import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";

const ThreeMergedScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const hasMounted = useRef(false);
  const loadedModels: THREE.Object3D[] = [];
  const labelSprites = useRef<THREE.Sprite[]>([]); // Store labels separately

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    // Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, 25);
    camera.lookAt(0, 5, 0);
    camera.far = 1000;
    camera.updateProjectionMatrix();
    cameraRef.current = camera;

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    } else {
      console.error("mountRef.current is null.");
    }

    // Lights
    const directionalLight = new THREE.DirectionalLight(0xff3cf6, 10);
    directionalLight.intensity = 10
    directionalLight.position.set(3, 0, -3);
    scene.add(directionalLight);
    directionalLight.target.position.set(0, 0, 0);

    const directionalLight2 = new THREE.DirectionalLight(0x00abff, 10);
    directionalLight2.intensity = 10
    directionalLight2.position.set(-3, 0, -3);
    scene.add(directionalLight2);
    directionalLight2.target.position.set(0, 0, 0);

    

    // Utility function to log scene objects
    const logSceneObjects = (message: string) => {
      const objects: string[] = [];
      scene.traverse((child) => {
        objects.push(child.name || child.uuid);
      });
      console.debug(
        `[DEBUG] ${message} | Total objects: ${objects.length}`,
        objects
      );
    };

    logSceneObjects("After adding lights");

    // Loader Setup
    const loader = new GLTFLoader();

    // Function to create a text sprite
    const createTextSprite = (message: string): THREE.Sprite => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      canvas.width = 256;
      canvas.height = 64;
      context.font = "Bold 30px Arial";
      context.fillStyle = "white";
      context.textAlign = "center";
      context.fillText(message, 128, 40);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(4, 1, 2); // Your adjusted size
      return sprite;
    };

    // Load Background Model
    loader.load("/StageandGlass.gltf", (gltf) => {
      const background = gltf.scene;
      background.scale.set(10, 10, 10);
      background.position.set(0, 0, 0);
      background.renderOrder = -1;
      background.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.transparent = true;
            child.material.opacity = 0.8;
          }
        }
      });
      scene.add(background);
      loadedModels.push(background);
      console.debug("[DEBUG] Background model added.");
      logSceneObjects("After adding Background Model");

      

      // Add labels after background is loaded
      labelSprites.current.forEach((sprite) => {
        if (!scene.children.includes(sprite)) {
          scene.add(sprite);
          console.debug("[DEBUG] Re-added label sprite to scene.");
        }
      });
    });

    // Load Marble Models and Invisible Buttons with Labels
    loader.load(
      "/marbel.gltf",
      (gltf) => {
        const positions = [
          { x: -10, y: 3, url: "https://example.com/1" },
          { x: -5, y: 3, url: "https://example.com/2" },
          { x: 0, y: 3, url: "https://example.com/3" },
          { x: 5, y: 3, url: "https://example.com/4" },
          { x: 10, y: 3, url: "https://example.com/5" },
        ];
        const labels = [
          "Events",
          "Events",
          "Location",
          "About Us",
          "Contact Us",
        ];

        positions.forEach((pos, index) => {
          const model = gltf.scene.clone(true);
          model.scale.set(1, 1, 1);
          model.position.set(pos.x, pos.y, 15);
          model.name = `marble-${index}`;

          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              child.userData.url = pos.url;
              child.material = child.material.clone();
              child.material.transparent = false;
              child.material.opacity = 1;
              child.geometry.computeBoundingSphere();
              child.geometry.computeBoundingBox();
            }
          });

          scene.add(model);
          loadedModels.push(model);
          console.debug(
            `[DEBUG] Marble ${index + 1} added at x: ${pos.x}, y: ${pos.y}`
          );
          logSceneObjects(`After adding Marble ${index + 1}`);

          // Add Invisible Button above each Marble
          const buttonGeometry = new THREE.PlaneGeometry(2, 2);
          const buttonMaterial = new THREE.MeshBasicMaterial({
            visible: false,
          });
          const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
          button.position.set(pos.x, pos.y + 2, 0);
          button.userData.url = pos.url;
          scene.add(button);
          loadedModels.push(button);
          console.debug(
            `[DEBUG] Invisible button for Marble ${index + 1} added.`
          );
          logSceneObjects(
            `After adding Invisible Button for Marble ${index + 1}`
          );

          // Create and store Label below each Marble
          const labelSprite = createTextSprite(labels[index]);
          labelSprite.position.set(pos.x, pos.y-1, 16.5); // Position below marble
          labelSprites.current[index] = labelSprite;
          scene.add(labelSprite);
          loadedModels.push(labelSprite);
          console.debug(
            `[DEBUG] Label '${labels[index]}' added for Marble ${index + 1}`
          );
          logSceneObjects(`After adding Label for Marble ${index + 1}`);
        });
      },
      undefined,
      (error) => console.error(error)
    );

    // Click Handler
    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        let object: THREE.Object3D = intersects[0].object;
        while (!object.userData.url && object.parent) {
          object = object.parent;
        }
        if (object.userData.url) {
          window.open(object.userData.url, "_blank");
        }
      }
    };

    renderer.domElement.addEventListener("click", handleClick);
    if (mountRef.current) {
      mountRef.current.addEventListener("click", handleClick);
    }

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (composerRef.current) {
        composerRef.current.render();
      } else if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(scene, camera);
      }
    };
    animate();

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener("click", handleClick);
      if (mountRef.current) {
        mountRef.current.removeEventListener("click", handleClick);
      }
      renderer.dispose();
      loadedModels.forEach((model) => scene.remove(model));
      loadedModels.length = 0;
      labelSprites.current = []; // Clear label references
      console.debug("[DEBUG] Cleaned up loaded models.");
    };
  }, []);

  return <div ref={mountRef} className="canvas" />;
};

export default ThreeMergedScene;
