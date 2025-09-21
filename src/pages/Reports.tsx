import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigate, useParams } from "react-router-dom";
import CircularProgress from "@/components/circular-progress";
import AnimatedBackground from "@/components/animated-background";
import { 
  ArrowLeft,
  FileText,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  Share,
  Lightbulb
} from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [animatedScore, setAnimatedScore] = useState(0);
  
  // Mock data for the report
  const reportData = {
    filename: "History_Essay_Final.docx",
    submissionDate: "2024-01-15",
    plagiarismScore: 92,
    totalWords: 1247,
    flaggedSentences: 23,
    sources: [
      {
        id: 1,
        url: "https://en.wikipedia.org/wiki/World_War_II",
        title: "World War II - Wikipedia",
        matches: 8,
        confidence: 95
      },
      {
        id: 2,
        url: "https://www.britannica.com/event/World-War-II",
        title: "World War II | Britannica",
        matches: 12,
        confidence: 88
      },
      {
        id: 3,
        url: "https://www.history.com/topics/world-war-ii",
        title: "World War II History - History.com",
        matches: 3,
        confidence: 76
      }
    ],
    suggestions: [
      "Rewrite the introduction paragraph to improve originality",
      "Paraphrase the statistical data in paragraphs 3-5",
      "Add more personal analysis and fewer direct quotes",
      "Consider citing sources more explicitly for better attribution"
    ]
  };

  // Sample text with highlighting
  const sampleText = `World War II was a global war that lasted from 1939 to 1945. It involved the vast majority of the world's countries—including all of the great powers—forming two opposing military alliances: the Allies and the Axis. [FLAGGED: This sentence closely matches Wikipedia content] 

The war began with the German invasion of Poland in September 1939, which led Britain and France to declare war on Germany. [ORIGINAL: This is well-paraphrased content] 

Over 70 million people died during World War II, making it the deadliest conflict in human history. [FLAGGED: Statistical information matches multiple sources] The war ended with the surrender of Japan in August 1945.`;

  useEffect(() => {
    // Animate the score
    const timer = setTimeout(() => {
      let current = 0;
      const increment = reportData.plagiarismScore / 50;
      const animate = () => {
        current += increment;
        if (current < reportData.plagiarismScore) {
          setAnimatedScore(Math.floor(current));
          requestAnimationFrame(animate);
        } else {
          setAnimatedScore(reportData.plagiarismScore);
        }
      };
      animate();
    }, 500);

    return () => clearTimeout(timer);
  }, [reportData.plagiarismScore]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-destructive";
    if (score >= 30) return "text-warning";
    return "text-success";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 70) return "from-destructive to-destructive/70";
    if (score >= 30) return "from-warning to-warning/70";
    return "from-success to-success/70";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b glass-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="hover:scale-105 transition-smooth"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Plagiarism Report</h1>
              <p className="text-sm text-muted-foreground">{reportData.filename}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Overview */}
            <Card className="p-8 glass-card hover:glow-strong animate-fade-in">
              <div className="text-center space-y-6">
                <div className="mb-6">
                  <CircularProgress 
                    value={animatedScore} 
                    size={200}
                    strokeWidth={12}
                    animated={true}
                    color={animatedScore >= 70 ? 'destructive' : animatedScore >= 30 ? 'warning' : 'success'}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{reportData.totalWords}</div>
                    <div className="text-sm text-muted-foreground">Total Words</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-destructive">{reportData.flaggedSentences}</div>
                    <div className="text-sm text-muted-foreground">Flagged</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{reportData.sources.length}</div>
                    <div className="text-sm text-muted-foreground">Sources</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Text Analysis */}
            <Card className="glass-card">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Text Analysis
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4 text-sm leading-relaxed">
                  {sampleText.split('\n\n').map((paragraph, index) => (
                    <div key={index} className="space-y-2">
                      {paragraph.includes('[FLAGGED:') ? (
                        <div className="p-4 bg-destructive/10 border-l-4 border-destructive rounded-r">
                          <div className="text-destructive font-medium flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4" />
                            Potential Plagiarism Detected
                          </div>
                          <p>{paragraph.split('[FLAGGED:')[0]}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {paragraph.split('[FLAGGED:')[1]?.replace(']', '')}
                          </p>
                        </div>
                      ) : paragraph.includes('[ORIGINAL:') ? (
                        <div className="p-4 bg-success/10 border-l-4 border-success rounded-r">
                          <div className="text-success font-medium flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4" />
                            Original Content
                          </div>
                          <p>{paragraph.split('[ORIGINAL:')[0]}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {paragraph.split('[ORIGINAL:')[1]?.replace(']', '')}
                          </p>
                        </div>
                      ) : (
                        <p className="text-foreground">{paragraph}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sources */}
            <Card className="glass-card">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Matched Sources</h3>
              </div>
              <div className="p-6 space-y-4">
                {reportData.sources.map((source) => (
                  <div key={source.id} className="space-y-3 pb-4 border-b last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2">{source.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{source.url}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{source.matches} matches</span>
                      <div className="flex items-center gap-2">
                        <Progress value={source.confidence} className="w-16 h-2" />
                        <span className="text-xs font-medium">{source.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Suggestions */}
            <Card className="glass-card">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Improvement Suggestions
                </h3>
              </div>
              <div className="p-6 space-y-3">
                {reportData.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                    <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Document Info */}
            <Card className="glass-card">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Document Information</h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{reportData.filename}</p>
                    <p className="text-xs text-muted-foreground">Submitted {reportData.submissionDate}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;