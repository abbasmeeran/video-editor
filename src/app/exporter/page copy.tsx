'use client';

import React, { useRef, useState, useEffect } from 'react';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [droppedLabels, setDroppedLabels] = useState<
    { id: string; x: number; y: number; text: string }[]
  >([]);
  const [draggingLabel, setDraggingLabel] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const canvasWidth = 640;
  const canvasHeight = 360;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up WebGL context
    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set up video playback
    const video = videoRef.current;
    if (video) {
      video.play();
      video.loop = true;
      video.onplay = () => renderFrame(gl, video);
    }

    // Draw video frame and labels
    function renderFrame(gl: WebGLRenderingContext, video: HTMLVideoElement) {
      if (!video.paused && !video.ended) {
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Video texture setup
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          video
        );

        // Draw the video frame
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // Draw the labels
        drawLabels(gl);

        // Continue rendering
        requestAnimationFrame(() => renderFrame(gl, video));
      }
    }

    function drawLabels(gl: WebGLRenderingContext) {
      // Draw each label on top of the video
      droppedLabels.forEach((label) => {
        // Set the position and size of the label
        const x = label.x;
        const y = label.y;

        // Drawing the label (you'll need a method to actually draw the text in WebGL)
        drawText(gl, label.text, x, y);
      });
    }

    function drawText(
      gl: WebGLRenderingContext,
      text: string,
      x: number,
      y: number
    ) {
      // Placeholder: Implement WebGL text rendering or use another library
      // For simplicity, you can use a 2D canvas or a library like "webgl-utils" for text rendering
      console.log(`Drawing label "${text}" at position (${x}, ${y})`);
    }
  }, [droppedLabels]);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const videoUrl = URL.createObjectURL(file);
      setLocalVideoUrl(videoUrl);
    }
  };

  // Handle label drop
  const handleDrop = (e: React.DragEvent) => {
    const offsetX = e.clientX - canvasRef.current!.getBoundingClientRect().left;
    const offsetY = e.clientY - canvasRef.current!.getBoundingClientRect().top;

    // Clamp the dropped position to stay within canvas bounds
    const clampedX = Math.max(0, Math.min(offsetX, canvasWidth));
    const clampedY = Math.max(0, Math.min(offsetY, canvasHeight));

    const labelText = e.dataTransfer.getData('text/plain');

    setDroppedLabels((prevLabels) => [
      ...prevLabels,
      { id: Date.now().toString(), x: clampedX, y: clampedY, text: labelText },
    ]);
  };

  // Handle drag start for labels
  const handleLabelDrag = (e: React.MouseEvent, labelId: string) => {
    setDraggingLabel(labelId);
    const label = droppedLabels.find((label) => label.id === labelId);
    if (label) {
      setDragOffset({
        x: e.clientX - label.x,
        y: e.clientY - label.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingLabel && canvasRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Clamp the new position to stay within canvas bounds
      const clampedX = Math.max(0, Math.min(newX, canvasWidth));
      const clampedY = Math.max(0, Math.min(newY, canvasHeight));

      setDroppedLabels((prevLabels) =>
        prevLabels.map((label) =>
          label.id === draggingLabel
            ? { ...label, x: clampedX, y: clampedY }
            : label
        )
      );
    }
  };

  const handleMouseUp = () => {
    setDraggingLabel(null);
  };

  return (
    <div>
      <input type='file' accept='video/*' onChange={handleVideoUpload} />
      {localVideoUrl && (
        <>
          <video
            ref={videoRef}
            src={localVideoUrl}
            style={{ display: 'block' }}
          />
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{ border: '1px solid #ccc' }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            Your browser does not support HTML5 canvas.
          </canvas>

          <div
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData('text/plain', 'Sample Label')
            }
            style={{
              padding: '5px',
              border: '1px dashed #aaa',
              backgroundColor: '#f4f4f4',
              cursor: 'move',
              marginBottom: '10px',
            }}
          >
            Sample Label
          </div>

          {droppedLabels.map((label) => (
            <div
              key={label.id}
              style={{
                position: 'absolute',
                top: label.y,
                left: label.x,
                cursor: 'move',
              }}
              onMouseDown={(e) => handleLabelDrag(e, label.id)}
            >
              <input
                type='text'
                value={label.text}
                onChange={(e) => {
                  setDroppedLabels((prevLabels) =>
                    prevLabels.map((lbl) =>
                      lbl.id === label.id
                        ? { ...lbl, text: e.target.value }
                        : lbl
                    )
                  );
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  color: 'red',
                  fontSize: '18px',
                }}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default App;
