'use client';

import React, { useRef, useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import Slider, { Range } from './Slider';
import { Canvas } from './Canvas';
import VideoUpload from './VideoUpload';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import SideMenu from './SideMenu';
import { RootState, store } from '../../store';
import { Provider } from 'react-redux';
import { useSelector, useDispatch } from 'react-redux';
import {
  Label,
  removeVideo,
  updateLabels,
  updateRange,
  updateVideo,
  Video,
} from '../../store/videoSlice';
import { postData } from '@/lib/videoApi';
import { indexDB } from '@/lib/indexdb';
import { videoToImage } from '@/lib/utils';
import Link from 'next/link';
type Props = {
  videoId: any;
};
const VideoEditor: React.FC<Props> = ({ videoId }: Props) => {
  const videos = useSelector((state: RootState) => state.videos);
  const dispatch = useDispatch();

  const defaultVideo = {
    video: { file: null, url: null, duration: 0 },
    id: Date.now().toString(),
    labels: [],
    title: '',
    img: null,
    range: {
      startTime: 0,
      endTime: 10,
    },
  };
  let videoData: Video | typeof defaultVideo =
    videos.length && videos[0] != null ? videos[0] : defaultVideo;

  let { url, duration } = videoData.video;
  let { startTime, endTime } = videoData.range;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editUrl, setEditUrl] = useState<string | null>(null);
  const canvasWidth = 600;
  const canvasHeight = 360;

  useEffect(() => {
    if (videoId) {
      (async () => {
        const response = await indexDB.get(videoId);
        dispatch(updateVideo({ ...response.videoData }));
        setEditUrl(URL.createObjectURL(response.file));
        // setFile(response.file);
        // if (videoRef.current && file) {
        //   videoRef.current.src = URL.createObjectURL(file);
        // }
      })();

      return () => {
        dispatch(removeVideo(null));
      };
    }
  }, [videoId]);

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    if (videoRef.current) {
      const video: any = videoRef.current;
      if (video) {
        try {
          video.autoPlay = true;
          video.pause();
          video.onplay = () => renderFrame(ctx, video, []);
          video.play();
          video.loop = true;
        } catch (err) {
          console.log(err);
        }
      }
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
  }, [
    videoData.video,
    videoData?.labels,
    videoData?.range,
    ,
    editUrl,
    videoId,
  ]);

  const handleVideoUpload = (videoObj: any) => {
    if (videoObj) {
      const { file, duration, videoUrl, title } = videoObj;
      let video = {};
      if (file) {
        video = { duration, url: videoUrl, file };
      }
      dispatch(
        updateVideo({
          ...videoData,
          title,
          video: { ...videoData.video, ...video },
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

  const processFrames = async (videoUrl: string): Promise<Blob[]> => {
    const video = videoRef.current;
    const canvas = exportCanvasRef.current;
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

    // const width = (canvas.width = video.videoWidth);
    // const height = (canvas.height = video.videoHeight);

    const width = canvas.width;
    const height = canvas.height;

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

  const saveVideo = async () => {
    try {
      setIsSaving(true);
      const trimmedBlob = await trimVideoInMemory();
      const img = await videoToImage(videoData.video.file);
      await indexDB.update(videoData, trimmedBlob, img);
    } catch (err) {
      console.log(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
      {' '}
      <Provider store={store}>
        <DndProvider backend={HTML5Backend}>
          <div style={{ flex: 1 }}>
            <form>
              <div className='space-y-12'>
                <div className='border-b border-gray-900/10 px-12'>
                  <div className='mt-6 flex items-center  gap-x-6'>
                    <div className='mt-6  items-center w-[50%] gap-x-6 '>
                      <h2 className=' font-semibold text-gray-900'>Video</h2>
                      <p className='mt-1 text-sm/6 text-gray-600'>
                        Load and edit your video
                      </p>
                    </div>
                  </div>

                  <div className=' grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'>
                    <div className='mt-6 flex items-center  justify-end gap-x-6 col-span-4'>
                      <Link href='/videos'>
                        <button
                          type='button'
                          className='rounded-md bg-indigo-600 px-3 py-2 w-30 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                          onClick={() => {
                            dispatch(removeVideo(null));
                          }}
                        >
                          Cancel
                        </button>
                      </Link>
                      <button
                        type='button'
                        className='rounded-md bg-indigo-600 px-3 py-2 w-30 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                        onClick={saveVideo}
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type='button'
                        className='rounded-md bg-indigo-600 px-3 py-2  text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                        onClick={exportVideo}
                        disabled={isExporting}
                      >
                        {isExporting ? 'Exporting...' : 'Export Video'}
                      </button>
                      {exportUrl && (
                        <button
                          type='button'
                          className='rounded-md bg-indigo-600 px-3 py-2  text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                        >
                          <a href={exportUrl} download='final_video.mp4'>
                            Download Exported Video
                          </a>
                        </button>
                      )}
                    </div>
                    <VideoUpload
                      onChange={handleVideoUpload}
                      isExporting={isExporting}
                      isProcessing={isProcessing}
                      videoTitle={videoData.title}
                    />
                    <div className='col-span-4'>
                      {url && (
                        <div className='w-full flex flex-col '>
                          <div className='w-full flex '>
                            <div
                              style={{ display: 'flex', flexFlow: 'column' }}
                            >
                              <SideMenu />
                            </div>
                            <div>
                              <Canvas
                                canvasRef={canvasRef}
                                labels={videoData.labels}
                                onChange={(labels: Label[]) => {
                                  dispatch(
                                    updateLabels({
                                      videoId: videoData.id,
                                      labels,
                                    })
                                  );
                                }}
                                height={canvasHeight}
                                width={canvasWidth}
                                videoRef={videoRef}
                                videoUrl={editUrl || url}
                                duration={duration}
                              />
                              <div>
                                <Slider
                                  isExporting={isExporting}
                                  isProcessing={isProcessing}
                                  startTime={startTime}
                                  endTime={endTime}
                                  onChange={(range: Range) => {
                                    const { startTime, endTime } = range;
                                    dispatch(
                                      updateRange({
                                        videoId: videoData.id,
                                        range,
                                      })
                                    );
                                  }}
                                  videoDuration={duration}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <canvas
            width={canvasWidth}
            height={canvasHeight}
            ref={exportCanvasRef}
            style={{ display: 'none' }}
          ></canvas>
        </DndProvider>
      </Provider>
    </div>
  );
};

export default VideoEditor;
