import { useState, useEffect } from 'react';

interface AnimationOptions {
  duration?: number;
  delay?: number;
  staggerDelay?: number;
  easing?: (t: number) => number;
}

// Default easing function (cubic bezier)
const defaultEasing = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
};

const defaultOptions: AnimationOptions = {
  duration: 1000,
  delay: 0,
  staggerDelay: 50,
  easing: defaultEasing
};

/**
 * Custom hook for animating data from its initial state to the target state
 * 
 * @param targetData The final data that should be displayed
 * @param initialData Optional initial data (defaults to 0 or empty values)
 * @param options Animation options like duration, delay, etc.
 * @returns The current animated state of the data
 */
export function useAnimatedData<T>(
  targetData: T,
  initialData?: T,
  options: AnimationOptions = {}
): T {
  const [animatedData, setAnimatedData] = useState<T>(initialData || targetData);
  const [previousData, setPreviousData] = useState<T>(initialData || targetData);
  
  // Merge default options with provided options
  const animOptions = { ...defaultOptions, ...options };
  
  useEffect(() => {
    // If target data changes, update the previous data and start animation
    if (JSON.stringify(targetData) !== JSON.stringify(previousData)) {
      const startData = animatedData;
      setPreviousData(targetData);
      
      // For simple number animation
      if (typeof targetData === 'number' && typeof startData === 'number') {
        const startTime = Date.now();
        const initialValue = startData;
        const deltaValue = (targetData as number) - initialValue;
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(1, elapsed / animOptions.duration!);
          const easedProgress = animOptions.easing!(progress);
          
          // Calculate the current animated value
          const currentValue = initialValue + deltaValue * easedProgress;
          setAnimatedData(currentValue as unknown as T);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        // Start animation after delay
        setTimeout(() => requestAnimationFrame(animate), animOptions.delay!);
      }
      // For arrays
      else if (Array.isArray(targetData) && Array.isArray(startData)) {
        const startTime = Date.now();
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(1, elapsed / animOptions.duration!);
          const easedProgress = animOptions.easing!(progress);
          
          // Animate each item in the array
          const newData = (targetData as any[]).map((target, index) => {
            const start = startData[index] || 0;
            
            // Handle objects
            if (typeof target === 'object' && target !== null) {
              const result: any = { ...target };
              
              // Animate numeric properties
              Object.keys(target).forEach(key => {
                if (typeof target[key] === 'number') {
                  const startValue = start && typeof start === 'object' ? (start[key] || 0) : 0;
                  const targetValue = target[key];
                  result[key] = startValue + (targetValue - startValue) * easedProgress;
                }
              });
              
              return result;
            }
            // Handle numbers
            else if (typeof target === 'number') {
              const startValue = typeof start === 'number' ? start : 0;
              return startValue + (target - startValue) * easedProgress;
            }
            
            return target;
          });
          
          setAnimatedData(newData as unknown as T);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        // Start animation after delay
        setTimeout(() => requestAnimationFrame(animate), animOptions.delay!);
      }
      // For objects with numeric properties
      else if (typeof targetData === 'object' && targetData !== null) {
        const startTime = Date.now();
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(1, elapsed / animOptions.duration!);
          const easedProgress = animOptions.easing!(progress);
          
          const newData: any = { ...targetData };
          
          // Animate each numeric property
          Object.keys(targetData as object).forEach(key => {
            const target = (targetData as any)[key];
            const start = (startData as any)[key];
            
            if (typeof target === 'number' && typeof start === 'number') {
              newData[key] = start + (target - start) * easedProgress;
            }
          });
          
          setAnimatedData(newData as T);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        // Start animation after delay
        setTimeout(() => requestAnimationFrame(animate), animOptions.delay!);
      }
      // If not a supported type, just set the target data directly
      else {
        setAnimatedData(targetData);
      }
    }
  }, [targetData, animOptions.duration, animOptions.delay, animOptions.easing]);
  
  return animatedData;
}

/**
 * Custom hook for staggered animations on arrays of data
 * 
 * @param items Array of items to animate
 * @param options Animation options
 * @returns Array of boolean values indicating whether each item is visible
 */
export function useStaggeredAnimation<T>(
  items: T[],
  options: AnimationOptions = {}
): boolean[] {
  const [visibleItems, setVisibleItems] = useState<boolean[]>([]);
  
  // Merge default options with provided options
  const animOptions = { ...defaultOptions, ...options };
  
  useEffect(() => {
    // Initialize all items as hidden
    const initialState = items.map(() => false);
    setVisibleItems(initialState);
    
    // Animate items one by one with a stagger
    const timeout = setTimeout(() => {
      items.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems(prev => {
            const updated = [...prev];
            updated[index] = true;
            return updated;
          });
        }, animOptions.delay! + index * animOptions.staggerDelay!);
      });
    }, animOptions.delay!);
    
    return () => clearTimeout(timeout);
  }, [items.length, animOptions.delay, animOptions.staggerDelay]);
  
  return visibleItems;
}