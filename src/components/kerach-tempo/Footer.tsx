
"use client";

import React from 'react';
import NamerUiBadge from "@/components/ui/NamerUiBadge";

export default function Footer() {
    return (
        <footer className='pb-4'>
            <div className='flex justify-center'>
                <NamerUiBadge />
            </div>
            <div
                className="mt-6 pt-4 flex items-center justify-center gap-2 border-t text-center text-sm text-gray-400"
                dir="ltr"
            >
                <a
                    href="https://sourceforge.net/projects/kerach-tempo/"
                    target="_blank"
                    className="text-[hsl(var(--foreground))] hover:text-primary hover:underline transition-colors"
                >
                    SourceForge
                </a>
                <a
                    href="https://github.com/Northstrix/kerach-tempo"
                    target="_blank"
                    className="text-[hsl(var(--foreground))] hover:text-primary hover:underline transition-colors"
                >
                    GitHub
                </a>
                </div>
                <div className="pt-4 text-center text-sm text-gray-400" dir="ltr">
                    <div className="mb-1">
                        Made by{" "}
                        <a
                        href="https://maxim-bortnikov.netlify.app/"
                        target="_blank"
                        className="text-[hsl(var(--foreground))] hover:text-primary hover:underline transition-colors"
                        >
                        Maxim Bortnikov
                        </a>
                    </div>
                    
                    <div className="mb-10">
                        using{" "}
                        <a
                        href="https://nextjs.org"
                        target="_blank"
                        className="text-[hsl(var(--foreground))] hover:text-primary hover:underline transition-colors"
                        >
                        Next.js
                        </a>
                        ,{" "}
                        <a
                        href="https://www.perplexity.ai"
                        target="_blank"
                        className="text-[hsl(var(--foreground))] hover:text-primary hover:underline transition-colors"
                        >
                        Perplexity
                        </a>
                        ,{" "}and{" "}
                        <a
                        href="https://firebase.studio"
                        target="_blank"
                        className="text-[hsl(var(--foreground))] hover:text-primary hover:underline transition-colors"
                        >
                        Firebase Studio
                        </a>.
                    </div>
            </div>
        </footer>
    );
};
