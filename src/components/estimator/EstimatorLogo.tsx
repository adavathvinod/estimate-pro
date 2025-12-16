import { cn } from '@/lib/utils';

interface EstimatorLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function EstimatorLogo({ className, size = 'md', animated = true }: EstimatorLogoProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(
        sizeClasses[size],
        animated && 'animate-pulse',
        className
      )}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer ring */}
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="currentColor"
        strokeWidth="4"
        className="text-primary/20"
      />
      
      {/* Progress arc */}
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray="200 283"
        strokeDashoffset="0"
        strokeLinecap="round"
        className="text-primary"
        transform="rotate(-90 50 50)"
      />
      
      {/* Inner clock face */}
      <circle
        cx="50"
        cy="50"
        r="32"
        fill="currentColor"
        className="text-primary/10"
      />
      
      {/* Clock hands representing time estimation */}
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="28"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="text-primary"
      />
      <line
        x1="50"
        y1="50"
        x2="68"
        y2="50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-primary/70"
      />
      
      {/* Center dot */}
      <circle
        cx="50"
        cy="50"
        r="5"
        fill="currentColor"
        className="text-primary"
      />
      
      {/* Dollar symbol tick marks */}
      <g className="text-primary/50">
        <circle cx="50" cy="15" r="3" fill="currentColor" />
        <circle cx="85" cy="50" r="3" fill="currentColor" />
        <circle cx="50" cy="85" r="3" fill="currentColor" />
        <circle cx="15" cy="50" r="3" fill="currentColor" />
      </g>
    </svg>
  );
}
