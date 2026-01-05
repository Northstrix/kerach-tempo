
"use client";

import type { Dispatch, SetStateAction } from 'react';
import type { AnimationConfig, ShaderName } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import FilePanel from '@/components/kerach-tempo/panels/FilePanel';
import { Separator } from '../ui/separator';
import FloatingLabelInput from '../ui/FloatingLabelInput';
import { FloatingLabelCombobox } from '../ui/FloatingLabelCombobox';
import React from 'react';
import { Accordion } from '../ui/accordion';
import ColorStudio from './ColorStudio';
import Footer from './Footer';

interface ControlPanelProps {
  config: AnimationConfig;
  setConfig: Dispatch<SetStateAction<AnimationConfig>>;
}

const fontFamilyOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Lato", label: "Lato" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Poppins", label: "Poppins" },
  { value: "Source Code Pro", label: "Source Code Pro" },
  { value: "Nunito", label: "Nunito" },
  { value: "Raleway", label: "Raleway" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "Ubuntu", label: "Ubuntu" },
  { value: "Zilla Slab", label: "Zilla Slab" },
  { value: "Space Mono", label: "Space Mono" },
  { value: "Work Sans", label: "Work Sans" },
];

const fontWeightOptions = [
  { value: "100", label: "Thin" },
  { value: "200", label: "Extra-Light" },
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semi-Bold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra-Bold" },
  { value: "900", label: "Black" },
];

const textAlignOptions = [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
];

const shaderOptions = [
  { value: "melt", label: "Melt" },
  { value: "flow", label: "Flow" },
  { value: "balatro", label: "Balatro" },
  { value: "glass", label: "Psychedelic Glass" },
  { value: "chargedCells", label: "Charged Cells" },
];

export default function ControlPanel({ config, setConfig }: ControlPanelProps) {
  const [durationInput, setDurationInput] = React.useState(String(config.duration));
  
  const handleDurationChange = (val: string) => {
    setDurationInput(val); // Show what the user is typing
    if (val === '') {
      setConfig(prev => ({ ...prev, duration: 0.1 }));
    } else {
      const newDuration = Number(val);
      if (!isNaN(newDuration) && newDuration > 0) {
        setConfig(prev => ({ ...prev, duration: newDuration }));
      }
    }
  };

  const handleTextChange = <K extends keyof AnimationConfig['text']>(
      key: K,
      value: AnimationConfig['text'][K]
  ) => {
      setConfig(prev => ({ ...prev, text: { ...prev.text, [key]: value } }));
  };

  const handleShaderChange = (shaderName: string) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      newConfig.shaders.activeShader = shaderName as ShaderName;
      const commonTracks = ['shader.hue', 'shader.saturation', 'shader.contrast'];
      newConfig.tracks = newConfig.tracks.map(track => {
        const propertyName = track.id.split('.').pop();
        if (commonTracks.includes(track.id) && propertyName) {
            if (shaderName === 'balatro' && propertyName === 'contrast') {
                 return { ...track, property: `shaders.balatro.contrast`};
            }
             if (shaderName in newConfig.shaders && propertyName in newConfig.shaders[shaderName as keyof typeof newConfig.shaders]) {
                return {
                    ...track,
                    property: `shaders.${shaderName}.${propertyName}`
                };
            }
        }
        return track;
      });

      return newConfig;
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex-shrink-0 border-b border-border p-2 px-4 flex items-center justify-between h-14">
        <a 
          href="/" 
          className="flex items-center gap-2 group hover:no-underline focus:no-underline"
        >
          <img 
            src="/logo.webp" 
            alt="Kerach Tempo" 
            width={32} 
            height={32}
            className="flex-shrink-0"
          />
          <h1 className="text-xl font-bold text-[hsl(var(--accent))] font-headline tracking-wider group-hover:text-[hsl(var(--primary))] transition-colors duration-300 ease-in-out">
            Kerach Tempo
          </h1>
        </a>
      </header>
      <ScrollArea className="flex-grow h-[calc(100vh-56px)]">
      <div className="p-4 space-y-6">
          <FilePanel config={config} setConfig={setConfig} />
          <Separator />
          
          <div className="space-y-4">
              <FloatingLabelInput 
              label="Text Content" 
              value={config.text.content} 
              onValueChange={v => handleTextChange('content', v)}
              textarea
              />
              
              <FloatingLabelCombobox
              label="Font Family"
              value={config.text.fontFamily}
              onValueChange={v => handleTextChange('fontFamily', v)}
              options={fontFamilyOptions}
              />

              <FloatingLabelCombobox
              label="Font Weight"
              value={config.text.fontWeight}
              onValueChange={v => handleTextChange('fontWeight', v)}
              options={fontWeightOptions}
              />

              <FloatingLabelCombobox
              label="Horizontal Align"
              value={config.text.align}
              onValueChange={v => handleTextChange('align', v as any)}
              options={textAlignOptions}
              />

              <FloatingLabelInput
                label="Line Height"
                type="number"
                value={String(config.text.lineHeight)}
                onValueChange={v => handleTextChange('lineHeight', Number(v))}
                min={0.5}
                max={3}
              />
          </div>
          <Separator />
          <div className="space-y-4">
              <FloatingLabelInput
              label="Animation Duration (s)"
              type="number"
              value={durationInput}
              onValueChange={handleDurationChange}
              />
          </div>
          <Separator />
          <FloatingLabelCombobox
          label="Shader"
          value={config.shaders.activeShader}
          onValueChange={handleShaderChange}
          options={shaderOptions}
          />
          <Separator />
           <Accordion type="single" collapsible className="w-full">
            <ColorStudio />
          </Accordion>
          <Footer />
      </div>
      </ScrollArea>
    </div>
  );
}
