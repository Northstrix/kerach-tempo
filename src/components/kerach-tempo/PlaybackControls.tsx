"use client";

import { Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlaybackControlsProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
}

export default function PlaybackControls({
  isPlaying,
  setIsPlaying,
  setCurrentTime,
}: PlaybackControlsProps) {
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={handlePlayPause}>
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={handleStop}>
        <Square className="h-5 w-5" />
        <span className="sr-only">Stop</span>
      </Button>
    </div>
  );
}
