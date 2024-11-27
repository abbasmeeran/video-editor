import { DroppedBox } from '@/app/videoeditor1/dragdrop/DroppedBox';
import { Container } from '@/app/videoeditor1/dragdrop/Container';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableBox } from '@/app/videoeditor1/dragdrop/DraggableBox';

type Props = {};

function DraggableContainer({}: Props) {
  return (
    <div style={{ flex: 1, flexFlow: 'column' }}>
      <DndProvider backend={HTML5Backend}>
        <div style={{ overflow: 'hidden', clear: 'both' }}>
          <DraggableBox text='Glass' />
          <DraggableBox text='Banana' />
          <DraggableBox text='Paper' />
        </div>
      </DndProvider>
    </div>
  );
}

export default DraggableContainer;
