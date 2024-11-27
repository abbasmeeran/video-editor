import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setVideoFile, setTrimRange, addLabel } from '../../store/rangeSlice';
import WebGLRenderer from '../WebGLRenderer';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { VideoPlayer } from '@/components/VideoPlayer';
import VideoUpload from '@/components/VideoUpload';

const VideoEditor: React.FC = () => {
  const dispatch = useDispatch();
  const { videoFile, startTime, endTime, labels } = useSelector(
    (state: RootState) => state.editor
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentLabel, setCurrentLabel] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [ffmpeg, setFfmpeg] = useState<any>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false);
  const [videoPlayerState, setVideoPlayerState] = useState<any>();
  const [videoPlayer, setVideoPlayer] = useState<any>();

  // Initialize FFmpeg.wasm
  useEffect(() => {
    const initFFmpeg = async () => {
      const ffmpeg = new FFmpeg();

      ffmpeg.load().then(() => {
        setFFmpegLoaded(true);
      });
      setFfmpeg(ffmpeg);
    };

    initFFmpeg();

    return () => {
      setFfmpeg(null);
    };
  }, []);

  const loadVideo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      dispatch(setVideoFile(file));
    }
  };

  const handleExport = async () => {
    if (!videoFile || !ffmpeg) return;

    setIsExporting(true);
    // Load FFmpeg
    await ffmpeg.load();

    // Convert video file to an array buffer and write to FFmpeg's virtual filesystem
    const videoBuffer = await fetchFile(videoFile);
    const videoData = await videoBuffer.buffer;
    ffmpeg.writeFile('input.mp4', new Uint8Array(videoData));

    // Run FFmpeg command to trim the video and export
    await ffmpeg.execute([
      '-i',
      'input.mp4',
      '-ss',
      startTime.toString(),
      '-to',
      endTime.toString(),
      '-c:v',
      'libx264',
      'output.mp4',
    ]);

    // Read the result and create a download link
    const data = ffmpeg.readFile('output.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);

    setExportUrl(url);
    setIsExporting(false);
  };

  const addNewLabel = () => {
    if (!videoRef.current || !currentLabel) return;

    dispatch(
      addLabel({
        time: videoRef.current.currentTime,
        text: currentLabel,
        x: 100,
        y: 100,
      })
    );
    setCurrentLabel('');
  };

  return (
    <div>
      <h1>Video Editor</h1>
      <input type='file' accept='video/*' onChange={loadVideo} />

      {ffmpegLoaded && videoFile && (
        <>
          <video
            ref={videoRef}
            src={URL.createObjectURL(videoFile)}
            width='100%'
            height='100%'
            crossOrigin='anonymous'
            controls
          />
          {videoRef && <WebGLRenderer videoRef={videoRef} />}

          <div>
            <label>
              Start Time:
              <input
                type='number'
                value={startTime}
                onChange={(e) =>
                  dispatch(
                    setTrimRange({ startTime: Number(e.target.value), endTime })
                  )
                }
              />
            </label>
            <label>
              End Time:
              <input
                type='number'
                value={endTime}
                onChange={(e) =>
                  dispatch(
                    setTrimRange({ startTime, endTime: Number(e.target.value) })
                  )
                }
              />
            </label>
          </div>

          <div>
            <input
              type='text'
              placeholder='Enter label text'
              value={currentLabel}
              onChange={(e) => setCurrentLabel(e.target.value)}
            />
            <button onClick={addNewLabel}>Add Label</button>
          </div>

          <button onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export Video'}
          </button>

          {exportUrl && (
            <a href={exportUrl} download='edited-video.mp4'>
              Download Video
            </a>
          )}
        </>
      )}
    </div>
  );
};

export default VideoEditor;
