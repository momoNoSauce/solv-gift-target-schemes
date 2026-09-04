// A living stage for the festive schemes, web only. A single fragment shader
// paints the night behind the pedestal and moves it slowly: the scene the SVG
// StageScene draws (ground falloff, key glow, ambient glow, vignette) plus what
// paint cannot do, motion at the pace of a lit room:
//   diwali  a breathing key glow and a field of embers rising from the diya line,
//           each flickering at its own rate
//   onam    slow golden light rays from above, and petals drifting down through
//           them, the way pookalam flowers are laid
//   holi    three clouds of gulal (pink, marigold, sky) folding into one another
//           through warped noise
// Everything is deterministic in time; no randomness at run time. The canvas is
// laid under the stage content and over the SVG scene, which stays as the
// fallback on native and for capture.
//
// Motion policy: under SETTLED (capture, reduced motion) the shader paints one
// frame at t = 0 and stops. A page that is not on screen keeps painting: the
// swipe reveals it mid-motion, as a room does.
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SETTLED } from './motion';

const web = Platform.OS === 'web';
let createElement = null;
if (web) {
  try {
    createElement = require('react-native-web').unstable_createElement;
  } catch (e) {
    createElement = null;
  }
}

const VERT = `
attribute vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform int u_mode;
uniform vec3 u_g1;
uniform vec3 u_g2;
uniform vec3 u_glow;
uniform vec3 u_amb;
uniform vec3 u_speck;

float hash(float n){ return fract(sin(n)*43758.5453123); }
float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)))*43758.5453123); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash2(i), hash2(i+vec2(1.0,0.0)), u.x), mix(hash2(i+vec2(0.0,1.0)), hash2(i+vec2(1.0,1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 5; i++) { v += a*noise(p); p = p*2.02 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;            // y up: 1 at the top
  vec2 p = (gl_FragCoord.xy - 0.5*u_res) / u_res.y;
  float t = u_time;

  // the ground: top to bottom falloff, as the SVG scene paints it
  vec3 col = mix(u_g2, u_g1, uv.y);
  // ambient glow, top-left, drifting a little
  float amb = exp(-length(p - vec2(-0.45 + 0.03*sin(t*0.13), 0.55)) * 1.6);
  col += u_amb * 0.30 * amb;

  if (u_mode == 0) {
    // Diwali. The key glow breathes behind the pedestal.
    float breathe = 0.86 + 0.14*sin(t*0.8);
    float d = length(p - vec2(0.0, 0.10));
    col += u_glow * 0.30 * breathe * exp(-d*d*5.5);
    // a warm haze that slowly turns
    float h = fbm(p*1.8 + vec2(t*0.03, -t*0.02));
    col += u_glow * 0.06 * h;
    // embers rising from the diya line, each on its own clock
    for (int i = 0; i < 28; i++) {
      float fi = float(i);
      float sx = hash(fi*3.1);
      float sp = 0.018 + 0.03*hash(fi*7.7);
      float y = fract(hash(fi*1.3) + t*sp);
      float x = sx + 0.025*sin(t*0.5 + fi*1.9) * (0.4 + y);
      vec2 ep = vec2((x - 0.5) * u_res.x / u_res.y, y - 0.5);
      float dd = length(p - ep);
      float life = smoothstep(0.0, 0.08, y) * (1.0 - smoothstep(0.55, 1.0, y));
      float tw = 0.55 + 0.45*sin(t*(2.0 + 1.5*hash(fi*5.3)) + fi*2.1);
      float r = 0.0022 + 0.0018*hash(fi*9.1);
      col += u_speck * tw * life * smoothstep(r, r*0.3, dd);
      col += u_glow * 0.10 * tw * life * exp(-dd*dd*2600.0);
    }
  } else if (u_mode == 1) {
    // Onam. Light rays fall from above; petals drift down through them.
    float ang = atan(p.x, 0.9 - p.y);
    float rays = 0.5 + 0.5*sin(ang*14.0 + t*0.25) * sin(ang*5.0 - t*0.17);
    rays *= smoothstep(-0.2, 0.9, uv.y) * 0.5;
    col += u_glow * 0.10 * rays;
    float d = length(p - vec2(0.0, 0.10));
    col += u_glow * 0.22 * (0.9 + 0.1*sin(t*0.6)) * exp(-d*d*5.0);
    for (int i = 0; i < 16; i++) {
      float fi = float(i);
      float sp = 0.012 + 0.02*hash(fi*2.7);
      float y = 1.0 - fract(hash(fi*1.1) + t*sp);
      float x = hash(fi*4.3) + 0.05*sin(t*0.4 + fi);
      vec2 pp = vec2((x - 0.5) * u_res.x / u_res.y, y - 0.5);
      float dd = length(p - pp);
      float r = 0.006 + 0.005*hash(fi*8.9);
      float fade = smoothstep(1.0, 0.85, y) * smoothstep(0.0, 0.15, y);
      col += u_speck * 0.55 * fade * smoothstep(r, r*0.5, dd);
    }
  } else {
    // Holi. Three clouds of colour fold through warped noise.
    vec2 q = p*1.3;
    vec2 w = vec2(fbm(q + vec2(t*0.04, 0.0)), fbm(q + vec2(5.2, t*0.035)));
    vec2 r = q + 1.6*(w - 0.5);
    float c1 = smoothstep(0.35, 0.8, fbm(r + vec2(0.0, 1.0)));
    float c2 = smoothstep(0.35, 0.8, fbm(r*1.1 + vec2(3.0, -2.0)));
    float c3 = smoothstep(0.35, 0.8, fbm(r*0.9 + vec2(-4.0, 3.5)));
    col += vec3(1.0, 0.31, 0.64) * 0.25 * c1;
    col += vec3(1.0, 0.79, 0.24) * 0.18 * c2;
    col += vec3(0.22, 0.78, 0.96) * 0.20 * c3;
    float d = length(p - vec2(0.0, 0.10));
    col += u_glow * 0.16 * exp(-d*d*5.0);
  }

  // the vignette
  float v = smoothstep(0.55, 1.15, length(p * vec2(0.85, 1.0)));
  col *= 1.0 - 0.34*v;
  gl_FragColor = vec4(col, 1.0);
}
`;

const MODE = { diwali: 0, onam: 1, holi: 2 };
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);

export default function ShaderStage({ theme, stage, focusY = 0.44, near = true }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [lost, setLost] = useState(false);
  const canvasRef = useRef(null);
  const glRef = useRef(null);     // { gl, uTime, uRes }
  const nearRef = useRef(near);
  nearRef.current = near;
  const mode = MODE[theme];
  if (!web || !createElement || mode == null) return null;

  // One WebGL context per canvas, made once. A canvas whose frame changes (the
  // card growing into the detail) only resizes its buffer; it never makes a
  // new context, because a browser keeps a small number of live contexts and
  // a context made every frame soon comes back lost, and a lost context paints
  // white over the scene. If the context cannot be made, or is lost later, the
  // canvas unmounts and the SVG scene under it stands in.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || lost) return;
    const onLost = (e) => {
      e.preventDefault();
      setLost(true);
    };
    canvas.addEventListener('webglcontextlost', onLost);
    // Safari returns a lost context when it is short of them, and then throws a
    // TypeError on the first call with the null shader that createShader gives
    // back (Chrome stays silent). A throw inside an effect unmounts the whole
    // tree: a blank page. So every step of the setup is guarded, and any failure
    // leaves the SVG scene in place.
    let gl = null;
    let uTime = null;
    let uRes = null;
    try {
      gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
      if (!gl || gl.isContextLost()) throw new Error('no webgl context');
      const compile = (type, src) => {
        const sh = gl.createShader(type);
        if (!sh) throw new Error('createShader failed');
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader compile failed');
        return sh;
      };
      const prog = gl.createProgram();
      if (!prog) throw new Error('createProgram failed');
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'program link failed');
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'a');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const u = (n) => gl.getUniformLocation(prog, n);
      gl.uniform1i(u('u_mode'), mode);
      gl.uniform3fv(u('u_g1'), hex(stage.ground));
      gl.uniform3fv(u('u_g2'), hex(stage.ground2));
      gl.uniform3fv(u('u_glow'), hex(stage.glowKey));
      gl.uniform3fv(u('u_amb'), hex(stage.glowAmbient));
      gl.uniform3fv(u('u_speck'), hex(stage.speck));
      uTime = u('u_time');
      uRes = u('u_res');
    } catch (e) {
      setLost(true);
      return () => canvas.removeEventListener('webglcontextlost', onLost);
    }
    glRef.current = { gl, uTime, uRes };

    let raf = 0;
    const t0 = performance.now();
    // 12 s in, so the field is already alive on the first frame
    const draw = (t) => {
      if (!glRef.current) return;
      try {
        gl.uniform1f(glRef.current.uTime, t);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      } catch (e) {
        setLost(true);
      }
    };
    const loop = () => {
      // Far from the screen the page holds its last frame; drawing resumes when
      // it comes near, mid-motion, as a room does.
      if (nearRef.current) draw(12.0 + (performance.now() - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    if (SETTLED) draw(12.0);
    else loop();
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('webglcontextlost', onLost);
      glRef.current = null;
      try {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      } catch (e) {}
    };
  }, [size.w > 0, mode, stage, lost]);

  // The frame: the buffer follows the layout, the context stays.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0) return;
    const dpr = Math.min(1.5, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    const w = Math.round(size.w * dpr);
    const h = Math.round(size.h * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const g = glRef.current;
    if (!g) return;
    try {
      g.gl.viewport(0, 0, w, h);
      g.gl.uniform2f(g.uRes, w, h);
      // Repaint at once, so a settled frame never shows a stretched buffer.
      if (SETTLED || !nearRef.current) {
        g.gl.uniform1f(g.uTime, 12.0);
        g.gl.drawArrays(g.gl.TRIANGLE_STRIP, 0, 4);
      }
    } catch (e) {
      setLost(true);
    }
  }, [size.w, size.h]);

  return (
    <View style={styles.host} pointerEvents="none" onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {size.w > 0 && !lost
        ? createElement('canvas', { ref: canvasRef, style: { width: size.w, height: size.h, display: 'block' } })
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  host: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
});
