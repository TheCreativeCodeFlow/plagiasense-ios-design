import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
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
  Calendar
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("assignments");

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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r glass-card">
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
                      Drag and drop your document or click to select files
                    </p>
                  </div>
                  <div className="border-2 border-dashed border-border rounded-lg p-12 hover:border-primary/50 transition-smooth cursor-pointer">
                    <div className="space-y-4">
                      <Plus className="h-16 w-16 text-muted-foreground mx-auto" />
                      <div>
                        <p className="text-lg font-medium">Drop files here</p>
                        <p className="text-sm text-muted-foreground">
                          Supports PDF, DOCX, TXT files up to 10MB
                        </p>
                      </div>
                      <Button className="btn-premium bg-gradient-primary">
                        Choose Files
                      </Button>
                    </div>
                  </div>
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