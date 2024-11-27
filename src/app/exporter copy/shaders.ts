export const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0, 1);
    // Flip the Y coordinate for proper orientation
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
  }
`;

export const fragmentShaderSource = `
  precision mediump float;
  uniform sampler2D u_image;
  varying vec2 v_texCoord;

  void main() {
    // Sample the texture and pass the color directly
    gl_FragColor = texture2D(u_image, v_texCoord);
  }
`;
