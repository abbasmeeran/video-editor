import React from 'react';

type Props = {
  videoRef: any;
  source: any;
};

function VideoPlayer({ source, videoRef }: Props) {
  return (
    <div>
      {source && (
        <>
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
            src={`${source}`}
            controls
            autoPlay
            muted
          />
        </>
      )}
    </div>
  );
}

export default VideoPlayer;
