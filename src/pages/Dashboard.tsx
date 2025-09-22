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
  Loader2
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("assignments");
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

  const assignments = [
    {
      id: "1",
      filename: "History_Essay_Final.docx",
      date: "2024-01-15",
      score: 92,
      status: "completed",
      sources: 3
    },
    {
      id: "2", 
      filename: "Biology_Lab_Report.pdf",
      date: "2024-01-14",
      score: 15,
      status: "completed",
      sources: 8
    },
    {
      id: "3",
      filename: "Math_Assignment_Chapter5.docx",
      date: "2024-01-13",
      score: 67,
      status: "processing",
      sources: 0
    }
  ];

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
        description: "Only PDF files are supported for plagiarism detection.",
        variant: "destructive",
      });
    }

    if (pdfFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...pdfFiles]);
      toast({
        title: "Files added",
        description: `${pdfFiles.length} PDF file(s) added successfully.`,
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length < 2) {
      toast({
        title: "Insufficient files",
        description: "Please upload at least 2 PDF files (1 student document + 1 reference document).",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

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

      const result = await api.analyzePlagiarism(selectedFiles);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setAnalysis(result);

      toast({
        title: "Analysis complete!",
        description: `Document analyzed successfully. Overall plagiarism score: ${(result.overall_score * 100).toFixed(1)}%`,
      });

      // Navigate to results after a brief delay
      setTimeout(() => {
        navigate("/reports/new", { state: { analysisResult: result, filename: selectedFiles[0].name } });
      }, 1500);

    } catch (error) {
      setUploadProgress(0);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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
                      <p className="text-2xl font-bold">24</p>
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
                      <p className="text-2xl font-bold">18</p>
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
                      <p className="text-2xl font-bold">4</p>
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
                      <p className="text-2xl font-bold">2</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Upload Section */}
              <Card className="p-8 glass-card">
                <div className="text-center space-y-4">
                  <div className="p-6 bg-primary/10 rounded-full w-fit mx-auto">
                    <Upload className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Upload New Assignment</h3>
                    <p className="text-muted-foreground mb-6">
                      Upload PDFs: first is the student document, rest are reference documents
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
                            Upload at least 2 PDFs (student document + reference documents)
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
                                  {index === 0 && " (Student Document)"}
                                  {index > 0 && " (Reference)"}
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
                  {selectedFiles.length >= 2 && !isUploading && (
                    <Button 
                      onClick={handleUpload}
                      className="btn-premium bg-gradient-primary mt-4"
                      size="lg"
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      Analyze {selectedFiles.length} Documents
                    </Button>
                  )}
                </div>
              </Card>

              {/* Assignments Table */}
              <Card className="glass-card">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold">Recent Assignments</h3>
                </div>
                <div className="p-0">
                  {assignments.map((assignment, index) => (
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
                          {assignment.status === "completed" ? (
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
                          ) : (
                            <div className="flex items-center gap-2">
                              <Progress value={33} className="w-20" />
                              <span className="text-sm text-muted-foreground">Processing...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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