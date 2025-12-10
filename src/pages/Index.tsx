import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Mic, Globe, Brain, Users, Smartphone, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef, useState } from "react";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import LoadingScreen from "@/components/auralaid/ui/LoadingScreen";

// Intersection Observer Hook for scroll animations
const useIntersectionObserver = (options = {}, dependency: any = null) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [dependency]);

  return [ref, isVisible] as const;
};

const Index = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Animation refs - pass isLoading as dependency to ensure observer attaches after loading
  const [heroRef, heroVisible] = useIntersectionObserver({}, isLoading);
  const [storyRef, storyVisible] = useIntersectionObserver({}, isLoading);
  const [howItWorksRef, howItWorksVisible] = useIntersectionObserver({}, isLoading);
  const [featuresRef, featuresVisible] = useIntersectionObserver({}, isLoading);
  const [closingRef, closingVisible] = useIntersectionObserver({}, isLoading);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Floating Language Selector with modern glass effect */}
      <div className="fixed top-4 right-4 z-50 animate-fade-in flex gap-3">
        <Link to="/login">
          <Button variant="outline" className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-teal-200/50 dark:border-teal-700/50 rounded-2xl shadow-lg hover:shadow-teal-500/20 transition-all duration-300 hover:scale-105">
            <Users className="w-4 h-4 mr-2 text-teal-600" />
            {t.loginSignup}
          </Button>
        </Link>
        <LanguageSelector />
      </div>


      {/* Enhanced Hero Section with parallax effect */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950 dark:via-cyan-950 dark:to-blue-950">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 via-cyan-400/10 to-blue-400/10 animate-gradient-xy" />

        {/* Placeholder for hero image - using gradient overlay */}
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80')] bg-cover bg-center opacity-15 scale-110 animate-slow-zoom" />

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-teal-500/30 rounded-full animate-float" />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-cyan-500/30 rounded-full animate-float-delayed" />
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-blue-500/30 rounded-full animate-float-slow" />
        </div>

        <div className="container mx-auto px-4 z-10 relative">
          <div
            ref={heroRef}
            className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            {/* Animated logo with glow effect */}
            <div className="relative inline-block mb-8 group">
              <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-3xl group-hover:bg-teal-500/30 transition-all duration-500 animate-pulse-slow" />
              <div className="relative w-32 h-32 md:w-48 md:h-48 mx-auto rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 p-1 transform transition-all duration-500 hover:scale-110 hover:rotate-3 shadow-2xl">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                  <Heart className="w-16 h-16 md:w-24 md:h-24 text-teal-600" />
                </div>
              </div>
            </div>

            {/* Title with gradient text */}
            <h1 className="text-5xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent drop-shadow-2xl animate-gradient-x">
              {t.title}
            </h1>

            {/* Tagline with typing effect feel */}
            <p className="text-2xl md:text-5xl mb-8 text-gray-800 dark:text-gray-100 font-medium leading-relaxed animate-slide-up">
              {t.heroTagline}
            </p>

            <p className="text-lg md:text-2xl mb-12 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed animate-slide-up-delayed">
              {t.heroDescription}
            </p>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Link to="/assistant" className="group">
                <Card className="h-full border-2 border-primary/20 hover:border-primary transition-all duration-300 hover:shadow-[var(--shadow-glow)] hover:-translate-y-2 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Mic className="w-8 h-8 text-white group-hover:animate-bounce" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                      Talk to Chatbot
                    </h3>
                    <p className="text-muted-foreground">
                      Get instant health guidance through our AI-powered voice assistant
                    </p>
                    <ArrowRight className="w-5 h-5 mx-auto mt-4 text-primary group-hover:translate-x-2 transition-transform" />
                  </CardContent>
                </Card>
              </Link>

              <Link to="/telemedicine" className="group">
                <Card className="h-full border-2 border-secondary/20 hover:border-secondary transition-all duration-300 hover:shadow-[var(--shadow-glow)] hover:-translate-y-2 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Users className="w-8 h-8 text-white group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-secondary transition-colors">
                      Telemedicine
                    </h3>
                    <p className="text-muted-foreground">
                      Find specialists and book video consultations instantly
                    </p>
                    <ArrowRight className="w-5 h-5 mx-auto mt-4 text-secondary group-hover:translate-x-2 transition-transform" />
                  </CardContent>
                </Card>
              </Link>

              <Link to="/emergency" className="group">
                <Card className="h-full border-2 border-accent/20 hover:border-accent transition-all duration-300 hover:shadow-[var(--shadow-glow)] hover:-translate-y-2 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Heart className="w-8 h-8 text-white group-hover:animate-bounce" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors">
                      Emergency
                    </h3>
                    <p className="text-muted-foreground">
                      Call for ambulance in emergencies
                    </p>
                    <ArrowRight className="w-5 h-5 mx-auto mt-4 text-accent group-hover:translate-x-2 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-teal-600/50 rounded-full flex justify-center p-2">
            <div className="w-1 h-3 bg-teal-600/50 rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* Story Section with staggered animations */}
      <section className="py-24 px-4 bg-gradient-to-b from-white via-teal-50/30 to-white dark:from-gray-900 dark:via-teal-950/30 dark:to-gray-900 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

        <div className="container mx-auto max-w-5xl relative z-10">
          <div
            ref={storyRef}
            className={`transition-all duration-1000 ${storyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-12 text-center bg-gradient-to-r from-teal-700 to-cyan-700 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              {t.problemTitle}
            </h2>

            <div className="space-y-8">
              {[t.storyPara1, t.storyPara2, t.storyPara3, t.storyPara4].map((para, index) => (
                <div
                  key={index}
                  className={`transform transition-all duration-700 delay-${index * 100} ${storyVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                    }`}
                >
                  <p className={`text-lg md:text-xl leading-relaxed ${index === 2 ? 'font-bold text-teal-900 dark:text-teal-100 text-2xl italic border-l-4 border-teal-600 pl-6 bg-teal-50 dark:bg-teal-950/50 py-4 rounded-r-2xl' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                    {index === 0 && <Sparkles className="inline w-5 h-5 mr-2 text-teal-600" />}
                    {para}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section with card hover effects */}
      <section className="py-24 px-4 bg-gradient-to-b from-teal-50/50 to-white dark:from-teal-950/50 dark:to-gray-900 relative">
        <div className="container mx-auto max-w-7xl">
          <div
            ref={howItWorksRef}
            className={`transition-all duration-1000 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {t.howItWorksTitle}
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {t.howItWorksSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Mic, title: t.speakNaturally, desc: t.speakNaturallyDesc, gradient: 'from-teal-500 to-cyan-500', delay: 0 },
                { icon: Brain, title: t.aiAnalyzes, desc: t.aiAnalyzesDesc, gradient: 'from-cyan-500 to-blue-500', delay: 200 },
                { icon: Heart, title: t.guidanceSteps, desc: t.guidanceStepsDesc, gradient: 'from-blue-500 to-teal-500', delay: 400 }
              ].map((item, index) => (
                <div
                  key={index}
                  className={`group transform transition-all duration-700 delay-${item.delay} ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                >
                  <Card className="h-full border-2 border-teal-200 dark:border-teal-800 hover:border-teal-500 transition-all duration-500 hover:shadow-2xl hover:shadow-teal-500/20 hover:-translate-y-2 bg-gradient-to-br from-white to-teal-50/50 dark:from-gray-900 dark:to-teal-950/50 backdrop-blur-sm overflow-hidden relative">
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                    <CardContent className="p-8 text-center relative z-10">
                      <div className="relative inline-block mb-6">
                        {/* Animated ring */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-20 rounded-full animate-ping-slow`} />
                        <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                          <item.icon className="w-10 h-10 text-white group-hover:rotate-12 transition-transform duration-500" />
                        </div>
                      </div>

                      <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base md:text-lg">
                        {item.desc}
                      </p>

                      {/* Step indicator */}
                      <div className={`absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                        {index + 1}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with modern grid */}
      <section className="py-24 px-4 bg-gradient-to-b from-white via-cyan-50/20 to-white dark:from-gray-900 dark:via-cyan-950/20 dark:to-gray-900 relative overflow-hidden">
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div
            ref={featuresRef}
            className={`transition-all duration-1000 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-16 text-center bg-gradient-to-r from-teal-700 to-cyan-700 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              {t.featuresTitle}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Mic, title: t.voiceFirst, desc: t.voiceFirstDesc, gradient: 'from-teal-500 to-cyan-500' },
                { icon: Globe, title: t.multilingual, desc: t.multilingualDesc, gradient: 'from-cyan-500 to-blue-500' },
                { icon: Users, title: t.forHealthWorkers, desc: t.forHealthWorkersDesc, gradient: 'from-blue-500 to-teal-500' },
                { icon: Smartphone, title: t.simpleOffline, desc: t.simpleOfflineDesc, gradient: 'from-teal-600 to-cyan-600' },
                { icon: Brain, title: t.aiPowered, desc: t.aiPoweredDesc, gradient: 'from-cyan-600 to-blue-600' },
                { icon: Heart, title: t.empathetic, desc: t.empatheticDesc, gradient: 'from-blue-600 to-teal-600' }
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`group transform transition-all duration-700 delay-${index * 100} ${featuresVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                    }`}
                >
                  <div className="flex gap-5 items-start p-6 rounded-2xl hover:bg-white/80 dark:hover:bg-gray-900/80 backdrop-blur-sm transition-all duration-300 border border-transparent hover:border-teal-200 dark:hover:border-teal-800 hover:shadow-xl group cursor-pointer">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                        {feature.title}
                        <CheckCircle2 className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing Statement with dramatic effect */}
      <section className="py-32 px-4 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float-delayed" />

        <div className="container mx-auto max-w-5xl relative z-10">
          <div
            ref={closingRef}
            className={`text-center transition-all duration-1000 ${closingVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-10 drop-shadow-2xl">
              {t.closingTitle}
            </h2>

            <p className="text-xl md:text-3xl leading-relaxed mb-8 drop-shadow-lg font-light">
              {t.closingPara1}
            </p>

            <p className="text-lg md:text-2xl mb-12 opacity-95 font-medium drop-shadow-lg">
              {t.closingPara2}
            </p>

            <Button
              variant="secondary"
              size="lg"
              className="text-lg px-10 py-7 rounded-2xl shadow-2xl hover:shadow-white/30 transform transition-all duration-300 hover:scale-110 hover:-translate-y-2 font-bold group bg-white text-teal-700 hover:bg-gray-50"
            >
              <Heart className="w-6 h-6 mr-2 text-red-500 group-hover:animate-pulse" />
              {t.joinMission}
              <Sparkles className="w-6 h-6 ml-2 text-teal-600 group-hover:rotate-180 transition-transform duration-500" />
            </Button>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="py-12 px-4 bg-gradient-to-b from-teal-50 to-white dark:from-teal-950 dark:to-gray-900 border-t border-teal-200 dark:border-teal-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto text-center relative z-10">
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base font-medium">
            {t.footerText}
          </p>
          <div className="mt-4 flex justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>© 2025 SwasthAI</span>
            <span>•</span>
            <span>Made with ❤️ for rural healthcare</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 0%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes slow-zoom {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.15); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.4; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        
        @keyframes scroll {
          0% { transform: translateY(-50%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        
        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 15s ease infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 3s linear infinite;
        }
        
        .animate-slow-zoom {
          animation: slow-zoom 20s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }
        
        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }
        
        .animate-slide-up-delayed {
          animation: slideUp 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
};

export default Index;
