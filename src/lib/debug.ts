// Development helper for testing assignment management
// Access these functions from browser console while in development

import { assignmentManager } from './assignments';

// Make functions available globally for testing
declare global {
  interface Window {
    plagiaSenseDebug: {
      addTestAssignment: () => string;
      clearAllAssignments: () => void;
      resetWithDemo: () => void;
      getStats: () => any;
      listAssignments: () => void;
    };
  }
}

// Debug functions
const addTestAssignment = () => {
  const testFiles = [
    'Test_Document_1.pdf',
    'Research_Paper.pdf',
    'Essay_Analysis.pdf',
    'Lab_Report.pdf',
    'Thesis_Chapter.pdf'
  ];
  
  const filename = testFiles[Math.floor(Math.random() * testFiles.length)];
  const analysisMode = Math.random() > 0.5 ? 'plagiarism' : 'ai_detection';
  const fileSize = Math.floor(Math.random() * 5000000) + 500000; // 0.5MB to 5MB
  
  const id = assignmentManager.addAssignment(filename, analysisMode, fileSize);
  
  // Simulate completion after a delay
  setTimeout(() => {
    const score = Math.floor(Math.random() * 100);
    const sources = Math.floor(Math.random() * 10);
    
    assignmentManager.updateAssignment(id, {
      status: 'completed',
      score,
      sources,
      analysisResult: {
        overall_score: score / 100,
        red_count: Math.floor(sources * 0.3),
        orange_count: Math.floor(sources * 0.7),
        total_sentences: Math.floor(Math.random() * 50) + 20,
        flagged_sentences: [],
        highlighted_fragments: [],
        processing_time: Math.random() * 30 + 5
      }
    });
  }, 2000 + Math.random() * 3000); // 2-5 seconds
  
  console.log(`Added test assignment: ${filename} (${analysisMode})`);
  return id;
};

const clearAllAssignments = () => {
  assignmentManager.clearAll();
  console.log('Cleared all assignments');
};

const resetWithDemo = () => {
  assignmentManager.clearAll();
  console.log('Cleared all assignments');
};

const getStats = () => {
  const stats = assignmentManager.getStats();
  console.log('Assignment Statistics:', stats);
  return stats;
};

const listAssignments = () => {
  const assignments = assignmentManager.getAssignments();
  console.log('Current Assignments:', assignments);
  assignments.forEach((assignment, index) => {
    console.log(`${index + 1}. ${assignment.filename} - ${assignment.status} - Score: ${assignment.score || 'N/A'}%`);
  });
};

// Initialize debug panel
if (typeof window !== 'undefined') {
  window.plagiaSenseDebug = {
    addTestAssignment,
    clearAllAssignments,
    resetWithDemo,
    getStats,
    listAssignments
  };
  
  console.log(`
🚀 PlagiaSense Debug Panel Loaded!

Available commands:
- window.plagiaSenseDebug.addTestAssignment() - Add a random test assignment
- window.plagiaSenseDebug.clearAllAssignments() - Clear all assignments
- window.plagiaSenseDebug.resetWithDemo() - Clear all assignments
- window.plagiaSenseDebug.getStats() - Show assignment statistics
- window.plagiaSenseDebug.listAssignments() - List all assignments

Try: window.plagiaSenseDebug.addTestAssignment()
  `);
}

export {
  addTestAssignment,
  clearAllAssignments,
  resetWithDemo,
  getStats,
  listAssignments
};