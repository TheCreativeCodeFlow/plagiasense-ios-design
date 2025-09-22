import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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
  Lightbulb,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { toast } = useToast();
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

  const exportReport = () => {
    const reportDate = new Date().toLocaleDateString();
    const reportTime = new Date().toLocaleTimeString();
    
    // Generate detailed HTML report
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PlagiaSense Analysis Report - ${filename}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #6366f1;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #6366f1;
            margin: 0;
            font-size: 2.2em;
        }
        .metadata {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .metadata-item {
            text-align: center;
        }
        .metadata-item .value {
            font-size: 1.8em;
            font-weight: bold;
            display: block;
        }
        .metadata-item .label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .score-high { color: #dc2626; }
        .score-medium { color: #f59e0b; }
        .score-low { color: #16a34a; }
        .flagged-sentences {
            margin: 30px 0;
        }
        .sentence-item {
            margin: 20px 0;
            padding: 20px;
            border-radius: 8px;
            border-left: 5px solid #ddd;
        }
        .sentence-item.high-risk {
            background: #fef2f2;
            border-left-color: #dc2626;
        }
        .sentence-item.medium-risk {
            background: #fffbeb;
            border-left-color: #f59e0b;
        }
        .sentence-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 15px;
        }
        .risk-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .risk-badge.high { background: #dc2626; color: white; }
        .risk-badge.medium { background: #f59e0b; color: white; }
        .similarity-score {
            font-weight: bold;
            font-size: 1.1em;
        }
        .student-text {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 6px;
            margin: 10px 0;
            border-left: 4px solid #6366f1;
        }
        .reference-text {
            background: #f0f9ff;
            padding: 15px;
            border-radius: 6px;
            margin: 10px 0;
            border-left: 4px solid #0ea5e9;
        }
        .section-title {
            font-size: 1.4em;
            color: #374151;
            margin: 30px 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
        .processing-info {
            background: #f0f9ff;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #0ea5e9;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 PlagiaSense Analysis Report</h1>
            <p><strong>Document:</strong> ${filename}</p>
            <p><strong>Generated:</strong> ${reportDate} at ${reportTime}</p>
        </div>

        <div class="metadata">
            <div class="metadata-item">
                <span class="value ${plagiarismScore >= 70 ? 'score-high' : plagiarismScore >= 30 ? 'score-medium' : 'score-low'}">
                    ${plagiarismScore}%
                </span>
                <span class="label">Overall Similarity</span>
            </div>
            <div class="metadata-item">
                <span class="value">${reportData.total_sentences}</span>
                <span class="label">Total Sentences</span>
            </div>
            <div class="metadata-item">
                <span class="value score-high">${reportData.red_count}</span>
                <span class="label">High Risk</span>
            </div>
            <div class="metadata-item">
                <span class="value score-medium">${reportData.orange_count}</span>
                <span class="label">Medium Risk</span>
            </div>
            <div class="metadata-item">
                <span class="value">${reportData.flagged_sentences.length}</span>
                <span class="label">Flagged Sentences</span>
            </div>
            <div class="metadata-item">
                <span class="value">${reportData.processing_time.toFixed(1)}s</span>
                <span class="label">Processing Time</span>
            </div>
        </div>

        <div class="processing-info">
            <h3>Analysis Summary</h3>
            <p><strong>Risk Assessment:</strong> ${plagiarismScore >= 70 ? '🚨 HIGH RISK - Significant similarity detected' : plagiarismScore >= 30 ? '⚠️ MODERATE RISK - Some similarities found' : '✅ LOW RISK - Minimal similarities detected'}</p>
            <p><strong>Model Used:</strong> BERT-based Semantic Similarity Analysis</p>
            <p><strong>Detection Method:</strong> Advanced semantic matching with context understanding</p>
        </div>

        <h2 class="section-title">📋 Flagged Content Analysis</h2>
        ${reportData.flagged_sentences.length === 0 ? 
            '<p style="text-align: center; color: #16a34a; font-size: 1.1em; padding: 20px;">🎉 No flagged content found. The document appears to be original.</p>' :
            reportData.flagged_sentences.map((sentence, index) => `
            <div class="sentence-item ${sentence.risk_level === 'HIGH' ? 'high-risk' : 'medium-risk'}">
                <div class="sentence-header">
                    <h4 style="margin: 0;">Flagged Content #${index + 1}</h4>
                    <div>
                        <span class="risk-badge ${sentence.risk_level.toLowerCase()}">${sentence.risk_level} Risk</span>
                        <span class="similarity-score" style="margin-left: 10px;">Similarity: ${(sentence.score * 100).toFixed(1)}%</span>
                    </div>
                </div>
                
                <div>
                    <h5>📝 Student Text (Sentence ${sentence.sentence_index + 1}):</h5>
                    <div class="student-text">${sentence.student_sentence}</div>
                </div>
                
                <div>
                    <h5>📚 Similar Reference Text:</h5>
                    <div class="reference-text">
                        ${sentence.reference_sentence}
                        <br><small style="color: #0ea5e9; font-weight: bold;">Source: ${sentence.reference_document}</small>
                    </div>
                </div>
            </div>
        `).join('')}

        <h2 class="section-title">💡 Recommendations</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1;">
            ${reportData.flagged_sentences.length > 0 ? `
                <ul style="margin: 0; padding-left: 20px;">
                    <li><strong>Review Flagged Content:</strong> Examine the ${reportData.flagged_sentences.length} flagged sentence(s) above for potential plagiarism.</li>
                    <li><strong>Paraphrase:</strong> Rewrite similar content in your own words while maintaining the original meaning.</li>
                    <li><strong>Add Citations:</strong> Properly cite any referenced sources to avoid plagiarism.</li>
                    <li><strong>Original Analysis:</strong> Include more personal insights and original analysis.</li>
                    <li><strong>Vary Sentence Structure:</strong> Use different sentence patterns and vocabulary.</li>
                </ul>
            ` : `
                <p style="margin: 0; color: #16a34a;">✅ <strong>Excellent Work!</strong> No significant similarities detected. The document demonstrates good originality.</p>
            `}
        </div>

        <div class="footer">
            <p><strong>PlagiaSense</strong> - AI-Powered Plagiarism Detection</p>
            <p>This report was generated using advanced BERT-based semantic analysis</p>
            <p>For questions about this report, please consult your instructor or academic integrity guidelines</p>
        </div>
    </div>
</body>
</html>`;

    // Create and download the file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const cleanFilename = filename.replace(/\.[^/.]+$/, ""); // Remove extension
    link.download = `PlagiaSense_Report_${cleanFilename}_${timestamp}.html`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    // Show success notification
    toast({
      title: "Report exported successfully!",
      description: `Downloaded as ${link.download}`,
    });
  };

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
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportReport}
              className="hover:bg-primary/10 transition-smooth"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
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