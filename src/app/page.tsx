

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { AnimationConfig } from '@/lib/types';
import { initialConfig } from '@/lib/state';
import ControlPanel from '@/components/kerach-tempo/ControlPanel';
import Timeline from '@/components/kerach-tempo/Timeline';
import Preview from '@/components/kerach-tempo/Preview';
import Loader from '@/components/ui/Loader';

export default function Home() {
  const [config, setConfig] = useState<AnimationConfig>(initialConfig);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // This effect ensures that legacy configs from localStorage (if any) are compatible
  useEffect(() => {
    setConfig(currentConfig => {
      const newConfig = {
        ...initialConfig,
        ...currentConfig,
        tracks: initialConfig.tracks.map(initialTrack => {
          const existingTrack = currentConfig.tracks.find(t => t.id === initialTrack.id);
          if (existingTrack) {
            // Add easing to old keyframes
            const keyframes = existingTrack.keyframes.map(k => ({...k, easing: k.easing || 'linear' }));
            return { ...initialTrack, property: existingTrack.property || initialTrack.property, keyframes };
          }
          return initialTrack;
        }),
      };
      
      // Filter out legacy rotation tracks
      newConfig.tracks = newConfig.tracks.filter(track => !track.property.startsWith('rotation.'));


      return newConfig;
    });
    
    // Simulate loading time and then reveal the app
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Adjust time as needed

    return () => clearTimeout(timer);
  }, []);

  // Keyboard controls for main timeline scrubber
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        
        // Prevent browser back/forward navigation
        if (event.metaKey || event.altKey) return;
        
        // Only act if the body is the target, so we don't interfere with other inputs/buttons
        if (document.activeElement !== document.body) return;

        event.preventDefault();
        
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const timeDelta = 0.01;

        setCurrentTime(prev => Math.max(0, Math.min(config.duration, prev + direction * timeDelta)));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [config.duration]);

  const memoizedConfig = useMemo(() => config, [config]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <aside
          className="w-[390px] flex-shrink-0 bg-card border-r border-border overflow-hidden"
      >
          <ControlPanel config={config} setConfig={setConfig} />
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-grow relative bg-black">
          <Preview
            config={memoizedConfig}
            isPlaying={isPlaying}
            onTimeUpdate={setCurrentTime}
            currentTime={currentTime}
          />
        </main>
        <footer className="flex-shrink-0 border-t border-border h-[280px]">
          <Timeline
            config={config}
            setConfig={setConfig}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
          />
        </footer>
      </div>
    </div>
  );
}
