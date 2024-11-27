import { useEffect, useRef, useState } from 'react';
import { IconContext } from 'react-icons';
import { BiPlay, BiSkipNext, BiSkipPrevious, BiPause } from 'react-icons/bi';

type Props = {
  videoRef: any;
  source: any;
  duration: any;
};

function NewVideoPlayer({ videoRef, source, duration: actualDuration }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState([0, 0]);
  const [currentTimeSec, setCurrentTimeSec] = useState();
  const [duration, setDuration] = useState([0, actualDuration]);
  const [durationSec, setDurationSec] = useState();

  const sec2Min = (sec: any) => {
    const min = Math.floor(sec / 60);
    const secRemain = Math.floor(sec % 60);
    return {
      min: min,
      sec: secRemain,
    };
  };

  useEffect(() => {
    const { min, sec } = sec2Min(actualDuration);
    setDurationSec(actualDuration);
    setDuration([min, sec]);

    console.log(videoRef.current.duration);
    const interval = setInterval(() => {
      const { min, sec } = sec2Min(videoRef.current.currentTime);
      setCurrentTimeSec(videoRef.current.currentTime);
      setCurrentTime([min, sec]);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlay = () => {
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };
  return (
    <div className='container'>
      <video
        ref={videoRef}
        crossOrigin='anonymous'
        style={{
          display: 'none',
          border: '1px solid red',
          height: '100px',
          maxWidth: '100%',
          backgroundColor: 'black',
        }}
        src={source}
        controls
      />{' '}
      <div className='playerContainer'>
        <div className='controlsContainer'>
          <div className='controls'>
            <button></button>
            {isPlaying ? (
              <button className='controlButton' onClick={handlePlay}>
                Pause
              </button>
            ) : (
              <button className='controlButton' onClick={handlePlay}>
                Play
              </button>
            )}
            <IconContext.Provider value={{ color: 'white', size: '2em' }}>
              <BiSkipNext />
            </IconContext.Provider>
            <div className='duration'>
              {currentTime[0]}:{currentTime[1]} / {duration[0]}:{duration[1]}
            </div>
          </div>
          <input
            type='range'
            min='0'
            max={durationSec}
            value={currentTimeSec}
            className='timeline'
            onChange={(e) => {
              videoRef.current.currentTime = e.target.value;
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default NewVideoPlayer;
