// LabelDrawer.tsx
import React from 'react';

interface LabelDrawerProps {
  onDragStart: (e: React.DragEvent, label: string) => void;
}

const LabelDrawer: React.FC<LabelDrawerProps> = ({ onDragStart }) => {
  return (
    <div
      style={{ width: '200px', padding: '10px', borderRight: '1px solid #ccc' }}
    >
      <div
        draggable
        onDragStart={(e) => onDragStart(e, 'Label 1')}
        style={{
          margin: '10px 0',
          padding: '5px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
        }}
      >
        Label 1
      </div>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, 'Label 2')}
        style={{
          margin: '10px 0',
          padding: '5px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
        }}
      >
        Label 2
      </div>
    </div>
  );
};

export default LabelDrawer;
