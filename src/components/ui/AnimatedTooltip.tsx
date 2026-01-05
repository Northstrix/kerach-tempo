
"use client";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

type TooltipItem = {
  id: number | string;
  children: React.ReactNode;
  [key: string]: any;
};

export const AnimatedTooltip = ({
  items,
  children,
  renderPill,
}: {
  items: TooltipItem[];
  children: (item: TooltipItem) => React.ReactNode;
  renderPill: (item: TooltipItem, isHovered: boolean) => React.ReactNode;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<string | number | null>(null);

  return (
    <TooltipProvider>
      {items.map((item) => (
         <Popover key={item.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  {renderPill(item, hoveredIndex === item.id)}
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Time: {(item.time * item.duration).toFixed(2)}s</p>
                {item.value && <p>Value: {item.value.toFixed(2)}</p>}
                {item.color && <p>Color: {item.color}</p>}
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-auto p-0 border-0" style={{height: 'auto'}}>
              {children(item)}
            </PopoverContent>
        </Popover>
      ))}
    </TooltipProvider>
  );
};
