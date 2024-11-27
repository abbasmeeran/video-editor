import update from 'immutability-helper';
import type { CSSProperties, FC } from 'react';
import { useCallback, useRef, useState } from 'react';
import type { XYCoord } from 'react-dnd';
import { useDrop } from 'react-dnd';

import { DroppedBox } from './DroppedBox';
import type { DragItem } from './DragItem';
import { ItemTypes } from './ItemTypes';
import VideoPlayer from '@/app/videoeditor1/VideoPlayer';
import { Label } from '@/store/videoSlice';

const styles: CSSProperties = {
  width: 300,
  height: 300,
  border: '1px solid black',
  position: 'relative',
};

export interface ContainerProps {
  hideSourceOnDrag?: boolean;
  videoRef: any;
  url: any;
  labels: Label[];
  onChange: any;
}

export interface ContainerState {
  boxes: { [key: string]: Label };
}

export const Container: FC<ContainerProps> = ({
  hideSourceOnDrag = true,
  videoRef,
  url,
  labels,
  onChange,
}) => {
  const containerRef: any = useRef();
  const [boxes, setBoxes] = useState<{
    [key: string]: Label;
  }>(
    labels.reduce((res: any, label) => {
      res[label.id] = label;
      return res;
    }, {})
  );

  const moveBox = useCallback(
    (id: string, text: string, x: number, y: number, isNew: boolean) => {
      const updatedBoxes = update(boxes, {
        [id]: isNew
          ? { $set: { x, y, text, id } }
          : {
              $merge: { x, y },
            },
      });
      setBoxes(updatedBoxes);
      onChange(Object.values(updatedBoxes));
    },
    [boxes, setBoxes]
  );

  const [, drop]: any[] = useDrop(
    () => ({
      accept: ItemTypes.BOX,
      drop(item: DragItem, monitor) {
        const { x, y } = getCorrectDroppedOffsetValue(
          monitor.getInitialSourceClientOffset(),
          monitor.getSourceClientOffset()
        );
        moveBox(
          item.id || Date.now().toString(),
          item.text,
          x,
          y,
          boxes[item.id] == null
        );
        return undefined;
      },
    }),
    [moveBox]
  );

  const getCorrectDroppedOffsetValue = (
    initialPosition: XYCoord | null,
    finalPosition: XYCoord | null
  ) => {
    // get the container (view port) position by react ref...
    const dropTargetPosition = containerRef.current.getBoundingClientRect();

    const { y: finalY, x: finalX } = finalPosition || { x: 0, y: 0 };
    const { y: initialY, x: initialX } = initialPosition || { x: 0, y: 0 };

    // calculate the correct position removing the viewport position.
    // finalY > initialY, I'm dragging down, otherwise, dragging up
    const newYposition =
      finalY > initialY
        ? initialY + (finalY - initialY) - dropTargetPosition.top
        : initialY - (initialY - finalY) - dropTargetPosition.top;

    const newXposition =
      finalX > initialX
        ? initialX + (finalX - initialX) - dropTargetPosition.left
        : initialX - (initialX - finalX) - dropTargetPosition.left;

    return {
      x: newXposition,
      y: newYposition,
    };
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div ref={drop} style={styles}>
        {Object.keys(boxes).map((key) => {
          const { x, y, text } = boxes[key] as Label;
          return (
            <DroppedBox
              key={key}
              id={key}
              left={x}
              top={y}
              text={text}
              hideSourceOnDrag={hideSourceOnDrag}
            >
              {text}
            </DroppedBox>
          );
        })}
        <VideoPlayer videoRef={videoRef} source={url} />
      </div>
    </div>
  );
};
