// components/DraggableLabel.tsx
import React, { useState } from 'react';

interface DraggableLabelProps {
  labelText: string;
  onDrop: (e: React.DragEvent) => void;
}

const DraggableLabel: React.FC<DraggableLabelProps> = ({
  labelText,
  onDrop,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', labelText)}
      style={{
        margin: '10px 0',
        padding: '5px',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
      }}
    >
      {labelText}
    </div>
  );
};

export default DraggableLabel;
