import { DroppedBox } from '@/app/videoeditor1/dragdrop/DroppedBox';
import { Container } from '@/app/videoeditor1/dragdrop/Container';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableBox } from '@/app/videoeditor1/dragdrop/DraggableBox';

type Props = {};

function SideMenu({}: Props) {
  return (
    <div style={{ display: 'flex', flex: 1, flexFlow: 'column' }}>
      <DraggableBox text='Glass' />
      <DraggableBox text='Banana' />
      <DraggableBox text='Paper' />
    </div>
  );
}

export default SideMenu;
