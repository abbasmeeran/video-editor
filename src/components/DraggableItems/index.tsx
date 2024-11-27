import { DraggableBox } from '@/components/DraggableBox';
import type { FC } from 'react';
import { memo } from 'react';

export const DraggableItems: FC = memo(function Container() {
  return (
    <div>
      <div style={{ overflow: 'hidden', clear: 'both' }}>
        <DraggableBox name='Glass' />
        <DraggableBox name='Banana' />
        <DraggableBox name='Paper' />
      </div>
    </div>
  );
});
