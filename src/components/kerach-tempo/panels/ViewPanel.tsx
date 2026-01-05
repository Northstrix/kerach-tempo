"use client";

import type { Dispatch, SetStateAction } from 'react';
import type { AnimationConfig } from '@/lib/types';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface ViewPanelProps {
    config: AnimationConfig;
    setConfig: Dispatch<SetStateAction<AnimationConfig>>;
}

export default function ViewPanel({ config, setConfig }: ViewPanelProps) {
    const handleViewChange = <K extends keyof NonNullable<AnimationConfig['view']>>(
        key: K,
        value: NonNullable<AnimationConfig['view']>[K]
    ) => {
        setConfig(prev => ({
            ...prev,
            view: {
                ...prev.view,
                [key]: value
            } as NonNullable<AnimationConfig['view']>
        }));
    };

    const zoom = config.view?.zoom ?? 1;

    return (
        <AccordionItem value="view">
            <AccordionTrigger className="text-base">View</AccordionTrigger>
            <AccordionContent>
                <div className="grid gap-4 p-1">
                    <div className="space-y-2">
                        <Label>Timeline Zoom: {zoom.toFixed(2)}x</Label>
                        <Slider
                            value={[zoom]}
                            onValueChange={v => handleViewChange('zoom', v[0])}
                            min={0.5}
                            max={5}
                            step={0.1}
                        />
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
