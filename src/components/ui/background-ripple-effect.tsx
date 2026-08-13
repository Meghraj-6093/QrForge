import React, { useState, useEffect, useMemo, useCallback } from 'react';

interface BackgroundRippleEffectProps {
  cellSize?: number;
  className?: string;
}

interface Cell {
  id: string;
  row: number;
  col: number;
}

export const BackgroundRippleEffect: React.FC<BackgroundRippleEffectProps> = ({
  cellSize = 52,
  className = '',
}) => {
  const [dimensions, setDimensions] = useState<{ cols: number; rows: number }>({
    cols: 30,
    rows: 20,
  });
  const [rippleOrigin, setRippleOrigin] = useState<{ row: number; col: number; key: number } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  // Dynamic viewport grid calculation
  useEffect(() => {
    const calculateGrid = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // On small screens, use larger cells to optimize performance
      const effectiveCellSize = width < 768 ? Math.max(cellSize, 64) : cellSize;
      
      const cols = Math.ceil(width / effectiveCellSize) + 2;
      const rows = Math.ceil(height / effectiveCellSize) + 2;

      setDimensions({ cols, rows });
    };

    calculateGrid();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(calculateGrid, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [cellSize]);

  // Memoize cells array to prevent expensive allocations
  const cells = useMemo(() => {
    const list: Cell[] = [];
    for (let r = 0; r < dimensions.rows; r++) {
      for (let c = 0; c < dimensions.cols; c++) {
        list.push({
          id: `${r}-${c}`,
          row: r,
          col: c,
        });
      }
    }
    return list;
  }, [dimensions.rows, dimensions.cols]);

  // Trigger ripple animation on click
  const handleCellClick = useCallback((row: number, col: number) => {
    setRippleOrigin({ row, col, key: Date.now() });
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-0 overflow-hidden pointer-events-auto bg-[#080705] ${className}`}
      style={{
        maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 80%)',
      }}
    >
      <div 
        className="grid w-full h-full justify-center content-start select-none"
        style={{
          gridTemplateColumns: `repeat(${dimensions.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${dimensions.rows}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((cell) => {
          // Calculate distance for ripple effect
          let rippleDelay = 0;
          let isRippling = false;

          if (rippleOrigin) {
            const distance = Math.sqrt(
              Math.pow(cell.row - rippleOrigin.row, 2) + Math.pow(cell.col - rippleOrigin.col, 2)
            );
            if (distance < 12) {
              rippleDelay = distance * 45; // ms delay per distance ring
              isRippling = true;
            }
          }

          const isHovered = hoveredCell?.row === cell.row && hoveredCell?.col === cell.col;

          return (
            <div
              key={cell.id}
              onClick={() => handleCellClick(cell.row, cell.col)}
              onMouseEnter={() => setHoveredCell({ row: cell.row, col: cell.col })}
              onMouseLeave={() => setHoveredCell(null)}
              className="border border-[#EEEEED]/[0.025] transition-all duration-300 relative cursor-pointer group"
              style={{
                height: `${cellSize}px`,
                animationDelay: isRippling ? `${rippleDelay}ms` : '0ms',
              }}
            >
              {/* Hover Highlight */}
              <div 
                className={`absolute inset-0 transition-opacity duration-300 ${
                  isHovered ? 'bg-[#3A3A3A]/20 opacity-100' : 'opacity-0'
                }`}
              />

              {/* Ripple Flash Effect */}
              {isRippling && rippleOrigin && (
                <div 
                  key={rippleOrigin.key}
                  className="absolute inset-0 bg-[#EEEEED]/10 border border-[#EEEEED]/20 rounded-sm animate-ripplePulse pointer-events-none"
                  style={{
                    animationDelay: `${rippleDelay}ms`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
