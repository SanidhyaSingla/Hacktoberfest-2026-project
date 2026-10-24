'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'monospace',
});

interface MermaidProps {
  chart: string;
}

export default function MermaidChart({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && chart) {
      containerRef.current.removeAttribute('data-processed');
      containerRef.current.innerHTML = chart;
      
      const uniqueId = `mermaid-${Math.floor(Math.random() * 1000000)}`;
      mermaid.render(uniqueId, chart)
        .then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        })
        .catch((err) => {
          console.error('Mermaid render error:', err);
        });
    }
  }, [chart]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full overflow-auto flex items-center justify-center p-4 bg-slate-900 rounded-xl border border-slate-800"
    />
  );
}