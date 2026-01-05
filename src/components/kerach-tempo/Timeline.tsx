
"use client";

import type { Dispatch, SetStateAction } from 'react';
import type { AnimationConfig, Track, ShaderName } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import TrackComponent from '@/components/kerach-tempo/Track';
import ColorTrack from '@/components/kerach-tempo/ColorTrack';
import PlaybackControls from '@/components/kerach-tempo/PlaybackControls';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface TimelineProps {
  config: AnimationConfig;
  setConfig: Dispatch<SetStateAction<AnimationConfig>>;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  currentTime: number;
  setCurrentTime: Dispatch<SetStateAction<number>>;
}

const shaderSpecificTracks: Record<ShaderName, string[]> = {
    melt: ['shaders.melt.zoom', 'shaders.melt.speed', 'shaders.melt.detail'],
    flow: ['shaders.flow.velocity', 'shaders.flow.detail', 'shaders.flow.twist'],
    balatro: [],
    glass: ['shaders.glass.sides', 'shaders.glass.density', 'shaders.glass.glow'],
    chargedCells: ['shaders.chargedCells.scale'],
};

const commonShaderTracks = ['shader.hue', 'shader.saturation', 'shader.contrast'];

const colorTrackGroups = [
    { label: 'Background Color', id: 'background.color' },
    { label: 'Balatro Color 1', id: 'shaders.balatro.color1' },
    { label: 'Balatro Color 2', id: 'shaders.balatro.color2' },
    { label: 'Balatro Color 3', id: 'shaders.balatro.color3' },
    { label: 'Cells Color 1', id: 'shaders.chargedCells.color1' },
    { label: 'Cells Color 2', id: 'shaders.chargedCells.color2' },
    { label: 'Cells Color 3', id: 'shaders.chargedCells.color3' },
];


export default function Timeline({
  config,
  setConfig,
  isPlaying,
  setIsPlaying,
  currentTime,
  setCurrentTime,
}: TimelineProps) {

  const handleScrubberChange = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const timelineWidth = '100%';
  const activeShader = config.shaders.activeShader;

  const getVisibleTracks = (trackIds: string[]) => {
    return config.tracks.filter(track => trackIds.includes(track.property) && !track.property.includes('.color.'));
  };

  const textTracks = getVisibleTracks(['text.fontSize', 'position.x', 'position.y', 'text.rotation']);
  
  const commonShaderTracksVisible = config.tracks.filter(t => commonShaderTracks.includes(t.id));
  const specificShaderTracksVisible = config.tracks.filter(t => (shaderSpecificTracks[activeShader] || []).some(idPrefix => t.id.startsWith(idPrefix)));

  const getGroupedColorTracks = (groupId: string) => {
    const r = config.tracks.find(t => t.property === `${groupId}.0`);
    const g = config.tracks.find(t => t.property === `${groupId}.1`);
    const b = config.tracks.find(t => t.property === `${groupId}.2`);
    if (r && g && b) {
      return { r, g, b };
    }
    return null;
  };
  
  const backgroundTracks = getGroupedColorTracks('background.color');
  const balatroColorTracks = colorTrackGroups.filter(g => g.id.startsWith('shaders.balatro.color')).map(g => ({ ...g, tracks: getGroupedColorTracks(g.id) }));
  const chargedCellsColorTracks = colorTrackGroups.filter(g => g.id.startsWith('shaders.chargedCells.color')).map(g => ({ ...g, tracks: getGroupedColorTracks(g.id) }));

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex-shrink-0 p-2 border-b border-border flex items-center gap-4">
        <PlaybackControls
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          setCurrentTime={setCurrentTime}
        />
        <div className="flex-grow flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-12 text-center">{currentTime.toFixed(2)}s</span>
            <Slider
                value={[currentTime]}
                max={config.duration}
                step={0.01}
                onValueChange={handleScrubberChange}
                className="w-full"
            />
            <span className="text-xs text-muted-foreground w-12 text-center">{config.duration.toFixed(2)}s</span>
        </div>
      </div>
      <ScrollArea className="flex-grow" type="always">
        <div className="relative py-2" style={{ width: timelineWidth }}>
          <Accordion type="multiple" defaultValue={['text', 'background', 'shader']} className="w-full">
            <AccordionItem value="text">
                <AccordionTrigger className="text-sm py-2 px-4">Text & Transform</AccordionTrigger>
                <AccordionContent className="px-4 space-y-2">
                   {textTracks.map((track) => (
                    <TrackComponent key={track.id} track={track} duration={config.duration} setConfig={setConfig} zoomLevel={1} />
                   ))}
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="background">
                <AccordionTrigger className="text-sm py-2 px-4">Background</AccordionTrigger>
                <AccordionContent className="px-4 space-y-2">
                  {backgroundTracks && (
                    <ColorTrack
                      key="bg-color"
                      label="Background Color"
                      duration={config.duration}
                      setConfig={setConfig}
                      rTrack={backgroundTracks.r}
                      gTrack={backgroundTracks.g}
                      bTrack={backgroundTracks.b}
                    />
                  )}
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shader">
                <AccordionTrigger className="text-sm py-2 px-4">Shader: {activeShader}</AccordionTrigger>
                <AccordionContent className="px-4 space-y-2">
                    {commonShaderTracksVisible.map((track) => (
                        <TrackComponent key={track.id} track={track} duration={config.duration} setConfig={setConfig} zoomLevel={1} />
                    ))}
                    {specificShaderTracksVisible.map((track) => (
                        <TrackComponent key={track.id} track={track} duration={config.duration} setConfig={setConfig} zoomLevel={1} />
                    ))}
                    {activeShader === 'balatro' && balatroColorTracks.map(group => group.tracks && (
                       <ColorTrack key={group.id} label={group.label} duration={config.duration} setConfig={setConfig} rTrack={group.tracks.r} gTrack={group.tracks.g} bTrack={group.tracks.b}/>
                    ))}
                    {activeShader === 'chargedCells' && chargedCellsColorTracks.map(group => group.tracks && (
                       <ColorTrack key={group.id} label={group.label} duration={config.duration} setConfig={setConfig} rTrack={group.tracks.r} gTrack={group.tracks.g} bTrack={group.tracks.b}/>
                    ))}
                </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}
