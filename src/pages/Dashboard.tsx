import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AnimatedBackground from "@/components/animated-background";
import { api, AnalysisResult } from "@/lib/api";
import { useAssignments, Assignment } from "@/lib/assignments";
// Import debug panel in development
if (import.meta.env.DEV) {
  import("@/lib/debug");
}
import { 
  Upload, 
  FileText, 
  BarChart3, 
  Settings, 
  Home,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Plus,
  Calendar,
  X,
  Loader2,
  Bot,
  Search
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("assignments");
  const { assignments, stats, addAssignment, updateAssignment, clearAllAssignments } = useAssignments();
  const [analysisMode, setAnalysisMode] = useState("plagiarism"); // "plagiarism" or "ai_detection"
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const sidebarItems = [
    { id: "assignments", icon: FileText, label: "Assignments" },
    { id: "reports", icon: BarChart3, label: "Reports" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  // Real-time assignments are now managed by useAssignments hook

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-destructive";
    if (score >= 30) return "text-warning";
    return "text-success";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-destructive/10";
    if (score >= 30) return "bg-warning/10";
    return "bg-success/10";
  };

  // File handling functions
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    // Filter only PDF files
    const pdfFiles = files.filter(file => file.type === "application/pdf");
    
    if (pdfFiles.length !== files.length) {
      toast({
        title: "Invalid file type",
        description: "Only PDF files are supported for analysis.",
        variant: "destructive",
      });
    }

    if (pdfFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...pdfFiles]);
      const modeText = analysisMode === "plagiarism" ? "plagiarism detection" : "AI detection";
      toast({
        title: "Files added",
        description: `${pdfFiles.length} PDF file(s) added for ${modeText}.`,
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const minFiles = analysisMode === "plagiarism" ? 2 : 1;
    if (selectedFiles.length < minFiles) {
      const modeDescription = analysisMode === "plagiarism" 
        ? "Please upload at least 2 PDF files (1 student document + 1 reference document)."
        : "Please upload at least 1 PDF file for AI detection.";
      
      toast({
        title: "Insufficient files",
        description: modeDescription,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Create assignment record immediately
    const primaryFile = selectedFiles[0];
    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    const assignmentId = addAssignment(
      primaryFile.name,
      analysisMode as 'plagiarism' | 'ai_detection',
      totalSize,
      selectedFiles
    );

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 1000);

      let result;
      if (analysisMode === "plagiarism") {
        result = await api.analyzePlagiarism(selectedFiles);
      } else {
        // AI Detection analysis
        result = await api.analyzeAI(selectedFiles[0]); // Only first file for AI detection
      }
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setAnalysis(result);

      // Update assignment with results
      const score = analysisMode === "plagiarism" 
        ? Math.round(result.overall_score * 100)
        : Math.round(result.ai_probability * 100);
      
      const sources = analysisMode === "plagiarism" 
        ? result.flagged_sentences?.length || 0
        : result.sentence_scores?.filter((s: any) => s.ai_probability > 0.5).length || 0;

      updateAssignment(assignmentId, {
        status: 'completed',
        score: score,
        sources: sources,
        analysisResult: result
      });

      const modeText = analysisMode === "plagiarism" ? "plagiarism" : "AI content";
      const scoreText = analysisMode === "plagiarism" 
        ? `Overall plagiarism score: ${(result.overall_score * 100).toFixed(1)}%`
        : `AI probability: ${(result.ai_probability * 100).toFixed(1)}%`;

      toast({
        title: "Analysis complete!",
        description: `Document analyzed for ${modeText}. ${scoreText}`,
      });

      // Navigate to results after a brief delay
      setTimeout(() => {
        navigate(`/reports/${assignmentId}`, { 
          state: { 
            analysisResult: result, 
            filename: selectedFiles[0].name,
            analysisMode: analysisMode
          } 
        });
      }, 1500);

    } catch (error) {
      setUploadProgress(0);
      
      // Update assignment with error status
      updateAssignment(assignmentId, {
        status: 'error'
      });
      
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setSelectedFiles([]);
    }
  };

  return (
    <div className="min-h-screen bg-background flex relative">
      <AnimatedBackground />
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r glass-card relative z-10">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="text-2xl font-bold text-primary">PlagiaSense</div>
          </div>
          
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b glass-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="hover:scale-105 transition-smooth"
              >
                <Home className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {activeTab === "assignments" && (
            <div className="space-y-6 animate-fade-in">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 glass-card hover:glow transition-smooth">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Assignments</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 glass-card hover:glow transition-smooth">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-success/10 rounded-full">
                      <CheckCircle className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clean Papers</p>
                      <p className="text-2xl font-bold">{stats.clean}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 glass-card hover:glow transition-smooth">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-warning/10 rounded-full">
                      <AlertTriangle className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Flagged</p>
                      <p className="text-2xl font-bold">{stats.flagged}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 glass-card hover:glow transition-smooth">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Processing</p>
                      <p className="text-2xl font-bold">{stats.processing}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Analysis Mode Selector */}
              <Card className="p-6 glass-card">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Analysis Type</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={analysisMode === "plagiarism" ? "default" : "outline"}
                      className="h-auto p-4 flex flex-col gap-2"
                      onClick={() => {
                        setAnalysisMode("plagiarism");
                        setSelectedFiles([]); // Clear files when switching modes
                      }}
                    >
                      <Search className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">Plagiarism Detection</div>
                        <div className="text-xs opacity-75">Compare against references</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant={analysisMode === "ai_detection" ? "default" : "outline"}
                      className="h-auto p-4 flex flex-col gap-2"
                      onClick={() => {
                        setAnalysisMode("ai_detection");
                        setSelectedFiles([]); // Clear files when switching modes
                      }}
                    >
                      <Bot className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">AI Detection</div>
                        <div className="text-xs opacity-75">Detect AI-generated content</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Upload Section */}
              <Card className="p-8 glass-card">
                <div className="text-center space-y-4">
                  <div className="p-6 bg-primary/10 rounded-full w-fit mx-auto">
                    <Upload className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {analysisMode === "plagiarism" ? "Upload Assignment for Plagiarism Check" : "Upload Document for AI Detection"}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {analysisMode === "plagiarism" 
                        ? "Upload PDFs: first is the student document, rest are reference documents"
                        : "Upload a PDF document to analyze for AI-generated content"
                      }
                    </p>
                  </div>

                  {/* File Upload Area */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-12 transition-all duration-200 cursor-pointer ${
                      dragActive 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {isUploading ? (
                      <div className="space-y-4">
                        <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
                        <div>
                          <p className="text-lg font-medium">Analyzing Documents...</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            This may take a few minutes depending on document size
                          </p>
                          <Progress value={uploadProgress} className="w-64 mx-auto" />
                          <p className="text-xs text-muted-foreground mt-2">
                            {uploadProgress.toFixed(0)}% complete
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Plus className="h-16 w-16 text-muted-foreground mx-auto" />
                        <div>
                          <p className="text-lg font-medium">Drop PDF files here or click to select</p>
                          <p className="text-sm text-muted-foreground">
                            {analysisMode === "plagiarism" 
                              ? "Upload at least 2 PDFs (student document + reference documents)"
                              : "Upload 1 PDF document for AI detection"
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-6 text-left">
                      <h4 className="font-medium mb-3">Selected Files ({selectedFiles.length}):</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-muted/20 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                  {analysisMode === "plagiarism" && index === 0 && " (Student Document)"}
                                  {analysisMode === "plagiarism" && index > 0 && " (Reference)"}
                                  {analysisMode === "ai_detection" && " (Document to analyze)"}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                              disabled={isUploading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  {((analysisMode === "plagiarism" && selectedFiles.length >= 2) || 
                    (analysisMode === "ai_detection" && selectedFiles.length >= 1)) && !isUploading && (
                    <Button 
                      onClick={handleUpload}
                      className="btn-premium bg-gradient-primary mt-4"
                      size="lg"
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      {analysisMode === "plagiarism" 
                        ? `Analyze ${selectedFiles.length} Documents for Plagiarism`
                        : "Analyze Document for AI Content"
                      }
                    </Button>
                  )}
                </div>
              </Card>

              {/* Assignments Table */}
              <Card className="glass-card">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Recent Assignments</h3>
                    {assignments.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          clearAllAssignments();
                          toast({
                            title: "All assignments cleared",
                            description: "Assignment history has been reset.",
                          });
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    )}
                  </div>
                </div>
                <div className="p-0">
                  {assignments.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No assignments yet</h3>
                      <p>Upload your first document to get started with plagiarism analysis.</p>
                    </div>
                  ) : (
                    assignments.map((assignment, index) => (
                    <div key={assignment.id} className="p-6 border-b last:border-b-0 hover:bg-muted/20 transition-smooth">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{assignment.filename}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {assignment.date}
                              </span>
                              {assignment.sources > 0 && (
                                <span>{assignment.sources} sources found</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {assignment.status === "completed" && assignment.score !== undefined ? (
                            <div className="flex items-center gap-2">
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBg(assignment.score)} ${getScoreColor(assignment.score)}`}>
                                {assignment.score}% similarity
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/reports/${assignment.id}`)}
                                className="hover:scale-105 transition-smooth"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Report
                              </Button>
                            </div>
                          ) : assignment.status === "error" ? (
                            <div className="flex items-center gap-2">
                              <div className="px-3 py-1 rounded-full text-sm font-medium bg-destructive/10 text-destructive">
                                Analysis Failed
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Progress value={33} className="w-20" />
                              <span className="text-sm text-muted-foreground">Processing...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="animate-fade-in">
              <Card className="p-8 text-center glass-card">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Reports Dashboard</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and reporting features coming soon
                </p>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="animate-fade-in">
              <Card className="p-8 text-center glass-card">
                <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Settings</h3>
                <p className="text-muted-foreground">
                  Customize your PlagiaSense experience
                </p>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;