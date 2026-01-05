
"use client";

import React, { useState, useMemo } from 'react';
import chroma from 'chroma-js';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ColorPicker from '../ui/ColorPicker';
import { FloatingLabelCombobox } from '../ui/FloatingLabelCombobox';
import FloatingLabelInput from '../ui/FloatingLabelInput';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import ColorCard from './ColorCard';

const harmonyOptions = [
  { value: "triad", label: "Triad" },
  { value: "complementary", label: "Complementary" },
  { value: "splitComp", label: "Split Complementary" },
  { value: "square", label: "Square" },
  { value: "tetradic", label: "Tetradic" },
  { value: "monochromatic", label: "Monochromatic" },
];

const mixModeOptions = [
    { value: "rgb", label: "RGB" },
    { value: "lch", label: "LCH" },
    { value: "lab", label: "LAB" },
    { value: "hsl", label: "HSL" },
];


export default function ColorStudio() {
    const [activeTab, setActiveTab] = useState('palette');

    // Palette State
    const [baseColor, setBaseColor] = useState("#0DE5DA");
    const [harmony, setHarmony] = useState("triad");

    // Mix State
    const [mix1, setMix1] = useState("#0DE5DA");
    const [mix2, setMix2] = useState("#E50DDA");
    const [mixMode, setMixMode] = useState("lch");
    const [mixSteps, setMixSteps] = useState("5");
    
    // Brightness State
    const [brightBase, setBrightBase] = useState("#0D82E5");
    const [brightMode, setBrightMode] = useState("darken");
    const [brightSteps, setBrightSteps] = useState("6");

    const harmonies = useMemo(() => {
        if (!chroma.valid(baseColor)) return [];
        try {
            const color = chroma(baseColor);
            switch(harmony) {
                case 'triad': return [color.hex(), color.set('hsl.h', '+120').hex(), color.set('hsl.h', '-120').hex()];
                case 'complementary': return [color.hex(), color.set('hsl.h', '+180').hex()];
                case 'splitComp': return [color.hex(), color.set('hsl.h', '+150').hex(), color.set('hsl.h', '-150').hex()];
                case 'square': return [color.hex(), color.set('hsl.h', '+90').hex(), color.set('hsl.h', '+180').hex(), color.set('hsl.h', '+270').hex()];
                case 'tetradic': return [color.hex(), color.set('hsl.h', '+60').hex(), color.set('hsl.h', '+180').hex(), color.set('hsl.h', '+240').hex()];
                case 'monochromatic': return chroma.scale([color.darken(2), color, color.brighten(2)]).mode('lch').colors(5);
                default: return [baseColor];
            }
        } catch (e) {
            return [];
        }
    }, [baseColor, harmony]);

    const mixes = useMemo(() => {
        if (!chroma.valid(mix1) || !chroma.valid(mix2)) return [];
        try {
            const steps = parseInt(mixSteps, 10);
            if(isNaN(steps) || steps < 2) return [];
            return chroma.scale([mix1, mix2]).mode(mixMode as any).colors(steps);
        } catch (e) {
            return [];
        }
    }, [mix1, mix2, mixMode, mixSteps]);

    const brights = useMemo(() => {
        if (!chroma.valid(brightBase)) return [];
        try {
            const steps = parseInt(brightSteps, 10);
            if(isNaN(steps) || steps < 2) return [];
            return chroma.scale([brightBase, brightMode === 'lighten' ? '#ffffff' : '#000000']).mode('lab').colors(steps);
        } catch(e) {
            return [];
        }
    }, [brightBase, brightMode, brightSteps]);


    const renderOutput = () => {
        switch(activeTab) {
            case 'palette': return harmonies.map((c, i) => <ColorCard key={i} hex={c} />);
            case 'mix': return mixes.map((c, i) => <ColorCard key={i} hex={c} />);
            case 'brightness': return brights.map((c, i) => <ColorCard key={i} hex={c} />);
            default: return null;
        }
    }

    return (
        <AccordionItem value="color-studio">
            <AccordionTrigger className="text-base">Color Studio</AccordionTrigger>
            <AccordionContent>
                <div className="grid gap-4 p-1">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="palette">Palette</TabsTrigger>
                            <TabsTrigger value="mix">Mix</TabsTrigger>
                            <TabsTrigger value="brightness">Brightness</TabsTrigger>
                        </TabsList>
                        <TabsContent value="palette" className="space-y-4 mt-4">
                            <ColorPicker value={baseColor} onValueChange={setBaseColor} contrastFormat="value" modeDropdownFullWidth={true} />
                            <FloatingLabelCombobox label="Mode" value={harmony} onValueChange={setHarmony} options={harmonyOptions} />
                        </TabsContent>
                        <TabsContent value="mix" className="space-y-4 mt-4">
                            <ColorPicker value={mix1} onValueChange={setMix1} contrastFormat="value" modeDropdownFullWidth={true}/>
                            <ColorPicker value={mix2} onValueChange={setMix2} contrastFormat="value" modeDropdownFullWidth={true}/>
                            <FloatingLabelCombobox label="Mix Mode" value={mixMode} onValueChange={setMixMode} options={mixModeOptions} />
                            <FloatingLabelInput label="Steps" value={mixSteps} onValueChange={setMixSteps} type="number" min={2} max={50} />
                        </TabsContent>
                        <TabsContent value="brightness" className="space-y-4 mt-4">
                            <ColorPicker value={brightBase} onValueChange={setBrightBase} contrastFormat="value" modeDropdownFullWidth={true}/>
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="brightness-mode">Darken</Label>
                                <Switch id="brightness-mode" checked={brightMode === 'lighten'} onCheckedChange={(c) => setBrightMode(c ? 'lighten' : 'darken')} />
                                <Label htmlFor="brightness-mode">Lighten</Label>
                            </div>
                            <FloatingLabelInput label="Steps" value={brightSteps} onValueChange={setBrightSteps} type="number" min={2} max={50} />
                        </TabsContent>
                    </Tabs>
                    
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Output</h4>
                        <div className="flex flex-wrap gap-4">
                            {renderOutput()}
                        </div>
                    </div>

                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
