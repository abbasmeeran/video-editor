import React, { useState } from 'react';

type Props = {
  label: Label;
  onChange: any;
};

export type Label = {
  x: number;
  y: number;
  text: string;
  id: string;
};

function DraggableLabel({ label, onChange }: Props) {
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: label.x,
    y: label.y,
  });

  const handleLabelDrag: any = (e: React.MouseEvent, labelId: string) => {
    const offset = { x: e.clientX - label.x, y: e.clientY - label.y };
    setDragOffset(offset);
    onChange({
      ...label,
      ...offset,
    });
  };

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', label.text)}
      style={{
        margin: '10px 0',
        padding: '5px',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
      }}
      onDrag={handleLabelDrag}
    >
      {label.text}
    </div>
  );
}

export default DraggableLabel;
