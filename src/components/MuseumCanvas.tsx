import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MUSEUM_ZONES, type AvatarColorId, type MuseumZoneId } from '../data/museumExhibits';
import { animateExplorerCharacter, createExplorerCharacter, type ExplorerCharacter } from '../three/character';
import { buildMuseumWorld, type BoxCollider, type InteractiveExhibit } from '../three/museumWorld';
import type { DpadState } from './BottomDock';
import { playMuseumChime } from '../utils/audio';

interface MuseumCanvasProps {
  avatarColor: AvatarColorId;
  cameraMode: 'third' | 'first';
  soundEnabled: boolean;
  panelOpen: boolean;
  dpadRef: React.MutableRefObject<DpadState>;
  teleportTarget: { zone: MuseumZoneId; seq: number } | null;
  onNearZoneChange: (nearby: { zone: MuseumZoneId; title: string; exhibitId?: string } | null) => void;
  onInteractExhibit: (zone: MuseumZoneId, exhibitId?: string) => void;
}

// Pre-allocated math helpers (zero GC inside animation loop)
const _moveDir = new THREE.Vector3();
const _camDesired = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _mouseNdc = new THREE.Vector2();

function detectZoneByCoords(x: number, z: number): MuseumZoneId {
  if (x < -6.5) return 'meme_meaning';
  if (x > 6.5) return 'proper_korean';
  if (z < -6.5) return 'empathy_mirror';
  if (Math.hypot(x, z - 2.3) < 2.8) return 'lounge';
  return 'atrium';
}

function resolveCollision(x: number, z: number, colliders: BoxCollider[], radius = 0.42): { x: number; z: number } {
  let rx = THREE.MathUtils.clamp(x, -16.1, 16.1);
  let rz = THREE.MathUtils.clamp(z, -16.1, 16.1);

  for (let i = 0; i < colliders.length; i++) {
    const c = colliders[i];
    const minX = c.minX - radius;
    const maxX = c.maxX + radius;
    const minZ = c.minZ - radius;
    const maxZ = c.maxZ + radius;

    if (rx > minX && rx < maxX && rz > minZ && rz < maxZ) {
      const penLeft = Math.abs(rx - minX);
      const penRight = Math.abs(maxX - rx);
      const penTop = Math.abs(rz - minZ);
      const penBottom = Math.abs(maxZ - rz);
      const minPen = Math.min(penLeft, penRight, penTop, penBottom);
      if (minPen === penLeft) rx = minX;
      else if (minPen === penRight) rx = maxX;
      else if (minPen === penTop) rz = minZ;
      else rz = maxZ;
    }
  }
  return { x: rx, z: rz };
}

export function MuseumCanvas({
  avatarColor,
  cameraMode,
  soundEnabled,
  panelOpen,
  dpadRef,
  teleportTarget,
  onNearZoneChange,
  onInteractExhibit,
}: MuseumCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);

  const characterRef = useRef<ExplorerCharacter | null>(null);
  const cameraModeRef = useRef(cameraMode);
  const soundEnabledRef = useRef(soundEnabled);
  const panelOpenRef = useRef(panelOpen);
  const onNearZoneChangeRef = useRef(onNearZoneChange);
  const onInteractExhibitRef = useRef(onInteractExhibit);
  const walkDestinationRef = useRef<THREE.Vector3 | null>(null);
  const yawRef = useRef(0);
  const pitchRef = useRef(0.32);

  useEffect(() => {
    cameraModeRef.current = cameraMode;
    if (characterRef.current) {
      characterRef.current.group.visible = cameraMode === 'third';
    }
  }, [cameraMode]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    panelOpenRef.current = panelOpen;
  }, [panelOpen]);

  useEffect(() => {
    onNearZoneChangeRef.current = onNearZoneChange;
  }, [onNearZoneChange]);

  useEffect(() => {
    onInteractExhibitRef.current = onInteractExhibit;
  }, [onInteractExhibit]);

  useEffect(() => {
    if (characterRef.current) {
      characterRef.current.setOutfitColor(avatarColor);
    }
  }, [avatarColor]);

  useEffect(() => {
    if (!teleportTarget || !characterRef.current) return;
    const zone = MUSEUM_ZONES.find((z) => z.id === teleportTarget.zone);
    if (!zone) return;
    characterRef.current.group.position.set(zone.position[0], 0, zone.position[2]);
    walkDestinationRef.current = null;
    const dx = zone.lookAt[0] - zone.position[0];
    const dz = zone.lookAt[2] - zone.position[2];
    const targetYaw = Math.atan2(dx, dz);
    characterRef.current.group.rotation.y = targetYaw;
    yawRef.current = targetYaw + Math.PI;
  }, [teleportTarget]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);

    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#EFE6D5');
    scene.fog = new THREE.Fog('#EFE6D5', 22, 44);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      58,
      (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
      0.1,
      80,
    );

    // 3-Point Studio Daylight Rig (<= 3 shadow casters)
    const hemiLight = new THREE.HemisphereLight(0xfef9ef, 0xd4c7b4, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e4, 1.35);
    keyLight.position.set(10, 18, 12);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 45;
    const d = 18;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.45);
    fillLight.position.set(-12, 10, -10);
    scene.add(fillLight);

    const world = buildMuseumWorld(renderer);
    scene.add(world.root);

    const character = createExplorerCharacter(avatarColor);
    character.group.position.set(0, 0, 5.5);
    character.group.rotation.y = Math.PI; // Face North toward Hangul centerpiece
    character.group.visible = cameraModeRef.current === 'third';
    characterRef.current = character;
    scene.add(character.group);
    yawRef.current = 0;

    // Walk destination ring indicator on floor
    const destGeo = new THREE.RingGeometry(0.28, 0.42, 24);
    const destMat = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const destMarker = new THREE.Mesh(destGeo, destMat);
    destMarker.rotation.x = -Math.PI / 2;
    destMarker.position.y = 0.04;
    destMarker.visible = false;
    scene.add(destMarker);

    camera.position.set(0, 3.2, 10.2);
    camera.lookAt(0, 1.4, 2.5);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Input state
    const keys: Record<string, boolean> = {};
    let isDragging = false;
    let dragDistance = 0;
    let lastPointerX = 0;
    let lastPointerY = 0;

    const raycaster = new THREE.Raycaster();
    const clickTargets = world.interactables.map((i) => i.hitMesh);

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (panelOpenRef.current) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (soundEnabledRef.current) playMuseumChime('discover');
        if (lastNearbyRef && lastNearbyRef.zone !== 'atrium') {
          onInteractExhibitRef.current(lastNearbyRef.zone, lastNearbyRef.exhibitId);
        } else {
          const currentZone = detectZoneByCoords(
            character.group.position.x,
            character.group.position.z,
          );
          onInteractExhibitRef.current(
            currentZone === 'atrium' ? 'proper_korean' : currentZone,
            lastNearbyRef?.exhibitId,
          );
        }
        return;
      }

      keys[e.code] = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragDistance = 0;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;
        dragDistance += Math.abs(dx) + Math.abs(dy);
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        yawRef.current -= dx * 0.006;
        pitchRef.current = THREE.MathUtils.clamp(pitchRef.current + dy * 0.004, 0.08, 0.78);
      } else {
        // Lightweight hover cursor feedback on clickable exhibits
        const rect = renderer.domElement.getBoundingClientRect();
        _mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        _mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.layers.set(1);
        raycaster.setFromCamera(_mouseNdc, camera);
        const hits = raycaster.intersectObjects(clickTargets, false);
        renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      if (dragDistance > 8) return; // Was a camera drag, not a click

      const rect = renderer.domElement.getBoundingClientRect();
      _mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // 1. Check clickable exhibits on layer 1
      raycaster.layers.set(1);
      raycaster.setFromCamera(_mouseNdc, camera);
      const exhibitHits = raycaster.intersectObjects(clickTargets, false);
      if (exhibitHits.length > 0) {
        const hitMesh = exhibitHits[0].object;
        const found: InteractiveExhibit | undefined = world.interactables.find((it) => it.hitMesh === hitMesh);
        if (found) {
          if (soundEnabledRef.current) playMuseumChime('discover');
          onInteractExhibitRef.current(found.zone, found.exhibitId);
          return;
        }
      }

      // 2. Otherwise walk to floor intersection point
      raycaster.layers.set(0);
      raycaster.setFromCamera(_mouseNdc, camera);
      const floorHits = raycaster.intersectObject(world.floorMesh, false);
      if (floorHits.length > 0) {
        const pt = floorHits[0].point;
        const clamped = resolveCollision(pt.x, pt.z, world.colliders);
        walkDestinationRef.current = new THREE.Vector3(clamped.x, 0, clamped.z);
        destMarker.position.set(clamped.x, 0.04, clamped.z);
        destMarker.visible = true;
      }
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const onContextLost = (ev: Event) => {
      ev.preventDefault();
      setWebglError(true);
    };
    const onContextRestored = () => {
      setWebglError(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    let lastNearbyKey = '';
    let lastNearbyRef: { zone: MuseumZoneId; title: string; exhibitId?: string } | null = null;
    let lastZoneCheck = '';

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();

      const dpad = dpadRef.current;
      const moveFwd = (keys['KeyW'] || keys['ArrowUp'] || dpad.forward ? 1 : 0) -
        (keys['KeyS'] || keys['ArrowDown'] || dpad.backward ? 1 : 0);
      const moveSide = (keys['KeyD'] || keys['ArrowRight'] || dpad.right ? 1 : 0) -
        (keys['KeyA'] || keys['ArrowLeft'] || dpad.left ? 1 : 0);

      let isMoving = false;
      const speed = 5.4;

      if (moveFwd !== 0 || moveSide !== 0) {
        // Cancel floor click-to-walk when keyboard/D-pad used
        walkDestinationRef.current = null;
        destMarker.visible = false;

        // Forward direction from camera yaw
        const sinY = Math.sin(yawRef.current);
        const cosY = Math.cos(yawRef.current);
        _moveDir.set(
          -sinY * moveFwd + cosY * moveSide,
          0,
          -cosY * moveFwd - sinY * moveSide,
        );
        if (_moveDir.lengthSq() > 0.001) {
          _moveDir.normalize();
          isMoving = true;
        }
      } else if (walkDestinationRef.current) {
        const dx = walkDestinationRef.current.x - character.group.position.x;
        const dz = walkDestinationRef.current.z - character.group.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.22) {
          walkDestinationRef.current = null;
          destMarker.visible = false;
        } else {
          _moveDir.set(dx / dist, 0, dz / dist);
          isMoving = true;
          destMarker.rotation.z = elapsed * 2;
        }
      }

      if (isMoving) {
        const nextX = character.group.position.x + _moveDir.x * speed * delta;
        const nextZ = character.group.position.z + _moveDir.z * speed * delta;
        const resolved = resolveCollision(nextX, nextZ, world.colliders);
        character.group.position.x = resolved.x;
        character.group.position.z = resolved.z;

        const targetAngle = Math.atan2(_moveDir.x, _moveDir.z);
        let diff = targetAngle - character.group.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        character.group.rotation.y += diff * (1 - Math.exp(-12 * delta));
      }

      animateExplorerCharacter(character, isMoving, 1, delta, elapsed);
      world.update(elapsed);

      // Camera smooth follow
      const pos = character.group.position;
      if (cameraModeRef.current === 'third') {
        const camDist = 5.4;
        const camHeight = 2.0 + Math.sin(pitchRef.current) * 3.4;
        const horizDist = Math.cos(pitchRef.current) * camDist;
        _camDesired.set(
          pos.x + Math.sin(yawRef.current) * horizDist,
          camHeight,
          pos.z + Math.cos(yawRef.current) * horizDist,
        );
        _camDesired.x = THREE.MathUtils.clamp(_camDesired.x, -16.2, 16.2);
        _camDesired.z = THREE.MathUtils.clamp(_camDesired.z, -16.2, 16.2);
        camera.position.lerp(_camDesired, 1 - Math.exp(-9 * delta));
        _camTarget.set(pos.x, 1.35, pos.z);
        camera.lookAt(_camTarget);
      } else {
        // First-person VR eye level
        _camDesired.set(pos.x, 1.62, pos.z);
        camera.position.lerp(_camDesired, 1 - Math.exp(-15 * delta));
        _camTarget.set(
          pos.x - Math.sin(yawRef.current) * 5,
          1.62 - Math.sin(pitchRef.current - 0.25) * 3,
          pos.z - Math.cos(yawRef.current) * 5,
        );
        camera.lookAt(_camTarget);
      }

      // Check proximity to interactive stations / artworks
      let closest: InteractiveExhibit | null = null;
      let closestDist = 2.8;
      for (let i = 0; i < world.interactables.length; i++) {
        const item = world.interactables[i];
        const dSq =
          (item.position.x - pos.x) * (item.position.x - pos.x) +
          (item.position.z - pos.z) * (item.position.z - pos.z);
        if (dSq < closestDist * closestDist) {
          closestDist = Math.sqrt(dSq);
          closest = item;
        }
      }

      const nearbyZone = detectZoneByCoords(pos.x, pos.z);
      if (closest) {
        const key = `${closest.id}:${closest.zone}`;
        if (key !== lastNearbyKey) {
          lastNearbyKey = key;
          lastNearbyRef = {
            zone: closest.zone,
            title: closest.title,
            exhibitId: closest.exhibitId,
          };
          if (soundEnabledRef.current) playMuseumChime('discover');
          onNearZoneChangeRef.current(lastNearbyRef);
        }
      } else if (nearbyZone !== lastZoneCheck) {
        lastZoneCheck = nearbyZone;
        lastNearbyKey = '';
        const meta = MUSEUM_ZONES.find((z) => z.id === nearbyZone);
        lastNearbyRef = meta ? { zone: meta.id, title: meta.title } : null;
        onNearZoneChangeRef.current(lastNearbyRef);
      }

      renderer.render(scene, camera);
      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    if (isSoftwareGl) afterDraw(tick);
    else frameId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      destGeo.dispose();
      destMat.dispose();
      envTarget.dispose();
      world.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#FBF6EC] p-8 text-center">
        <h2 className="font-display text-2xl font-bold text-slate-900">
          3D 서당을 불러오는 중이에요
        </h2>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          그래픽 화면을 준비하지 못했어요. 상단 메뉴에서 각 글방을 클릭해 바로 학습을 이어갈 수 있어요.
        </p>
      </div>
    );
  }

  return <div ref={mountRef} className="h-full w-full select-none touch-none" />;
}
