import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import CircularProgress from "@/components/circular-progress";
import AnimatedBackground from "@/components/animated-background";
import { useAssignments } from "@/lib/assignments";
import { 
  ArrowLeft,
  FileText,
  ExternalLink,
  CheckCircle,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Types for plagiarism analysis results
export interface FlaggedSentence {
  student_sentence: string;
  score: number;
  reference_document: string;
  reference_sentence: string;
  sentence_index: number;
  risk_level: 'HIGH' | 'MEDIUM';
}

export interface AnalysisResult {
  overall_score: number;
  red_count: number;
  orange_count: number;
  total_sentences: number;
  flagged_sentences: FlaggedSentence[];
  highlighted_fragments: string[];
  processing_time: number;
}

const Reports = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const { getAssignment } = useAssignments();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [currentFlaggedIndex, setCurrentFlaggedIndex] = useState(0);
  
  // Get analysis result from navigation state or assignment data
  const analysisResult: AnalysisResult | null = location.state?.analysisResult || null;
  const filename = location.state?.filename || "Sample_Document.pdf";
  
  // Try to load from assignment if we have an ID but no navigation state
  const assignment = id ? getAssignment(id) : null;
  
  // Determine which data to use - redirect to dashboard if no data available
  let finalData: AnalysisResult | null = null;
  let finalFilename: string = filename;

  if (assignment && assignment.analysisResult) {
    // Use assignment data
    finalData = assignment.analysisResult;
    finalFilename = assignment.filename;
  } else if (analysisResult) {
    // Use navigation state data
    finalData = analysisResult;
    finalFilename = filename;
  }

  // Redirect to dashboard if no data is available
  useEffect(() => {
    if (!finalData) {
      navigate('/dashboard');
    }
  }, [finalData, navigate]);

  // Don't render if no data
  if (!finalData) {
    return null;
  }
  
  const scoreValue = Math.round(finalData.overall_score * 100);
  const submissionDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Animate the score
    const timer = setTimeout(() => {
      let current = 0;
      const increment = scoreValue / 50;
      const animate = () => {
        current += increment;
        if (current < scoreValue) {
          setAnimatedScore(Math.floor(current));
          requestAnimationFrame(animate);
        } else {
          setAnimatedScore(scoreValue);
        }
      };
      animate();
    }, 500);

    return () => clearTimeout(timer);
  }, [scoreValue]);

  const exportReport = () => {
    const reportDate = new Date().toLocaleDateString();
    const reportTime = new Date().toLocaleTimeString();
    
    const riskAssessment = scoreValue >= 70 ? '🚨 HIGH RISK - Significant similarity detected' : 
                          scoreValue >= 30 ? '⚠️ MODERATE RISK - Some similarities found' : 
                          '✅ LOW RISK - Minimal similarities detected';

    // Create and download the file
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
                <span class="value ${scoreValue >= 70 ? 'score-high' : scoreValue >= 30 ? 'score-medium' : 'score-low'}">
                    ${scoreValue}%
                </span>
                <span class="label">Overall Similarity</span>
            </div>
            <div class="metadata-item">
                <span class="value">${finalData.total_sentences}</span>
                <span class="label">Total Sentences</span>
            </div>
            <div class="metadata-item">
                <span class="value score-high">${finalData.red_count}</span>
                <span class="label">High Risk</span>
            </div>
            <div class="metadata-item">
                <span class="value score-medium">${finalData.orange_count}</span>
                <span class="label">Medium Risk</span>
            </div>
            <div class="metadata-item">
                <span class="value">${finalData.flagged_sentences.length}</span>
                <span class="label">Flagged Sentences</span>
            </div>
            <div class="metadata-item">
                <span class="value">${finalData.processing_time.toFixed(1)}s</span>
                <span class="label">Processing Time</span>
            </div>
        </div>

        <h2>📋 Flagged Content Analysis</h2>
        ${finalData.flagged_sentences.length === 0 ? 
            '<p style="text-align: center; color: #16a34a; font-size: 1.1em; padding: 20px;">🎉 No flagged content found. The document appears to be original.</p>' :
            finalData.flagged_sentences.map((sentence, index) => `
            <div class="sentence-item ${sentence.risk_level === 'HIGH' ? 'high-risk' : 'medium-risk'}">
                <h4>Flagged Content #${index + 1} - ${sentence.risk_level} Risk (${(sentence.score * 100).toFixed(1)}% similarity)</h4>
                <p><strong>Student Text:</strong> ${sentence.student_sentence}</p>
                <p><strong>Reference Text:</strong> ${sentence.reference_sentence}</p>
                <p><small><strong>Source:</strong> ${sentence.reference_document}</small></p>
            </div>
        `).join('')}

        <h2>💡 Recommendations</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1;">
            <p><strong>Risk Assessment:</strong> ${riskAssessment}</p>
            ${finalData.flagged_sentences.length > 0 ? `
                <ul>
                    <li>Review flagged content for potential plagiarism</li>
                    <li>Paraphrase similar content in your own words</li>
                    <li>Add proper citations where needed</li>
                    <li>Include more original analysis</li>
                </ul>
            ` : `
                <p>✅ <strong>Excellent Work!</strong> No significant similarities detected.</p>
            `}
        </div>

        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 0.9em;">
            <p><strong>PlagiaSense</strong> - AI-Powered Plagiarism Detection</p>
        </div>
    </div>
</body>
</html>`;

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

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      
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
              <p className="text-sm text-muted-foreground">{finalFilename}</p>
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
                <h2 className="text-2xl font-bold">Similarity Analysis</h2>
                
                <div className="flex items-center justify-center">
                  <CircularProgress 
                    value={animatedScore}
                    size={200}
                    strokeWidth={12}
                    animated={true}
                    color={animatedScore >= 70 ? 'destructive' : animatedScore >= 30 ? 'warning' : 'success'}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{finalData.total_sentences}</div>
                    <div className="text-sm text-muted-foreground">Total Sentences</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">{finalData.flagged_sentences.length}</div>
                    <div className="text-sm text-muted-foreground">Flagged</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{finalData.red_count + finalData.orange_count}</div>
                    <div className="text-sm text-muted-foreground">Issues Found</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Flagged Content */}
            {finalData.flagged_sentences.length === 0 ? (
              <Card className="glass-card">
                <div className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-success">No Plagiarism Detected</h3>
                  <p className="text-muted-foreground">
                    This document appears to be original with no significant similarities found.
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="glass-card">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Flagged Sentences ({finalData.flagged_sentences.length})
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
                        {currentFlaggedIndex + 1} of {finalData.flagged_sentences.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentFlaggedIndex(Math.min(finalData.flagged_sentences.length - 1, currentFlaggedIndex + 1))}
                        disabled={currentFlaggedIndex >= finalData.flagged_sentences.length - 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {(() => {
                    const flagged = finalData.flagged_sentences[currentFlaggedIndex];
                    if (!flagged) return null;
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            flagged.risk_level === 'HIGH' 
                              ? 'bg-destructive/10 text-destructive' 
                              : 'bg-warning/10 text-warning'
                          }`}>
                            {flagged.risk_level} Risk - {(flagged.score * 100).toFixed(1)}% similarity
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Sentence {flagged.sentence_index + 1}
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Student Text
                            </h4>
                            <div className="p-4 bg-muted/20 rounded-lg border-l-4 border-primary">
                              {flagged.student_sentence}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <ExternalLink className="h-4 w-4" />
                              Reference Source
                            </h4>
                            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500">
                              <p className="mb-2">{flagged.reference_sentence}</p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                Source: {flagged.reference_document}
                              </p>
                            </div>
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
          <div className="lg:col-span-1">
            <Card className="glass-card">
              <div className="p-6">
                <h3 className="font-semibold mb-4">Analysis Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Detection Method:</p>
                    <p className="text-sm font-medium">BERT Semantic Analysis</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Risk Distribution:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">High Risk</span>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-muted rounded-full">
                            <div 
                              className="h-full bg-destructive rounded-full transition-all duration-1000"
                              style={{ width: `${Math.min(100, (finalData.red_count / finalData.total_sentences) * 100 * 10)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-destructive">{finalData.red_count}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Medium Risk</span>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-muted rounded-full">
                            <div 
                              className="h-full bg-warning rounded-full transition-all duration-1000"
                              style={{ width: `${Math.min(100, (finalData.orange_count / finalData.total_sentences) * 100 * 10)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-warning">{finalData.orange_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Processing Time: {finalData.processing_time.toFixed(1)}s</p>
                  </div>
                  
                  {finalData.flagged_sentences.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Recommendations:</p>
                      <div className="space-y-2 text-xs">
                        <div className="p-2 bg-primary/5 rounded">
                          Review flagged content for potential issues
                        </div>
                        <div className="p-2 bg-primary/5 rounded">
                          Paraphrase similar sections in your own words
                        </div>
                        <div className="p-2 bg-primary/5 rounded">
                          Add proper citations where needed
                        </div>
                      </div>
                    </div>
                  )}
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