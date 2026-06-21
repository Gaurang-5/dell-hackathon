import { useEffect, useRef } from 'react'

const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const fragmentShaderSource = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;

  // Simple hash for noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    // Grid spacing
    vec2 grid = fract(st * 40.0);
    vec2 cell = floor(st * 40.0);
    
    // Parallax effect based on mouse
    vec2 mouseOffset = (u_mouse / u_resolution.xy - 0.5) * 0.05;
    cell += floor(mouseOffset * 40.0);

    // Randomize dot existence
    float rnd = hash(cell);
    
    // Dot matrix pattern
    float dotSize = 0.15;
    float dist = length(grid - vec2(0.5));
    
    // Smooth circle
    float circle = smoothstep(dotSize + 0.05, dotSize, dist);
    
    // Breathing pulse (slow)
    float pulse = (sin(u_time * 0.5 + rnd * 10.0) * 0.5 + 0.5);
    
    // Base color (soft violet/primary tone #EDE9FE translated to normalized rgb)
    vec3 dotColor = vec3(0.93, 0.91, 1.0); 
    
    // Fade dots based on their hash to make them sparse
    float alpha = circle * pulse * smoothstep(0.7, 1.0, rnd);
    
    // Depth fade towards edges
    float vignette = smoothstep(1.5, 0.2, length(st - vec2(0.5 * (u_resolution.x / u_resolution.y), 0.5)));
    
    gl_FragColor = vec4(dotColor, alpha * vignette * 0.3);
  }
`

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl')
    if (!gl) return

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    // Setup full-screen quad
    const vertices = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const positionLoc = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    const resolutionLoc = gl.getUniformLocation(program, 'u_resolution')
    const timeLoc = gl.getUniformLocation(program, 'u_time')
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse')

    let mouseX = 0
    let mouseY = 0
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = canvas.height - e.clientY // flip Y
    }
    window.addEventListener('mousemove', handleMouseMove)

    const resize = () => {
      // DPR clamp as specified
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    window.addEventListener('resize', resize)
    resize()

    let startTime = performance.now()
    let animationFrameId: number

    const render = (time: number) => {
      gl.clearColor(0.06, 0.06, 0.06, 1.0) // #101010 background
      gl.clear(gl.COLOR_BUFFER_BIT)
      
      // Enable alpha blending
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      gl.uniform2f(resolutionLoc, canvas.width, canvas.height)
      gl.uniform1f(timeLoc, (time - startTime) * 0.001)
      gl.uniform2f(mouseLoc, mouseX * Math.min(window.devicePixelRatio || 1, 2), mouseY * Math.min(window.devicePixelRatio || 1, 2))

      gl.drawArrays(gl.TRIANGLES, 0, 6)
      animationFrameId = requestAnimationFrame(render)
    }
    render(startTime)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
      gl.deleteProgram(program)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="top-webgl"
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-0 h-screen w-full"
    />
  )
}
