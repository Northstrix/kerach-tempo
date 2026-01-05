
"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ModeSelectorProps {
  options: { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function ModeSelector({ options, value, onValueChange, className }: ModeSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-1 p-1", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onValueChange(option.value)}
          className={cn(
            "flex items-center justify-between w-full px-2 py-1.5 text-sm text-left rounded-md transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            value === option.value
              ? "bg-accent text-accent-foreground"
              : "text-foreground"
          )}
        >
          <span>{option.label}</span>
          {value === option.value && <Check className="w-4 h-4" />}
        </button>
      ))}
    </div>
  );
}
