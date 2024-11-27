'use client';
import React, { useRef, useState, useEffect } from 'react';

const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform sampler2D u_texture;
  varying vec2 v_texCoord;
  uniform vec2 u_resolution;
  uniform float u_frameNumber;

  void main() {
    vec4 color = texture2D(u_texture, v_texCoord);

    // Add text overlay (simple color tint for demonstration)
    if (v_texCoord.x > 0.1 && v_texCoord.x < 0.3 && v_texCoord.y > 0.7) {
      color.rgb = vec3(1.0, 0.0, 0.0); // Red overlay block for text region
    }

    gl_FragColor = color;
  }
`;

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const createShader = (
    gl: WebGLRenderingContext,
    type: number,
    source: string
  ) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Error creating shader.');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw new Error('Shader compilation failed.');
    }
    return shader;
  };

  const createProgram = (
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ) => {
    const program = gl.createProgram();
    if (!program) throw new Error('Error creating program.');
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      throw new Error('Program linking failed.');
    }
    return program;
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setLocalVideoUrl(videoUrl);
    }
  };

  const processVideoFrames = async () => {
    setIsProcessing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      console.error('Video or canvas not initialized');
      setIsProcessing(false);
      return;
    }

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      setIsProcessing(false);
      return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    const program = createProgram(gl, vertexShader, fragmentShader);

    // Look up attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const frameNumberLocation = gl.getUniformLocation(program, 'u_frameNumber');

    // Create buffers for quad positions and texture coordinates
    const positionBuffer = gl.createBuffer();
    const texCoordBuffer = gl.createBuffer();

    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);

    const texCoords = new Float32Array([0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const renderFrame = (frameNumber: number) => {
      if (!video || !canvas) return;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(frameNumberLocation, frameNumber);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        video
      );

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    video.play();
    let frameNumber = 0;

    const process = () => {
      renderFrame(frameNumber++);
      if (!video.ended) {
        requestAnimationFrame(process);
      } else {
        setIsProcessing(false);
      }
    };

    process();
  };

  return (
    <div>
      <input
        type='file'
        accept='video/*'
        onChange={handleVideoUpload}
        disabled={isProcessing}
      />
      {localVideoUrl && (
        <>
          <video
            ref={videoRef}
            src={localVideoUrl}
            style={{ display: 'none' }}
            crossOrigin='anonymous'
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            style={{ display: 'block', border: '1px solid black' }}
          ></canvas>
          <button onClick={processVideoFrames} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Process Video'}
          </button>
        </>
      )}
    </div>
  );
};

export default App;
