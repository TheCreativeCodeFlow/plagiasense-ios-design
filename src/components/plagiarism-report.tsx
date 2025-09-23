import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import CircularProgress from "@/components/circular-progress";
import { 
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  Search
} from "lucide-react";

export interface FlaggedSentence {
  student_sentence: string;
  score: number;
  reference_document: string;
  reference_sentence: string;
  sentence_index: number;
  risk_level: 'HIGH' | 'MEDIUM';
}

export interface PlagiarismResult {
  overall_score: number;
  red_count: number;
  orange_count: number;
  total_sentences: number;
  flagged_sentences: FlaggedSentence[];
  highlighted_fragments: string[];
  processing_time: number;
}

interface PlagiarismReportProps {
  data: PlagiarismResult;
  filename: string;
  onDownload: () => void;
}

const PlagiarismReport = ({ data, filename, onDownload }: PlagiarismReportProps) => {
  const [currentFlaggedIndex, setCurrentFlaggedIndex] = useState(0);
  
  const scoreValue = Math.round(data.overall_score * 100);
  const submissionDate = new Date().toISOString().split('T')[0];
  
  const getRiskAssessment = () => {
    if (scoreValue >= 85) return "Very High Risk - Significant plagiarism detected";
    if (scoreValue >= 70) return "High Risk - Multiple similarities found";
    if (scoreValue >= 50) return "Medium Risk - Some similarities detected";
    if (scoreValue >= 25) return "Low Risk - Minor similarities found";
    return "Very Low Risk - Minimal similarities detected";
  };

  const generatePlagiarismReport = () => {
    const riskAssessment = getRiskAssessment();
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plagiarism Report - ${filename}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 40px; background: #f8fafc; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        h1 { color: #1e293b; margin-bottom: 30px; text-align: center; font-size: 2.2em; }
        h2 { color: #334155; margin-top: 40px; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
        .header-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metadata-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 30px 0; }
        .metadata-item { text-align: center; padding: 20px; background: #f1f5f9; border-radius: 8px; }
        .metadata-item .value { display: block; font-size: 1.8em; font-weight: bold; color: #1e293b; }
        .metadata-item .label { font-size: 0.9em; color: #64748b; margin-top: 5px; }
        .score-high { color: #ef4444; }
        .score-medium { color: #f59e0b; }
        .sentence-item { margin: 15px 0; padding: 20px; border-radius: 8px; border-left: 4px solid; }
        .high-risk { background: #fef2f2; border-color: #ef4444; }
        .medium-risk { background: #fefbf3; border-color: #f59e0b; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📋 Plagiarism Detection Report</h1>
        
        <div class="header-info">
            <div><strong>Document:</strong> ${filename}</div>
            <div><strong>Analysis Date:</strong> ${submissionDate}</div>
            <div><strong>Overall Score:</strong> ${scoreValue}%</div>
            <div><strong>Processing Time:</strong> ${data.processing_time.toFixed(1)}s</div>
        </div>

        <div class="metadata-grid">
            <div class="metadata-item">
                <span class="value">${scoreValue}%</span>
                <span class="label">Overall Similarity</span>
            </div>
            <div class="metadata-item">
                <span class="value">${data.total_sentences}</span>
                <span class="label">Total Sentences</span>
            </div>
            <div class="metadata-item">
                <span class="value score-high">${data.red_count}</span>
                <span class="label">High Risk</span>
            </div>
            <div class="metadata-item">
                <span class="value score-medium">${data.orange_count}</span>
                <span class="label">Medium Risk</span>
            </div>
            <div class="metadata-item">
                <span class="value">${data.flagged_sentences.length}</span>
                <span class="label">Flagged Sentences</span>
            </div>
            <div class="metadata-item">
                <span class="value">${data.processing_time.toFixed(1)}s</span>
                <span class="label">Processing Time</span>
            </div>
        </div>

        <h2>📋 Flagged Content Analysis</h2>
        ${data.flagged_sentences.length === 0 ? 
            '<p style="text-align: center; color: #16a34a; font-size: 1.1em; padding: 20px;">🎉 No flagged content found. The document appears to be original.</p>' :
            data.flagged_sentences.map((sentence, index) => `
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
            ${data.flagged_sentences.length > 0 ? `
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
    link.download = `PlagiaSense_Plagiarism_Report_${cleanFilename}_${timestamp}.html`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-between items-center p-6 border-b">
        <div className="flex items-center gap-4">
          <Search className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Plagiarism Report</h1>
            <p className="text-muted-foreground">{filename}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generatePlagiarismReport}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 text-center">
            <CircularProgress 
              value={scoreValue} 
              color={scoreValue >= 85 ? "destructive" : scoreValue >= 50 ? "warning" : "success"}
            />
            <div className="mt-4">
              <div className="text-2xl font-bold">{scoreValue}%</div>
              <div className="text-sm text-muted-foreground">Overall Similarity</div>
            </div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold">{data.total_sentences}</div>
            <div className="text-sm text-muted-foreground">Total Sentences</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-destructive">{data.flagged_sentences.length}</div>
            <div className="text-sm text-muted-foreground">Flagged Sentences</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold">{data.red_count + data.orange_count}</div>
            <div className="text-sm text-muted-foreground">Risk Sentences</div>
          </Card>
        </div>

        {/* Risk Assessment */}
        <Card className="p-6">
          <div className="space-y-4">
            {data.flagged_sentences.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-green-600">No plagiarism detected</p>
                <p className="text-muted-foreground">Great work! The document appears to be original.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">
                    Flagged Sentences ({data.flagged_sentences.length})
                  </h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentFlaggedIndex(Math.max(0, currentFlaggedIndex - 1))}
                      disabled={currentFlaggedIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      {currentFlaggedIndex + 1} of {data.flagged_sentences.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentFlaggedIndex(Math.min(data.flagged_sentences.length - 1, currentFlaggedIndex + 1))}
                      disabled={currentFlaggedIndex >= data.flagged_sentences.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {(() => {
                  const flagged = data.flagged_sentences[currentFlaggedIndex];
                  if (!flagged) return null;
                  
                  return (
                    <Card className={`p-4 border-l-4 ${flagged.risk_level === 'HIGH' ? 'border-l-destructive bg-destructive/5' : 'border-l-orange-500 bg-orange-50/50'}`}>
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className={`text-sm font-medium ${flagged.risk_level === 'HIGH' ? 'text-destructive' : 'text-orange-500'}`}>
                            {flagged.risk_level} RISK - {(flagged.score * 100).toFixed(1)}% Similarity
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Sentence #{flagged.sentence_index + 1}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Student Text:</p>
                            <p className="text-sm leading-relaxed">{flagged.student_sentence}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Reference Text:</p>
                            <p className="text-sm leading-relaxed text-muted-foreground">{flagged.reference_sentence}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground">
                              <strong>Source:</strong> {flagged.reference_document}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })()}
              </div>
            )}
          </div>
        </Card>

        {/* Visual Progress Indicators */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Risk Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">High Risk Sentences</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className="bg-destructive h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (data.red_count / data.total_sentences) * 100 * 10)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-destructive">{data.red_count}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Medium Risk Sentences</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (data.orange_count / data.total_sentences) * 100 * 10)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-orange-500">{data.orange_count}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PlagiarismReport;