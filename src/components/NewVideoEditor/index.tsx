import React, { Suspense, useEffect, useState, useTransition } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { Slider, Spin } from 'antd';
import { sliderValueToVideoTime } from '../../lib/utils';
import VideoUpload from '../VideoUpload';
import { VideoPlayer } from '@/components/VideoPlayer';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DropppableContainer } from '@/components/DroppableContainer';
import { DraggableItems } from '@/components/DraggableItems';
import WebGLRenderer from '@/components/WebGLRenderer';

const ffmpeg = new FFmpeg();
type Props = {};

export default function NewVideoEditor({}: Props) {
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false);
  const [videoFile, setVideoFile] = useState<any>();
  const [videoPlayerState, setVideoPlayerState] = useState<any>();
  const [videoPlayer, setVideoPlayer] = useState<any>();
  const [gifUrl, setGifUrl] = useState<string>();
  const [sliderValues, setSliderValues] = useState<number[]>([0, 100]);
  const [processing, setProcessing] = useState(false);

  const [layserSlides, setLayerSlides] = useState([]);

  useEffect(() => {
    // loading ffmpeg on startup
    ffmpeg.load().then(() => {
      setFFmpegLoaded(true);
    });
  }, []);

  useEffect(() => {
    const min = sliderValues[0];
    // when the slider values are updated, updating the
    // video time
    if (min !== undefined && videoPlayerState && videoPlayer) {
      videoPlayer.seek(sliderValueToVideoTime(videoPlayerState.duration, min));
    }
  }, [sliderValues]);

  useEffect(() => {
    if (videoPlayer && videoPlayerState) {
      // allowing users to watch only the portion of
      // the video selected by the slider
      const [min, max] = sliderValues;

      const minTime = sliderValueToVideoTime(videoPlayerState.duration, min);
      const maxTime = sliderValueToVideoTime(videoPlayerState.duration, max);

      if (videoPlayerState.currentTime < minTime) {
        videoPlayer.seek(minTime);
      }
      if (videoPlayerState.currentTime > maxTime) {
        // looping logic
        videoPlayer.seek(minTime);
      }
    }
  }, [videoPlayerState]);

  useEffect(() => {
    // when the current videoFile is removed,
    // restoring the default state
    if (!videoFile) {
      setVideoPlayerState(undefined);
      setSliderValues([0, 100]);
      setVideoPlayerState(undefined);
      setGifUrl(undefined);
    }
  }, [videoFile]);
  return (
    <Suspense
      fallback={
        !ffmpegLoaded ? 'Waiting for FFmpeg to load...' : 'Processing...'
      }
    >
      <DndProvider backend={HTML5Backend}>
        {!ffmpegLoaded ? null : (
          <div className='flex flex-col md:flex-row border-2 border-red-400 '>
            <div className='border-2 border-blue-400 basis-1/4'>
              <DraggableItems />
            </div>
            <div className='border-2 border-blue-400 flex-1'>
              Video panel
              <div className='flex  flex-col border-2 border-red-400 '>
                <div className='border-2 border-green-400'>
                  <h1>Upload a video</h1>
                  <VideoUpload
                    disabled={!!videoFile}
                    onChange={(videoFile: any) => {
                      setVideoFile(videoFile);
                    }}
                    onRemove={() => {
                      setVideoFile(undefined);
                    }}
                    videoRef={null}
                  />
                </div>
                <div className='border-2 border-cyan-400'>
                  <DropppableContainer>
                    <>
                      {videoFile && (
                        <VideoPlayer
                          src={URL.createObjectURL(videoFile)}
                          onPlayerChange={(videoPlayer: any) => {
                            setVideoPlayer(videoPlayer);
                          }}
                          onChange={(videoPlayerState: any) => {
                            setVideoPlayerState(videoPlayerState);
                          }}
                        />
                      )}
                      {/* {videoPlayer?.manager?.rootElement && (
                        <WebGLRenderer
                          video={videoPlayer.manager.rootElement.children[0]}
                          // labels={[{ text: 'abbas', time: 10, x: 10, y: 10 }]}
                        />
                      )} */}
                    </>
                  </DropppableContainer>
                </div>
                <div className='border-2 border-gray-400'>
                  <h3>Cut Video</h3>
                  <Slider
                    disabled={!videoPlayerState}
                    value={sliderValues}
                    range={true}
                    onChange={(values) => {
                      setSliderValues(values);
                    }}
                    tooltip={{
                      formatter: null,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </DndProvider>
    </Suspense>
  );
}
