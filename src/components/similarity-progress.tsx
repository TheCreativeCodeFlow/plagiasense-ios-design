import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Shield } from 'lucide-react';

interface SimilarityProgressProps {
  similarity: number; // 0-100 percentage
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  showIcon?: boolean;
  animated?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

const SimilarityProgress = ({ 
  similarity, 
  size = 120, 
  strokeWidth = 8, 
  className = '', 
  showLabel = true,
  showIcon = true,
  animated = true,
  variant = 'default'
}: SimilarityProgressProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        let current = 0;
        const increment = similarity / 50;
        const animate = () => {
          current += increment;
          if (current < similarity) {
            setAnimatedValue(Math.floor(current));
            requestAnimationFrame(animate);
          } else {
            setAnimatedValue(similarity);
          }
        };
        animate();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedValue(similarity);
    }
  }, [similarity, animated]);

  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  // Risk level determination
  const getRiskLevel = () => {
    if (similarity >= 70) return 'high';
    if (similarity >= 30) return 'medium';
    return 'low';
  };

  const getRiskColor = () => {
    const risk = getRiskLevel();
    switch (risk) {
      case 'high':
        return 'stroke-destructive text-destructive';
      case 'medium':
        return 'stroke-warning text-warning';
      default:
        return 'stroke-success text-success';
    }
  };

  const getRiskBg = () => {
    const risk = getRiskLevel();
    switch (risk) {
      case 'high':
        return 'bg-destructive/10';
      case 'medium':
        return 'bg-warning/10';
      default:
        return 'bg-success/10';
    }
  };

  const getRiskLabel = () => {
    const risk = getRiskLevel();
    switch (risk) {
      case 'high':
        return 'High Risk';
      case 'medium':
        return 'Medium Risk';
      default:
        return 'Low Risk';
    }
  };

  const getRiskIcon = () => {
    const risk = getRiskLevel();
    const iconClass = `h-4 w-4 ${getRiskColor().split(' ')[1]}`;
    
    switch (risk) {
      case 'high':
        return <AlertTriangle className={iconClass} />;
      case 'medium':
        return <Shield className={iconClass} />;
      default:
        return <CheckCircle className={iconClass} />;
    }
  };

  const getDescription = () => {
    const risk = getRiskLevel();
    switch (risk) {
      case 'high':
        return 'Significant similarity detected';
      case 'medium':
        return 'Moderate similarity found';
      default:
        return 'Minimal similarity detected';
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            className="transform -rotate-90"
            width={size}
            height={size}
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-out ${getRiskColor().split(' ')[0]}`}
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-bold ${getRiskColor().split(' ')[1]}`}>
              {animatedValue}%
            </span>
          </div>
        </div>
        {showLabel && (
          <div className="text-xs">
            <div className={`font-medium ${getRiskColor().split(' ')[1]}`}>
              {getRiskLabel()}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`text-center space-y-4 ${className}`}>
        <div className="relative inline-block">
          <svg
            className="transform -rotate-90"
            width={size}
            height={size}
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-out ${getRiskColor().split(' ')[0]}`}
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {showIcon && getRiskIcon()}
            <span className={`text-lg font-bold ${getRiskColor().split(' ')[1]} mt-1`}>
              {animatedValue}%
            </span>
          </div>
        </div>
        
        {showLabel && (
          <div className="space-y-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${getRiskBg()} ${getRiskColor().split(' ')[1]}`}>
              {getRiskLabel()}
            </div>
            <p className="text-xs text-muted-foreground">
              {getDescription()}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`text-center space-y-3 ${className}`}>
      <div className="relative inline-block">
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${getRiskColor().split(' ')[0]}`}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${getRiskColor().split(' ')[1]}`}>
            {animatedValue}%
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            Similarity
          </span>
        </div>
      </div>
      
      {showLabel && (
        <div className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-2 ${getRiskBg()} ${getRiskColor().split(' ')[1]}`}>
          {showIcon && getRiskIcon()}
          {getRiskLabel()}
        </div>
      )}
    </div>
  );
};

export default SimilarityProgress;