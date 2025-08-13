import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get API key from environment variable
    const apiKey = Deno.env.get('OPENROUTER_API_KEY')
    
    if (!apiKey) {
      return Response.json(
        { error: 'API_KEY_NOT_CONFIGURED' },
        { status: 500, headers: corsHeaders }
      )
    }

    const { action, data } = await req.json()
    
    let result
    
    switch (action) {
      case 'generateDailyOutreachTip':
        result = await generateDailyOutreachTip(data.platform, apiKey)
        break
      case 'generateDailyPricingTip':
        result = await generateDailyPricingTip(apiKey)
        break
      case 'generateBrandMatchEnhancer':
        result = await generateBrandMatchEnhancer(data.niche, apiKey)
        break
      case 'enhanceBioWithAI':
        result = await enhanceBioWithAI(data.bio, data.niche, data.influencerData, apiKey)
        break
      case 'generateDMWithAI':
        result = await generateDMWithAI(data.request, data.influencerData, apiKey)
        break
      case 'generatePricingWithAI':
        result = await generatePricingWithAI(data.request, data.influencerData, apiKey)
        break
      case 'generateMediaKitWithAI':
        result = await generateMediaKitWithAI(data.request, data.influencerData, apiKey)
        break
      default:
        throw new Error('Unknown action')
    }

    return Response.json(result, { headers: corsHeaders })
  } catch (error) {
    console.error('Error:', error)
    
    // Handle specific OpenRouter errors
    if (error.message.includes('429') || error.message.includes('402')) {
      return Response.json(
        { error: 'OPENROUTER_API_402_ERROR' },
        { status: 402, headers: corsHeaders }
      )
    }
    
    return Response.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    )
  }
})

async function callOpenRouter(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [
        {
          role: 'system',
          content: 'You are an expert social media marketing assistant specializing in creator business growth. Provide clean, professional responses without mentioning AI generation or disclaimers. Focus on practical, actionable advice that drives real results for content creators and their brand partnerships.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function generateDailyOutreachTip(platform: string, apiKey: string): Promise<string> {
  const prompt = `Generate a practical, actionable outreach tip specifically for ${platform} creators who want to improve their brand partnership response rates. Focus on platform-specific strategies that actually work. Keep it concise, specific, and include a concrete example or statistic if possible. Make it feel like insider advice from a successful creator.`
  
  return await callOpenRouter(prompt, apiKey)
}

async function generateDailyPricingTip(apiKey: string): Promise<string> {
  const prompt = `Generate a practical pricing strategy tip for content creators that helps them maximize their revenue and negotiate better deals with brands. Focus on actionable advice they can implement immediately. Include specific tactics, percentage increases, or negotiation strategies. Make it feel like insider knowledge from a successful creator business coach.`
  
  return await callOpenRouter(prompt, apiKey)
}

async function generateBrandMatchEnhancer(niche: string, apiKey: string): Promise<any> {
  const prompt = `Generate 3 compelling, results-focused value propositions for ${niche} content creators to use when pitching to brands. Each should highlight specific benefits, include metrics or results when possible, and be formatted as short, impactful statements that brands would find irresistible. Focus on ROI, engagement, and conversion potential.`
  
  const response = await callOpenRouter(prompt, apiKey)
  
  // Parse the response to extract the 3 suggestions
  const lines = response.split('\n').filter(line => line.trim())
  const suggestions = lines.slice(0, 3).map(line => line.replace(/^\d+\.\s*/, '').trim())
  
  return {
    suggestions: suggestions.length >= 3 ? suggestions : [
      `🎯 "Content that converts viewers into loyal customers"`,
      `📈 "Authentic storytelling that drives real business results"`,
      `✨ "Creative campaigns that make your brand unforgettable"`
    ],
    niche
  }
}

async function enhanceBioWithAI(bio: string, niche: string, influencerData: any[], apiKey: string): Promise<string> {
  const prompt = `Enhance this ${niche} creator bio to be more compelling for brand partnerships: "${bio}". 

Make it:
- Professional yet authentic
- Highlight value for brands
- Include results-oriented language
- Keep the creator's unique voice
- Focus on what makes them different
- Emphasize audience connection and engagement

Return only the enhanced bio, nothing else.`
  
  return await callOpenRouter(prompt, apiKey)
}

async function generateDMWithAI(request: any, influencerData: any[], apiKey: string): Promise<any> {
  const { platform, followerCount, engagementRate, messageType, tone, brandType, brandReply } = request
  
  let prompt = ''
  
  if (messageType === 'reply' && brandReply) {
    prompt = `Create a ${tone} reply to this brand message: "${brandReply}"

Creator details:
- Platform: ${platform}
- Followers: ${followerCount}
- Engagement: ${engagementRate}%
- Brand type: ${brandType || 'general'}

Write a professional response that:
- Shows genuine excitement and interest
- Highlights relevant metrics naturally
- Suggests specific next steps
- Maintains authenticity
- Includes a clear call-to-action

Keep it concise but compelling. Return only the message content.`
  } else {
    prompt = `Create a ${tone} outreach message for a ${platform} creator reaching out to ${brandType || 'a brand'} for collaboration.

Creator details:
- Followers: ${followerCount}
- Engagement: ${engagementRate}%

Write a compelling pitch that:
- Shows genuine interest in the brand
- Highlights relevant metrics and value
- Suggests specific collaboration ideas
- Feels authentic, not templated
- Includes a clear next step

Keep it professional but personable. Return only the message content.`
  }
  
  const primary = await callOpenRouter(prompt, apiKey)
  
  // Generate alternatives with slight variations
  const alt1Prompt = `${prompt}\n\nMake this version more ${tone === 'professional' ? 'friendly and approachable' : tone === 'friendly' ? 'confident and results-focused' : 'professional and business-oriented'}.`
  const alt2Prompt = `${prompt}\n\nMake this version focus more on specific collaboration ideas and deliverables.`
  
  const [alternative1, alternative2] = await Promise.all([
    callOpenRouter(alt1Prompt, apiKey),
    callOpenRouter(alt2Prompt, apiKey)
  ])
  
  return {
    primary,
    alternatives: [alternative1, alternative2],
    matchedData: influencerData.slice(0, 3)
  }
}

async function generatePricingWithAI(request: any, influencerData: any[], apiKey: string): Promise<any> {
  const { platform, followerCount, engagementRate, niche, region, dealType } = request
  
  const prompt = `Analyze pricing for a ${platform} creator with ${followerCount} followers and ${engagementRate}% engagement in the ${niche} niche for ${dealType}${region ? ` in ${region}` : ''}.

Based on current market rates and creator metrics, provide:
1. A realistic price range (minimum, maximum, recommended)
2. Brief reasoning for the pricing
3. Premium factors that could increase rates
4. Market context

Consider:
- Platform-specific rates
- Engagement quality vs quantity
- Niche premium/discount
- Regional market differences
- Current market trends

Format your response to include specific dollar amounts and clear reasoning.`
  
  const response = await callOpenRouter(prompt, apiKey)
  
  // Parse the response and calculate pricing
  const followerNum = parseInt(followerCount.replace(/[^0-9]/g, ''))
  const engagementNum = parseFloat(engagementRate)
  
  // Calculate base pricing with AI insights
  let basePrice = 0
  if (platform.toLowerCase() === 'instagram') {
    if (followerNum < 10000) basePrice = 75
    else if (followerNum < 50000) basePrice = 200
    else if (followerNum < 100000) basePrice = 500
    else if (followerNum < 500000) basePrice = 1500
    else basePrice = 5000
  } else if (platform.toLowerCase() === 'tiktok') {
    if (followerNum < 10000) basePrice = 100
    else if (followerNum < 50000) basePrice = 300
    else if (followerNum < 100000) basePrice = 700
    else if (followerNum < 500000) basePrice = 2000
    else basePrice = 6000
  } else if (platform.toLowerCase() === 'youtube') {
    if (followerNum < 10000) basePrice = 200
    else if (followerNum < 50000) basePrice = 600
    else if (followerNum < 100000) basePrice = 1500
    else if (followerNum < 500000) basePrice = 5000
    else basePrice = 15000
  }
  
  // Apply engagement multiplier
  const multiplier = engagementNum > 4 ? 1.3 : engagementNum > 2 ? 1.1 : 1
  const recommended = Math.round(basePrice * multiplier)
  
  const premiumFactors = []
  if (engagementNum > 4) premiumFactors.push('High engagement rate')
  if (['finance', 'investing', 'luxury', 'b2b'].some(p => niche.toLowerCase().includes(p))) {
    premiumFactors.push('Premium niche')
  }
  
  return {
    suggestedRange: {
      min: Math.round(recommended * 0.7),
      max: Math.round(recommended * 1.4),
      recommended
    },
    reasoning: response,
    exampleDeals: influencerData.slice(0, 3).map(data => ({
      platform: data.platform,
      followers: data.follower_count,
      rate: data.pricing_example,
      context: `${data.niche} creator with ${data.engagement_rate} engagement`
    })),
    premiumFactors,
    matchedData: influencerData
  }
}

async function generateMediaKitWithAI(request: any, influencerData: any[], apiKey: string): Promise<any> {
  const { creatorName, bio, niche, platforms, audience, pastCollabs, kitStyle, emailTone, services, location, email, brandName, profileImageUrl, brandLogoUrl, brandColor } = request
  
  if (kitStyle === 'email') {
    const prompt = `Create a professional email template for ${creatorName}, a ${niche} creator, reaching out to ${brandName || '[Brand Name]'} for collaboration.

Creator details:
- Name: ${creatorName}
- Bio: ${bio}
- Location: ${location || 'Not specified'}
- Email: ${email}
- Platforms: ${platforms.map(p => `${p.name} (${p.followers} followers)`).join(', ')}
- Audience: ${audience.gender || ''} ${audience.age || ''} ${audience.countries || ''}
- Services: ${services || 'Content creation and brand partnerships'}
- Past collaborations: ${pastCollabs || 'Various brand partnerships'}
- Email tone: ${emailTone}

Create a complete email template with:
- Compelling subject line
- Professional greeting
- Brief, engaging introduction
- Key metrics and audience insights
- Clear value proposition
- Specific collaboration suggestions
- Strong call-to-action
- Professional signature

Make it ${emailTone} in tone and ensure it's compelling for brands.`

    const emailContent = await callOpenRouter(prompt, apiKey)
    
    return {
      htmlContent: emailContent,
      sections: ['Subject Line', 'Introduction', 'Creator Metrics', 'Value Proposition', 'Collaboration Ideas', 'Call to Action'],
      designTips: [
        'Personalize the subject line with your niche',
        'Include specific metrics and engagement rates',
        'Mention relevant past collaborations',
        'Keep it concise but informative',
        'Include a clear call-to-action',
        'Attach your media kit for more details'
      ],
      matchedData: influencerData.slice(0, 3)
    }
  } else {
    // Notion kit generation
    // First, optimize bio if it's too long
    let optimizedBio = bio
    if (bio.length > 300) {
      const bioPrompt = `Shorten this creator bio to under 200 characters while keeping the key value propositions for brands: "${bio}"`
      try {
        optimizedBio = await callOpenRouter(bioPrompt, apiKey)
      } catch (error) {
        optimizedBio = bio.substring(0, 200) + '...'
      }
    }
    
    // Create the professional media kit HTML
    const htmlContent = createProfessionalMediaKit({
      ...request,
      bio: optimizedBio
    })
    
    return {
      htmlContent,
      sections: ['Creator Bio', 'Platform Statistics', 'Audience Demographics', 'Services', 'Past Collaborations', 'Contact Information'],
      designTips: [
        'Optimized for single-page layout',
        'Professional color scheme and typography',
        'All essential information included',
        'Print-friendly design',
        'Modern, clean aesthetic'
      ],
      matchedData: influencerData.slice(0, 3)
    }
  }
}

// Professional media kit generator with proper single-page layout
function createProfessionalMediaKit(request: any): string {
  const { creatorName, bio, niche, platforms, audience, pastCollabs, services, location, email, profileImageUrl, brandLogoUrl, brandColor } = request
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${creatorName} - Media Kit</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.4;
            color: #1a1a1a;
            background: white;
            padding: 0;
            margin: 0;
        }
        
        .media-kit {
            max-width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            border-radius: 0;
            overflow: hidden;
            position: relative;
            page-break-inside: avoid;
        }
        
        .header {
            background: linear-gradient(135deg, ${brandColor || '#6366f1'} 0%, ${brandColor || '#8b5cf6'} 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            border-radius: 16px 16px 0 0;
            margin: 20px 20px 0 20px;
        }
        
        .logo {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 50px;
            height: 50px;
            object-fit: contain;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
            padding: 6px;
        }
        
        .profile-image {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid rgba(255, 255, 255, 0.3);
            margin: 0 auto 15px;
            display: block;
        }
        
        .creator-name {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 6px;
            letter-spacing: -0.02em;
        }
        
        .creator-niche {
            font-size: 16px;
            font-weight: 500;
            opacity: 0.9;
            margin-bottom: 6px;
        }
        
        .creator-location {
            font-size: 14px;
            opacity: 0.8;
        }
        
        .content {
            padding: 20px 30px;
            margin: 0 20px;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section:last-child {
            margin-bottom: 0;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: ${brandColor || '#6366f1'};
            margin-bottom: 12px;
            display: flex;
            align-items: center;
        }
        
        .section-title::before {
            content: '';
            width: 3px;
            height: 18px;
            background: ${brandColor || '#6366f1'};
            margin-right: 8px;
            border-radius: 2px;
        }
        
        .bio-text {
            font-size: 14px;
            line-height: 1.5;
            color: #374151;
        }
        
        .platforms-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin-top: 12px;
        }
        
        .platform-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            position: relative;
        }
        
        .platform-name {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .platform-icon {
            width: 16px;
            height: 16px;
            margin-right: 6px;
        }
        
        .platform-followers {
            font-size: 20px;
            font-weight: 800;
            color: ${brandColor || '#6366f1'};
            margin-bottom: 3px;
        }
        
        .platform-handle {
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
        }
        
        .audience-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 12px;
            margin-top: 12px;
        }
        
        .audience-item {
            background: #f8fafc;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        
        .audience-label {
            font-size: 10px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 3px;
        }
        
        .audience-value {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
        }
        
        .services-list {
            font-size: 14px;
            line-height: 1.5;
            color: #374151;
            margin-top: 12px;
        }
        
        .contact-section {
            background: linear-gradient(135deg, ${brandColor || '#6366f1'} 0%, ${brandColor || '#8b5cf6'} 100%);
            color: white;
            padding: 25px 30px;
            text-align: center;
            margin: 0 20px 20px 20px;
            border-radius: 0 0 16px 16px;
        }
        
        .contact-title {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 12px;
        }
        
        .contact-subtitle {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 15px;
        }
        
        .contact-email {
            font-size: 16px;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 8px;
            display: inline-block;
        }
        
        /* Social Media Icons */
        .instagram-icon { color: #E4405F; }
        .youtube-icon { color: #FF0000; }
        .tiktok-icon { color: #000000; }
        .twitter-icon { color: #1DA1F2; }
        .linkedin-icon { color: #0077B5; }
        
        @media print {
            body {
                padding: 0;
                background: white;
            }
            
            .media-kit {
                box-shadow: none;
                margin: 0;
                max-width: none;
                min-height: auto;
            }
        }
    </style>
</head>
<body>
    <div class="media-kit">
        <div class="header">
            ${brandLogoUrl ? `<img src="${brandLogoUrl}" alt="Logo" class="logo" />` : ''}
            ${profileImageUrl ? `<img src="${profileImageUrl}" alt="${creatorName}" class="profile-image" />` : ''}
            <h1 class="creator-name">${creatorName}</h1>
            <p class="creator-niche">${niche} Creator</p>
            ${location ? `<p class="creator-location">${location}</p>` : ''}
        </div>
        
        <div class="content">
            <div class="section">
                <h2 class="section-title">About Me</h2>
                <p class="bio-text">${bio}</p>
            </div>
            
            <div class="section">
                <h2 class="section-title">Platform Statistics</h2>
                <div class="platforms-grid">
                    ${platforms.map(platform => `
                        <div class="platform-card">
                            <div class="platform-name">${platform.name}</div>
                            <div class="platform-followers">${platform.followers}</div>
                            <div class="platform-handle">${platform.handle}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            ${(audience.gender || audience.age || audience.countries) ? `
                <div class="section">
                    <h2 class="section-title">Audience Demographics</h2>
                    <div class="audience-grid">
                        ${audience.gender ? `
                            <div class="audience-item">
                                <div class="audience-label">Gender Split</div>
                                <div class="audience-value">${audience.gender}</div>
                            </div>
                        ` : ''}
                        ${audience.age ? `
                            <div class="audience-item">
                                <div class="audience-label">Age Range</div>
                                <div class="audience-value">${audience.age}</div>
                            </div>
                        ` : ''}
                        ${audience.countries ? `
                            <div class="audience-item">
                                <div class="audience-label">Top Countries</div>
                                <div class="audience-value">${audience.countries}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${services ? `
                <div class="section">
                    <h2 class="section-title">Services</h2>
                    <p class="services-list">${services}</p>
                </div>
            ` : ''}
            
            ${pastCollabs ? `
                <div class="section">
                    <h2 class="section-title">Past Collaborations</h2>
                    <p class="services-list">${pastCollabs}</p>
                </div>
            ` : ''}
        </div>
        
        <div class="contact-section">
            <h2 class="contact-title">Let's Work Together</h2>
            <p class="contact-subtitle">Ready to create amazing content for your brand?</p>
            ${email ? `<div class="contact-email">${email}</div>` : ''}
        </div>
    </div>
</body>
</html>`
}