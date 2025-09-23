// Demo script to add multiple sample analyzed assignments for testing reports
// Run this in the browser console to test the all reports functionality

// Sample analysis results with different scores and types
const sampleAssignments = [
  {
    filename: 'Environmental_Research_Paper.pdf',
    score: 25,
    analysisMode: 'plagiarism',
    sources: 5,
    analysisResult: {
      overall_score: 0.25,
      red_count: 2,
      orange_count: 3,
      total_sentences: 45,
      flagged_sentences: [
        {
          student_sentence: "Climate change is one of the most pressing issues of our time, affecting global weather patterns.",
          score: 0.89,
          reference_document: "climate_science_journal.pdf",
          reference_sentence: "Climate change represents one of the most urgent challenges of our era, influencing global weather systems.",
          sentence_index: 5,
          risk_level: "HIGH"
        }
      ],
      highlighted_fragments: [],
      processing_time: 18.7
    }
  },
  {
    filename: 'AI_Ethics_Essay.pdf',
    score: 78,
    analysisMode: 'plagiarism',
    sources: 12,
    analysisResult: {
      overall_score: 0.78,
      red_count: 8,
      orange_count: 4,
      total_sentences: 52,
      flagged_sentences: [
        {
          student_sentence: "Artificial intelligence poses both opportunities and challenges for society.",
          score: 0.95,
          reference_document: "ai_ethics_textbook.pdf",
          reference_sentence: "AI technology presents significant opportunities alongside notable challenges for modern society.",
          sentence_index: 3,
          risk_level: "HIGH"
        },
        {
          student_sentence: "Machine learning algorithms can exhibit bias based on training data.",
          score: 0.87,
          reference_document: "ml_bias_research.pdf",
          reference_sentence: "ML algorithms may demonstrate bias that reflects patterns in their training datasets.",
          sentence_index: 15,
          risk_level: "HIGH"
        }
      ],
      highlighted_fragments: [],
      processing_time: 32.4
    }
  },
  {
    filename: 'Biology_Lab_Report.pdf',
    score: 8,
    analysisMode: 'plagiarism',
    sources: 2,
    analysisResult: {
      overall_score: 0.08,
      red_count: 0,
      orange_count: 2,
      total_sentences: 38,
      flagged_sentences: [
        {
          student_sentence: "The mitochondria is often called the powerhouse of the cell.",
          score: 0.65,
          reference_document: "biology_textbook.pdf",
          reference_sentence: "Mitochondria are commonly referred to as the powerhouses of cells.",
          sentence_index: 12,
          risk_level: "MEDIUM"
        }
      ],
      highlighted_fragments: [],
      processing_time: 15.2
    }
  },
  {
    filename: 'Marketing_Strategy_Analysis.pdf',
    score: 45,
    analysisMode: 'plagiarism',
    sources: 7,
    analysisResult: {
      overall_score: 0.45,
      red_count: 3,
      orange_count: 4,
      total_sentences: 41,
      flagged_sentences: [
        {
          student_sentence: "Digital marketing has revolutionized how businesses reach their target audiences.",
          score: 0.82,
          reference_document: "marketing_fundamentals.pdf",
          reference_sentence: "Digital marketing has transformed the way companies connect with their target markets.",
          sentence_index: 8,
          risk_level: "HIGH"
        }
      ],
      highlighted_fragments: [],
      processing_time: 28.9
    }
  },
  {
    filename: 'Physics_Quantum_Paper.pdf',
    score: 92,
    analysisMode: 'plagiarism',
    sources: 15,
    analysisResult: {
      overall_score: 0.92,
      red_count: 12,
      orange_count: 3,
      total_sentences: 47,
      flagged_sentences: [
        {
          student_sentence: "Quantum mechanics describes the behavior of matter and energy at the atomic scale.",
          score: 0.98,
          reference_document: "quantum_physics_textbook.pdf",
          reference_sentence: "Quantum mechanics explains the behavior of matter and energy at atomic and subatomic scales.",
          sentence_index: 2,
          risk_level: "HIGH"
        }
      ],
      highlighted_fragments: [],
      processing_time: 41.6
    }
  },
  {
    filename: 'Creative_Writing_Sample.pdf',
    score: 12,
    analysisMode: 'ai_detection',
    sources: 3,
    analysisResult: {
      overall_score: 0.12,
      red_count: 1,
      orange_count: 2,
      total_sentences: 35,
      flagged_sentences: [],
      highlighted_fragments: [],
      processing_time: 22.1
    }
  }
];

// Get current assignments from localStorage
let assignments = [];
const stored = localStorage.getItem('plagiasense_assignments');
if (stored) {
  try {
    assignments = JSON.parse(stored);
  } catch (e) {
    assignments = [];
  }
}

// Add sample assignments
const baseTime = Date.now();
sampleAssignments.forEach((sample, index) => {
  const assignmentId = `demo_${sample.analysisMode}_${baseTime + index}`;
  const hoursAgo = (index + 1) * 3600000; // Each assignment is a few hours older
  
  const assignment = {
    id: assignmentId,
    filename: sample.filename,
    date: new Date(baseTime - hoursAgo).toISOString().split('T')[0],
    score: sample.score,
    status: 'completed',
    sources: sample.sources,
    uploadedAt: new Date(baseTime - hoursAgo),
    completedAt: new Date(baseTime - hoursAgo + 1800000), // Completed 30 min after upload
    analysisMode: sample.analysisMode,
    fileSize: Math.floor(Math.random() * 3000000) + 1000000, // 1-4MB
    analysisResult: sample.analysisResult
  };
  
  assignments.push(assignment);
});

// Save back to localStorage
localStorage.setItem('plagiasense_assignments', JSON.stringify(assignments));

console.log(`✅ Added ${sampleAssignments.length} sample analyzed assignments!`);
console.log('📊 Assignment types:');
sampleAssignments.forEach((sample, index) => {
  console.log(`  ${index + 1}. ${sample.filename} - ${sample.score}% (${sample.analysisMode})`);
});
console.log('🔄 Refresh the page to see the new reports');

// Auto-refresh to show the new data
setTimeout(() => {
  window.location.reload();
}, 1000);