export type Easing = 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad';

export type Keyframe = {
  id: string;
  time: number; // 0 to 1, representing percentage of duration
  value: number;
  easing: Easing;
};

export type Track = {
  id: string;
  property: string; // e.g., 'shaders.melt.zoom'
  label: string;
  keyframes: Keyframe[];
  min: number;
  max: number;
  step?: number;
};

export type TextConfig = {
  content: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight: string;
  align: 'left' | 'center' | 'right';
  rotation: number;
  lineHeight: number;
};

export type ShaderName = 'melt' | 'flow' | 'balatro' | 'glass' | 'chargedCells';

export type MeltShaderConfig = {
  hue: number;
  saturation: number;
  contrast: number;
  zoom: number;
  speed: number;
  detail: number;
};

export type FlowShaderConfig = {
  hue: number;
  saturation: number;
  contrast: number;
  velocity: number;
  detail: number;
  twist: number;
  speed: number;
  rgbR: number;
  rgbG: number;
  rgbB: number;
  colorOffset: number;
};

export type BalatroShaderConfig = {
  speed: number;
  spinRotation: number;
  spinSpeed: number;
  contrast: number;
  lighting: number;
  spinAmount: number;
  pixelFilter: number;
  spinEase: number;
  isRotate: boolean;
  color1?: [number, number, number];
  color2?: [number, number, number];
  color3?: [number, number, number];
};

export type GlassShaderConfig = {
    speed: number;
    sides: number;
    hue: number;
    saturation: number;
    contrast: number;
    density: number;
    glow: number;
}

export type ChargedCellsShaderConfig = {
    speed: number;
    scale: number;
    hue: number;
    saturation: number;
    contrast: number;
    color1?: [number, number, number];
    color2?: [number, number, number];
    color3?: [number, number, number];
}

export type ShaderConfigs = {
  melt: MeltShaderConfig;
  flow: FlowShaderConfig;
  balatro: BalatroShaderConfig;
  glass: GlassShaderConfig;
  chargedCells: ChargedCellsShaderConfig;
};


export type AnimationConfig = {
  duration: number; // in seconds
  text: TextConfig;
  background: {
    color: [number, number, number]; // RGB
  };
  tracks: Track[];
  shaders: {
    activeShader: ShaderName;
    melt: MeltShaderConfig;
    flow: FlowShaderConfig;
    balatro: BalatroShaderConfig;
    glass: GlassShaderConfig;
    chargedCells: ChargedCellsShaderConfig;
  };
};
