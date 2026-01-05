
"use client";

import React from "react";
import { motion } from "framer-motion";
import { PanelRightOpen } from "lucide-react";
import { Button } from "./button";

interface Props {
  visible: boolean;
  onClick: () => void;
}

export default function FloatingCollapsedIcon({ visible, onClick }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: -20 }}
      animate={
        visible
          ? { opacity: 1, y: 0, x: 0, transition: { delay: 0.2, duration: 0.2, ease: "easeInOut" } }
          : { opacity: 0, y: -20, x: -20, transition: { duration: 0.2, ease: "easeInOut" } }
      }
      exit={{
        opacity: 0,
        y: -20,
        x: -20,
        transition: { duration: 0.2, ease: "easeInOut" },
      }}
      className="fixed top-3 left-3 z-[100]"
      style={{
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <Button
        variant="outline"
        size="icon"
        aria-label="Show sidebar"
        onClick={onClick}
        className="bg-background/80 backdrop-blur-sm"
      >
        <PanelRightOpen />
      </Button>
    </motion.div>
  );
}
