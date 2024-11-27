'use client';

import React, { useRef, useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import Slider, { Range } from '@/app/videoeditor1/Slider';
import Canvas from '@/app/videoeditor1/Canvas';
import VideoUpload from '@/app/videoeditor1/VideoUpload';
import VideoPlayer from '@/app/videoeditor1/VideoPlayer';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import SideMenu from '@/app/videoeditor1/SideMenu';
import { RootState, store } from '../../store';
import { Provider } from 'react-redux';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateLabels,
  updateRange,
  updateVideo,
  Video,
} from '../../store/videoSlice';
import { Label } from '@/app/videoeditor1/DraggableLabel';

const VideoEditor: React.FC = () => {
  const videos = useSelector((state: RootState) => state.videos);
  const dispatch = useDispatch();
  const defaultVideo = {
    video: { file: null, url: null, duration: 0 },
    id: Date.now().toString(),
    labels: [],
    range: {
      startTime: 0,
      endTime: 10,
    },
  };
  const videoData: Video | typeof defaultVideo = videos.length
    ? videos[0]
    : defaultVideo;

  const { url, file, duration } = videoData.video;
  const { startTime, endTime } = videoData.range;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  // const [videoFile, setVideoFile] = useState<File | null>(null);
  // const [startTime, setStartTime] = useState(0);
  // const [endTime, setEndTime] = useState(10);
  // const [videoDuration, setVideoDuration] = useState(0);
  // const [droppedLabels, setDroppedLabels] = useState<
  //   { id: string; x: number; y: number; text: string }[]
  // >([]);
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
      video.pause();
      video.onplay = () => renderFrame(ctx, video, videoData.labels);
      video.play();
      video.loop = true;
    }

    function renderFrame(
      ctx: CanvasRenderingContext2D,
      video: HTMLVideoElement,
      labels: Label[]
    ) {
      if (!video.paused && !video.ended) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw labels on top of the video
        labels.forEach((label) => {
          ctx.fillStyle = 'red';
          ctx.font = '30px Arial';
          ctx.fillText(label.text, label.x, label.y);
        });

        requestAnimationFrame(() => renderFrame(ctx, video, labels));
      }
    }
  }, [videoData?.labels]);

  const handleVideoUpload = (videoObj: any) => {
    if (videoObj) {
      const { file, duration, videoUrl, title } = videoObj;
      dispatch(
        updateVideo({
          ...videoData,
          img: null,
          title,
          video: { ...videoData.video, file, duration, url: videoUrl },
          range: {
            startTime: startTime,
            endTime: Math.min(10, duration),
          },
          id: videoData.id,
        })
      );
      // setVideoFile(file);
      // setLocalVideoUrl(videoUrl);
      // setVideoDuration(duration);
      // setEndTime(Math.min(10, duration));
    }
  };

  const trimVideoInMemory = async (): Promise<Blob | null> => {
    try {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();

      const videoContent = new Uint8Array(
        await videoData.video.file!.arrayBuffer()
      );

      await ffmpeg.writeFile('input.mp4', videoContent);

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

  const handleLabelDrag = (labelObj: Label) => {
    const { id, x, y } = labelObj;
    setDraggingLabel(id);
    const label = videoData.labels.find((label) => label.id === id);
    if (label) {
      setDragOffset({ x: x - label.x, y: y - label.y });
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
            videoData.labels.forEach((label) => {
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
      <Provider store={store}>
        <DndProvider backend={HTML5Backend}>
          <div style={{ display: 'flex', flexFlow: 'column' }}>
            <SideMenu onLabelDrag={handleLabelDrag} />
          </div>
          {/* Main container with canvas */}
          <div style={{ flex: 1 }}>
            <VideoUpload
              onChange={handleVideoUpload}
              isExporting={isExporting}
              isProcessing={isProcessing}
            />
            {url && (
              <>
                <VideoPlayer videoRef={videoRef} source={url} />
                <Canvas
                  canvasRef={canvasRef}
                  droppedLabels={videoData.labels}
                  draggingLabel={draggingLabel || ''}
                  dragOffset={dragOffset}
                  onChange={(labels: Label[]) => {
                    dispatch(updateLabels({ videoId: videoData.id, labels }));
                  }}
                  onHandleMouseUp={handleMouseUp}
                  height={canvasHeight}
                  width={canvasWidth}
                  // dragOffset={dragOffset}
                  // draggingLabel={draggingLabel || ''}
                  videoRef={videoRef}
                  videoUrl={url}
                />
                <Slider
                  isExporting={isExporting}
                  isProcessing={isProcessing}
                  startTime={startTime}
                  endTime={endTime}
                  onChange={(range: Range) => {
                    const { startTime, endTime } = range;
                    dispatch(updateRange({ videoId: videoData.id, range }));
                  }}
                  videoDuration={duration}
                />
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
        </DndProvider>
      </Provider>
    </div>
  );
};

export default VideoEditor;
