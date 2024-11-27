'use client';
import React, { useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null); // Base video frame
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null); // Overlay for labels
  const combinedCanvasRef = useRef<HTMLCanvasElement>(null); // Final combined canvas
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<any>(null);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const videoUrl = URL.createObjectURL(file);
      setLocalVideoUrl(videoUrl); // Set the video source to the uploaded file
    }
  };

  const processFrames = async () => {
    setIsProcessing(true);

    const video = videoRef.current;
    const baseCanvas = baseCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const combinedCanvas = combinedCanvasRef.current;

    if (!video || !baseCanvas || !overlayCanvas || !combinedCanvas) {
      console.error('Video or canvases not initialized');
      setIsProcessing(false);
      return;
    }

    const baseCtx = baseCanvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');
    const combinedCtx = combinedCanvas.getContext('2d');

    if (!baseCtx || !overlayCtx || !combinedCtx) {
      console.error('Failed to get canvas contexts');
      setIsProcessing(false);
      return;
    }

    const frames: Blob[] = [];
    const frameRate = 30;
    const duration = video.duration;
    const frameInterval = 1 / frameRate;

    // Configure canvas sizes
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
            // Draw video frame on base canvas
            baseCtx.drawImage(video, 0, 0, width, height);

            // Clear and draw overlay (label or graphics)
            overlayCtx.clearRect(0, 0, width, height);
            overlayCtx.font = '30px Arial';
            overlayCtx.fillStyle = 'red';
            overlayCtx.fillText(
              `Frame: ${Math.floor(currentTime * frameRate)}`,
              50,
              50
            );

            // Combine base and overlay on the final canvas
            combinedCtx.clearRect(0, 0, width, height);
            combinedCtx.drawImage(baseCanvas, 0, 0, width, height);
            combinedCtx.drawImage(overlayCanvas, 0, 0, width, height);

            // Save the combined frame
            combinedCanvas.toBlob((blob) => {
              if (blob) {
                frames.push(blob);
              }
              resolve();
            }, 'image/png');
          },
          { once: true }
        );
      });
    }

    console.log(`Captured ${frames.length} frames.`);
    setIsProcessing(false);
    return frames;
  };

  const exportVideo = async (frames: Blob[]) => {
    setIsExporting(true);
    try {
      const ffmpeg = new FFmpeg();
      ffmpeg.on('log', ({ type, message }) => {
        console.log(type, message);
      });

      ffmpeg.on('progress', ({ progress, time }) => {
        console.log(progress, time);
      });
      await ffmpeg.load();

      // const videoData = new Uint8Array(await videoFile.arrayBuffer());
      // await ffmpeg.writeFile('input.mp4', videoData);

      // // Step 2: Extract audio from the original video
      // await ffmpeg.exec([
      //   '-i',
      //   'input.mp4',
      //   '-vn',
      //   '-acodec',
      //   'aac',
      //   '-b:a',
      //   '192k',
      //   'audio.mp3',
      // ]);
      // console.log('Audio extracted successfully');

      // Write each frame to FFmpeg's virtual file system
      for (let i = 0; i < frames.length; i++) {
        const frameFileName = `frame${i.toString().padStart(4, '0')}.png`;
        const frameData = new Uint8Array(await frames[i].arrayBuffer());

        console.log(
          `Writing frame: ${frameFileName}, Size: ${frameData.length}`
        );
        ffmpeg.writeFile(frameFileName, frameData);
      }
      console.log('All frames written to FFmpeg FS');

      // Encode the frames into a video
      await ffmpeg.exec([
        '-framerate',
        '30', // Frame rate
        '-i',
        'frame%04d.png', // Input frames with padded naming
        '-c:v',
        'libx264', // Encoding codec
        '-pix_fmt',
        'yuv420p', // Pixel format
        '-shortest', // Ensures video length matches the shortest (audio/video)
        'output.mp4', // Output file
      ]);

      console.log('FFmpeg successfully encoded video');

      // Retrieve the video file
      const data: any = await ffmpeg.readFile('output.mp4');
      const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(videoBlob);
      console.log('Video url generated for export', videoUrl);

      setExportUrl(videoUrl);
      setIsExporting(false);
    } catch (error) {
      console.error('An error occurred during export:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = async () => {
    const frames = await processFrames();
    if (frames) {
      await exportVideo(frames);
      console.log('Finished exporting video');
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
            src={localVideoUrl}
            crossOrigin='anonymous'
            style={{ display: 'block' }}
          />
          <canvas ref={baseCanvasRef} style={{ display: 'block' }}></canvas>
          <canvas ref={overlayCanvasRef} style={{ display: 'block' }}></canvas>
          <canvas ref={combinedCanvasRef} style={{ display: 'block' }}></canvas>
          <button onClick={handleExport} disabled={isProcessing || isExporting}>
            {isProcessing || isExporting ? 'Processing...' : 'Export Video'}
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
