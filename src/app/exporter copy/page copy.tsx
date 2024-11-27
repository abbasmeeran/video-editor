'use client';

import React, { useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null); // Base video frame
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null); // Overlay for labels
  const combinedCanvasRef = useRef<HTMLCanvasElement>(null); // Final combined canvas
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Handle video upload
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const videoUrl = URL.createObjectURL(file);
      setLocalVideoUrl(videoUrl);
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
        '00:00:05', // Start time for trimming
        '-t',
        '00:00:10', // Duration for trimming
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
        video.videoWidth);
    const height =
      (baseCanvas.height =
      overlayCanvas.height =
      combinedCanvas.height =
        video.videoHeight);

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

            overlayCtx.clearRect(0, 0, width, height);
            overlayCtx.font = '30px Arial';
            overlayCtx.fillStyle = 'red';
            overlayCtx.fillText(
              `Frame: ${Math.floor(currentTime * frameRate)}`,
              50,
              50
            );

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
          <button onClick={handleExport} disabled={isProcessing}>
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
