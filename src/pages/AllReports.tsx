import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AnimatedBackground from "@/components/animated-background";
import SimilarityProgress from "@/components/similarity-progress";
import { useAssignments, Assignment } from "@/lib/assignments";
import { 
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  Download,
  Eye,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Target,
  Zap,
  Grid3X3,
  List,
  RefreshCw,
} from "lucide-react";

type SortField = 'date' | 'filename' | 'score' | 'sources';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

const AllReports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { assignments, stats } = useAssignments();
  
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'error'>('all');
  const [analysisFilter, setAnalysisFilter] = useState<'all' | 'plagiarism' | 'ai_detection'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Filter and sort assignments
  const filteredAndSortedAssignments = assignments
    .filter(assignment => {
      const matchesSearch = assignment.filename.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
      const matchesAnalysis = analysisFilter === 'all' || assignment.analysisMode === analysisFilter;
      return matchesSearch && matchesStatus && matchesAnalysis;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'date':
          aValue = new Date(a.uploadedAt).getTime();
          bValue = new Date(b.uploadedAt).getTime();
          break;
        case 'filename':
          aValue = a.filename.toLowerCase();
          bValue = b.filename.toLowerCase();
          break;
        case 'score':
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        case 'sources':
          aValue = a.sources;
          bValue = b.sources;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Get completed assignments for statistics
  const completedAssignments = assignments.filter(a => a.status === 'completed' && a.analysisResult);
  
  // Calculate average score
  const avgScore = completedAssignments.length > 0 
    ? Math.round(completedAssignments.reduce((sum, a) => sum + (a.score || 0), 0) / completedAssignments.length)
    : 0;

  // Helper functions
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-warning animate-pulse" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportAllReports = () => {
    // Create comprehensive report with all completed assignments
    const completedReports = completedAssignments.filter(a => a.analysisResult);
    
    if (completedReports.length === 0) {
      toast({
        title: "No reports to export",
        description: "Complete some analyses first to generate reports.",
        variant: "destructive",
      });
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PlagiaSense Comprehensive Analysis Report</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; background: #f8f9fa; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .stat-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .stat-label { color: #666; font-size: 0.9em; }
        .reports { padding: 30px; }
        .report-item { border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
        .report-header { background: #f9fafb; padding: 20px; border-bottom: 1px solid #e5e7eb; }
        .report-content { padding: 20px; }
        .score-high { color: #dc2626; }
        .score-medium { color: #f59e0b; }
        .score-low { color: #16a34a; }
        .flagged-sentence { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 10px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 PlagiaSense Analysis Report</h1>
            <p>Comprehensive Analysis Summary • Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">Total Assignments</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.completed}</div>
                <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${avgScore}%</div>
                <div class="stat-label">Average Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.flagged}</div>
                <div class="stat-label">Flagged Reports</div>
            </div>
        </div>

        <div class="reports">
            <h2>📋 Individual Reports</h2>
            ${completedReports.map((assignment, index) => `
                <div class="report-item">
                    <div class="report-header">
                        <h3>${assignment.filename}</h3>
                        <p>Analysis Date: ${assignment.date} • Mode: ${assignment.analysisMode === 'plagiarism' ? 'Plagiarism Detection' : 'AI Detection'}</p>
                        <p class="score-${assignment.score >= 70 ? 'high' : assignment.score >= 30 ? 'medium' : 'low'}">
                            Similarity Score: ${assignment.score}%
                        </p>
                    </div>
                    <div class="report-content">
                        <p><strong>Total Sentences:</strong> ${assignment.analysisResult.total_sentences}</p>
                        <p><strong>Flagged Sentences:</strong> ${assignment.analysisResult.flagged_sentences.length}</p>
                        <p><strong>Processing Time:</strong> ${assignment.analysisResult.processing_time.toFixed(1)}s</p>
                        
                        ${assignment.analysisResult.flagged_sentences.length > 0 ? `
                            <h4>🚨 Flagged Content:</h4>
                            ${assignment.analysisResult.flagged_sentences.slice(0, 3).map(sentence => `
                                <div class="flagged-sentence">
                                    <p><strong>Student Text:</strong> ${sentence.student_sentence}</p>
                                    <p><strong>Reference:</strong> ${sentence.reference_sentence}</p>
                                    <p><small>Similarity: ${(sentence.score * 100).toFixed(1)}% • Source: ${sentence.reference_document}</small></p>
                                </div>
                            `).join('')}
                        ` : '<p>✅ No flagged content found.</p>'}
                    </div>
                </div>
            `).join('')}
        </div>

        <div style="text-align: center; padding: 30px; color: #666;">
            <p><strong>PlagiaSense</strong> - AI-Powered Academic Integrity Analysis</p>
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PlagiaSense_All_Reports_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.html`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "All reports exported!",
      description: `Exported ${completedReports.length} reports successfully.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="border-b glass-card px-6 py-4 sticky top-0 z-50">
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
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                All Analysis Reports
              </h1>
              <p className="text-sm text-muted-foreground">
                {filteredAndSortedAssignments.length} of {assignments.length} assignments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={exportAllReports}
              className="hover:bg-primary/10 transition-smooth"
              disabled={completedAssignments.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 glass-card hover:glow transition-smooth">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 glass-card hover:glow transition-smooth">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass-card hover:glow transition-smooth">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-full">
                <Target className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Flagged</p>
                <p className="text-2xl font-bold text-warning">{stats.flagged}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass-card hover:glow transition-smooth">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-blue-500">{stats.processing}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card className="p-6 glass-card mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                />
              </div>

              {/* Filters */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="error">Failed</option>
              </select>

              <select
                value={analysisFilter}
                onChange={(e) => setAnalysisFilter(e.target.value as any)}
                className="px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
              >
                <option value="all">All Types</option>
                <option value="plagiarism">Plagiarism</option>
                <option value="ai_detection">AI Detection</option>
              </select>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="transition-smooth"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="transition-smooth"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { field: 'date' as SortField, label: 'Date' },
            { field: 'filename' as SortField, label: 'Name' },
            { field: 'score' as SortField, label: 'Score' },
            { field: 'sources' as SortField, label: 'Sources' },
          ].map(({ field, label }) => (
            <Button
              key={field}
              variant={sortField === field ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort(field)}
              className="transition-smooth"
            >
              {label}
              {sortField === field && (
                sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
              )}
            </Button>
          ))}
        </div>

        {/* Reports Grid/List */}
        {filteredAndSortedAssignments.length === 0 ? (
          <Card className="p-12 text-center glass-card">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No reports found</h3>
            <p className="text-muted-foreground mb-4">
              {assignments.length === 0 
                ? "Upload and analyze documents to generate reports."
                : "No reports match your current search criteria."
              }
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
              {assignments.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter('all');
                    setAnalysisFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredAndSortedAssignments.map((assignment) => (
              <Card 
                key={assignment.id} 
                className={`glass-card hover:glow transition-smooth cursor-pointer ${
                  viewMode === 'list' ? 'p-6' : 'p-4'
                }`}
                onClick={() => navigate(`/reports/${assignment.id}`)}
              >
                {viewMode === 'grid' ? (
                  // Grid View
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        {getStatusIcon(assignment.status)}
                      </div>
                      <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                        {assignment.analysisMode === 'plagiarism' ? 'Plagiarism' : 'AI Detection'}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2 line-clamp-2">{assignment.filename}</h4>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {assignment.date}
                        </div>
                        {assignment.sources > 0 && (
                          <div>{assignment.sources} sources found</div>
                        )}
                      </div>
                    </div>

                    {assignment.status === 'completed' && assignment.score !== undefined ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center">
                          <SimilarityProgress 
                            similarity={assignment.score}
                            size={60}
                            strokeWidth={6}
                            variant="compact"
                            showLabel={false}
                            showIcon={false}
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full hover:scale-105 transition-smooth"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/reports/${assignment.id}`);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          View Report
                        </Button>
                      </div>
                    ) : assignment.status === 'processing' ? (
                      <div className="flex items-center justify-center py-4">
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm text-muted-foreground">Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <AlertTriangle className="h-4 w-4 text-destructive mr-2" />
                        <span className="text-sm text-destructive">Analysis Failed</span>
                      </div>
                    )}
                  </div>
                ) : (
                  // List View
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        {getStatusIcon(assignment.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{assignment.filename}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {assignment.date}
                          </span>
                          <span>{assignment.analysisMode === 'plagiarism' ? 'Plagiarism' : 'AI Detection'}</span>
                          {assignment.sources > 0 && (
                            <span>{assignment.sources} sources</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {assignment.status === 'completed' && assignment.score !== undefined ? (
                        <>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBg(assignment.score)} ${getScoreColor(assignment.score)}`}>
                            {assignment.score}% similarity
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/reports/${assignment.id}`);
                            }}
                            className="hover:scale-105 transition-smooth"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </>
                      ) : assignment.status === 'processing' ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full text-sm font-medium bg-destructive/10 text-destructive">
                          Failed
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllReports;