import { Label } from '@/app/videoeditor1/DraggableLabel';
import React, { useState } from 'react';

type Props = {
  canvasRef: any;
  width: number;
  height: number;
  droppedLabels: any[];
  onChange: any;
  draggingLabel: string;
  dragOffset: { x: number; y: number };
  onHandleMouseUp: any;
  videoRef: any;
  videoUrl: any;
};

function Canvas({
  canvasRef,
  width,
  height,
  droppedLabels,
  onChange,
  draggingLabel = '',
  dragOffset = { x: 0, y: 0 },
  onHandleMouseUp,
  videoRef,
  videoUrl,
}: Props) {
  const [labels, setLabels] = useState<Label[]>(droppedLabels);

  const handleDrop = (e: React.DragEvent) => {
    const offsetX = e.clientX - canvasRef.current!.getBoundingClientRect().left;
    const offsetY = e.clientY - canvasRef.current!.getBoundingClientRect().top;
    const clampedX = Math.max(0, Math.min(offsetX, width));
    const clampedY = Math.max(0, Math.min(offsetY, height));

    const labelText = e.dataTransfer.getData('text/plain');
    const newLabels = [
      ...labels,
      { id: Date.now().toString(), x: clampedX, y: clampedY, text: labelText },
    ];
    setLabels(newLabels);
    onChange(newLabels);
    onHandleMouseUp();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingLabel && canvasRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      const clampedX = Math.max(0, Math.min(newX, width));
      const clampedY = Math.max(0, Math.min(newY, height));

      const newLabels = labels.map((label) =>
        label.id === draggingLabel
          ? { ...label, x: clampedX, y: clampedY }
          : label
      );
      setLabels(newLabels);
      onChange(newLabels);
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onMouseMove={handleMouseMove}
        onMouseUp={onHandleMouseUp}
        style={{ border: '1px solid black', cursor: 'pointer' }}
      ></canvas>
    </div>
  );
}

export default Canvas;
