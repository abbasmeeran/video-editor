import DraggableLabel from '@/app/videoeditor1/DraggableLabel';
import React from 'react';

type Props = {
  onLabelDrag: any;
};

function SideMenu({ onLabelDrag }: Props) {
  return (
    <div
      style={{
        width: '200px',
        padding: '10px',
        borderRight: '1px solid #ccc',
      }}
    >
      <DraggableLabel
        label={{ text: 'Label 1', id: '1', x: 0, y: 0 }}
        onChange={onLabelDrag}
      />
      <DraggableLabel
        label={{ text: 'Label 2', id: '2', x: 0, y: 0 }}
        onChange={onLabelDrag}
      />
    </div>
  );
}

export default SideMenu;
