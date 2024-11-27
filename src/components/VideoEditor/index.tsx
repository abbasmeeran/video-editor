import React, { Suspense, useEffect, useState, useTransition } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { Slider, Spin } from 'antd';
import { sliderValueToVideoTime } from '../../lib/utils';
import VideoUpload from '../VideoUpload';
import { VideoPlayer } from '@/components/VideoPlayer';
const ffmpeg = new FFmpeg();
type Props = {};

function VideoEditor({}: Props) {
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
    <div>
      <Suspense
        fallback={
          !ffmpegLoaded ? 'Waiting for FFmpeg to load...' : 'Processing...'
        }
      >
        {!ffmpegLoaded ? null : (
          <>
            <div>
              {videoFile ? (
                <VideoPlayer
                  src={URL.createObjectURL(videoFile)}
                  onPlayerChange={(videoPlayer: any) => {
                    setVideoPlayer(videoPlayer);
                  }}
                  onChange={(videoPlayerState: any) => {
                    setVideoPlayerState(videoPlayerState);
                  }}
                />
              ) : (
                <h1>Upload a video</h1>
              )}
            </div>
            <div className={'upload-div'}>
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
            <div className={'slider-div'}>
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
          </>
        )}
      </Suspense>
    </div>
  );
}

export default VideoEditor;
