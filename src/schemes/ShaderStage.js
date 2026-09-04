// A living stage for the festive schemes, web only. A single fragment shader
// paints the night behind the pedestal and moves it slowly: the scene the SVG
// StageScene draws (ground falloff, key glow, ambient glow, vignette) plus what
// paint cannot do, motion at the pace of a lit room:
//   diwali  a night over lit lamps: warm haze that breathes and turns, god rays
//           from the key light, embers rising with heat streaks, distant lamps
//           as bokeh, and small fireworks blooming high on their own clocks
//   onam    a pookalam: five rings of petals on the floor under the pedestal,
//           turning against one another, under dappled monsoon light; six
//           fireflies pulse, none fall
//   holi    three clouds of gulal folding through warped noise, and thrown
//           gulal blooming in bursts that thin out
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

#define PI 3.14159265

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

// ---------- Diwali: a night over lit lamps ----------
vec3 diwali(vec2 p, vec2 uv, float t, vec3 col){
  // warm haze, two layers turning at different speeds, heavier low
  float h1 = fbm(p*2.0 + vec2(t*0.035, -t*0.025));
  float h2 = fbm(p*3.6 - vec2(t*0.02, t*0.045));
  col += u_glow * (0.055*h1 + 0.035*h2) * (0.55 + 0.45*(1.0 - uv.y));
  // the key glow breathes
  vec2 kc = vec2(0.0, 0.10);
  float d = length(p - kc);
  float breathe = 0.86 + 0.14*sin(t*0.8);
  col += u_glow * 0.30 * breathe * exp(-d*d*5.5);
  // god rays, slow, fading with distance
  float ang = atan(p.x, p.y - kc.y + 0.35);
  float rays = 0.5 + 0.5*sin(ang*9.0 + t*0.12) * sin(ang*3.0 - t*0.08);
  rays = pow(rays, 2.0);
  col += u_glow * 0.07 * rays * exp(-d*1.8);
  // bokeh: distant lamps out of focus, drifting up
  for (int i = 0; i < 9; i++) {
    float fi = float(i);
    float y = fract(hash(fi*2.3) + t*(0.006 + 0.008*hash(fi*5.1)));
    float x = hash(fi*3.7) + 0.02*sin(t*0.3 + fi);
    vec2 bp = vec2((x - 0.5) * u_res.x / u_res.y, y - 0.5);
    float rr = 0.028 + 0.03*hash(fi*7.9);
    float dd = length(p - bp);
    float disc = smoothstep(rr, rr*0.55, dd);
    float ring = smoothstep(rr*1.05, rr*0.92, dd) * (1.0 - smoothstep(rr*0.92, rr*0.75, dd));
    float tw = 0.6 + 0.4*sin(t*0.9 + fi*2.3);
    col += u_glow * (0.045*disc + 0.03*ring) * tw;
  }
  // embers rising from the diya line, with heat streaks
  for (int i = 0; i < 26; i++) {
    float fi = float(i);
    float sp = 0.02 + 0.03*hash(fi*7.7);
    float y = fract(hash(fi*1.3) + t*sp);
    float x = hash(fi*3.1) + 0.03*sin(t*0.5 + fi*1.9) * (0.4 + y);
    vec2 ep = vec2((x - 0.5) * u_res.x / u_res.y, y - 0.5);
    vec2 dv = p - ep; dv.y *= 0.5;         // stretched: a streak of heat
    float dd = length(dv);
    float life = smoothstep(0.0, 0.08, y) * (1.0 - smoothstep(0.5, 1.0, y));
    float tw = 0.55 + 0.45*sin(t*(2.0 + 1.5*hash(fi*5.3)) + fi*2.1);
    float r = 0.0022 + 0.0018*hash(fi*9.1);
    col += u_speck * tw * life * smoothstep(r, r*0.3, dd);
    col += u_glow * 0.09 * tw * life * exp(-dd*dd*2200.0);
  }
  // fireworks, two on their own clocks, high and to the sides
  for (int b = 0; b < 2; b++) {
    float fb = float(b);
    float period = 7.5 + 2.5*fb;
    float cycle = floor(t/period + 0.41*fb);
    float phase = fract(t/period + 0.41*fb);
    vec2 c = vec2((fb == 0.0 ? -0.34 : 0.34) + 0.08*(hash(cycle*3.3 + fb) - 0.5), 0.52 + 0.1*hash(cycle*7.1 + fb));
    float grow = 1.0 - pow(1.0 - phase, 2.2);
    float fade = pow(1.0 - phase, 1.6);
    vec3 fc = mix(u_glow, vec3(1.0, 0.55, 0.35), hash(cycle*2.9 + fb));
    // the flash
    col += fc * 0.25 * exp(-length(p - c)*length(p - c)*220.0) * (1.0 - smoothstep(0.0, 0.12, phase));
    for (int k = 0; k < 18; k++) {
      float fk = float(k);
      float a = fk/18.0*2.0*PI + hash(fk + cycle) * 0.3;
      float len = 0.12 + 0.05*hash(fk*1.7 + cycle);
      vec2 sp = c + vec2(cos(a), sin(a)) * len * grow - vec2(0.0, 0.10*phase*phase);
      float dd = length(p - sp);
      float flick = 0.7 + 0.3*sin(t*9.0 + fk);
      col += fc * fade * flick * smoothstep(0.0055, 0.0, dd) * 0.9;
      col += fc * 0.06 * fade * exp(-dd*dd*1800.0);
    }
  }
  return col;
}

// ---------- Onam: a pookalam under monsoon light ----------
vec3 onam(vec2 p, vec2 uv, float t, vec3 col){
  // dappled light through palm fronds, drifting; soft and large
  float d1 = fbm(p*2.6 + vec2(t*0.04, t*0.025));
  float d2 = fbm(p*5.0 - vec2(t*0.025, t*0.05));
  float dapple = smoothstep(0.46, 0.8, d1*0.65 + d2*0.35);
  col += u_glow * 0.085 * dapple * (0.3 + 0.7*uv.y);
  // the key glow
  vec2 kc = vec2(0.0, 0.10);
  float d = length(p - kc);
  col += u_glow * 0.16 * (0.92 + 0.08*sin(t*0.6)) * exp(-d*d*5.0);
  // the pookalam, laid on the floor behind the pedestal and seen whole from
  // above: five rings of petal lobes turning against one another, the gift in
  // its centre. Dim, a floor pattern under stage light.
  vec2 c = p - vec2(0.0, 0.06);
  float r = length(c);
  float th = atan(c.y, c.x);
  vec3 mand = vec3(0.0);
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float ri = 0.12 + 0.075*fi;
    float w = 0.062;
    float band = smoothstep(ri, ri + 0.012, r) * (1.0 - smoothstep(ri + w - 0.012, ri + w, r));
    float n = 10.0 + 4.0*fi;
    float dir = mod(fi, 2.0) == 0.0 ? 1.0 : -1.0;
    float rot = dir * t * (0.04 + 0.01*fi);
    // a lobe per petal: full at its centre, tapering to a point between petals
    float lobe = pow(max(0.0, cos(n*(th + rot) * 0.5)), 1.8);
    float mid = 1.0 - pow(abs((r - ri)/w - 0.5)*2.0, 2.0);
    vec3 cc = vec3(0.96, 0.75, 0.31);                        // saffron
    if (i == 1) cc = vec3(0.91, 0.39, 0.17);                 // vermilion
    if (i == 2) cc = vec3(1.0, 0.95, 0.72);                  // cream
    if (i == 3) cc = vec3(0.55, 0.75, 0.35);                 // leaf
    if (i == 4) cc = vec3(0.95, 0.62, 0.22);                 // marigold
    mand += cc * band * lobe * max(0.0, mid);
  }
  // the heart, and a thin gold ring at the outer edge
  mand += vec3(0.86, 0.22, 0.16) * (1.0 - smoothstep(0.05, 0.11, r));
  mand += vec3(0.96, 0.75, 0.31) * 0.6 * smoothstep(0.505, 0.512, r) * (1.0 - smoothstep(0.518, 0.526, r));
  float floorFade = 1.0 - smoothstep(0.30, 0.56, r);
  col += mand * 0.22 * floorFade;
  // six fireflies, pulsing, drifting a little; never falling
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec2 fp = vec2(-0.42 + 0.84*hash(fi*2.1), -0.25 + 0.7*hash(fi*4.7));
    fp += vec2(0.03*sin(t*0.25 + fi*1.3), 0.02*sin(t*0.31 + fi*2.7));
    float pulse = pow(0.5 + 0.5*sin(t*(0.9 + 0.3*hash(fi*8.1)) + fi*1.9), 3.0);
    float dd = length(p - fp);
    col += vec3(0.85, 1.0, 0.55) * pulse * smoothstep(0.0032, 0.0, dd);
    col += vec3(0.6, 0.9, 0.45) * 0.10 * pulse * exp(-dd*dd*1400.0);
  }
  return col;
}

// ---------- Holi: gulal in the air ----------
vec3 holi(vec2 p, vec2 uv, float t, vec3 col){
  vec2 q = p*1.3;
  vec2 w = vec2(fbm(q + vec2(t*0.04, 0.0)), fbm(q + vec2(5.2, t*0.035)));
  vec2 r = q + 1.6*(w - 0.5);
  float c1 = smoothstep(0.35, 0.8, fbm(r + vec2(0.0, 1.0)));
  float c2 = smoothstep(0.35, 0.8, fbm(r*1.1 + vec2(3.0, -2.0)));
  float c3 = smoothstep(0.35, 0.8, fbm(r*0.9 + vec2(-4.0, 3.5)));
  vec3 pink = vec3(1.0, 0.31, 0.64);
  vec3 mari = vec3(1.0, 0.79, 0.24);
  vec3 sky = vec3(0.22, 0.78, 0.96);
  col += pink * 0.25 * c1 + mari * 0.18 * c2 + sky * 0.20 * c3;
  // thrown gulal: bursts that bloom and thin out, two on their own clocks
  for (int b = 0; b < 2; b++) {
    float fb = float(b);
    float period = 6.0 + 2.0*fb;
    float cycle = floor(t/period + 0.5*fb);
    float phase = fract(t/period + 0.5*fb);
    vec2 c = vec2(-0.4 + 0.8*hash(cycle*3.1 + fb), -0.2 + 0.7*hash(cycle*5.7 + fb));
    float R = 0.06 + 0.34*sqrt(phase);
    float dd = length(p - c);
    float cloud = smoothstep(R, R*0.15, dd) * (1.0 - phase) * (0.6 + 0.4*fbm(p*6.0 + cycle));
    float pick = hash(cycle*1.7 + fb*9.0);
    vec3 cc = pick < 0.33 ? pink : (pick < 0.66 ? mari : sky);
    col += cc * 0.30 * cloud;
  }
  float d = length(p - vec2(0.0, 0.10));
  col += u_glow * 0.14 * exp(-d*d*5.0);
  return col;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;            // y up: 1 at the top
  vec2 p = (gl_FragCoord.xy - 0.5*u_res) / u_res.y;
  float t = u_time;

  // the ground, and the ambient glow at the top left
  vec3 col = mix(u_g2, u_g1, uv.y);
  float amb = exp(-length(p - vec2(-0.45 + 0.03*sin(t*0.13), 0.55)) * 1.6);
  col += u_amb * 0.30 * amb;

  if (u_mode == 0) col = diwali(p, uv, t, col);
  else if (u_mode == 1) col = onam(p, uv, t, col);
  else col = holi(p, uv, t, col);

  // two star layers, parallax, festive only (all modes here are festive)
  for (int i = 0; i < 14; i++) {
    float fi = float(i);
    float layer = fi < 7.0 ? 0.004 : 0.009;
    vec2 sp = vec2(fract(hash(fi*1.9) + t*layer*0.15) - 0.5, hash(fi*6.3) - 0.5) * vec2(u_res.x/u_res.y, 1.0);
    float dd = length(p - sp);
    float tw = 0.5 + 0.5*sin(t*1.3 + fi*2.9);
    col += u_speck * 0.7 * tw * smoothstep(0.0022, 0.0, dd) * (fi < 7.0 ? 1.0 : 0.6);
  }

  // the vignette
  float v = smoothstep(0.55, 1.15, length(p * vec2(0.85, 1.0)));
  col *= 1.0 - 0.34*v;
  gl_FragColor = vec4(col, 1.0);
}
`;

const MODE = { diwali: 0, onam: 1, holi: 2 };
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);

export default function ShaderStage({ theme, stage, focusY = 0.44 }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const canvasRef = useRef(null);
  const mode = MODE[theme];
  if (!web || !createElement || mode == null) return null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0) return;
    // 0.85 of a CSS px: the field is soft and upsamples cleanly; the loops stay cheap.
    const dpr = 0.85;
    canvas.width = Math.round(size.w * dpr);
    canvas.height = Math.round(size.h * dpr);
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) return;
    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn('[ShaderStage] compile failed', gl.getShaderInfoLog(sh));
      return sh;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      // Never fail silently into the SVG fallback: say why.
      console.warn('[ShaderStage] link failed', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n) => gl.getUniformLocation(prog, n);
    gl.uniform2f(u('u_res'), canvas.width, canvas.height);
    gl.uniform1i(u('u_mode'), mode);
    gl.uniform3fv(u('u_g1'), hex(stage.ground));
    gl.uniform3fv(u('u_g2'), hex(stage.ground2));
    gl.uniform3fv(u('u_glow'), hex(stage.glowKey));
    gl.uniform3fv(u('u_amb'), hex(stage.glowAmbient));
    gl.uniform3fv(u('u_speck'), hex(stage.speck));
    const uTime = u('u_time');
    gl.viewport(0, 0, canvas.width, canvas.height);

    let raf = 0;
    const t0 = performance.now();
    const draw = () => {
      // 12 s in, so the field is already alive on the first frame
      gl.uniform1f(uTime, 12.0 + (performance.now() - t0) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    if (SETTLED) {
      gl.uniform1f(uTime, 12.0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      return;
    }
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    };
  }, [size.w, size.h, mode, stage]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {size.w > 0
        ? createElement('canvas', { ref: canvasRef, style: { width: size.w, height: size.h, display: 'block' } })
        : null}
    </View>
  );
}
