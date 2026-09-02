/**
 * BabylonEngine — Core 3D WebGPU / WebGL Engine Initializer.
 * Sets up atmospheric volumetric fog, moonlit directional shadow casting, and scene management.
 */
export class BabylonEngine {
  static async create(canvas) {
    let engine = null;

    // 1. Try WebGPU if available
    if (navigator.gpu && BABYLON.WebGPUEngine) {
      try {
        const webgpuEngine = new BABYLON.WebGPUEngine(canvas, {
          powerPreference: 'high-performance',
          antialias: true
        });
        await webgpuEngine.initAsync();
        engine = webgpuEngine;
        console.log('⚡ [BabylonEngine] WebGPU initialized successfully.');
      } catch (e) {
        console.warn('⚠️ [BabylonEngine] WebGPU failed, falling back to WebGL:', e);
      }
    }

    // 2. WebGL Fallback
    if (!engine) {
      engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        powerPreference: 'high-performance'
      });
      console.log('🎮 [BabylonEngine] WebGL Engine initialized.');
    }

    // 3. Create Scene
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.04, 0.06, 0.1, 1.0);

    // 4. Volumetric Exponential Fog (Dark Fantasy Atmosphere)
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.012;
    scene.fogColor = new BABYLON.Color3(0.04, 0.06, 0.1);

    // 5. Lighting Setup
    // Ambient Hemispheric Fill (Deep Navy to Abyssal Floor)
    const hemiLight = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.diffuse = new BABYLON.Color3(0.18, 0.24, 0.35);
    hemiLight.groundColor = new BABYLON.Color3(0.05, 0.07, 0.1);
    hemiLight.intensity = 0.85;

    // Key Directional Moon Light (Casting Soft Shadows)
    const dirLight = new BABYLON.DirectionalLight('moonLight', new BABYLON.Vector3(-0.4, -0.85, 0.35), scene);
    dirLight.position = new BABYLON.Vector3(20, 35, -20);
    dirLight.diffuse = new BABYLON.Color3(0.45, 0.65, 0.95);
    dirLight.specular = new BABYLON.Color3(0.6, 0.75, 1.0);
    dirLight.intensity = 1.4;

    // 6. Shadow Generator
    let shadowGenerator = null;
    try {
      shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
      shadowGenerator.usePoissonSampling = true;
      shadowGenerator.bias = 0.002;
    } catch (e) {
      console.warn('[BabylonEngine] Shadow generator setup note:', e);
    }

    // Handle Window Resize
    window.addEventListener('resize', () => {
      engine.resize();
    });

    return { engine, scene, shadowGenerator, dirLight, hemiLight };
  }
}
