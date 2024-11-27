'use client';

import React, { useRef, useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [videoDuration, setVideoDuration] = useState(0);
  const [droppedLabels, setDroppedLabels] = useState<
    { id: string; x: number; y: number; text: string }[]
  >([]);
  const [draggingLabel, setDraggingLabel] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const canvasWidth = 640;
  const canvasHeight = 360;

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    const video = videoRef.current;
    if (video) {
      video.play();
      video.loop = true;
      video.onplay = () => renderFrame(ctx, video);
    }

    function renderFrame(
      ctx: CanvasRenderingContext2D,
      video: HTMLVideoElement
    ) {
      if (!video.paused && !video.ended) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw labels on top of the video
        droppedLabels.forEach((label) => {
          ctx.fillStyle = 'red';
          ctx.font = '30px Arial';
          ctx.fillText(label.text, label.x, label.y);
        });

        requestAnimationFrame(() => renderFrame(ctx, video));
      }
    }
  }, [droppedLabels]);

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
        setEndTime(Math.min(10, tempVideo.duration));
      };
    }
  };

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
        startTime.toString(),
        '-t',
        (endTime - startTime).toString(),
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

  const handleDrop = (e: React.DragEvent) => {
    const offsetX = e.clientX - canvasRef.current!.getBoundingClientRect().left;
    const offsetY = e.clientY - canvasRef.current!.getBoundingClientRect().top;
    const clampedX = Math.max(0, Math.min(offsetX, canvasWidth));
    const clampedY = Math.max(0, Math.min(offsetY, canvasHeight));

    const labelText = e.dataTransfer.getData('text/plain');

    setDroppedLabels((prevLabels) => [
      ...prevLabels,
      { id: Date.now().toString(), x: clampedX, y: clampedY, text: labelText },
    ]);
  };

  const handleLabelDrag = (e: React.MouseEvent, labelId: string) => {
    setDraggingLabel(labelId);
    const label = droppedLabels.find((label) => label.id === labelId);
    if (label) {
      setDragOffset({ x: e.clientX - label.x, y: e.clientY - label.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingLabel && canvasRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      const clampedX = Math.max(0, Math.min(newX, canvasWidth));
      const clampedY = Math.max(0, Math.min(newY, canvasHeight));

      setDroppedLabels((prevLabels) =>
        prevLabels.map((label) =>
          label.id === draggingLabel
            ? { ...label, x: clampedX, y: clampedY }
            : label
        )
      );
    }
  };

  const handleMouseUp = () => {
    setDraggingLabel(null);
  };

  const processFrames = async (videoUrl: string): Promise<Blob[]> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      console.error('Video or canvas not initialized');
      return [];
    }

    video.src = videoUrl;
    await new Promise<void>((resolve: any, reject) => {
      video.addEventListener('loadeddata', resolve, { once: true });
      video.addEventListener('error', reject, { once: true });
    });

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return [];
    }

    const frames: Blob[] = [];
    const frameRate = 30;
    const duration = video.duration;
    const frameInterval = 1 / frameRate;

    const width = (canvas.width = video.videoWidth);
    const height = (canvas.height = video.videoHeight);

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
            ctx.drawImage(video, 0, 0, width, height);

            // Draw labels on top of the video
            droppedLabels.forEach((label) => {
              ctx.fillStyle = 'red';
              ctx.font = '30px Arial';
              ctx.fillText(label.text, label.x, label.y);
            });

            canvas.toBlob((blob) => {
              if (blob) frames.push(blob);
              resolve();
            });
          },
          { once: true }
        );
      });
    }

    return frames;
  };

  const exportVideo = async () => {
    setIsExporting(true);
    const trimmedBlob = await trimVideoInMemory();
    if (!trimmedBlob) {
      setIsExporting(false);
      return;
    }

    const frames = await processFrames(URL.createObjectURL(trimmedBlob));

    // Create video from frames
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    // Create video file from frames
    for (let i = 0; i < frames.length; i++) {
      const frameBlob = frames[i];
      await ffmpeg.writeFile(
        `frame${i}.png`,
        new Uint8Array(await frameBlob.arrayBuffer())
      );
    }

    // Combine frames into a video
    await ffmpeg.exec([
      '-framerate',
      '30',
      '-i',
      'frame%d.png',
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      'output.mp4',
    ]);

    const data: any = await ffmpeg.readFile('output.mp4');
    const videoUrl = URL.createObjectURL(
      new Blob([data.buffer], { type: 'video/mp4' })
    );
    setExportUrl(videoUrl);
    setIsExporting(false);
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Side menu */}
      <div
        style={{
          width: '200px',
          padding: '10px',
          borderRight: '1px solid #ccc',
        }}
      >
        <div
          draggable
          onDragStart={(e) => e.dataTransfer.setData('text/plain', 'Label 1')}
          style={{
            margin: '10px 0',
            padding: '5px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
          }}
        >
          Label 1
        </div>
        <div
          draggable
          onDragStart={(e) => e.dataTransfer.setData('text/plain', 'Label 2')}
          style={{
            margin: '10px 0',
            padding: '5px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
          }}
        >
          Label 2
        </div>
      </div>

      {/* Main container with canvas */}
      <div style={{ flex: 1 }}>
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
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{ border: '1px solid black', cursor: 'pointer' }}
            />
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
          </>
        )}
      </div>
    </div>
  );
};

export default App;
