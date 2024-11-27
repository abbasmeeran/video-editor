// components/CanvasWithLabels.tsx
import React, { useRef, useEffect } from 'react';

interface CanvasWithLabelsProps {
  droppedLabels: { id: string; x: number; y: number; text: string }[];
  canvasWidth: number;
  canvasHeight: number;
  handleDrop: (e: React.DragEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
}

const CanvasWithLabels: React.FC<CanvasWithLabelsProps> = ({
  droppedLabels,
  canvasWidth,
  canvasHeight,
  handleDrop,
  handleMouseMove,
  handleMouseUp,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const renderFrame = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      droppedLabels.forEach((label) => {
        ctx.fillStyle = 'red';
        ctx.font = '30px Arial';
        ctx.fillText(label.text, label.x, label.y);
      });
      requestAnimationFrame(renderFrame);
    };

    renderFrame();
  }, [droppedLabels, canvasWidth, canvasHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ border: '1px solid black', cursor: 'pointer' }}
    />
  );
};

export default CanvasWithLabels;
