import { useRef, useEffect } from 'react';
import { createDeepfakeScene } from '@/lib/three-utils';

type DeepfakeSceneProps = {
  className?: string;
};

export default function DeepfakeScene({ className = "" }: DeepfakeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const { animate, cleanup } = createDeepfakeScene(containerRef.current);
    
    // Animation loop
    const animationId = requestAnimationFrame(function loop() {
      animate();
      requestAnimationFrame(loop);
    });
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      cleanup();
    };
  }, []);
  
  return (
    <div className={`w-full h-full ${className}`} ref={containerRef} />
  );
}
