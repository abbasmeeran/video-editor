import React from 'react';
import { DraggableBox } from './DraggableBox';

type Props = {};

function SideMenu({}: Props) {
  return (
    <div
      style={{ display: 'flex', flex: 1, flexFlow: 'column', margin: '10px' }}
    >
      <DraggableBox text='Glass' />
      <DraggableBox text='Banana' />
      <DraggableBox text='Paper' />
    </div>
  );
}

export default SideMenu;
