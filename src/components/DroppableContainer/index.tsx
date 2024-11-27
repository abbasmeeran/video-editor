import type { CSSProperties, FC, ReactElement } from 'react';
import { useDrop } from 'react-dnd';

import { DraggableItemTypes } from '../../lib/draggableItemTypes';

const style: CSSProperties = {
  // height: '12rem',
  // width: '12rem',
  // marginRight: '1.5rem',
  // marginBottom: '1.5rem',
  // color: 'white',
  // padding: '1rem',
  // textAlign: 'center',
  // fontSize: '1rem',
  // lineHeight: 'normal',
  // float: 'left',
};

type Props = {
  children: ReactElement;
};

export const DropppableContainer: FC<Props> = ({ children }) => {
  const [{ canDrop, isOver }, drop]: any[] = useDrop(() => ({
    accept: DraggableItemTypes.BOX,
    drop: () => ({ name: 'DroppableContainer' }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const isActive = canDrop && isOver;
  let backgroundColor = '#222';
  if (isActive) {
    //backgroundColor = 'darkgreen';
  } else if (canDrop) {
    //backgroundColor = 'darkkhaki';
  }

  return (
    <div ref={drop} style={{ ...style }} data-testid='dustbin'>
      {children}
    </div>
  );
};
