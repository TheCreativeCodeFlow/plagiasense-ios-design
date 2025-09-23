import { useState, useEffect, useCallback } from 'react';

// Assignment interfaces
export interface Assignment {
  id: string;
  filename: string;
  date: string;
  score?: number;
  status: 'processing' | 'completed' | 'error';
  sources: number;
  analysisResult?: any;
  uploadedAt: Date;
  completedAt?: Date;
  analysisMode: 'plagiarism' | 'ai_detection';
  fileSize: number;
  originalFiles?: File[];
}

export interface AssignmentStats {
  total: number;
  completed: number;
  processing: number;
  flagged: number;
  clean: number;
}

// Assignment Manager Class
class AssignmentManager {
  private static instance: AssignmentManager;
  private assignments: Assignment[] = [];
  private listeners: Set<() => void> = new Set();

  static getInstance(): AssignmentManager {
    if (!AssignmentManager.instance) {
      AssignmentManager.instance = new AssignmentManager();
      AssignmentManager.instance.loadFromStorage();
    }
    return AssignmentManager.instance;
  }

  // Load assignments from localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('plagiasense_assignments');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.assignments = parsed.map((assignment: any) => ({
          ...assignment,
          uploadedAt: new Date(assignment.uploadedAt),
          completedAt: assignment.completedAt ? new Date(assignment.completedAt) : undefined,
        }));
      }
    } catch (error) {
      console.error('Failed to load assignments from storage:', error);
      this.assignments = [];
    }
  }

  // Save assignments to localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem('plagiasense_assignments', JSON.stringify(this.assignments));
    } catch (error) {
      console.error('Failed to save assignments to storage:', error);
    }
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // Subscribe to changes
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Get all assignments
  getAssignments(): Assignment[] {
    return [...this.assignments].sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  // Get assignment by ID
  getAssignment(id: string): Assignment | undefined {
    return this.assignments.find(assignment => assignment.id === id);
  }

  // Add new assignment
  addAssignment(
    filename: string, 
    analysisMode: 'plagiarism' | 'ai_detection',
    fileSize: number,
    originalFiles?: File[]
  ): string {
    const id = `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const assignment: Assignment = {
      id,
      filename,
      date: new Date().toISOString().split('T')[0],
      status: 'processing',
      sources: 0,
      uploadedAt: new Date(),
      analysisMode,
      fileSize,
      originalFiles,
    };

    this.assignments.push(assignment);
    this.saveToStorage();
    this.notifyListeners();
    return id;
  }

  // Update assignment
  updateAssignment(id: string, updates: Partial<Assignment>): void {
    const index = this.assignments.findIndex(assignment => assignment.id === id);
    if (index !== -1) {
      this.assignments[index] = { 
        ...this.assignments[index], 
        ...updates,
        ...(updates.status === 'completed' && !this.assignments[index].completedAt 
          ? { completedAt: new Date() } 
          : {}
        )
      };
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  // Delete assignment
  deleteAssignment(id: string): void {
    this.assignments = this.assignments.filter(assignment => assignment.id !== id);
    this.saveToStorage();
    this.notifyListeners();
  }

  // Get assignment statistics
  getStats(): AssignmentStats {
    const total = this.assignments.length;
    const completed = this.assignments.filter(a => a.status === 'completed').length;
    const processing = this.assignments.filter(a => a.status === 'processing').length;
    const flagged = this.assignments.filter(a => 
      a.status === 'completed' && a.score !== undefined && a.score >= 30
    ).length;
    const clean = this.assignments.filter(a => 
      a.status === 'completed' && a.score !== undefined && a.score < 30
    ).length;

    return { total, completed, processing, flagged, clean };
  }



  // Clear all assignments
  clearAll(): void {
    this.assignments = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  // Get recent assignments (last 10)
  getRecentAssignments(limit: number = 10): Assignment[] {
    return this.getAssignments().slice(0, limit);
  }

  // Search assignments
  searchAssignments(query: string): Assignment[] {
    const lowerQuery = query.toLowerCase();
    return this.assignments.filter(assignment =>
      assignment.filename.toLowerCase().includes(lowerQuery) ||
      assignment.date.includes(lowerQuery) ||
      assignment.status.toLowerCase().includes(lowerQuery)
    );
  }
}

// React hook for using assignments
export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<AssignmentStats>({
    total: 0,
    completed: 0,
    processing: 0,
    flagged: 0,
    clean: 0,
  });

  const manager = AssignmentManager.getInstance();

  // Update state from manager
  const updateState = useCallback(() => {
    setAssignments(manager.getAssignments());
    setStats(manager.getStats());
  }, [manager]);

  // Subscribe to changes
  useEffect(() => {
    updateState();
    const unsubscribe = manager.subscribe(updateState);
    return unsubscribe;
  }, [updateState, manager]);

  // Assignment operations
  const addAssignment = useCallback((
    filename: string, 
    analysisMode: 'plagiarism' | 'ai_detection',
    fileSize: number,
    originalFiles?: File[]
  ) => {
    return manager.addAssignment(filename, analysisMode, fileSize, originalFiles);
  }, [manager]);

  const updateAssignment = useCallback((id: string, updates: Partial<Assignment>) => {
    manager.updateAssignment(id, updates);
  }, [manager]);

  const deleteAssignment = useCallback((id: string) => {
    manager.deleteAssignment(id);
  }, [manager]);

  const getAssignment = useCallback((id: string) => {
    return manager.getAssignment(id);
  }, [manager]);

  const searchAssignments = useCallback((query: string) => {
    return manager.searchAssignments(query);
  }, [manager]);

  const clearAllAssignments = useCallback(() => {
    manager.clearAll();
  }, [manager]);

  return {
    assignments,
    stats,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignment,
    searchAssignments,
    clearAllAssignments,
  };
}

// Export singleton instance for direct access
export const assignmentManager = AssignmentManager.getInstance();