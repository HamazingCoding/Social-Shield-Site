import { useRef, useEffect } from 'react';
import { createShieldScene } from '@/lib/three-utils';

type HeroSceneProps = {
  className?: string;
};

export default function HeroScene({ className = "" }: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const { animate, cleanup } = createShieldScene(containerRef.current);
    
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
