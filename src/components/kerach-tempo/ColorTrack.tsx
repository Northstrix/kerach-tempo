
"use client";

import React, { useRef, useState, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { AnimationConfig, Track, Keyframe, Easing } from '@/lib/types';
import { Button } from '../ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import ColorPicker from '../ui/ColorPicker';
import { rgbToHex, hexToRgb } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import FloatingLabelInput from '../ui/FloatingLabelInput';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface ColorTrackProps {
  label: string;
  duration: number;
  setConfig: Dispatch<SetStateAction<AnimationConfig>>;
  rTrack: Track;
  gTrack: Track;
  bTrack: Track;
}

export default function ColorTrack({ label, duration, setConfig, rTrack, gTrack, bTrack }: ColorTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [keyframeToDelete, setKeyframeToDelete] = useState<number | null>(null);
  const isOnlyKeyframe = rTrack.keyframes.length <= 1;

  const combinedKeyframes = useMemo(() => {
    const timeMap = new Map<number, {r?: Keyframe, g?: Keyframe, b?: Keyframe}>();
    rTrack.keyframes.forEach(k => {
        if (!timeMap.has(k.time)) timeMap.set(k.time, {});
        timeMap.get(k.time)!.r = k;
    });
    gTrack.keyframes.forEach(k => {
        if (!timeMap.has(k.time)) timeMap.set(k.time, {});
        timeMap.get(k.time)!.g = k;
    });
    bTrack.keyframes.forEach(k => {
        if (!timeMap.has(k.time)) timeMap.set(k.time, {});
        timeMap.get(k.time)!.b = k;
    });
    
    return Array.from(timeMap.entries()).map(([time, {r,g,b}], index) => ({
        id: (r?.id || `r${index}`) + (g?.id || `g${index}`) + (b?.id || `b${index}`),
        time,
        color: rgbToHex(r?.value ?? 0, g?.value ?? 0, b?.value ?? 0),
        rId: r?.id,
        gId: g?.id,
        bId: b?.id,
    }));
  }, [rTrack, gTrack, bTrack]);

  const handleDragStart = (e: React.MouseEvent, keyframeTime: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    let draggingKeyframeTime = keyframeTime;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
        requestAnimationFrame(() => {
            if (!trackRef.current) return;
            
            const trackRect = trackRef.current.getBoundingClientRect();
            const newTime = Math.max(0, Math.min(1, (moveEvent.clientX - trackRect.left) / trackRect.width));
            
            setConfig(prev => {
                const newTracks = prev.tracks.map(t => {
                    if (t.id === rTrack.id || t.id === gTrack.id || t.id === bTrack.id) {
                        const updatedKeyframes = t.keyframes.map(k => 
                            Math.abs(k.time - draggingKeyframeTime) < 0.0001 ? { ...k, time: newTime } : k
                        ).sort((a, b) => a.time - b.time);
                        return { ...t, keyframes: updatedKeyframes };
                    }
                    return t;
                });
                return { ...prev, tracks: newTracks };
            });
            draggingKeyframeTime = newTime;
        });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const updateKeyframeTime = (oldTime: number, newTimeSeconds: string) => {
    const newTime = Math.max(0, Math.min(duration, parseFloat(newTimeSeconds))) / duration;
    setConfig(prev => {
        const newTracks = prev.tracks.map(t => {
            if (t.id === rTrack.id || t.id === gTrack.id || t.id === bTrack.id) {
                return {...t, keyframes: t.keyframes.map(k => Math.abs(k.time - oldTime) < 0.0001 ? {...k, time: newTime} : k).sort((a,b) => a.time - b.time)}
            }
            return t;
        });
        return { ...prev, tracks: newTracks };
    });
  };
  
  const updateKeyframeColor = (time: number, newColorHex: string) => {
    const [r, g, b] = hexToRgb(newColorHex);
    setConfig(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => {
            if (t.id === rTrack.id) {
                return {...t, keyframes: t.keyframes.map(k => Math.abs(k.time - time) < 0.0001 ? {...k, value: r} : k)}
            }
            if (t.id === gTrack.id) {
                return {...t, keyframes: t.keyframes.map(k => Math.abs(k.time - time) < 0.0001 ? {...k, value: g} : k)}
            }
            if (t.id === bTrack.id) {
                return {...t, keyframes: t.keyframes.map(k => Math.abs(k.time - time) < 0.0001 ? {...k, value: b} : k)}
            }
            return t;
        })
    }));
  };

  const addKeyframe = () => {
    const newTime = 0.5;
    const newColor = [0.5, 0.5, 0.5]; // Default grey
    
    setConfig(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => {
            if (t.id === rTrack.id) {
                const newKf = {id: `k-${Date.now()}-r`, time: newTime, value: newColor[0], easing: 'linear' as Easing};
                return {...t, keyframes: [...t.keyframes, newKf].sort((a,b) => a.time - b.time)}
            }
             if (t.id === gTrack.id) {
                const newKf = {id: `k-${Date.now()}-g`, time: newTime, value: newColor[1], easing: 'linear' as Easing};
                return {...t, keyframes: [...t.keyframes, newKf].sort((a,b) => a.time - b.time)}
            }
             if (t.id === bTrack.id) {
                const newKf = {id: `k-${Date.now()}-b`, time: newTime, value: newColor[2], easing: 'linear' as Easing};
                return {...t, keyframes: [...t.keyframes, newKf].sort((a,b) => a.time - b.time)}
            }
            return t;
        })
    }));
  };

  const deleteSelectedKeyframe = () => {
    if (keyframeToDelete === null || rTrack.keyframes.length <= 1) return;
    
    setConfig(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => {
            if (t.id === rTrack.id || t.id === gTrack.id || t.id === bTrack.id) {
                 return {...t, keyframes: t.keyframes.filter(k => Math.abs(k.time - keyframeToDelete) > 0.0001)};
            }
            return t;
        })
    }));
    setKeyframeToDelete(null);
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
    <>
      <div className="flex items-center gap-4 h-12">
        <div className="w-32 text-sm text-muted-foreground truncate" title={label}>{label}</div>
        <div ref={trackRef} className="flex-grow h-6 bg-muted/30 rounded-md relative">
          <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(to right, hsl(var(--border) / 0.2), hsl(var(--border) / 0.2) 1px, transparent 1px, transparent 100%)`,
              backgroundSize: `calc(100% / 16) 100%`,
          }} />
          <TooltipProvider delayDuration={0}>
            {combinedKeyframes.map(kf => (
              <Popover key={kf.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <div
                          onMouseDown={(e) => handleDragStart(e, kf.time)}
                          style={{ left: `${kf.time * 100}%` }}
                          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full cursor-pointer transition-transform duration-100 z-10"
                        >
                          <div className="w-full h-full rounded-full border border-white/50" style={{backgroundColor: kf.color as string}}/>
                        </div>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Time: {(kf.time * duration).toFixed(2)}s</p>
                    <p>Color: {kf.color}</p>
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="w-[424px]" style={{height: 'auto'}}>
                    <div className="p-2 space-y-4">
                       <ColorPicker enabledModes={['hex']} value={kf.color} onValueChange={(newHex) => updateKeyframeColor(kf.time, newHex)} />
                        <FloatingLabelInput
                            label="Time (s)"
                            value={(kf.time * duration).toFixed(2)}
                            onValueChange={(v) => updateKeyframeTime(kf.time, v)}
                            type="number"
                            step={0.01}
                          />
                        <DeleteButtonWrapper>
                          <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => setKeyframeToDelete(kf.time)} 
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

       <AlertDialog open={keyframeToDelete !== null} onOpenChange={(open) => !open && setKeyframeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              keyframe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSelectedKeyframe}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    