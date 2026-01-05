
import type { AnimationConfig, ShaderName } from '@/lib/types';

export const initialConfig: AnimationConfig = {
  duration: 5,
  text: {
    content: 'Kerach Tempo',
    fontSize: 80,
    color: '#0DE5DA',
    fontFamily: 'Inter',
    fontWeight: '700',
    align: 'center',
    rotation: 0,
    lineHeight: 1.2,
  },
  background: {
    color: [0, 0, 0], // Black
  },
  shaders: {
    activeShader: 'melt' as ShaderName,
    melt: { hue: 0, saturation: 1.0, zoom: 7.60, speed: 0.5, detail: 0.2, contrast: 1.0 },
    flow: { velocity: 0.2, detail: 200.0, twist: 50.0, speed: 2.5, contrast: 1.0, rgbR: 1.0, rgbG: 1.0, rgbB: 1.0, colorOffset: 0.0, hue: 0, saturation: 1.0 },
    balatro: { speed: 1, spinRotation: -2.0, spinSpeed: 7.0, contrast: 3.5, lighting: 0.4, spinAmount: 0.25, pixelFilter: 745.0, spinEase: 1.0, isRotate: false },
    glass: { speed: 0.8, sides: 6, hue: 0, saturation: 1, contrast: 1, density: 15.0, glow: 1.2 },
    chargedCells: { speed: 1.0, scale: 5.0, hue: 0, saturation: 1, contrast: 1 },
  },
  tracks: [
    {
      id: 'text.fontSize',
      property: 'text.fontSize',
      label: 'Font Size',
      min: 10,
      max: 200,
      keyframes: [{ id: 'fs1', time: 0, value: 80, easing: 'linear' }],
    },
    {
      id: 'position.x',
      property: 'position.x',
      label: 'Position X',
      min: -200,
      max: 200,
      keyframes: [{ id: 'px1', time: 0, value: 0, easing: 'linear' }],
    },
    {
      id: 'position.y',
      property: 'position.y',
      label: 'Position Y',
      min: -200,
      max: 200,
      keyframes: [{ id: 'py1', time: 0, value: 0, easing: 'linear' }],
    },
    {
      id: 'text.rotation',
      property: 'text.rotation',
      label: 'Rotation',
      min: 0,
      max: 360,
      step: 0.01,
      keyframes: [{ id: 'rot1', time: 0, value: 0, easing: 'linear' }],
    },
    {
      id: 'background.color.0',
      property: 'background.color.0',
      label: 'BG Color (R)',
      min: 0,
      max: 1,
      step: 0.01,
      keyframes: [{ id: 'bgr1', time: 0, value: 0, easing: 'linear' }],
    },
    {
      id: 'background.color.1',
      property: 'background.color.1',
      label: 'BG Color (G)',
      min: 0,
      max: 1,
      step: 0.01,
      keyframes: [{ id: 'bgg1', time: 0, value: 0, easing: 'linear' }],
    },
    {
      id: 'background.color.2',
      property: 'background.color.2',
      label: 'BG Color (B)',
      min: 0,
      max: 1,
      step: 0.01,
      keyframes: [{ id: 'bgb1', time: 0, value: 0, easing: 'linear' }],
    },
    // Common Shader Tracks
    {
      id: 'shader.hue',
      property: 'shaders.melt.hue', // Will be updated dynamically
      label: 'Hue Shift',
      min: 0,
      max: 360,
      keyframes: [{ id: 'sh1', time: 0, value: 0, easing: 'linear' }],
    },
    {
      id: 'shader.saturation',
      property: 'shaders.melt.saturation',
      label: 'Saturation',
      min: 0,
      max: 2,
      step: 0.01,
      keyframes: [{ id: 'ss1', time: 0, value: 1, easing: 'linear' }],
    },
    {
      id: 'shader.contrast',
      property: 'shaders.melt.contrast',
      label: 'Contrast',
      min: 0,
      max: 5,
      step: 0.01,
      keyframes: [{ id: 'sc1', time: 0, value: 1, easing: 'linear' }],
    },
    // Melt Specific
    {
        id: 'shaders.melt.zoom',
        property: 'shaders.melt.zoom',
        label: 'Melt Zoom',
        min: 0.1, max: 32, step: 0.1,
        keyframes: [{ id: 'smz1', time: 0, value: 7.6, easing: 'linear' }]
    },
    {
        id: 'shaders.melt.speed',
        property: 'shaders.melt.speed',
        label: 'Melt Speed',
        min: 0, max: 12, step: 0.01,
        keyframes: [{ id: 'sms1', time: 0, value: 0.5, easing: 'linear' }]
    },
    {
        id: 'shaders.melt.detail',
        property: 'shaders.melt.detail',
        label: 'Melt Detail',
        min: 0, max: 1, step: 0.01,
        keyframes: [{ id: 'smd1', time: 0, value: 0.2, easing: 'linear' }]
    },
    // Flow Specific
    {
      id: 'shaders.flow.velocity',
      property: 'shaders.flow.velocity',
      label: 'Flow Velocity',
      min: 0, max: 1, step: 0.01,
      keyframes: [{ id: 'sfv1', time: 0, value: 0.2, easing: 'linear' }]
    },
    {
      id: 'shaders.flow.detail',
      property: 'shaders.flow.detail',
      label: 'Flow Detail',
      min: 10, max: 500, step: 1,
      keyframes: [{ id: 'sfd1', time: 0, value: 200, easing: 'linear' }]
    },
    {
      id: 'shaders.flow.twist',
      property: 'shaders.flow.twist',
      label: 'Flow Twist',
      min: -100, max: 100, step: 1,
      keyframes: [{ id: 'sft1', time: 0, value: 50, easing: 'linear' }]
    },
    // Glass Specific
    {
      id: 'shaders.glass.sides',
      property: 'shaders.glass.sides',
      label: 'Glass Sides',
      min: 2, max: 32, step: 1,
      keyframes: [{ id: 'sgs1', time: 0, value: 6, easing: 'linear' }]
    },
    {
      id: 'shaders.glass.density',
      property: 'shaders.glass.density',
      label: 'Glass Density',
      min: 1, max: 50, step: 0.1,
      keyframes: [{ id: 'sgd1', time: 0, value: 15.0, easing: 'linear' }]
    },
    {
      id: 'shaders.glass.glow',
      property: 'shaders.glass.glow',
      label: 'Glass Glow',
      min: 0, max: 5, step: 0.1,
      keyframes: [{ id: 'sgg1', time: 0, value: 1.2, easing: 'linear' }]
    },
    // Charged Cells Specific
    {
      id: 'shaders.chargedCells.scale',
      property: 'shaders.chargedCells.scale',
      label: 'Cells Scale',
      min: 1, max: 120, step: 0.1,
      keyframes: [{ id: 'sccs1', time: 0, value: 5.0, easing: 'linear' }]
    },
    ...['color1', 'color2', 'color3'].flatMap((color, i) => 
        ['r', 'g', 'b'].map((comp, j) => ({
            id: `shaders.chargedCells.${color}.${j}`,
            property: `shaders.chargedCells.${color}.${j}`,
            label: `Cells ${color} ${comp.toUpperCase()}`,
            min: 0, max: 1, step: 0.01,
            keyframes: [{ id: `sccc${i}${j}`, time: 0, value: [0.18, 0.7, 0.4, 0.58, 1.0, 0.15, 0.0, 0.65, 0.31][i*3+j], easing: 'linear' }]
        }))
    ),
    // Balatro Specific
    ...['color1', 'color2', 'color3'].flatMap((color, i) => 
        ['r', 'g', 'b'].map((comp, j) => ({
            id: `shaders.balatro.${color}.${j}`,
            property: `shaders.balatro.${color}.${j}`,
            label: `Balatro ${color} ${comp.toUpperCase()}`,
            min: 0, max: 1, step: 0.01,
            keyframes: [{ id: `sbc${i}${j}`, time: 0, value: [0.871, 0.267, 0.231, 0.0, 0.42, 0.706, 0.086, 0.137, 0.145][i*3+j], easing: 'linear' }]
        }))
    ),
  ],
};
