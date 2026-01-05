
"use client";

import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="loader"></div>
      <style jsx>{`
        .loader {
          border: 4px solid hsl(var(--border));
          border-top: 4px solid hsl(var(--primary));
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;
