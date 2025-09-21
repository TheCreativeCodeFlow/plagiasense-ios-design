import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  Zap, 
  Globe, 
  Brain, 
  Upload, 
  Shield,
  Star,
  ArrowRight,
  Play
} from "lucide-react";
import heroImage from "@/assets/hero-illustration.jpg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">
            PlagiaSense
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")}
              className="transition-smooth hover:scale-105"
            >
              Dashboard
            </Button>
            <Button 
              onClick={() => navigate("/dashboard")}
              className="btn-premium bg-gradient-primary text-primary-foreground"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-20 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Beyond Copy-Paste:
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    {" "}Smart Plagiarism Detection
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-md">
                  AI-powered plagiarism detection with semantic similarity analysis, 
                  multilingual support, and explainable results.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => navigate("/dashboard")}
                  className="btn-premium bg-gradient-primary text-primary-foreground text-lg px-8 py-4"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Assignment
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 transition-smooth hover:scale-105"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Try Demo
                </Button>
              </div>
            </div>
            
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <img 
                src={heroImage}
                alt="AI-powered plagiarism detection illustration"
                className="relative z-10 w-full h-auto rounded-3xl shadow-glass glow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced AI technology that goes beyond simple text matching
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Brain,
                title: "Semantic Similarity",
                description: "Detects meaning-based similarities, not just word-for-word matches"
              },
              {
                icon: Globe,
                title: "Multilingual Support",
                description: "Analyze documents in multiple languages with high accuracy"
              },
              {
                icon: Zap,
                title: "AI-Powered Scoring",
                description: "Advanced algorithms provide precise plagiarism scores"
              },
              {
                icon: CheckCircle,
                title: "Explainable Results",
                description: "Clear visualizations show exactly where issues were found"
              }
            ].map((feature, index) => (
              <Card 
                key={index}
                className="p-6 glass-card hover:glow transition-smooth hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Educators</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of teachers and institutions worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Sarah Johnson",
                role: "Professor, Stanford University",
                content: "PlagiaSense has revolutionized how we handle academic integrity. The semantic analysis catches sophisticated attempts at plagiarism."
              },
              {
                name: "Michael Chen",
                role: "High School Teacher",
                content: "The interface is incredibly intuitive. Students and teachers alike find it easy to use and understand the results."
              },
              {
                name: "Prof. Elena Rodriguez",
                role: "Department Head, MIT",
                content: "Multi-language support is game-changing. We can now analyze papers from our international students with confidence."
              }
            ].map((testimonial, index) => (
              <Card 
                key={index}
                className="p-8 glass-card hover:glow transition-smooth animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-warning fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Enhance Academic Integrity?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join educators worldwide who trust PlagiaSense for accurate, 
              AI-powered plagiarism detection.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="bg-white text-primary hover:bg-white/90 text-lg px-12 py-4 btn-premium"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/30 border-t">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-primary mb-4">
                PlagiaSense
              </div>
              <p className="text-muted-foreground">
                AI-powered plagiarism detection for the modern classroom.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">About</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 PlagiaSense. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;