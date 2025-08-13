import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-gumroad-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface GumroadWebhookPayload {
  sale_id: string
  product_id: string
  product_name: string
  permalink: string
  product_permalink: string
  email: string
  price: number
  gumroad_fee: number
  currency: string
  quantity: number
  discover_fee_charged: boolean
  can_contact: boolean
  referrer: string
  card: {
    visual: string
    type: string
    bin: string
    expiry_month: string
    expiry_year: string
  }
  order_number: number
  sale_timestamp: string
  purchaser_id: string
  subscription_id?: string
  cancelled?: boolean
  dispute?: boolean
  refunded?: boolean
  chargebacked?: boolean
  test?: boolean
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    // Get the raw body for signature verification
    const body = await req.text()
    const payload: GumroadWebhookPayload = JSON.parse(body)

    console.log('Received Gumroad webhook:', {
      sale_id: payload.sale_id,
      email: payload.email,
      product_id: payload.product_id,
      price: payload.price,
      test: payload.test
    })

    // Verify webhook signature (optional but recommended)
    const signature = req.headers.get('x-gumroad-signature')
    if (signature) {
      const isValid = await verifyGumroadSignature(body, signature)
      if (!isValid) {
        console.error('Invalid Gumroad signature')
        return new Response('Invalid signature', { 
          status: 401, 
          headers: corsHeaders 
        })
      }
    }

    // Skip test transactions in production
    if (payload.test && Deno.env.get('ENVIRONMENT') === 'production') {
      console.log('Skipping test transaction in production')
      return new Response('Test transaction skipped', { 
        status: 200, 
        headers: corsHeaders 
      })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Process the payment
    const result = await processPayment(supabase, payload)

    if (result.success) {
      console.log('Payment processed successfully:', result.message)
      return new Response(JSON.stringify({ 
        success: true, 
        message: result.message 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      console.error('Payment processing failed:', result.message)
      return new Response(JSON.stringify({ 
        success: false, 
        error: result.message 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function verifyGumroadSignature(body: string, signature: string): Promise<boolean> {
  // Gumroad webhook signature verification
  // This is optional but recommended for security
  const webhookSecret = Deno.env.get('GUMROAD_WEBHOOK_SECRET')
  if (!webhookSecret) {
    console.warn('GUMROAD_WEBHOOK_SECRET not set, skipping signature verification')
    return true
  }

  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    return signature === expectedSignature
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

async function processPayment(supabase: any, payload: GumroadWebhookPayload) {
  try {
    // Find user by email in user_profiles table
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id, email, pro_until')
      .eq('email', payload.email)
      .single()

    if (!userProfile) {
      console.log(`No user found with email: ${payload.email}`)
      return {
        success: true,
        message: `Payment received but no user account found for ${payload.email}. User can contact support to link their account.`
      }
    }

    // Calculate pro_until date (1 month from now for $7 plan)
    const proUntilDate = new Date()
    proUntilDate.setMonth(proUntilDate.getMonth() + 1)

    // Update user's pro_until field
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        pro_until: proUntilDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', payload.email)

    if (updateError) {
      console.error('Error updating user pro status:', updateError)
      return {
        success: false,
        message: 'Failed to upgrade user to Pro plan'
      }
    }

    // Log the upgrade activity
    await supabase
      .from('user_activity_log')
      .insert({
        user_id: userProfile.id,
        activity_type: 'subscription_upgrade',
        activity_details: {
          from_plan: userProfile.pro_until ? 'pro' : 'free',
          to_plan: 'pro',
          gumroad_sale_id: payload.sale_id,
          amount: payload.price,
          pro_until: proUntilDate.toISOString()
        }
      })

    console.log(`Successfully upgraded user ${payload.email} to Pro plan until ${proUntilDate.toISOString()}`)

    return {
      success: true,
      message: `User ${payload.email} successfully upgraded to Pro plan until ${proUntilDate.toDateString()}`
    }

  } catch (error) {
    console.error('Payment processing error:', error)
    return {
      success: false,
      message: 'Payment processing failed'
    }
  }
}