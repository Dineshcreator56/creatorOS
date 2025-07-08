import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Check, 
  Star, 
  Users, 
  TrendingUp, 
  MessageSquare, 
  DollarSign, 
  FileText, 
  Zap, 
  Clock, 
  Target, 
  Sparkles,
  ChevronDown,
  Menu,
  X,
  Quote,
  ChevronLeft,
  ChevronRight,
  Mail
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  const featureImages = [
    {
      title: "AI-Powered DM Generator",
      description: "Generate personalized brand outreach messages that get responses",
      image: "https://images.pexels.com/photos/5077047/pexels-photo-5077047.jpeg?auto=compress&cs=tinysrgb&w=800",
      icon: MessageSquare,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Smart Pricing Assistant", 
      description: "Get AI-powered pricing recommendations based on real creator data",
      image: "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800",
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Professional Media Kits",
      description: "Create stunning media kits that convert brands into partnerships",
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
      icon: FileText,
      gradient: "from-orange-500 to-red-500"
    }
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featureImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featureImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featureImages.length) % featureImages.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Left aligned */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                CreatorOS
              </span>
            </div>

            {/* Desktop Navigation - Right aligned */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
              >
                Reviews
              </button>
              <a 
                href="mailto:mysaasbuilding@gmail.com"
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium flex items-center"
              >
                <Mail className="h-4 w-4 mr-1" />
                Contact
              </a>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started Free
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-left text-gray-700 hover:text-purple-600 transition-colors font-medium"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-left text-gray-700 hover:text-purple-600 transition-colors font-medium"
                >
                  How It Works
                </button>
                <button 
                  onClick={() => scrollToSection('testimonials')}
                  className="text-left text-gray-700 hover:text-purple-600 transition-colors font-medium"
                >
                  Reviews
                </button>
                <a 
                  href="mailto:mysaasbuilding@gmail.com"
                  className="text-left text-gray-700 hover:text-purple-600 transition-colors font-medium flex items-center"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Us
                </a>
                <button
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-center"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div>
              {/* Social Proof Badge */}
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-8 shadow-lg border border-purple-100">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white"></div>
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full border-2 border-white"></div>
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Join 500+ creators scaling their business</span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Automate Your{' '}
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Creator Business
                </span>
                <br />
                in Minutes
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                AI-powered tools for content creators to streamline brand outreach, set pricing, 
                and create professional media kits - all in one place.
              </p>

              {/* Bullet Points */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">Generate personalized brand outreach DMs in seconds</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">Use AI pricing assistant to set the right rates with confidence</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">Create media kits that attract the right brands effortlessly</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                <button
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center space-x-3"
                >
                  <span>Start Automating My Creator Business</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>

              <p className="text-gray-500 font-medium">Join hundreds of creators scaling their business.</p>
            </div>

            {/* Right Column - Feature Carousel */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Carousel Container */}
                <div className="relative h-96 overflow-hidden">
                  {featureImages.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                          index === currentSlide ? 'translate-x-0' : 
                          index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                        }`}
                      >
                        <div className="relative h-full">
                          <img 
                            src={feature.image} 
                            alt={feature.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <div className={`inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r ${feature.gradient} mb-3`}>
                              <Icon className="h-4 w-4 mr-2" />
                              <span className="text-sm font-semibold">Feature {index + 1}</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-sm opacity-90">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {featureImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentSlide ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-gray-400" />
        </div>
      </section>

      {/* Pain Points Section */}
      <section id="pain-points" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Does This Sound Like Your Reality?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Pain Point 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">"Brand Outreach Takes Too Long"</h3>
              <p className="text-gray-600 leading-relaxed">
                You're overwhelmed with content creation and don't have time for brand outreach. 
                Opportunities slip away while you're stuck in the hamster wheel.
              </p>
            </div>

            {/* Pain Point 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">"I Don't Know What to Charge"</h3>
              <p className="text-gray-600 leading-relaxed">
                You're guessing your worth, quoting rates without knowing what others charge. 
                Every negotiation feels like a shot in the dark.
              </p>
            </div>

            {/* Pain Point 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">"I Need a System"</h3>
              <p className="text-gray-600 leading-relaxed">
                Creating content is easy, but running your business is not. You're still sending DMs manually, 
                struggling to stay organized.
              </p>
            </div>
          </div>

          {/* Belief Deconstruction */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 md:p-12 text-center text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              The truth is, successful creators don't work harder, they work smarter.
            </h3>
            <p className="text-xl opacity-90">
              With the right tools, you can automate what's tedious and scale faster than ever before.
            </p>
          </div>
        </div>
      </section>

      {/* Desired Outcome Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Imagine Running Your Creator Business Like This...
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Outcome 1 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <MessageSquare className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">"Outreach That Converts"</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                AI generates personalized DMs in seconds, increasing response rates and making outreach effortless.
              </p>
            </div>

            {/* Outcome 2 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <DollarSign className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">"Pricing You Can Trust"</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Get AI-powered rate recommendations to price your services with confidence, knowing exactly what others charge.
              </p>
            </div>

            {/* Outcome 3 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">"Professional Media Kits"</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Create sleek, branded media kits that convert - without needing a designer.
              </p>
            </div>
          </div>

          {/* New Paradigm */}
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              The game changes when you have systems in place.
            </h3>
            <p className="text-xl text-gray-600">
              Successful creators automate the boring stuff, leaving them more time to create.
            </p>
          </div>
        </div>
      </section>

      {/* Product Introduction */}
      <section id="features" className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Meet CreatorOS
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              CreatorOS combines AI tools to streamline the business side of content creation, 
              including brand outreach, pricing, and professional media kits.
            </p>
          </div>

          {/* 3-Step Process */}
          <div id="how-it-works" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-4xl font-bold text-purple-200">01</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Generate Outreach</h3>
                <p className="text-gray-600 leading-relaxed">
                  Use AI to send personalized brand outreach messages that actually get responses.
                </p>
              </div>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-300 to-blue-300"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-4xl font-bold text-blue-200">02</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Set Your Price</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get AI-powered pricing recommendations based on real creator data and market analysis.
                </p>
              </div>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-300 to-green-300"></div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <span className="text-4xl font-bold text-green-200">03</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Create Media Kits</h3>
              <p className="text-gray-600 leading-relaxed">
                Automatically generate professional media kits with email templates that convert.
              </p>
            </div>
          </div>

          {/* Founder Message */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Quote className="h-12 w-12 text-white" />
              </div>
              <div className="text-center md:text-left">
                <blockquote className="text-xl md:text-2xl text-gray-700 italic mb-4 leading-relaxed">
                  "I created CreatorOS to give creators like you the tools to grow your business 
                  without sacrificing creativity. Now, the boring stuff is automated, and you can focus on what you love."
                </blockquote>
                <cite className="text-lg font-semibold text-gray-900">– Alex Chen, Founder</cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Loved by Creators Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "Creator Toolkit helped me increase my rates by 40%. The AI suggestions are spot-on and saved me hours of research!"
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">S</span>
                </div>
                <div>
                  <cite className="font-semibold text-gray-900">Sarah Chen</cite>
                  <p className="text-sm text-gray-600">Fashion Creator, 150K followers</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "The DM generator saves me hours every week. My response rate has doubled since I started using it!"
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">M</span>
                </div>
                <div>
                  <cite className="font-semibold text-gray-900">Marcus Johnson</cite>
                  <p className="text-sm text-gray-600">Tech Reviewer, 85K followers</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "Professional media kits in minutes. Brands love the quality and I love the time saved!"
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">A</span>
                </div>
                <div>
                  <cite className="font-semibold text-gray-900">Ana Rodriguez</cite>
                  <p className="text-sm text-gray-600">Lifestyle Creator, 220K followers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Scale Your Creator Business?
          </h2>
          <p className="text-xl text-purple-100 mb-8 leading-relaxed">
            Join hundreds of creators who've transformed their business with CreatorOS
          </p>
          
          <button
            onClick={onGetStarted}
            className="bg-white text-purple-600 px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 inline-flex items-center space-x-3 mb-6"
          >
            <span>Get Started with CreatorOS</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          
          <p className="text-purple-200 font-medium">
            Start for free today. No credit card required.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mt-12 pt-8 border-t border-purple-400/30">
            <div className="flex items-center space-x-2 text-purple-100">
              <Check className="h-5 w-5" />
              <span>Freemium model</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-100">
              <Check className="h-5 w-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-100">
              <Check className="h-5 w-5" />
              <span>Upgrade anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">CreatorOS</span>
            </div>
            
            <div className="flex items-center space-x-6 text-gray-400 mb-4 md:mb-0">
              <a 
                href="mailto:mysaasbuilding@gmail.com"
                className="hover:text-white transition-colors flex items-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                mysaasbuilding@gmail.com
              </a>
            </div>
            
            <div className="flex items-center space-x-6 text-gray-400">
              <span>© 2024 CreatorOS. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;