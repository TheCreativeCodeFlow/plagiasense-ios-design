// Demo script to showcase different SimilarityProgress variants
// Add this to a test page or component to see all variants

import SimilarityProgress from '@/components/similarity-progress';

const SimilarityProgressDemo = () => {
  const testScores = [8, 25, 45, 78, 92];
  
  return (
    <div className="p-8 space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-6">Similarity Progress Variants</h2>
        
        {/* Default Variant */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Default Variant</h3>
          <div className="flex gap-8 justify-center">
            {testScores.map(score => (
              <SimilarityProgress 
                key={score}
                similarity={score}
                size={120}
                variant="default"
              />
            ))}
          </div>
        </div>
        
        {/* Compact Variant */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Compact Variant</h3>
          <div className="flex gap-4 justify-center">
            {testScores.map(score => (
              <SimilarityProgress 
                key={score}
                similarity={score}
                size={60}
                variant="compact"
              />
            ))}
          </div>
        </div>
        
        {/* Detailed Variant */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Detailed Variant</h3>
          <div className="flex gap-8 justify-center">
            {testScores.map(score => (
              <SimilarityProgress 
                key={score}
                similarity={score}
                size={150}
                variant="detailed"
              />
            ))}
          </div>
        </div>
        
        {/* Risk Level Examples */}
        <div className="grid grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <h4 className="text-md font-semibold mb-4 text-success">Low Risk (0-29%)</h4>
            <SimilarityProgress similarity={12} variant="detailed" />
          </div>
          <div className="text-center">
            <h4 className="text-md font-semibold mb-4 text-warning">Medium Risk (30-69%)</h4>
            <SimilarityProgress similarity={45} variant="detailed" />
          </div>
          <div className="text-center">
            <h4 className="text-md font-semibold mb-4 text-destructive">High Risk (70%+)</h4>
            <SimilarityProgress similarity={78} variant="detailed" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarityProgressDemo;