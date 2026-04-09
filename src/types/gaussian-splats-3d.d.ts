declare module "@mkkellogg/gaussian-splats-3d" {
  import * as THREE from "three";

  export class Viewer {
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;

    constructor(options?: {
      cameraUp?: number[];
      initialCameraPosition?: number[];
      initialCameraLookAt?: number[];
      rootElement?: HTMLElement;
      dynamicScene?: boolean;
      sharedMemoryForWorkers?: boolean;
      selfDrivenMode?: boolean;
    });

    addSplatScene(url: string, options?: {
      showLoadingUI?: boolean;
      splatAlphaRemovalThreshold?: number;
    }): Promise<void>;

    start(): void;
    dispose(): void;
    update(): void;
  }
}
