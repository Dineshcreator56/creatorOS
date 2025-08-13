import React from 'react';
import { Star, Users, Shield, Check, ArrowRight, TrendingUp, Target, MessageSquare, FileText, DollarSign, Mail } from 'lucide-react';
import Logo from './Logo';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Logo size="sm" />
              <span className="text-xl font-bold text-white">CreatorOS</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors">Testimonials</a>
              <a href="#contact" className="text-slate-300 hover:text-white transition-colors">Contact</a>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-8">
            <Star className="w-4 h-4 mr-2" />
            Trusted by 10,000+ creators worldwide
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            The Ultimate
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Creator </span>
            Toolkit
          </h1>
          
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Generate professional DMs, calculate fair pricing, and create stunning media kits. 
            Everything you need to grow your creator business in one powerful platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center"
            >
              Start Creating Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="text-3xl font-bold text-white mb-2">10,000+</div>
              <div className="text-slate-300">Active Creators</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="text-3xl font-bold text-white mb-2">$2M+</div>
              <div className="text-slate-300">Revenue Generated</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="text-3xl font-bold text-white mb-2">50,000+</div>
              <div className="text-slate-300">DMs Sent</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Succeed</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our comprehensive suite of tools helps creators at every stage of their journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 hover:bg-slate-800/70 transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Smart DM Generator</h3>
              <p className="text-slate-300 mb-6">
                Generate personalized outreach messages and professional replies that convert. 
                AI-powered templates for every situation.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-slate-300">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Outreach templates
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Professional replies
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Custom tone options
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 hover:bg-slate-800/70 transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-6">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Pricing Calculator</h3>
              <p className="text-slate-300 mb-6">
                Calculate fair rates based on your metrics, engagement, and industry standards. 
                Never undervalue your work again.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-slate-300">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Platform-specific rates
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Engagement analysis
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Industry benchmarks
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 hover:bg-slate-800/70 transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Media Kit Builder</h3>
              <p className="text-slate-300 mb-6">
                Create professional media kits that showcase your brand and attract premium partnerships.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-slate-300">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Professional templates
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Brand customization
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  PDF export ready
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Simple, Transparent
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Pricing</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Start free and upgrade when you're ready to unlock advanced features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <div className="text-4xl font-bold text-white mb-2">$0</div>
                <div className="text-slate-400">per month</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  5 DM generations per month
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  3 pricing calculations per month
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  1 media kit per month
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  Basic templates
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  Community support
                </li>
              </ul>
              
              <button
                onClick={onGetStarted}
                className="w-full bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition-colors font-medium"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/50 rounded-xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <div className="text-4xl font-bold text-white mb-2">$7</div>
                <div className="text-slate-400">per month</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  Unlimited DM generations
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  Unlimited pricing calculations
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  Unlimited media kits
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  Premium templates
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  Priority support
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  Advanced analytics
                </li>
              </ul>
              
              <button
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h3>
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-2">Can I cancel anytime?</h4>
                <p className="text-slate-300">Yes, you can cancel your subscription at any time. No long-term commitments.</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-2">Do you offer refunds?</h4>
                <p className="text-slate-300">We offer a 30-day money-back guarantee if you're not satisfied with our service.</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h4>
                <p className="text-slate-300">We accept all major credit cards and PayPal for your convenience.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">How It Works</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Get started in minutes with our intuitive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Sign Up</h3>
              <p className="text-slate-300">
                Create your free account in seconds. No credit card required to get started.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Choose Your Tool</h3>
              <p className="text-slate-300">
                Select from DM Generator, Pricing Calculator, or Media Kit Builder based on your needs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Generate & Export</h3>
              <p className="text-slate-300">
                Get professional results instantly. Export, copy, or download your content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Loved by
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Creators</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              See what our community of creators has to say about CreatorOS
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-300 mb-6">
                "CreatorOS helped me increase my rates by 40% and land better brand partnerships. The pricing calculator is a game-changer!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold">S</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Sarah Chen</div>
                  <div className="text-slate-400 text-sm">Fashion Influencer, 150K followers</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-300 mb-6">
                "The DM templates are incredible. I've closed 3 major deals this month using the outreach messages. Highly recommend!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold">M</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Marcus Johnson</div>
                  <div className="text-slate-400 text-sm">Tech YouTuber, 500K subscribers</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-300 mb-6">
                "My media kit looks so professional now. Brands take me seriously and I'm getting better collaboration offers."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold">A</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Alex Rivera</div>
                  <div className="text-slate-400 text-sm">Lifestyle Creator, 75K followers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Get in
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Touch</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Have questions or need support? We're here to help you succeed.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Contact Support</h3>
              <p className="text-slate-300 mb-6">
                Questions about features, billing, or need technical support? 
                We typically respond within 24 hours.
              </p>
              <a
                href="mailto:mysaasbuilding@gmail.com"
                className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Mail className="w-5 h-5 mr-2" />
                mysaasbuilding@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Level Up Your Creator Business?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already using CreatorOS to grow their business and increase their earnings.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center"
            >
              Start Your Journey Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <div className="mt-4 text-slate-400 text-sm">
              No credit card required • Start free forever
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Logo size="sm" />
              <span className="text-xl font-bold text-white">CreatorOS</span>
            </div>
            <div className="text-slate-400 text-sm">
              © 2025 CreatorOS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}