import React from 'react';

interface ExportControlsProps {
  startTime: number;
  endTime: number;
  videoDuration: number;
  setStartTime: (value: number) => void;
  setEndTime: (value: number) => void;
  exportVideo: () => void;
  isExporting: boolean;
  exportUrl: string | null;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  startTime,
  endTime,
  videoDuration,
  setStartTime,
  setEndTime,
  exportVideo,
  isExporting,
  exportUrl,
}) => {
  return (
    <div>
      <div>
        <label>
          Start Time: {startTime.toFixed(1)}s
          <input
            type='range'
            min={0}
            max={videoDuration}
            step={0.1}
            value={startTime}
            onChange={(e) => setStartTime(parseFloat(e.target.value))}
            disabled={isExporting}
          />
        </label>
      </div>
      <div>
        <label>
          End Time: {endTime.toFixed(1)}s
          <input
            type='range'
            min={0}
            max={videoDuration}
            step={0.1}
            value={endTime}
            onChange={(e) => setEndTime(parseFloat(e.target.value))}
            disabled={isExporting}
          />
        </label>
      </div>
      <button onClick={exportVideo} disabled={isExporting}>
        {isExporting ? 'Exporting...' : 'Export Video'}
      </button>
      {exportUrl && (
        <div>
          <a href={exportUrl} download='final_video.mp4'>
            Download Exported Video
          </a>
        </div>
      )}
    </div>
  );
};

export default ExportControls;
