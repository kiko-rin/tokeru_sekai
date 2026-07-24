import type { ColorGradeParams, LUTData } from '@shared/types'

const DEFAULT_PARAMS: ColorGradeParams = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 6500,
  tint: 0,
  saturation: 1,
  vibrance: 0,
  lift: { r: 0, g: 0, b: 0 },
  gamma: { r: 1, g: 1, b: 1 },
  gain: { r: 1, g: 1, b: 1 },
  lutEnabled: false,
  lutOpacity: 1
}

export class ColorGrade {
  private gl: WebGL2RenderingContext
  private program: WebGLProgram | null = null
  private vao: WebGLVertexArrayObject | null = null
  private params: ColorGradeParams = { ...DEFAULT_PARAMS }

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', {
      premultipliedAlpha: false,
      preserveDrawingBuffer: true
    })
    if (!gl) throw new Error('WebGL2 not supported')
    this.gl = gl
    this.init()
  }

  private init(): void {
    const gl = this.gl

    const vsSource = `#version 300 es
      in vec2 aPosition;
      in vec2 aTexCoord;
      out vec2 vTexCoord;
      void main() {
        vTexCoord = aTexCoord;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `

    const fsSource = `#version 300 es
      precision highp float;
      in vec2 vTexCoord;
      out vec4 fragColor;
      uniform sampler2D uTexture;
      uniform float uExposure;
      uniform float uContrast;
      uniform float uHighlights;
      uniform float uShadows;
      uniform float uWhites;
      uniform float uBlacks;
      uniform float uTemperature;
      uniform float uTint;
      uniform float uSaturation;
      uniform float uVibrance;
      uniform vec3 uLift;
      uniform vec3 uGamma;
      uniform vec3 uGain;

      vec3 adjustColorWheel(vec3 color, vec3 lift, vec3 gamma, vec3 gain) {
        color = color * gain + lift * (1.0 - color);
        color = pow(max(color, vec3(0.0)), vec3(1.0 / max(gamma, 0.001)));
        return clamp(color, 0.0, 1.0);
      }

      vec3 adjustTone(vec3 color) {
        float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));

        float shadowWeight = smoothstep(0.0, 0.5, luma);
        float highlightWeight = smoothstep(0.5, 1.0, luma);

        color += uShadows * (1.0 - shadowWeight) * 0.2;
        color += uHighlights * highlightWeight * 0.2;
        color += uWhites * step(0.8, luma) * 0.1;
        color -= uBlacks * step(luma, 0.2) * 0.1;

        return clamp(color, 0.0, 1.0);
      }

      vec3 adjustTemperatureTint(vec3 color) {
        float tempShift = (uTemperature - 6500.0) / 6500.0;
        color.r += tempShift * 0.1;
        color.b -= tempShift * 0.1;
        color.g += uTint * 0.01;
        return clamp(color, 0.0, 1.0);
      }

      float getLuminance(vec3 c) {
        return dot(c, vec3(0.2126, 0.7152, 0.0722));
      }

      void main() {
        vec3 color = texture(uTexture, vTexCoord).rgb;

        color = pow(color, vec3(2.2));
        color *= pow(2.0, uExposure);

        float factor = 1.0 + uContrast;
        color = (color - 0.5) * factor + 0.5;

        color = adjustTone(color);
        color = adjustTemperatureTint(color);

        float luma = getLuminance(color);
        float satFactor = uSaturation + uVibrance * (1.0 - luma);
        color = mix(vec3(luma), color, satFactor);

        color = adjustColorWheel(color, uLift, uGamma, uGain);

        color = pow(clamp(color, 0.0, 1.0), vec3(1.0 / 2.2));

        fragColor = vec4(color, 1.0);
      }
    `

    const vs = this.compileShader(gl.VERTEX_SHADER, vsSource)
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource)

    this.program = gl.createProgram()!
    gl.attachShader(this.program, vs)
    gl.attachShader(this.program, fs)
    gl.linkProgram(this.program)

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw new Error('Shader link failed')
    }

    const vertices = new Float32Array([
      -1, -1, 0, 1,
       1, -1, 1, 1,
      -1,  1, 0, 0,
       1,  1, 1, 0
    ])

    const vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    this.vao = gl.createVertexArray()
    gl.bindVertexArray(this.vao)

    const posLoc = gl.getAttribLocation(this.program, 'aPosition')
    const texLoc = gl.getAttribLocation(this.program, 'aTexCoord')

    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0)
    gl.enableVertexAttribArray(texLoc)
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 16, 8)

    gl.bindVertexArray(null)
  }

  private compileShader(type: number, source: string): WebGLShader {
    const gl = this.gl
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader)
      gl.deleteShader(shader)
      throw new Error(`Shader compile error: ${info}`)
    }

    return shader
  }

  setParams(params: Partial<ColorGradeParams>): void {
    this.params = { ...this.params, ...params }
  }

  getParams(): ColorGradeParams {
    return { ...this.params }
  }

  renderTexture(texture: WebGLTexture): void {
    const gl = this.gl

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.useProgram(this.program!)
    gl.bindVertexArray(this.vao)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.uniform1i(gl.getUniformLocation(this.program!, 'uTexture'), 0)

    const p = this.params
    gl.uniform1f(gl.getUniformLocation(this.program!, 'uExposure'), p.exposure)
    gl.uniform1f(gl.getUniformLocation(this.program!, 'uContrast'), p.contrast)
    gl.uniform1f(gl.getUniformLocation(this.program!, 'uHighlights'), p.highlights)
    gl.uniform1f(gl.getUniformLocation(this.program!, 'uShadows'), p.shadows)
    gl.uniform1f(gl.getUniformLocation(this.program!, 'uWhites'), p.whites)
    gl.uniform1f(gl.getUniformLocation(this.program!, 'uBlacks'), p.blacks)
    gl.uniform1f(gl.getUniformLocation(this.program!, 'uTemperature'), p.temperature)
    gl.uniform1f(gl.getUniformLocation(this.program!, 'uTint'), p.tint)
    gl.uniform1f(gl.getUniformLocation(this.program!, 'uSaturation'), p.saturation)
    gl.uniform1f(gl.getUniformLocation(this.program!, 'uVibrance'), p.vibrance)
    gl.uniform3f(gl.getUniformLocation(this.program!, 'uLift'), p.lift.r, p.lift.g, p.lift.b)
    gl.uniform3f(gl.getUniformLocation(this.program!, 'uGamma'), p.gamma.r, p.gamma.g, p.gamma.b)
    gl.uniform3f(gl.getUniformLocation(this.program!, 'uGain'), p.gain.r, p.gain.g, p.gain.b)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.bindVertexArray(null)
  }

  createTexture(source: TexImageSource): WebGLTexture {
    const gl = this.gl
    const texture = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    return texture
  }

  destroy(): void {
    const gl = this.gl
    if (this.program) gl.deleteProgram(this.program)
    if (this.vao) gl.deleteVertexArray(this.vao)
  }
}
