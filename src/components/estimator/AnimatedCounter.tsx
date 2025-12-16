import { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatFn?: (value: number) => string;
  placeholder?: string;
}

// Safe number helper
function safeNumber(value: number, fallback: number = 0): number {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return fallback;
  }
  return value;
}

export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  prefix = '', 
  suffix = '',
  formatFn,
  placeholder = '--'
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  const animationRef = useRef<number>();

  // Check if value is valid
  const safeValue = safeNumber(value);
  const isValidValue = typeof value === 'number' && !isNaN(value) && isFinite(value) && value > 0;

  useEffect(() => {
    if (!isValidValue) {
      setDisplayValue(0);
      previousValue.current = 0;
      return;
    }

    const startValue = previousValue.current;
    const endValue = safeValue;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;
      setDisplayValue(safeNumber(currentValue));
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [safeValue, duration, isValidValue]);

  // Show placeholder for invalid or zero values
  if (!isValidValue) {
    return <span className="tabular-nums text-muted-foreground">{placeholder}</span>;
  }

  const safeDisplayValue = safeNumber(displayValue);
  const formattedValue = formatFn ? formatFn(safeDisplayValue) : Math.round(safeDisplayValue).toLocaleString();
  
  return (
    <span className="tabular-nums">
      {prefix}{formattedValue}{suffix}
    </span>
  );
}
