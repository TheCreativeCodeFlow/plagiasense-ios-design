import { useEffect, useState } from 'react';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  animated?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
}

const CircularProgress = ({ 
  value, 
  size = 120, 
  strokeWidth = 8, 
  className = '', 
  showValue = true,
  animated = true,
  color = 'primary'
}: CircularProgressProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedValue(value);
    }
  }, [value, animated]);

  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'stroke-success';
      case 'warning':
        return 'stroke-warning';
      case 'destructive':
        return 'stroke-destructive';
      default:
        return 'stroke-primary';
    }
  };

  const getGlowColor = () => {
    switch (color) {
      case 'success':
        return 'drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]';
      case 'warning':
        return 'drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]';
      case 'destructive':
        return 'drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]';
      default:
        return 'drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]';
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${getColorClasses()} ${getGlowColor()} transition-all duration-1000 ease-out`}
          style={{
            filter: 'drop-shadow(0 0 8px currentColor)',
          }}
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Math.round(animatedValue)}%
            </div>
            <div className="text-xs text-muted-foreground">
              similarity
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircularProgress;