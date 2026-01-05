
"use client";

import React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { AnimationConfig } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { generateHtml } from '@/lib/code-generator';
import { FileDown, FileUp, Code } from 'lucide-react';
import RefinedChronicleButton from '@/components/ui/RefinedChronicleButton';

interface FilePanelProps {
    config: AnimationConfig;
    setConfig: Dispatch<SetStateAction<AnimationConfig>>;
}

export default function FilePanel({ config, setConfig }: FilePanelProps) {
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const jsonString = JSON.stringify(config, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'kerach-tempo-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "Exported successfully!", description: "Configuration saved to kerach-tempo-config.json." });
    };
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File is not valid text");
                const newConfig = JSON.parse(text) as AnimationConfig;
                if (newConfig.duration && newConfig.text && newConfig.tracks) {
                    setConfig(newConfig);
                    toast({ title: "Import successful!", description: "Animation configuration loaded." });
                } else {
                    throw new Error("Invalid config format");
                }
            } catch (error) {
                toast({ variant: "destructive", title: "Import failed", description: "The selected file is not a valid configuration." });
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleGenerateCode = () => {
        const htmlContent = generateHtml(config);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'kerach-tempo-animation.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "Code generated!", description: "Standalone HTML file has been downloaded." });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Project</h3>
            <div className="grid grid-cols-1 gap-2">
                <RefinedChronicleButton 
                    onClick={handleImportClick} 
                    variant="outline"
                    icon={<FileUp />}
                    backgroundColor="transparent"
                    textColor="hsl(var(--foreground))"
                    hoverTextColor="hsl(var(--accent-foreground))"
                    borderColor="hsl(var(--border))"
                    borderVisible
                    hoverBorderVisible
                    hoverBorderColor="hsl(var(--accent))"
                    hoverBackgroundColor="hsl(var(--accent))"
                >
                    Import Config
                </RefinedChronicleButton>
                 <RefinedChronicleButton 
                    onClick={handleExport}
                    variant="outline"
                    icon={<FileDown />}
                    backgroundColor="transparent"
                    textColor="hsl(var(--foreground))"
                    hoverTextColor="hsl(var(--accent-foreground))"
                    borderColor="hsl(var(--border))"
                    borderVisible
                    hoverBorderVisible
                    hoverBorderColor="hsl(var(--accent))"
                    hoverBackgroundColor="hsl(var(--accent))"
                >
                    Export Config
                </RefinedChronicleButton>
                <RefinedChronicleButton 
                    onClick={handleGenerateCode} 
                    variant="default"
                    icon={<Code />}
                    backgroundColor="hsl(var(--foreground))"
                    textColor="hsl(var(--background))"
                    hoverBackgroundColor="hsl(var(--primary))"
                    hoverTextColor="hsl(var(--primary-foreground))"
                >
                    Generate HTML
                </RefinedChronicleButton>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                />
            </div>
        </div>
    );
}
