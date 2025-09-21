import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "@/components/animated-background";
import { 
  CheckCircle, 
  Zap, 
  Globe, 
  Brain, 
  Upload, 
  Shield,
  Star,
  ArrowRight,
  Play,
  Sparkles,
  Layers,
  BarChart3
} from "lucide-react";
import heroImage from "@/assets/hero-illustration.jpg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-card border-b border-border/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            PlagiaSense
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")}
              className="transition-smooth hover-scale"
            >
              Dashboard
            </Button>
            <Button 
              onClick={() => navigate("/dashboard")}
              className="btn-premium bg-gradient-primary text-primary-foreground relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary border border-primary/20 animate-bounce-in">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Detection
                </div>
                
                <h1 className="text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                  Beyond Copy-Paste:
                  <span className="bg-gradient-primary bg-clip-text text-transparent block">
                    Smart Plagiarism Detection
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                  Revolutionary AI-powered plagiarism detection with semantic similarity analysis, 
                  multilingual support, and crystal-clear explainable results.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="xl"
                  onClick={() => navigate("/dashboard")}
                  className="btn-premium bg-gradient-primary text-primary-foreground text-lg px-10 py-4 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <Upload className="mr-3 h-5 w-5" />
                    Upload Assignment
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Button>
                
                <Button 
                  size="xl"
                  variant="outline"
                  className="text-lg px-10 py-4 glass-card border-primary/20 hover:bg-primary/10 group relative overflow-hidden"
                >
                  <Play className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
                  Try Demo
                </Button>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-primary border-2 border-background flex items-center justify-center text-white font-bold text-sm">
                      {i}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="font-semibold">10,000+ educators</div>
                  <div>trust PlagiaSense worldwide</div>
                </div>
              </div>
            </div>
            
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-hero rounded-3xl blur-3xl opacity-30 animate-pulse-glow" />
              <div className="relative glass-card p-2 rounded-3xl">
                <img 
                  src={heroImage}
                  alt="AI-powered plagiarism detection illustration"
                  className="w-full h-auto rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-glass rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-sm font-medium text-accent border border-accent/20 mb-6">
              <Layers className="h-4 w-4" />
              Powerful Features
            </div>
            <h2 className="text-5xl font-bold mb-6 tracking-tight">Advanced AI Technology</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Experience the future of plagiarism detection with cutting-edge algorithms 
              that understand context, meaning, and intent beyond simple text matching.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Brain,
                title: "Semantic Analysis",
                description: "Deep learning models detect meaning-based similarities and paraphrasing attempts",
                color: "primary",
                delay: "0s"
              },
              {
                icon: Globe,
                title: "Global Coverage",
                description: "Support for 100+ languages with native cultural context understanding",
                color: "accent",
                delay: "0.1s"
              },
              {
                icon: Zap,
                title: "Real-time Processing",
                description: "Lightning-fast analysis with results in seconds, not minutes",
                color: "warning",
                delay: "0.2s"
              },
              {
                icon: CheckCircle,
                title: "Visual Insights",
                description: "Interactive reports with heatmaps, highlights, and actionable suggestions",
                color: "success",
                delay: "0.3s"
              }
            ].map((feature, index) => (
              <Card 
                key={index}
                className="p-8 glass-card hover:glow-strong group cursor-pointer relative overflow-hidden animate-fade-in-delayed"
                style={{ animationDelay: feature.delay }}
              >
                <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className={`p-4 bg-${feature.color}/10 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-8 w-8 text-${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 glass-card relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "99.9%", label: "Accuracy Rate", icon: Shield },
              { number: "2M+", label: "Documents Scanned", icon: BarChart3 },
              { number: "100+", label: "Languages Supported", icon: Globe },
              { number: "10k+", label: "Happy Educators", icon: Star }
            ].map((stat, index) => (
              <div key={index} className="text-center animate-bounce-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="p-4 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 tracking-tight">Trusted Worldwide</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of educators and institutions who've revolutionized their approach to academic integrity
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Sarah Johnson",
                role: "Professor, Stanford University",
                content: "PlagiaSense has revolutionized how we handle academic integrity. The semantic analysis catches sophisticated attempts that traditional tools miss completely.",
                avatar: "SJ",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "High School Principal",
                content: "The interface is incredibly intuitive, and the real-time results have transformed our workflow. Students and teachers love how clear everything is.",
                avatar: "MC",
                rating: 5
              },
              {
                name: "Prof. Elena Rodriguez",
                role: "Department Head, MIT",
                content: "Multi-language support is game-changing. We can now analyze papers from our international students with complete confidence and accuracy.",
                avatar: "ER",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card 
                key={index}
                className="p-8 glass-card hover:glow-strong group relative overflow-hidden animate-fade-in-delayed"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                  
                  <div className="flex mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-warning fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl float-delayed" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center text-white max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Ready to Transform Academic Integrity?
            </h2>
            <p className="text-xl mb-12 opacity-90 leading-relaxed max-w-3xl mx-auto">
              Join educators worldwide who trust PlagiaSense for accurate, AI-powered plagiarism detection. 
              Start your free trial today and experience the future of academic integrity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="xl"
                onClick={() => navigate("/dashboard")}
                className="bg-white text-primary hover:bg-white/90 text-lg px-12 py-4 btn-premium group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
              
              <Button 
                size="xl"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 text-lg px-12 py-4 glass-card"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-16 glass-card border-t border-border/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
                PlagiaSense
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Revolutionary AI-powered plagiarism detection for the modern digital classroom and beyond.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-muted-foreground">Powered by Advanced AI</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Product</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'API', 'Integrations'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-smooth hover-scale inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Support</h4>
              <ul className="space-y-3">
                {['Help Center', 'Contact', 'Status', 'Documentation'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-smooth hover-scale inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Company</h4>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Press'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-smooth hover-scale inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/20 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-muted-foreground text-center md:text-left">
                &copy; 2024 PlagiaSense. All rights reserved. 
                <span className="ml-2 text-xs">Built with ❤️ for educators</span>
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-primary transition-smooth">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-smooth">Terms of Service</a>
                <a href="#" className="hover:text-primary transition-smooth">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;