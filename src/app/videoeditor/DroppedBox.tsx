import type { CSSProperties, FC, ReactNode } from 'react';
import { useDrag } from 'react-dnd';

import { ItemTypes } from './ItemTypes';

const style: CSSProperties = {
  position: 'absolute',
  border: '1px dashed gray',
  backgroundColor: 'white',
  padding: '0.5rem 1rem',
  cursor: 'move',
};

export interface DroppedBoxProps {
  id: any;
  text: string;
  left: number;
  top: number;
  hideSourceOnDrag?: boolean;
  children?: ReactNode;
}

export const DroppedBox: FC<DroppedBoxProps> = ({
  id,
  text,
  left,
  top,
  hideSourceOnDrag,
  children,
}) => {
  const [{ isDragging }, drag]: any = useDrag(
    () => ({
      type: ItemTypes.BOX,
      item: { id, x: left, y: top, text },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, left, top, text]
  );

  if (isDragging && hideSourceOnDrag) {
    return <div ref={drag} />;
  }
  return (
    <div
      className='box'
      ref={drag}
      style={{ ...style, left, top }}
      data-testid='box'
    >
      {children}
    </div>
  );
};
