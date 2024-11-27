import type { CSSProperties, FC } from 'react';
import { useDrag } from 'react-dnd';

import { ItemTypes } from './ItemTypes';

const style: CSSProperties = {
  border: '1px dashed gray',
  backgroundColor: 'white',
  padding: '0.5rem 1rem',
  marginRight: '1.5rem',
  marginBottom: '1.5rem',
  cursor: 'move',
  float: 'left',
};

export interface DraggableBoxProps {
  text: string;
}

interface DropResult {
  id: string;
}

export const DraggableBox: FC<DraggableBoxProps> = function DraggaleBox({
  text,
}) {
  const [{ isDragging }, drag]: any[] = useDrag(() => ({
    type: ItemTypes.BOX,
    item: { text },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<DropResult>();
      if (item && dropResult) {
        console.log(`You dropped ${item.text} into ${dropResult.id}!`);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    }),
  }));

  const opacity = isDragging ? 0.4 : 1;
  return (
    <div ref={drag} style={{ ...style, opacity }} data-testid={`box`}>
      {text}
    </div>
  );
};
