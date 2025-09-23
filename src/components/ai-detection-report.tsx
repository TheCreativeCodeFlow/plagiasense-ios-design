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
  Bot,
  Brain,
  Zap
} from "lucide-react";

export interface AISentenceScore {
  sentence: string;
  ai_probability: number;
  sentence_index: number;
}

export interface AIDetectionResult {
  available: boolean;
  method: string;
  overall_score: number;
  ai_probability: number;
  sentence_scores: AISentenceScore[];
  high_risk_sentences: number;
  medium_risk_sentences: number;
  model_used?: string;
  optimized?: boolean;
  device?: string;
  total_sentences_analyzed: number;
  processing_time: number;
}

interface AIDetectionReportProps {
  data: AIDetectionResult;
  filename: string;
  onDownload: () => void;
}

const AIDetectionReport = ({ data, filename, onDownload }: AIDetectionReportProps) => {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  
  const aiProbabilityScore = Math.round((data.ai_probability || data.overall_score) * 100);
  const submissionDate = new Date().toISOString().split('T')[0];
  
  // Filter high-risk sentences (AI probability > 0.7)
  const highRiskSentences = data.sentence_scores?.filter(s => s.ai_probability > 0.7) || [];
  const mediumRiskSentences = data.sentence_scores?.filter(s => s.ai_probability > 0.5 && s.ai_probability <= 0.7) || [];
  
  const getRiskAssessment = () => {
    if (aiProbabilityScore >= 80) return "High Risk - Likely AI-generated";
    if (aiProbabilityScore >= 50) return "Medium Risk - Some AI-generated content detected";
    return "Low Risk - Likely human-written";
  };

  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case 'pretrained':
        return 'Pre-trained AI Model';
      case 'gptzero_api':
        return 'GPTZero API';
      case 'custom_api':
        return 'Custom API';
      case 'statistical':
        return 'Statistical Analysis';
      default:
        return method;
    }
  };

  const generateAIReport = () => {
    const riskAssessment = getRiskAssessment();
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Detection Report - ${filename}</title>
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
        .sentence-item { margin: 15px 0; padding: 20px; border-radius: 8px; border-left: 4px solid; }
        .high-risk { background: #fef2f2; border-color: #ef4444; }
        .medium-risk { background: #fefbf3; border-color: #f59e0b; }
        .low-risk { background: #f0fdf4; border-color: #10b981; }
        .ai-probability { font-weight: bold; }
        .high-prob { color: #ef4444; }
        .medium-prob { color: #f59e0b; }
        .low-prob { color: #10b981; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 AI Detection Report</h1>
        
        <div class="header-info">
            <div><strong>Document:</strong> ${filename}</div>
            <div><strong>Analysis Date:</strong> ${submissionDate}</div>
            <div><strong>Method:</strong> ${getMethodDisplayName(data.method)}</div>
            <div><strong>Processing Time:</strong> ${data.processing_time.toFixed(1)}s</div>
        </div>

        <div class="metadata-grid">
            <div class="metadata-item">
                <span class="value ${aiProbabilityScore >= 80 ? 'high-prob' : aiProbabilityScore >= 50 ? 'medium-prob' : 'low-prob'}">${aiProbabilityScore}%</span>
                <span class="label">AI Probability</span>
            </div>
            <div class="metadata-item">
                <span class="value">${data.total_sentences_analyzed}</span>
                <span class="label">Total Sentences</span>
            </div>
            <div class="metadata-item">
                <span class="value ai-probability high-prob">${highRiskSentences.length}</span>
                <span class="label">High Risk Sentences</span>
            </div>
            <div class="metadata-item">
                <span class="value ai-probability medium-prob">${mediumRiskSentences.length}</span>
                <span class="label">Medium Risk Sentences</span>
            </div>
            <div class="metadata-item">
                <span class="value">${data.processing_time.toFixed(1)}s</span>
                <span class="label">Processing Time</span>
            </div>
        </div>

        <h2>🔍 Sentence Analysis</h2>
        ${highRiskSentences.length === 0 && mediumRiskSentences.length === 0 ? 
            '<p style="text-align: center; color: #10b981; font-size: 1.1em; padding: 20px;">✅ No high-risk AI-generated content detected.</p>' :
            [...highRiskSentences, ...mediumRiskSentences].map((sentence, index) => `
            <div class="sentence-item ${sentence.ai_probability > 0.7 ? 'high-risk' : 'medium-risk'}">
                <h4>Sentence #${sentence.sentence_index + 1} - ${sentence.ai_probability > 0.7 ? 'HIGH' : 'MEDIUM'} Risk (${(sentence.ai_probability * 100).toFixed(1)}% AI probability)</h4>
                <p><strong>Text:</strong> ${sentence.sentence}</p>
            </div>
        `).join('')}

        <h2>📊 Risk Assessment</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1;">
            <p><strong>Overall Assessment:</strong> ${riskAssessment}</p>
            ${data.model_used ? `<p><strong>Model Used:</strong> ${data.model_used}</p>` : ''}
            ${aiProbabilityScore >= 50 ? `
                <ul>
                    <li>Review flagged sentences for potential AI generation</li>
                    <li>Consider requesting original drafts or revision history</li>
                    <li>Encourage more personal voice and unique perspectives</li>
                    <li>Verify understanding through oral discussion</li>
                </ul>
            ` : `
                <p>✅ <strong>Good work!</strong> Content appears to be human-written.</p>
            `}
        </div>

        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 0.9em;">
            <p><strong>PlagiaSense</strong> - AI-Powered Content Detection</p>
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
    link.download = `PlagiaSense_AI_Report_${cleanFilename}_${timestamp}.html`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-between items-center p-6 border-b">
        <div className="flex items-center gap-4">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">AI Detection Report</h1>
            <p className="text-muted-foreground">{filename}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateAIReport}>
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
              value={aiProbabilityScore} 
              color={aiProbabilityScore >= 80 ? "destructive" : aiProbabilityScore >= 50 ? "warning" : "success"}
            />
            <div className="mt-4">
              <div className="text-2xl font-bold">{aiProbabilityScore}%</div>
              <div className="text-sm text-muted-foreground">AI Probability</div>
            </div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold">{data.total_sentences_analyzed}</div>
            <div className="text-sm text-muted-foreground">Total Sentences</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-destructive">{highRiskSentences.length}</div>
            <div className="text-sm text-muted-foreground">High Risk</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-500">{mediumRiskSentences.length}</div>
            <div className="text-sm text-muted-foreground">Medium Risk</div>
          </Card>
        </div>

        {/* Risk Assessment */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            {aiProbabilityScore >= 80 ? (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            ) : aiProbabilityScore >= 50 ? (
              <Eye className="h-5 w-5 text-orange-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            <h3 className="text-lg font-semibold">Risk Assessment</h3>
          </div>
          <p className="text-muted-foreground mb-2">{getRiskAssessment()}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Method:</strong> {getMethodDisplayName(data.method)}
            </div>
            <div>
              <strong>Processing Time:</strong> {data.processing_time.toFixed(1)}s
            </div>
            {data.model_used && (
              <div>
                <strong>Model:</strong> {data.model_used}
              </div>
            )}
            {data.device && (
              <div>
                <strong>Device:</strong> {data.device}
              </div>
            )}
          </div>
        </Card>

        {/* Sentence Analysis */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Sentence Analysis</h3>
          
          {highRiskSentences.length === 0 && mediumRiskSentences.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-green-600">No AI-generated content detected</p>
              <p className="text-muted-foreground">The document appears to be human-written.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">
                  Flagged Sentences ({highRiskSentences.length + mediumRiskSentences.length})
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentSentenceIndex(Math.max(0, currentSentenceIndex - 1))}
                    disabled={currentSentenceIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    {currentSentenceIndex + 1} of {highRiskSentences.length + mediumRiskSentences.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentSentenceIndex(Math.min(highRiskSentences.length + mediumRiskSentences.length - 1, currentSentenceIndex + 1))}
                    disabled={currentSentenceIndex >= highRiskSentences.length + mediumRiskSentences.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {(() => {
                const allFlaggedSentences = [...highRiskSentences, ...mediumRiskSentences];
                const sentence = allFlaggedSentences[currentSentenceIndex];
                if (!sentence) return null;
                
                const riskLevel = sentence.ai_probability > 0.7 ? 'HIGH' : 'MEDIUM';
                const riskColor = sentence.ai_probability > 0.7 ? 'text-destructive' : 'text-orange-500';
                
                return (
                  <Card className={`p-4 border-l-4 ${sentence.ai_probability > 0.7 ? 'border-l-destructive bg-destructive/5' : 'border-l-orange-500 bg-orange-50/50'}`}>
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium ${riskColor}`}>
                          {riskLevel} RISK - {(sentence.ai_probability * 100).toFixed(1)}% AI Probability
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Sentence #{sentence.sentence_index + 1}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{sentence.sentence}</p>
                    </div>
                  </Card>
                );
              })()}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AIDetectionReport;