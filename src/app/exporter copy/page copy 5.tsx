'use client';

import React, { useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const combinedCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [videoDuration, setVideoDuration] = useState(0);
  const [droppedLabels, setDroppedLabels] = useState<
    { id: string; x: number; y: number; text: string }[]
  >([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedLabelId, setDraggedLabelId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const canvasWidth = 640; // Set your canvas width
  const canvasHeight = 360; // Set your canvas height

  // Handle video upload
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const videoUrl = URL.createObjectURL(file);
      setLocalVideoUrl(videoUrl);

      const tempVideo = document.createElement('video');
      tempVideo.src = videoUrl;
      tempVideo.onloadedmetadata = () => {
        setVideoDuration(tempVideo.duration);
        setEndTime(Math.min(10, tempVideo.duration)); // Default trimming range to 10s or the full video duration
      };
    }
  };

  // Trim the video in memory
  const trimVideoInMemory = async (): Promise<Blob | null> => {
    try {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();

      const videoData = new Uint8Array(await videoFile!.arrayBuffer());
      await ffmpeg.writeFile('input.mp4', videoData);

      await ffmpeg.exec([
        '-i',
        'input.mp4',
        '-ss',
        startTime.toString(), // Use selected start time
        '-t',
        (endTime - startTime).toString(), // Calculate duration
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        '-strict',
        'experimental',
        'trimmed.mp4',
      ]);

      const data: any = await ffmpeg.readFile('trimmed.mp4');
      return new Blob([data.buffer], { type: 'video/mp4' });
    } catch (error) {
      console.error('Error during video trimming:', error);
      return null;
    }
  };

  // Process frames with overlay
  const processFrames = async (videoUrl: string): Promise<Blob[]> => {
    const video = videoRef.current;
    const baseCanvas = baseCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const combinedCanvas = combinedCanvasRef.current;

    if (!video || !baseCanvas || !overlayCanvas || !combinedCanvas) {
      console.error('Video or canvases not initialized');
      return [];
    }

    video.src = videoUrl;
    await new Promise<void>((resolve: any, reject) => {
      video.addEventListener('loadeddata', resolve, { once: true });
      video.addEventListener('error', reject, { once: true });
    });

    const baseCtx = baseCanvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');
    const combinedCtx = combinedCanvas.getContext('2d');
    if (!baseCtx || !overlayCtx || !combinedCtx) {
      console.error('Failed to get canvas contexts');
      return [];
    }

    const frames: Blob[] = [];
    const frameRate = 30;
    const duration = video.duration;
    const frameInterval = 1 / frameRate;

    const width =
      (baseCanvas.width =
      overlayCanvas.width =
      combinedCanvas.width =
        canvasWidth);
    const height =
      (baseCanvas.height =
      overlayCanvas.height =
      combinedCanvas.height =
        canvasHeight);

    for (
      let currentTime = 0;
      currentTime < duration;
      currentTime += frameInterval
    ) {
      await new Promise<void>((resolve) => {
        video.currentTime = currentTime;
        video.addEventListener(
          'seeked',
          () => {
            baseCtx.drawImage(video, 0, 0, width, height);

            // Draw the label on the overlay canvas if any label is placed
            overlayCtx.clearRect(0, 0, width, height);
            droppedLabels.forEach((label) => {
              overlayCtx.font = '30px Arial';
              overlayCtx.fillStyle = 'red';
              overlayCtx.fillText(label.text, label.x, label.y);
            });

            combinedCtx.clearRect(0, 0, width, height);
            combinedCtx.drawImage(baseCanvas, 0, 0, width, height);
            combinedCtx.drawImage(overlayCanvas, 0, 0, width, height);

            combinedCanvas.toBlob((blob) => {
              if (blob) frames.push(blob);
              resolve();
            }, 'image/png');
          },
          { once: true }
        );
      });
    }

    console.log(`Captured ${frames.length} frames.`);
    return frames;
  };

  // Export video with overlay
  const exportVideo = async (frames: Blob[]) => {
    try {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();

      for (let i = 0; i < frames.length; i++) {
        const frameFileName = `frame${i.toString().padStart(4, '0')}.png`;
        const frameData = new Uint8Array(await frames[i].arrayBuffer());
        await ffmpeg.writeFile(frameFileName, frameData);
      }

      await ffmpeg.exec([
        '-framerate',
        '30',
        '-i',
        'frame%04d.png',
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        'output.mp4',
      ]);

      const data: any = await ffmpeg.readFile('output.mp4');
      const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(videoBlob);

      setExportUrl(videoUrl);
      console.log('Video exported successfully:', videoUrl);
    } catch (error) {
      console.error('Error during video export:', error);
    }
  };

  // Handle export workflow
  const handleExport = async () => {
    try {
      setIsProcessing(true);

      const trimmedVideoBlob = await trimVideoInMemory();
      if (!trimmedVideoBlob) {
        console.error('Failed to trim the video');
        return;
      }

      const trimmedVideoUrl = URL.createObjectURL(trimmedVideoBlob);
      const frames = await processFrames(trimmedVideoUrl);

      if (frames.length > 0) await exportVideo(frames);
    } catch (error) {
      console.error('Error during processing:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag-and-drop handling for labels
  const handleDragStart = (e: React.DragEvent, labelText: string) => {
    e.dataTransfer.setData('text/plain', labelText);
  };

  const handleDrop = (e: React.DragEvent) => {
    const offsetX =
      e.clientX - overlayCanvasRef.current!.getBoundingClientRect().left;
    const offsetY =
      e.clientY - overlayCanvasRef.current!.getBoundingClientRect().top;

    // Clamp the dropped position to stay within canvas bounds
    const clampedX = Math.max(0, Math.min(offsetX, canvasWidth));
    const clampedY = Math.max(0, Math.min(offsetY, canvasHeight));

    const labelText = e.dataTransfer.getData('text/plain');

    setDroppedLabels((prevLabels) => [
      ...prevLabels,
      { id: Date.now().toString(), x: clampedX, y: clampedY, text: labelText },
    ]);
  };

  // Start dragging a label
  const handleLabelDrag = (e: React.MouseEvent, labelId: string) => {
    setIsDragging(true);
    setDraggedLabelId(labelId);

    const label = droppedLabels.find((label) => label.id === labelId);
    if (label) {
      setDragOffset({
        x: e.clientX - label.x,
        y: e.clientY - label.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && draggedLabelId) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Clamp the new position to stay within canvas bounds
      const clampedX = Math.max(0, Math.min(newX, canvasWidth));
      const clampedY = Math.max(0, Math.min(newY, canvasHeight));

      setDroppedLabels((prevLabels) =>
        prevLabels.map((label) =>
          label.id === draggedLabelId
            ? { ...label, x: clampedX, y: clampedY }
            : label
        )
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedLabelId(null);
  };

  return (
    <div>
      <input
        type='file'
        accept='video/*'
        onChange={handleVideoUpload}
        disabled={isProcessing || isExporting}
      />
      {localVideoUrl && (
        <>
          <video
            ref={videoRef}
            crossOrigin='anonymous'
            style={{ display: 'none' }}
          />
          <canvas ref={baseCanvasRef} style={{ display: 'none' }} />
          <canvas ref={overlayCanvasRef} style={{ display: 'none' }} />
          <canvas ref={combinedCanvasRef} style={{ display: 'none' }} />

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
                disabled={isProcessing || isExporting}
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
                disabled={isProcessing || isExporting}
              />
            </label>
          </div>

          <div
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              border: '1px solid #ccc',
              padding: '10px',
              marginBottom: '20px',
              position: 'relative',
            }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, 'Sample Label')}
              style={{
                cursor: 'move',
                padding: '5px',
                border: '1px dashed #aaa',
                marginBottom: '10px',
                background: '#f4f4f4',
              }}
            >
              Sample Label
            </div>
            {droppedLabels.map((label) => (
              <div
                key={label.id}
                style={{
                  position: 'absolute',
                  top: label.y,
                  left: label.x,
                  cursor: 'move',
                  padding: '5px',
                  background: '#f4f4f4',
                  border: '1px dashed #aaa',
                }}
                onMouseDown={(e) => handleLabelDrag(e, label.id)}
              >
                <input
                  type='text'
                  value={label.text}
                  onChange={(e) => {
                    setDroppedLabels((prevLabels) =>
                      prevLabels.map((lbl) =>
                        lbl.id === label.id
                          ? { ...lbl, text: e.target.value }
                          : lbl
                      )
                    );
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>

          <button onClick={handleExport} disabled={isProcessing || isExporting}>
            {isProcessing ? 'Processing...' : 'Export Video'}
          </button>
        </>
      )}
      {exportUrl && (
        <a href={exportUrl} download='output.mp4'>
          Download Exported Video
        </a>
      )}
    </div>
  );
};

export default App;
