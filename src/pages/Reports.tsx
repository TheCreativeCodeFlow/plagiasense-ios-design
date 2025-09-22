import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import CircularProgress from "@/components/circular-progress";
import AnimatedBackground from "@/components/animated-background";
import { AnalysisResult, FlaggedSentence } from "@/lib/api";
import { 
  ArrowLeft,
  FileText,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  Share,
  Lightbulb,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [currentFlaggedIndex, setCurrentFlaggedIndex] = useState(0);
  
  // Get analysis result from navigation state or use mock data
  const analysisResult: AnalysisResult | null = location.state?.analysisResult || null;
  const filename = location.state?.filename || "Sample_Document.pdf";
  
  // Mock data for demonstration if no real data
  const mockData: AnalysisResult = {
    overall_score: 0.15,
    red_count: 2,
    orange_count: 3,
    total_sentences: 45,
    flagged_sentences: [
      {
        student_sentence: "World War II was a global war that lasted from 1939 to 1945, involving most of the world's nations.",
        score: 0.92,
        reference_document: "world_war_ii_reference.pdf",
        reference_sentence: "World War II was a global war that took place from 1939 to 1945 and involved the majority of the world's countries.",
        sentence_index: 3,
        risk_level: "HIGH"
      },
      {
        student_sentence: "The conflict resulted in significant casualties and changed the geopolitical landscape forever.",
        score: 0.78,
        reference_document: "history_textbook.pdf", 
        reference_sentence: "This devastating conflict led to enormous casualties and permanently altered the global political landscape.",
        sentence_index: 15,
        risk_level: "MEDIUM"
      }
    ],
    highlighted_fragments: [],
    processing_time: 45.2
  };

  const reportData = analysisResult || mockData;
  const plagiarismScore = Math.round(reportData.overall_score * 100);
  const submissionDate = new Date().toISOString().split('T')[0];

  // Sample text with highlighting
  const sampleText = `World War II was a global war that lasted from 1939 to 1945. It involved the vast majority of the world's countries—including all of the great powers—forming two opposing military alliances: the Allies and the Axis. [FLAGGED: This sentence closely matches Wikipedia content] 

The war began with the German invasion of Poland in September 1939, which led Britain and France to declare war on Germany. [ORIGINAL: This is well-paraphrased content] 

Over 70 million people died during World War II, making it the deadliest conflict in human history. [FLAGGED: Statistical information matches multiple sources] The war ended with the surrender of Japan in August 1945.`;

  useEffect(() => {
    // Animate the score
    const timer = setTimeout(() => {
      let current = 0;
      const increment = plagiarismScore / 50;
      const animate = () => {
        current += increment;
        if (current < plagiarismScore) {
          setAnimatedScore(Math.floor(current));
          requestAnimationFrame(animate);
        } else {
          setAnimatedScore(plagiarismScore);
        }
      };
      animate();
    }, 500);

    return () => clearTimeout(timer);
  }, [plagiarismScore]);

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
              <p className="text-sm text-muted-foreground">{filename}</p>
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
                    <div className="text-2xl font-bold">{reportData.total_sentences}</div>
                    <div className="text-sm text-muted-foreground">Total Sentences</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-destructive">{reportData.flagged_sentences.length}</div>
                    <div className="text-sm text-muted-foreground">Flagged</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{reportData.red_count + reportData.orange_count}</div>
                    <div className="text-sm text-muted-foreground">Issues Found</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Flagged Sentences Navigation */}
            {reportData.flagged_sentences.length > 0 && (
              <Card className="glass-card">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Flagged Sentences ({reportData.flagged_sentences.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentFlaggedIndex(Math.max(0, currentFlaggedIndex - 1))}
                        disabled={currentFlaggedIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {currentFlaggedIndex + 1} of {reportData.flagged_sentences.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentFlaggedIndex(Math.min(reportData.flagged_sentences.length - 1, currentFlaggedIndex + 1))}
                        disabled={currentFlaggedIndex >= reportData.flagged_sentences.length - 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {(() => {
                    const flagged = reportData.flagged_sentences[currentFlaggedIndex];
                    if (!flagged) return null;
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            flagged.risk_level === 'HIGH' 
                              ? 'bg-destructive/10 text-destructive' 
                              : 'bg-warning/10 text-warning'
                          }`}>
                            {flagged.risk_level} RISK - {(flagged.score * 100).toFixed(1)}% similarity
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Sentence #{flagged.sentence_index + 1}
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-destructive/5 border-l-4 border-destructive rounded-r">
                            <div className="text-destructive font-medium flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4" />
                              Student Text
                            </div>
                            <p className="text-sm">{flagged.student_sentence}</p>
                          </div>
                          
                          <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-r">
                            <div className="text-primary font-medium flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4" />
                              Reference Source
                            </div>
                            <p className="text-sm">{flagged.reference_sentence}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Source: {flagged.reference_document}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Analysis Summary */}
            <Card className="glass-card">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Analysis Summary</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-destructive/5 rounded-lg">
                    <div className="text-2xl font-bold text-destructive">{reportData.red_count}</div>
                    <div className="text-sm text-muted-foreground">High Risk</div>
                  </div>
                  <div className="text-center p-4 bg-warning/5 rounded-lg">
                    <div className="text-2xl font-bold text-warning">{reportData.orange_count}</div>
                    <div className="text-sm text-muted-foreground">Medium Risk</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Processing Time: {reportData.processing_time.toFixed(1)}s</p>
                  <p>Analysis completed using advanced BERT-based similarity detection</p>
                </div>
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
                {[
                  "Review flagged sentences and rewrite in your own words",
                  "Add proper citations for referenced material",
                  "Paraphrase content while maintaining original meaning",
                  "Ensure proper attribution for all sources used"
                ].map((suggestion, index) => (
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
                    <p className="text-sm font-medium">{filename}</p>
                    <p className="text-xs text-muted-foreground">Analyzed on {submissionDate}</p>
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