import type { CSSProperties, FC } from 'react';
import { useDrag } from 'react-dnd';

import { DraggableItemTypes } from '../../lib/draggableItemTypes';

const style: CSSProperties = {
  border: '1px dashed gray',
  backgroundColor: 'white',
  padding: '0.5rem 1rem',
  marginRight: '1.5rem',
  marginBottom: '1.5rem',
  cursor: 'move',
  float: 'left',
};

interface BoxProps {
  name: string;
}

interface DragItem {
  name: string;
}
export const DraggableBox: FC<BoxProps> = ({ name }) => {
  const [{ isDragging }, drag]: any[] = useDrag(
    () => ({
      type: DraggableItemTypes.BOX,
      item: { name },
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult<DragItem>();
        if (item && dropResult) {
          alert(`You dropped ${item.name} into ${dropResult.name}!`);
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [name]
  );
  const opacity = isDragging ? 0.4 : 1;

  return (
    <div ref={drag} style={{ ...style, opacity }}>
      {name}
    </div>
  );
};
