import { Slider } from 'antd';
import React, { useState } from 'react';

type Props = {
  startTime: number;
  endTime: number;
  videoDuration: number;
  isProcessing: boolean;
  isExporting: boolean;
  onChange: any;
};

export type Range = {
  startTime: number;
  endTime: number;
};

function Slider1({
  startTime,
  endTime,
  videoDuration,
  isProcessing,
  isExporting,
  onChange,
}: Props) {
  const [start, setStart] = useState(startTime);
  const [end, setEnd] = useState(endTime);

  function onValueChange(e: any) {
    const { name, value } = e.target;
    const result: Range = { startTime: start, endTime: end };
    const seconds = parseFloat(value);
    if (name === 'start') {
      setStart(seconds);
      result.startTime = seconds;
    } else {
      setEnd(seconds);
      result.endTime = seconds;
    }
    onChange(result);
  }

  return (
    <div className='mt-10'>
      <Slider
        disabled={isProcessing || isExporting}
        value={[startTime, endTime]}
        min={0}
        step={0.1}
        max={videoDuration}
        range={true}
        onChange={(values) => {
          const result: Range = { startTime: values[0], endTime: values[1] };
          onChange(result);
        }}
        tooltip={{
          formatter: null,
        }}
      />
      {/* <div>
        <label>
          Start Time: {start.toFixed(1)}s
          <input
            name='start'
            type='range'
            min={0}
            max={videoDuration}
            step={0.1}
            value={start}
            onChange={onValueChange}
            disabled={isProcessing || isExporting}
          />
        </label>
      </div>
      <div>
        <label>
          End Time: {end.toFixed(1)}s
          <input
            name='end'
            type='range'
            min={0}
            max={videoDuration}
            step={0.1}
            value={end}
            onChange={onValueChange}
            disabled={isProcessing || isExporting}
          />
        </label>
      </div> */}
    </div>
  );
}

export default Slider1;
