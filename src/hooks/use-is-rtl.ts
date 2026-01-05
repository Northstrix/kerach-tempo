
"use client";

import { useState, useEffect } from 'react';

const useIsRTL = () => {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const checkDir = () => {
      setIsRTL(document.documentElement.dir === 'rtl');
    };

    checkDir();

    // Optional: Watch for changes on the dir attribute
    const observer = new MutationObserver(checkDir);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return isRTL;
};

export default useIsRTL;
