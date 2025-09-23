import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import CircularProgress from "@/components/circular-progress";
import AnimatedBackground from "@/components/animated-background";
import AIDetectionReport, { AIDetectionResult as AIReportResult } from "@/components/ai-detection-report";
import PlagiarismReport, { PlagiarismResult } from "@/components/plagiarism-report";
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
  Calendar,
  AlertTriangle,
  Search,
  Filter,
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

// Types for AI detection results
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

const Reports = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const { getAssignment } = useAssignments();
  const [currentFlaggedIndex, setCurrentFlaggedIndex] = useState(0);
  
  // If no ID is provided, redirect to all reports page
  useEffect(() => {
    if (!id) {
      navigate('/reports');
      return;
    }
  }, [id, navigate]);
  
  // Get analysis result from navigation state or assignment data
  const analysisResult: AnalysisResult | AIDetectionResult | null = location.state?.analysisResult || null;
  const filename = location.state?.filename || "Sample_Document.pdf";
  const analysisMode = location.state?.analysisMode || "plagiarism";
  
  // Try to load from assignment if we have an ID
  const assignment = id ? getAssignment(id) : null;
  
  // Individual report view logic
  // Determine which data to use - redirect to reports list if no data available
  let finalData: AnalysisResult | AIDetectionResult | null = null;
  let finalFilename: string = filename;
  let finalAnalysisMode: string = analysisMode;

  if (assignment && assignment.analysisResult) {
    // Use assignment data
    finalData = assignment.analysisResult;
    finalFilename = assignment.filename;
    finalAnalysisMode = assignment.analysisMode || "plagiarism";
  } else if (analysisResult) {
    // Use navigation state data
    finalData = analysisResult;
    finalFilename = filename;
    finalAnalysisMode = analysisMode;
  }

  // Redirect to reports list if no data is available for individual report
  useEffect(() => {
    if (!finalData && id) {
      navigate('/reports');
    }
  }, [finalData, navigate, id]);

  // Don't render individual report if no data
  if (!finalData) {
    return null;
  }

  // Helper functions to determine analysis type and cast data safely
  const isPlagiarismResult = (data: any): data is AnalysisResult => {
    return finalAnalysisMode === "plagiarism" || data.flagged_sentences !== undefined;
  };

  const isAIDetectionResult = (data: any): data is AIDetectionResult => {
    return finalAnalysisMode === "ai_detection" || data.ai_probability !== undefined;
  };

  // Determine the score value based on analysis type
  const scoreValue = isPlagiarismResult(finalData) 
    ? Math.round(finalData.overall_score * 100)
    : isAIDetectionResult(finalData)
    ? Math.round((finalData.ai_probability || finalData.overall_score) * 100)
    : 0;
  
  const submissionDate = new Date().toISOString().split('T')[0];



  // Render appropriate report component based on analysis mode
  if (isPlagiarismResult(finalData)) {
    return (
      <PlagiarismReport 
        data={finalData} 
        filename={finalFilename} 
        onDownload={() => {}} 
      />
    );
  } else if (isAIDetectionResult(finalData)) {
    return (
      <AIDetectionReport 
        data={finalData} 
        filename={finalFilename} 
        onDownload={() => {}} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Invalid Report Data</h2>
        <p className="text-muted-foreground mb-4">Unable to determine report type.</p>
        <Button onClick={() => navigate("/reports")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
      </div>
    </div>
  );
};

export default Reports;