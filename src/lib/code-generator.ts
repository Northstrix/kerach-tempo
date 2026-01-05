

import type { AnimationConfig, Keyframe, Track, ShaderName } from '@/lib/types';

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
    
    vec3 rgb2hsv(vec3 c) { vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0); vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g)); vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r)); float d = q.x - min(q.w, q.y); float e = 1.0e-10; return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x); }
    vec3 hsv2rgb(vec3 c) { vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0); vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www); return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y); }

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

    vec3 rgb2hsv(vec3 c) { vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0); vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g)); vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r)); float d = q.x - min(q.w, q.y); float e = 1.0e-10; return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x); }
    vec3 hsv2rgb(vec3 c) { vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0); vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www); return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y); }

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

export function generateHtml(config: AnimationConfig): string {
  // Create a deep copy of the config to modify for export
  const exportConfig = JSON.parse(JSON.stringify(config));

  // Modify track properties to be valid JS identifiers for the export script
  exportConfig.tracks.forEach((track: Track) => {
    track.property = track.property.replace(/\./g, '_');
  });
  
  const configJson = JSON.stringify(exportConfig);
  const activeShaderName = config.shaders.activeShader;
  const fragmentShaderSource = shaders[activeShaderName].replace(/`/g, '\\`');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kerach Tempo Export</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Roboto:wght@100;300;400;500;700;900&family=Lato:wght@100;300;400;700;900&family=Open+Sans:wght@300;400;500;600;700;800&family=Montserrat:wght@100..900&family=Poppins:wght@100;200;300;400;500;600;700;800;900&family=Source+Code+Pro:wght@200..900&family=Nunito:wght@200..1000&family=Raleway:wght@100..900&family=Playfair+Display:wght@400..900&family=Merriweather:wght@300;400;700;900&family=Ubuntu:wght@300;400;500;700&family=Zilla+Slab:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=Work+Sans:wght@100..900&display=swap" rel="stylesheet" />
  <style>
    body, html { margin: 0; padding: 0; background-color: #000; overflow: hidden; height: 100%; }
    #container { width: 100%; height: 100%; }
    canvas { display: block; position: absolute; top: 0; left: 0; }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <div id="container"></div>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const config = ${configJson};
      const fragmentShader = \`${fragmentShaderSource}\`;
      const vertexShader = \`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      \`;

      const easingFunctions = {
        linear: (x) => x,
        easeInQuad: (x) => x * x,
        easeOutQuad: (x) => 1 - (1 - x) * (1 - x),
        easeInOutQuad: (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2,
      };

      let scene, camera, renderer, mesh, material, texture, textCanvas;
      let startTime = Date.now();
      let shaderTime = 0;

      function getInterpolatedValue(property, time) {
          const { tracks, duration } = config;
          const track = tracks.find(t => t.property === property);
          
          const getNestedValue = (obj, path) => {
            const keys = path.split('_');
            let current = obj;
            for (let i = 0; i < keys.length; i++) {
                if (current === undefined) return undefined;
                const key = keys[i];
                // Handle array access for colors
                if (Array.isArray(current) && !isNaN(parseInt(key, 10))) {
                    current = current[parseInt(key, 10)];
                } else {
                    current = current[key];
                }
            }
            return current;
          }

          const defaultValue = getNestedValue(config, property.replace(/_(\\d)/, (match, p1) => \`[\${p1}]\`));


          if (!track || track.keyframes.length === 0) {
            return defaultValue;
          }

          const { keyframes } = track;
          const progress = time / duration;

          if (keyframes.length === 1 || progress <= keyframes[0].time) return keyframes[0].value;
          if (progress >= keyframes[keyframes.length - 1].time) return keyframes[keyframes.length - 1].value;

          let p1, p2;
          for (let i = 0; i < keyframes.length - 1; i++) {
              if (progress >= keyframes[i].time && progress <= keyframes[i+1].time) {
                  p1 = keyframes[i];
                  p2 = keyframes[i+1];
                  break;
              }
          }
          
          if (!p1 || !p2) return keyframes[0].value;
          
          const timeDiff = p2.time - p1.time;
          if (timeDiff === 0) return p1.value;
          
          const valueDiff = p2.value - p1.value;
          const localProgress = (progress - p1.time) / timeDiff;
          const easedProgress = easingFunctions[p2.easing] ? easingFunctions[p2.easing](localProgress) : easingFunctions['linear'](localProgress);
          return p1.value + valueDiff * easedProgress;
      }

      function updateTextCanvas(time) {
          const { text } = config;
          const context = textCanvas.getContext('2d');
          if (!context) return;
          
          const dpr = window.devicePixelRatio || 1;
          const width = window.innerWidth * dpr;
          const height = window.innerHeight * dpr;

          const fontSize = getInterpolatedValue('text_fontSize', time) * dpr;
          const font = \`\${text.fontWeight} \${fontSize}px '\${text.fontFamily}'\`;

          if(textCanvas.width !== width || textCanvas.height !== height) {
              textCanvas.width = width;
              textCanvas.height = height;
          } else {
              context.clearRect(0, 0, textCanvas.width, textCanvas.height);
          }

          context.font = font;
          context.fillStyle = 'white';
          context.textAlign = text.align;
          context.textBaseline = 'middle';
          
          let x;
          if (text.align === 'center') x = textCanvas.width / 2;
          else if (text.align === 'right') x = textCanvas.width;
          else x = 0;
          
          const lines = text.content.split('\\n');
          const lineHeight = fontSize * text.lineHeight;
          const totalHeight = lines.length * lineHeight;
          let startY = textCanvas.height / 2 - totalHeight / 2 + lineHeight / 2;

          for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i], x, startY + i * lineHeight);
          }
          
          texture.needsUpdate = true;
      }

      function init() {
        const container = document.getElementById('container');
        try {
            renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        } catch (e) {
            console.error("Error creating WebGL context", e);
            container.innerHTML = 'Could not create a WebGL context. Please ensure your browser supports WebGL and it is enabled.';
            return;
        }

        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        
        textCanvas = document.createElement('canvas');
        texture = new THREE.CanvasTexture(textCanvas);
        
        const geometry = new THREE.PlaneGeometry(2, 2);
        
        const uniforms = {
          u_mask: { value: texture },
          uTime: { value: 0.0 },
          uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          // Common
          uHue: { value: 0.0 }, uSaturation: { value: 1.0 }, uContrast: { value: 1.0 }, uSpeed: { value: 0.5 },
          // Melt
          uZoom: { value: 1.0 }, uDetail: { value: 0.2 },
          // Flow
          uVelocity: { value: 0.2 }, uTwist: { value: 50.0 }, uRgbMultiplierR: { value: 1.0 }, uRgbMultiplierG: { value: 1.0 }, uRgbMultiplierB: { value: 1.0 }, uColorOffset: { value: 0.0 },
          // Balatro
          uSpinRotation: { value: -2.0 }, uSpinSpeed: { value: 7.0 }, uColor1: { value: new THREE.Color(0.871, 0.267, 0.231) }, uColor2: { value: new THREE.Color(0.0, 0.42, 0.706) }, uColor3: { value: new THREE.Color(0.086, 0.137, 0.145) }, uLighting: { value: 0.4 }, uSpinAmount: { value: 0.25 }, uPixelFilter: { value: 745.0 }, uSpinEase: { value: 1.0 }, uIsRotate: { value: false },
          // Glass
          uSides: { value: 6.0 }, uDensity: { value: 15.0 }, uGlow: { value: 1.2 },
          // Charged Cells
          uScale: { value: 5.0 },
        };

        material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader,
          fragmentShader,
          transparent: true,
        });

        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        
        window.addEventListener('resize', onWindowResize, false);
        onWindowResize();
        updateTextCanvas(0); // Immediately render text with initial properties
        animate();
      }

      function onWindowResize() {
        if (!renderer) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        const dpr = window.devicePixelRatio || 1;
        if (material) {
            material.uniforms.uResolution.value.set(width * dpr, height * dpr);
        }
      }

      function animate() {
        if (!renderer) return;
        requestAnimationFrame(animate);

        const elapsedTime = (Date.now() - startTime) / 1000;
        const loopTime = elapsedTime % config.duration;
        shaderTime += 0.016; // Continuous time for shader
        
        updateTextCanvas(loopTime);

        const uniforms = material.uniforms;

        uniforms.uTime.value = shaderTime;

        // Update background
        const bgR = getInterpolatedValue('background_color_0', loopTime);
        const bgG = getInterpolatedValue('background_color_1', loopTime);
        const bgB = getInterpolatedValue('background_color_2', loopTime);
        
        renderer.setClearColor(new THREE.Color(bgR, bgG, bgB), 1);
        
        const activeShaderName = config.shaders.activeShader;
        
        if (uniforms.uHue) uniforms.uHue.value = getInterpolatedValue(\`shaders_\${activeShaderName}_hue\`, loopTime);
        if (uniforms.uSaturation) uniforms.uSaturation.value = getInterpolatedValue(\`shaders_\${activeShaderName}_saturation\`, loopTime);
        if (uniforms.uContrast) uniforms.uContrast.value = getInterpolatedValue(\`shaders_\${activeShaderName}_contrast\`, loopTime);

        if (activeShaderName === 'melt') {
            if (uniforms.uZoom) uniforms.uZoom.value = getInterpolatedValue('shaders_melt_zoom', loopTime);
            if (uniforms.uSpeed) uniforms.uSpeed.value = getInterpolatedValue('shaders_melt_speed', loopTime);
            if (uniforms.uDetail) uniforms.uDetail.value = getInterpolatedValue('shaders_melt_detail', loopTime);
        } else if (activeShaderName === 'flow') {
            if (uniforms.uVelocity) uniforms.uVelocity.value = getInterpolatedValue('shaders_flow_velocity', loopTime);
            if (uniforms.uDetail) uniforms.uDetail.value = getInterpolatedValue('shaders_flow_detail', loopTime);
            if (uniforms.uTwist) uniforms.uTwist.value = getInterpolatedValue('shaders_flow_twist', loopTime);
            if (uniforms.uSpeed) uniforms.uSpeed.value = config.shaders.flow.speed; // Not animatable
        } else if (activeShaderName === 'glass') {
            if (uniforms.uSides) uniforms.uSides.value = getInterpolatedValue('shaders_glass_sides', loopTime);
            if (uniforms.uDensity) uniforms.uDensity.value = getInterpolatedValue('shaders_glass_density', loopTime);
            if (uniforms.uGlow) uniforms.uGlow.value = getInterpolatedValue('shaders_glass_glow', loopTime);
            if (uniforms.uSpeed) uniforms.uSpeed.value = config.shaders.glass.speed; // Not animatable
        } else if (activeShaderName === 'chargedCells') {
            if (uniforms.uScale) uniforms.uScale.value = getInterpolatedValue('shaders_chargedCells_scale', loopTime);
            if (uniforms.uSpeed) uniforms.uSpeed.value = config.shaders.chargedCells.speed; // Not animatable
            if (uniforms.uColor1) uniforms.uColor1.value.setRGB(getInterpolatedValue('shaders_chargedCells_color1_0', loopTime), getInterpolatedValue('shaders_chargedCells_color1_1', loopTime), getInterpolatedValue('shaders_chargedCells_color1_2', loopTime));
            if (uniforms.uColor2) uniforms.uColor2.value.setRGB(getInterpolatedValue('shaders_chargedCells_color2_0', loopTime), getInterpolatedValue('shaders_chargedCells_color2_1', loopTime), getInterpolatedValue('shaders_chargedCells_color2_2', loopTime));
            if (uniforms.uColor3) uniforms.uColor3.value.setRGB(getInterpolatedValue('shaders_chargedCells_color3_0', loopTime), getInterpolatedValue('shaders_chargedCells_color3_1', loopTime), getInterpolatedValue('shaders_chargedCells_color3_2', loopTime));
        } else if (activeShaderName === 'balatro') {
            const props = config.shaders.balatro; // Non-animatable props
            if (uniforms.uSpeed) uniforms.uSpeed.value = props.speed;
            if (uniforms.uSpinRotation) uniforms.uSpinRotation.value = props.spinRotation;
            if (uniforms.uSpinSpeed) uniforms.uSpinSpeed.value = props.spinSpeed;
            if (uniforms.uLighting) uniforms.uLighting.value = props.lighting;
            if (uniforms.uSpinAmount) uniforms.uSpinAmount.value = props.spinAmount;
            if (uniforms.uPixelFilter) uniforms.uPixelFilter.value = props.pixelFilter;
            if (uniforms.uSpinEase) uniforms.uSpinEase.value = props.spinEase;
            if (uniforms.uIsRotate) uniforms.uIsRotate.value = props.isRotate;
             if (uniforms.uContrast) uniforms.uContrast.value = getInterpolatedValue('shaders_balatro_contrast', loopTime);
            if (uniforms.uColor1) uniforms.uColor1.value.setRGB(getInterpolatedValue('shaders_balatro_color1_0', loopTime), getInterpolatedValue('shaders_balatro_color1_1', loopTime), getInterpolatedValue('shaders_balatro_color1_2', loopTime));
            if (uniforms.uColor2) uniforms.uColor2.value.setRGB(getInterpolatedValue('shaders_balatro_color2_0', loopTime), getInterpolatedValue('shaders_balatro_color2_1', loopTime), getInterpolatedValue('shaders_balatro_color2_2', loopTime));
            if (uniforms.uColor3) uniforms.uColor3.value.setRGB(getInterpolatedValue('shaders_balatro_color3_0', loopTime), getInterpolatedValue('shaders_balatro_color3_1', loopTime), getInterpolatedValue('shaders_balatro_color3_2', loopTime));
        }
        
        const positionX = getInterpolatedValue('position_x', loopTime);
        const positionY = getInterpolatedValue('position_y', loopTime);
        
        mesh.position.x = positionX / (window.innerWidth / 2);
        mesh.position.y = -positionY / (window.innerHeight / 2);
        mesh.rotation.z = -THREE.MathUtils.degToRad(getInterpolatedValue('text_rotation', loopTime));
        
        renderer.render(scene, camera);
      }
      
      init();
    });
  </script>
</body>
</html>
  `;
}
