
"use client";

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import type { AnimationConfig, Track, Keyframe, ShaderName } from '@/lib/types';
import { easingFunctions } from '@/lib/easing';
import { get } from 'lodash';

interface PreviewProps {
  config: AnimationConfig;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  currentTime: number;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const hueSatHelpers = `
  vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
`;

const shaders: Record<ShaderName, string> = {
  melt: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D u_mask;
    uniform float uTime;
    uniform vec2 uResolution;
    
    uniform float uSpeed;
    uniform float uZoom;
    uniform float uDetail;
    uniform float uHue;
    uniform float uSaturation;
    uniform float uContrast;
    
    ${hueSatHelpers}

    float f(in vec2 p) {
      float t = uTime * uSpeed;
      return sin(p.x + sin(p.y + t * 0.2)) * sin(p.y * p.x * 0.1 + t * 0.2);
    }

    void main() {
      vec4 mask = texture2D(u_mask, vUv);
      if (mask.r < 0.1) discard;

      vec2 p = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
      float scale = max(0.1, uZoom);
      p *= scale;
      
      vec2 rz = vec2(0.0);
      float stepMul = mix(0.0, 0.1, clamp(uDetail, 0.0, 1.0));

      for (int i = 0; i < 15; i++) {
          float t0 = f(p);
          float t1 = f(p + vec2(0.05, 0.0));
          vec2 g = vec2((t1 - t0), (f(p + vec2(0.0, 0.05)) - t0)) / 0.05;
          vec2 t = vec2(-g.y, g.x);
          p += 0.05 * t + g * (0.2 + stepMul);
          rz = g;
      }

      vec3 col = vec3(rz * 0.5 + 0.5, 1.0);
      
      col = (col - 0.5) * uContrast + 0.5;
      vec3 hsv = rgb2hsv(col);
      hsv.x += uHue / 360.0;
      hsv.y *= uSaturation;
      col = hsv2rgb(hsv);

      gl_FragColor = vec4(col, 1.0) * mask;
    }
  `,
  flow: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D u_mask;
    uniform float uTime;
    uniform vec2 uResolution;

    uniform float uVelocity;
    uniform float uDetail;
    uniform float uTwist;
    uniform float uSpeed;
    uniform float uContrast;
    uniform float uRgbMultiplierR;
    uniform float uRgbMultiplierG;
    uniform float uRgbMultiplierB;
    uniform float uColorOffset;
    uniform float uHue;
    uniform float uSaturation;

    ${hueSatHelpers}

    float f(in vec2 p) {
        return sin(p.x + sin(p.y + uTime * uVelocity)) * sin(p.y * p.x * 0.1 + uTime * uVelocity);
    }

    void main() {
        vec4 mask = texture2D(u_mask, vUv);
        if (mask.r < 0.1) discard;

        vec2 p = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
        float uScale = 5.0;
        p *= uScale;

        vec2 ep = vec2(0.05, 0.0);
        vec2 rz = vec2(0.0);

        for (int i = 0; i < 20; i++) {
            float t0 = f(p);
            float t1 = f(p + ep.xy);
            float t2 = f(p + ep.yx);
            vec2 g = vec2((t1 - t0), (t2 - t0)) / ep.xx;
            vec2 t = vec2(-g.y, g.x);
            p += (uTwist * 0.01) * t + g * (1.0 / uDetail);
            p.x += sin(uTime * uSpeed / 10.0) / 10.0;
            p.y += cos(uTime * uSpeed / 10.0) / 10.0;
            rz = g;
        }

        vec3 colorVec = vec3(rz * 0.5 + 0.5, 1.5);
        colorVec.r *= uRgbMultiplierR;
        colorVec.g *= uRgbMultiplierG;
        colorVec.b *= uRgbMultiplierB;
        colorVec += uColorOffset;

        colorVec = (colorVec - 0.5) * uContrast + 0.5;
        vec3 hsv = rgb2hsv(colorVec);
        hsv.x += uHue / 360.0;
        hsv.y *= uSaturation;
        colorVec = hsv2rgb(hsv);

        gl_FragColor = vec4(colorVec, 1.0) * mask;
    }
  `,
  balatro: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D u_mask;
    uniform float uTime;
    uniform vec2 uResolution;

    uniform float uSpeed;
    uniform float uSpinRotation;
    uniform float uSpinSpeed;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uContrast;
    uniform float uLighting;
    uniform float uSpinAmount;
    uniform float uPixelFilter;
    uniform float uSpinEase;
    uniform bool uIsRotate;

    #define PI 3.14159265359

    vec4 effect(vec2 screenSize, vec2 screen_coords) {
        float pixel_size = length(screenSize.xy) / uPixelFilter;
        vec2 uv = (floor(screen_coords.xy*(1./pixel_size))*pixel_size - 0.5*screenSize.xy)/length(screenSize.xy) - vec2(0.0);
        float uv_len = length(uv);
        float speed = (uSpinRotation*uSpinEase*0.2);
        if(uIsRotate){ speed = uTime * speed; }
        speed += 302.2;
        float new_pixel_angle = atan(uv.y, uv.x) + speed - uSpinEase*20.*(1.*uSpinAmount*uv_len + (1. - 1.*uSpinAmount));
        vec2 mid = (screenSize.xy/length(screenSize.xy))/2.;
        uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x), (uv_len * sin(new_pixel_angle) + mid.y)) - mid);
        uv *= 30.;
        speed = uTime*(uSpinSpeed);
        vec2 uv2 = vec2(uv.x+uv.y);
        for(int i=0; i < 5; i++) {
            uv2 += sin(max(uv.x, uv.y)) + uv;
            uv  += 0.5*vec2(cos(5.1123314 + 0.353*uv2.y + speed*0.131121),sin(uv2.x - 0.113*speed));
            uv  -= 1.0*cos(uv.x + uv.y) - 1.0*sin(uv.x*0.711 - uv.y);
        }
        float contrast_mod = (0.25*uContrast + 0.5*uSpinAmount + 1.2);
        float paint_res = min(2., max(0.,length(uv)*(0.035)*contrast_mod));
        float c1p = max(0.,1. - contrast_mod*abs(1.-paint_res));
        float c2p = max(0.,1. - contrast_mod*abs(paint_res));
        float c3p = 1. - min(1., c1p + c2p);
        float light = (uLighting - 0.2)*max(c1p*5. - 4., 0.) + uLighting*max(c2p*5. - 4., 0.);
        return (0.3/uContrast)*vec4(uColor1,1.0) + (1. - 0.3/uContrast)*(vec4(uColor1,1.0)*c1p + vec4(uColor2,1.0)*c2p + vec4(c3p*uColor3.rgb, c3p*1.0)) + light;
    }

    void main() {
        vec4 mask = texture2D(u_mask, vUv);
        if (mask.r < 0.1) discard;

        vec2 uv = gl_FragCoord.xy/uResolution.xy;
        vec4 col = effect(uResolution.xy, uv * uResolution.xy);
        gl_FragColor = col * mask;
    }
  `,
  glass: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D u_mask;
    uniform float uTime;
    uniform vec2 uResolution;

    uniform float uSpeed;
    uniform float uSides;
    uniform float uHue;
    uniform float uSaturation;
    uniform float uContrast;
    uniform float uDensity;
    uniform float uGlow;
    
    ${hueSatHelpers}

    vec3 palette(float t) {
        vec3 a = vec3(0.8, 0.5, 0.4);
        vec3 b = vec3(1.0, 1.0, 0.2);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.00, 0.25, 0.25);
        return a + b * cos(6.28318 * (c * t + d));
    }

    float sdParallelogram(in vec2 p, float wi, float he, float sk) {
        vec2 e = vec2(sk, he);
        p = (p.y < 0.0) ? -p : p;
        vec2 w = p - e;
        w.x -= clamp(w.x, -wi, wi);
        vec2 d = vec2(dot(w, w), -w.y);
        float s = p.x * e.y - p.y * e.x;
        p = (s < 0.0) ? -p : p;
        vec2 v = p - vec2(wi, 0.0);
        v -= e * clamp(dot(v, e)/dot(e, e), -1.0, 1.0);
        d = min(d, vec2(dot(v,v), wi*he - abs(s)));
        return sqrt(d.x) * sign(-d.y);
    }

    float sdLine(in vec2 p) {
        float size = 0.5;
        float width = size * 0.33;
        return min(sdParallelogram(p + vec2(-0.12, -0.5), 0.1, size * 1.5, size * 0.75),
                   sdParallelogram(p + vec2(width + size * 0.175, size * 1.52), 0.1, size, 0.));
    }

    float sdfDon(vec2 uv) {
        float d1 = sdLine(uv);
        float d2 = sdLine(uv + vec2(0.315, 0.0));
        float d3 = sdLine(uv + vec2(0.63, 0.0));
        return min(min(d1, d2), d3);
    }

    void main() {
        vec4 mask = texture2D(u_mask, vUv);
        if (mask.r < 0.1) discard;

        vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
        uv.y *= uResolution.y / uResolution.x;
        float t = uTime * uSpeed;
        float PI = 3.14159;
        float sectors = max(uSides, 2.0);
        float halfSector = sectors * 0.5;
        
        float angle = atan(uv.y, uv.x);
        angle = abs(mod(angle, PI / halfSector) - PI / sectors);
        uv = vec2(cos(angle), sin(angle)) * length(uv);

        vec2 puv = uv + vec2(0.1, 0.05);
        float ind = floor((uv.y + uv.x) * 6.0) + t * 0.1;
        float g = mod(((uv.y + uv.x) * 6.0), 1.0);
        uv = vec2(uv.x + ind * 0.285, uv.y + uv.x) + t * 0.1;
        uv *= uDensity;
        uv = mod(uv, 2.5) - 1.25;
        puv = vec2(puv.x + ind * 0.285, puv.y + puv.x) + t * 0.1;
        puv *= uDensity;
        puv = mod(puv, 2.5) - 1.25;
        
        float d = sdfDon(uv);
        float p = sdfDon(puv);
        d = smoothstep(0.0, 0.02, d);
        p = smoothstep(0.0, 0.01, p);
        
        vec3 fgColor = palette(-t + ind * 0.1) * g * 1.579 * uGlow;
        vec3 bgColor = palette(-t + ind * 0.1) * g * 0.1;
        if (g > 0.95) {bgColor = mix(fgColor, palette(-t + uv.x + uv.y), 0.5);}
        
        vec3 color = mix(fgColor, bgColor, d);
        color = mix(color * 2.0, color, p);
        
        color = (color - 0.5) * uContrast + 0.5;
        vec3 hsv = rgb2hsv(color);
        hsv.x += uHue / 360.0;
        hsv.y *= uSaturation;
        color = hsv2rgb(hsv);

        gl_FragColor = vec4(color, 1.0) * mask;
    }
  `,
  chargedCells: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D u_mask;
    uniform float uTime;
    uniform vec2 uResolution;

    uniform float uSpeed;
    uniform float uScale;
    uniform float uHue;
    uniform float uSaturation;
    uniform float uContrast;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;

    ${hueSatHelpers}

    #define PI 3.14159
    float hash1( float n ) { return fract(sin(n)*43758.5453); }
    vec2  hash2( vec2  p ) { p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) ); return fract(sin(p)*43758.5453); }

    vec4 voronoi( in vec2 x, float w ) {
        vec2 n = floor( x );
        vec2 f = fract( x );
        vec4 m = vec4( 8.0, 0.0, 0.0, 0.0 );
        for( int j=-2; j<=2; j++ )
        for( int i=-2; i<=2; i++ ) {
            vec2 g = vec2( float(i),float(j) );
            vec2 o = hash2( n + g );
            o = 0.5 + 0.5*sin( uTime + 6.2831*o );
            float d = length(g - f + o);
            vec3 col = 0.5 + 0.5*sin(hash1(dot(n+g,vec2(7.0,113.0)))*2.5 +3.5 +vec3(2.0,3.0,0.0));
            col = col * col;
            float h = smoothstep( -1.0, 1.0, (m.x-d)/w );
            m.x   = mix( m.x,     d, h ) - h*(1.0-h)*w/(1.0+3.0*w);
            m.yzw = mix( m.yzw, col, h ) - h*(1.0-h)*w/(1.0+3.0*w);
        }
        return m;
    }

    float sdfGrid(vec2 uv, float r) {
        vec2 c = uv * 4.0 * r;
        float angle = r;
        float thickness = 0.5 + r;
        float one = abs(0.5 - mod(c.y + cos(angle) * c.x, 1.0)) * thickness;
        float two = abs(0.5 - mod(c.y - cos(angle) * c.x, 1.0)) * thickness;
        return min(one, two);
    }

    vec3 paletteCharged(float t) {
        t = clamp(t, 0.0, 1.0);
        if (t < 0.5) {
            float k = t / 0.5;
            return mix(uColor1, uColor2, k);
        } else {
            float k = (t - 0.5) / 0.5;
            return mix(uColor2, uColor3, k);
        }
    }

    void main() {
        vec4 mask = texture2D(u_mask, vUv);
        if (mask.r < 0.1) discard;

        vec2 uv = gl_FragCoord.xy / uResolution.xy * 2.0 - 1.0;
        uv.y *= uResolution.y / uResolution.x;
        float t = sin(uTime * 0.1 * uSpeed);
        vec4 v = voronoi(uScale * uv, 0.5);
        float r = pow(v.y, 0.5);
        float d = 0.0;
        d = max(sdfGrid(uv - t, r), d);
        d = max(sdfGrid(uv + t, 1.0 - r), -d);
        d = smoothstep(0.1, 0.15 + r * 0.1, d);
        vec3 fgColor = paletteCharged(0.6 * r);
        vec3 bgColor = paletteCharged(0.1 * r);
        vec3 edgeColor = paletteCharged(clamp(r + d * 0.5, 0.0, 1.0));
        vec3 color = mix(fgColor, bgColor, d);
        color = mix(color, edgeColor, 0.35);

        vec3 hsv = rgb2hsv(color);
        hsv.x += uHue / 360.0;
        hsv.y *= uSaturation;
        color = hsv2rgb(hsv);
        color = (color - 0.5) * uContrast + 0.5;

        gl_FragColor = vec4(color, 1.0) * mask;
    }
  `,
};

function getInterpolatedValue(tracks: Track[], property: string, time: number, duration: number, defaultValue: any): any {
  const track = tracks.find(t => t.property === property);
  if (!track) return defaultValue;
  
  const { keyframes } = track;
  const progress = time / duration;

  if (keyframes.length === 0) return defaultValue;
  if (keyframes.length === 1 || progress <= keyframes[0].time) {
    return keyframes[0].value;
  }
  if (progress >= keyframes[keyframes.length - 1].time) {
    return keyframes[keyframes.length - 1].value;
  }

  let p1: Keyframe | undefined, p2: Keyframe | undefined;
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (progress >= keyframes[i].time && progress <= keyframes[i + 1].time) {
      p1 = keyframes[i];
      p2 = keyframes[i + 1];
      break;
    }
  }

  if (!p1 || !p2) return keyframes[0].value;

  const timeDiff = p2.time - p1.time;
  if (timeDiff === 0) return p1.value;

  const valueDiff = p2.value - p1.value;
  const localProgress = (progress - p1.time) / timeDiff;

  const easedProgress = easingFunctions[p2.easing](localProgress);

  return p1.value + valueDiff * easedProgress;
}


export default function Preview({ config, isPlaying, onTimeUpdate, currentTime }: PreviewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const animationFrameId = useRef<number>();
  const startTimeRef = useRef(Date.now());
  const shaderTimeRef = useRef(0);
  const lastTimeRef = useRef(0);
  const backgroundColorRef = useRef(new THREE.Color());

  const [textCanvas, setTextCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const canvas = document.createElement('canvas');
        setTextCanvas(canvas);
    }
  }, []);

  const updateScene = (timelineTime: number, shaderTime: number) => {
    const { tracks, duration, text, shaders: shaderConfig, background } = config;
    if (!meshRef.current || !materialRef.current || !textCanvas || !textureRef.current || !rendererRef.current?.domElement) return;

    const rendererSize = new THREE.Vector2();
    rendererRef.current.getSize(rendererSize);
    const {x: width, y: height} = rendererSize;

    const getValue = (prop: string, def: any) => getInterpolatedValue(tracks, prop, timelineTime, duration, def);

    const fontSize = getValue('text.fontSize', text.fontSize);
    const positionX = getValue('position.x', 0);
    const positionY = getValue('position.y', 0);
    const rotationZ = getValue('text.rotation', text.rotation);
    

    const bgR = getValue('background.color.0', background.color[0]);
    const bgG = getValue('background.color.1', background.color[1]);
    const bgB = getValue('background.color.2', background.color[2]);
    backgroundColorRef.current.setRGB(bgR, bgG, bgB);
    rendererRef.current.setClearColor(backgroundColorRef.current, 1);


    // Update canvas texture for text
    const context = textCanvas.getContext('2d');
    if (!context) return;
    
    if(textCanvas.width !== width || textCanvas.height !== height) {
        textCanvas.width = width;
        textCanvas.height = height;
    } else {
        context.clearRect(0, 0, width, height);
    }
    
    const font = `${text.fontWeight} ${fontSize}px '${text.fontFamily}'`;
    context.font = font;
    context.fillStyle = 'white';
    context.textAlign = text.align;
    context.textBaseline = 'middle';
    
    let x;
    if (text.align === 'center') x = textCanvas.width / 2;
    else if (text.align === 'right') x = textCanvas.width;
    else x = 0;
    
    const lines = text.content.split('\n');
    const lineHeight = fontSize * text.lineHeight;
    const totalHeight = lines.length * lineHeight;
    let startY = textCanvas.height / 2 - totalHeight / 2 + lineHeight / 2;

    for (let i = 0; i < lines.length; i++) {
        context.fillText(lines[i], x, startY + i * lineHeight);
    }

    textureRef.current.needsUpdate = true;
        
    // Update material uniforms and mesh properties
    const activeShaderName = shaderConfig.activeShader;
    const uniforms = materialRef.current.uniforms;
    
    uniforms.uTime.value = shaderTime;
    uniforms.uResolution.value.set(width, height);

    if (activeShaderName === 'melt') {
        const props = shaderConfig.melt;
        uniforms.uHue.value = getValue(`shaders.melt.hue`, props.hue);
        uniforms.uSaturation.value = getValue(`shaders.melt.saturation`, props.saturation);
        uniforms.uContrast.value = getValue(`shaders.melt.contrast`, props.contrast);
        uniforms.uZoom.value = getValue(`shaders.melt.zoom`, props.zoom);
        uniforms.uSpeed.value = getValue(`shaders.melt.speed`, props.speed);
        uniforms.uDetail.value = getValue(`shaders.melt.detail`, props.detail);
    } else if (activeShaderName === 'flow') {
        const props = shaderConfig.flow;
        uniforms.uHue.value = getValue(`shaders.flow.hue`, props.hue);
        uniforms.uSaturation.value = getValue(`shaders.flow.saturation`, props.saturation);
        uniforms.uContrast.value = getValue(`shaders.flow.contrast`, props.contrast);
        uniforms.uVelocity.value = getValue(`shaders.flow.velocity`, props.velocity);
        uniforms.uDetail.value = getValue(`shaders.flow.detail`, props.detail);
        uniforms.uTwist.value = getValue(`shaders.flow.twist`, props.twist);
        uniforms.uSpeed.value = props.speed; // Not animatable
    } else if (activeShaderName === 'glass') {
        const props = shaderConfig.glass;
        uniforms.uHue.value = getValue(`shaders.glass.hue`, props.hue);
        uniforms.uSaturation.value = getValue(`shaders.glass.saturation`, props.saturation);
        uniforms.uContrast.value = getValue(`shaders.glass.contrast`, props.contrast);
        uniforms.uSides.value = getValue(`shaders.glass.sides`, props.sides);
        uniforms.uDensity.value = getValue(`shaders.glass.density`, props.density);
        uniforms.uGlow.value = getValue(`shaders.glass.glow`, props.glow);
        uniforms.uSpeed.value = props.speed;
    } else if (activeShaderName === 'chargedCells') {
        const props = shaderConfig.chargedCells;
        uniforms.uHue.value = getValue(`shaders.chargedCells.hue`, props.hue);
        uniforms.uSaturation.value = getValue(`shaders.chargedCells.saturation`, props.saturation);
        uniforms.uContrast.value = getValue(`shaders.chargedCells.contrast`, props.contrast);
        uniforms.uScale.value = getValue(`shaders.chargedCells.scale`, props.scale);
        uniforms.uSpeed.value = props.speed;
        uniforms.uColor1.value.setRGB(getValue('shaders.chargedCells.color1.0', 0), getValue('shaders.chargedCells.color1.1', 0), getValue('shaders.chargedCells.color1.2', 0));
        uniforms.uColor2.value.setRGB(getValue('shaders.chargedCells.color2.0', 0), getValue('shaders.chargedCells.color2.1', 0), getValue('shaders.chargedCells.color2.2', 0));
        uniforms.uColor3.value.setRGB(getValue('shaders.chargedCells.color3.0', 0), getValue('shaders.chargedCells.color3.1', 0), getValue('shaders.chargedCells.color3.2', 0));
    } else if (activeShaderName === 'balatro') {
        const props = shaderConfig.balatro;
        // Most balatro props are not animated in this setup
        uniforms.uContrast.value = getValue(`shaders.balatro.contrast`, props.contrast);
        uniforms.uSpeed.value = props.speed;
        uniforms.uSpinRotation.value = props.spinRotation;
        uniforms.uSpinSpeed.value = props.spinSpeed;
        uniforms.uLighting.value = props.lighting;
        uniforms.uSpinAmount.value = props.spinAmount;
        uniforms.uPixelFilter.value = props.pixelFilter;
        uniforms.uSpinEase.value = props.spinEase;
        uniforms.uIsRotate.value = props.isRotate;
        uniforms.uColor1.value.setRGB(getValue('shaders.balatro.color1.0', 0), getValue('shaders.balatro.color1.1', 0), getValue('shaders.balatro.color1.2', 0));
        uniforms.uColor2.value.setRGB(getValue('shaders.balatro.color2.0', 0), getValue('shaders.balatro.color2.1', 0), getValue('shaders.balatro.color2.2', 0));
        uniforms.uColor3.value.setRGB(getValue('shaders.balatro.color3.0', 0), getValue('shaders.balatro.color3.1', 0), getValue('shaders.balatro.color3.2', 0));
    }
    
    meshRef.current.position.set(positionX, positionY, 0);
    meshRef.current.rotation.set(0, 0, THREE.MathUtils.degToRad(rotationZ));
    meshRef.current.scale.set(1, 1, 1);

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };
  
  // Scrubber manual update & continuous animation when paused
  useEffect(() => {
    let frameId: number;
    const animatePaused = () => {
        shaderTimeRef.current += 0.016; // Approx 60fps
        updateScene(currentTime, shaderTimeRef.current);
        frameId = requestAnimationFrame(animatePaused);
    };

    if (!isPlaying) {
        animatePaused();
    }

    return () => {
        if(frameId) cancelAnimationFrame(frameId);
    };
  }, [currentTime, config, isPlaying]);


  // Initialization and Shader Switching
  useEffect(() => {
    if (!textCanvas) return;
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const { activeShader } = config.shaders;

    if (!rendererRef.current) {
      // First time initialization
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      cameraRef.current = camera;
      
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      rendererRef.current = renderer;
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      currentMount.appendChild(renderer.domElement);

      const texture = new THREE.CanvasTexture(textCanvas);
      textureRef.current = texture;
    }
    
    const fragmentShader = shaders[activeShader];
    if (!fragmentShader) return;

    // Define uniforms for all possible shaders
    const uniforms = {
        u_mask: { value: textureRef.current },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(currentMount.clientWidth, currentMount.clientHeight) },
        // Common
        uHue: { value: 0.0 },
        uSaturation: { value: 1.0 },
        uContrast: { value: 1.0 },
        uSpeed: { value: 0.5 },
        // Melt
        uZoom: { value: 1.0 },
        uDetail: { value: 0.2 },
        // Flow
        uVelocity: { value: 0.2 },
        uTwist: { value: 50.0 },
        uRgbMultiplierR: { value: 1.0 },
        uRgbMultiplierG: { value: 1.0 },
        uRgbMultiplierB: { value: 1.0 },
        uColorOffset: { value: 0.0 },
        // Balatro
        uSpinRotation: { value: -2.0 },
        uSpinSpeed: { value: 7.0 },
        uColor1: { value: new THREE.Color(0.871, 0.267, 0.231) },
        uColor2: { value: new THREE.Color(0.0, 0.42, 0.706) },
        uColor3: { value: new THREE.Color(0.086, 0.137, 0.145) },
        uLighting: { value: 0.4 },
        uSpinAmount: { value: 0.25 },
        uPixelFilter: { value: 745.0 },
        uSpinEase: { value: 1.0 },
        uIsRotate: { value: false },
        // Glass
        uSides: { value: 6.0 },
        uDensity: { value: 15.0 },
        uGlow: { value: 1.2 },
        // Charged Cells
        uScale: { value: 5.0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
    });
    
    if (materialRef.current) {
        materialRef.current.dispose();
    }
    materialRef.current = material;

    if (!meshRef.current) {
      const geometry = new THREE.PlaneGeometry(2, 2);
      const mesh = new THREE.Mesh(geometry, material);
      meshRef.current = mesh;
      sceneRef.current?.add(mesh);
    } else {
        meshRef.current.material = material;
    }
    
    const handleResize = () => {
        if (rendererRef.current && mountRef.current) {
            const { clientWidth, clientHeight } = mountRef.current;
            rendererRef.current.setSize(clientWidth, clientHeight);
            if (materialRef.current) {
              materialRef.current.uniforms.uResolution.value.set(clientWidth, clientHeight);
            }
        }
    };
    window.addEventListener('resize', handleResize);

    updateScene(currentTime, shaderTimeRef.current); // Render after change

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [textCanvas, config.shaders.activeShader, config.text.fontFamily, config.text.fontWeight]); // Re-run when shader or font changes

  // Cleanup on unmount
  useEffect(() => {
    const currentMount = mountRef.current;
    const renderer = rendererRef.current;
    return () => {
        if (renderer?.domElement && currentMount?.contains(renderer.domElement)) {
            currentMount.removeChild(renderer.domElement);
        }
        renderer?.dispose();
        materialRef.current?.dispose();
        textureRef.current?.dispose();
        meshRef.current?.geometry.dispose();
    }
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (!isPlaying) {
        if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        return;
      }

      animationFrameId.current = requestAnimationFrame(animate);

      const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
      const loopTime = elapsedTime % config.duration;
      shaderTimeRef.current += 0.016; // Keep this running continuously
      lastTimeRef.current = loopTime;
      onTimeUpdate(loopTime);
      updateScene(loopTime, shaderTimeRef.current);
    };

    if (isPlaying) {
      startTimeRef.current = Date.now() - lastTimeRef.current * 1000;
      animate();
    } else {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    }
    
    return () => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isPlaying, config, onTimeUpdate]);
  
  return <div ref={mountRef} className="w-full h-full" />;
}

    

    
