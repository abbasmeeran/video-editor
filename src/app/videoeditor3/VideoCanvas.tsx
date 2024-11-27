// VideoCanvas.tsx
import React, { useRef, useEffect } from 'react';

interface VideoCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  droppedLabels: { id: string; x: number; y: number; text: string }[];
  handleDrop: (e: React.DragEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
}

const VideoCanvas: React.FC<VideoCanvasProps> = ({
  videoRef,
  canvasRef,
  droppedLabels,
  handleDrop,
  handleMouseMove,
  handleMouseUp,
}) => {
  const canvasWidth = 640;
  const canvasHeight = 360;

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const video = videoRef.current;
    if (video) {
      video.play();
      video.loop = true;
      video.onplay = () => renderFrame(ctx, video);
    }

    function renderFrame(
      ctx: CanvasRenderingContext2D,
      video: HTMLVideoElement
    ) {
      if (!video.paused && !video.ended) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw labels
        droppedLabels.forEach((label) => {
          ctx.fillStyle = 'red';
          ctx.font = '30px Arial';
          ctx.fillText(label.text, label.x, label.y);
        });

        requestAnimationFrame(() => renderFrame(ctx, video));
      }
    }
  }, [droppedLabels]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ border: '1px solid black', cursor: 'pointer' }}
    />
  );
};

export default VideoCanvas;
