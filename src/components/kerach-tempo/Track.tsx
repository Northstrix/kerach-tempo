
"use client";

import React, { useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { AnimationConfig, Track, Keyframe, Easing } from '@/lib/types';
import { Button } from '../ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import FloatingLabelInput from '../ui/FloatingLabelInput';
import { FloatingLabelCombobox } from '../ui/FloatingLabelCombobox';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface TrackProps {
  track: Track;
  duration: number;
  setConfig: Dispatch<SetStateAction<AnimationConfig>>;
  zoomLevel: number;
}

const easingOptions = [
    { value: "linear", label: "Linear" },
    { value: "easeInQuad", label: "Ease In" },
    { value: "easeOutQuad", label: "Ease Out" },
    { value: "easeInOutQuad", label: "Ease In/Out" },
];


export default function TrackComponent({ track, duration, setConfig, zoomLevel }: TrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isOnlyKeyframe = track.keyframes.length <= 1;

  const handleDragStart = (e: React.MouseEvent, keyframe: Keyframe) => {
    e.preventDefault();
    e.stopPropagation();
    
    const onMouseMove = (moveEvent: MouseEvent) => {
        requestAnimationFrame(() => {
            if (!trackRef.current) return;
            
            const trackRect = trackRef.current.getBoundingClientRect();
            const newTime = Math.max(0, Math.min(1, (moveEvent.clientX - trackRect.left) / trackRect.width));
            
            setConfig(prev => {
                const newTracks = prev.tracks.map(t => {
                    if (t.id === track.id) {
                        const updatedKeyframes = t.keyframes.map(k => 
                            k.id === keyframe.id ? { ...k, time: newTime } : k
                        ).sort((a, b) => a.time - b.time);
                        return { ...t, keyframes: updatedKeyframes };
                    }
                    return t;
                });
                return { ...prev, tracks: newTracks };
            });
        });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const updateKeyframe = (id: string, newProps: Partial<Keyframe>) => {
    setConfig(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => 
        t.id === track.id ? { ...t, keyframes: t.keyframes.map(k => 
          k.id === id ? { ...k, ...newProps } : k
        ).sort((a,b) => a.time - b.time)} : t
      )
    }));
  };

  const addKeyframe = () => {
    const newKeyframe: Keyframe = {
        id: `k-${Date.now()}`,
        time: 0.5,
        value: track.keyframes[0]?.value ?? (track.min + track.max) / 2,
        easing: 'linear'
    };
    setConfig(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => t.id === track.id ? { ...t, keyframes: [...t.keyframes, newKeyframe].sort((a,b) => a.time - b.time) } : t)
    }));
  };

  const deleteKeyframe = (id: string) => {
    if (track.keyframes.length <= 1) return;
    setConfig(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => t.id === track.id ? { ...t, keyframes: t.keyframes.filter(k => k.id !== id)} : t)
    }));
  };

  const DeleteButtonWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isOnlyKeyframe) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">{children}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>A track must have at least one keyframe.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return <>{children}</>;
  };

  return (
    <div className="flex items-center gap-4 h-12">
      <div className="w-32 text-sm text-muted-foreground truncate" title={track.label}>{track.label}</div>
      <div ref={trackRef} className="flex-grow h-6 bg-muted/30 rounded-md relative">
         <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(to right, hsl(var(--border) / 0.2), hsl(var(--border) / 0.2) 1px, transparent 1px, transparent 100%)`,
            backgroundSize: `calc(100% / 16) 100%`,
         }} />
        <TooltipProvider delayDuration={0}>
          {track.keyframes.map(kf => (
            <Popover key={kf.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <div
                      onMouseDown={(e) => handleDragStart(e, kf)}
                      style={{ left: `${kf.time * 100}%` }}
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent cursor-pointer transition-transform duration-100 z-10 hover:scale-110 hover:bg-primary"
                    />
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Time: {(kf.time * duration).toFixed(2)}s</p>
                  <p>Value: {kf.value.toFixed(2)}</p>
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="w-64" style={{height: 'auto'}}>
                  <div className="p-2 space-y-4">
                      <FloatingLabelInput 
                          label="Time (s)"
                          value={(kf.time * duration).toFixed(2)}
                          onValueChange={(val) => updateKeyframe(kf.id, { time: Math.max(0, Math.min(duration, parseFloat(val))) / duration })}
                          type="number"
                      />
                      <FloatingLabelInput 
                          label="Value"
                          value={String(kf.value)}
                          onValueChange={(val) => updateKeyframe(kf.id, { value: parseFloat(val) })}
                          type="number"
                          min={track.min}
                          max={track.max}
                          step={track.step || 0.01}
                      />
                       <FloatingLabelCombobox
                          label="Easing"
                          value={kf.easing}
                          onValueChange={(val: string) => updateKeyframe(kf.id, { easing: val as Easing })}
                          options={easingOptions}
                      />
                      <DeleteButtonWrapper>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => deleteKeyframe(kf.id)} 
                          className="w-full mt-2" 
                          disabled={isOnlyKeyframe}
                          style={{ cursor: isOnlyKeyframe ? 'not-allowed' : 'pointer' }}
                        >
                          <Trash2 className="w-4 h-4 mr-2"/> Delete Keyframe
                        </Button>
                      </DeleteButtonWrapper>
                  </div>
              </PopoverContent>
            </Popover>
          ))}
        </TooltipProvider>
      </div>
      <Button variant="ghost" size="icon" className="w-8 h-8" onClick={addKeyframe}><PlusCircle className="w-4 h-4" /></Button>
    </div>
  );
}

    