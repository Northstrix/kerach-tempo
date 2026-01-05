"use client";

import type { Dispatch, SetStateAction } from 'react';
import type { AnimationConfig } from '@/lib/types';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ShaderPanelProps {
    config: AnimationConfig;
    setConfig: Dispatch<SetStateAction<AnimationConfig>>;
}

export default function ShaderPanel({ config, setConfig }: ShaderPanelProps) {
    const { activeShader } = config.shaders;

    return (
        <AccordionItem value="shader">
            <AccordionTrigger className="text-base">Shader Properties</AccordionTrigger>
            <AccordionContent>
                <div className="grid gap-4 p-1">
                    <p className="text-sm text-muted-foreground">
                        Animatable properties for the '{activeShader}' shader can be found on the timeline below.
                    </p>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
