import {
  BigPlayButton,
  ControlBar,
  LoadingSpinner,
  Player,
  PlayerActions,
  PlayerReference,
  PlayerState,
  PlayToggle,
} from 'video-react';
import 'video-react/dist/video-react.css';
import { useEffect, useRef, useState } from 'react';

type VideoPlayerProps = {
  src: any;
  onPlayerChange: any;
  onChange: any;
  startTime?: number;
};

export function VideoPlayer({
  src,
  onPlayerChange = () => {},
  onChange = () => {},
  startTime = undefined,
}: VideoPlayerProps) {
  const [player, setPlayer] = useState<PlayerReference | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState | undefined>(
    undefined
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (playerState) {
      onChange(playerState);
    }
  }, [playerState]);

  useEffect(() => {
    onPlayerChange(player, videoRef);

    if (player) {
      player.subscribeToStateChange(setPlayerState);
    }
  }, [player, videoRef]);

  return (
    <div className={'video-player'}>
      <Player startTime={startTime}>
        <source src={src} />
        <video ref={videoRef} />
        <BigPlayButton position='center' />
        <LoadingSpinner />
        <ControlBar autoHide={false} disableDefaultControls={true}>
          <PlayToggle />
        </ControlBar>
      </Player>
    </div>
  );
}
