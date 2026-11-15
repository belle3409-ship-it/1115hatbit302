import * as THREE from 'three';
import type { MuseumZoneId } from '../data/museumExhibits';
import {
  createHangulBlockTexture,
  createHanjiWallTexture,
  createMaruFloorTexture,
  createPlaqueTexture,
} from './textures';

import welcomeImgUrl from '../assets/images/seodang_welcome_banner_1794710182161.jpg';
import youngTeacherImgUrl from '../assets/images/seodang_young_teacher_1794712610117.jpg';
import properKoreanImgUrl from '../assets/images/seodang_proper_korean_1794710183145.jpg';
import empathyMirrorImgUrl from '../assets/images/seodang_empathy_mirror_1794710183040.jpg';

export interface InteractiveExhibit {
  id: string;
  zone: MuseumZoneId;
  exhibitId?: string;
  title: string;
  position: THREE.Vector3;
  hitMesh: THREE.Mesh;
}

export interface BoxCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface MuseumWorld {
  root: THREE.Group;
  interactables: InteractiveExhibit[];
  colliders: BoxCollider[];
  floorMesh: THREE.Mesh;
  update: (elapsed: number) => void;
  dispose: () => void;
}

export function buildMuseumWorld(renderer: THREE.WebGLRenderer): MuseumWorld {
  const root = new THREE.Group();
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  const disposables: { dispose: () => void }[] = [];
  const interactables: InteractiveExhibit[] = [];
  const colliders: BoxCollider[] = [];

  const textureLoader = new THREE.TextureLoader();
  function loadGalleryImage(url: string): THREE.Texture {
    const tex = textureLoader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;
    disposables.push(tex);
    return tex;
  }

  const welcomeTex = loadGalleryImage(welcomeImgUrl);
  const youngTeacherTex = loadGalleryImage(youngTeacherImgUrl);
  const properKoreanTex = loadGalleryImage(properKoreanImgUrl);
  const empathyMirrorTex = loadGalleryImage(empathyMirrorImgUrl);

  // Shared Hanok Seodang PBR Materials
  const floorTex = createMaruFloorTexture(maxAnisotropy);
  const wallTex = createHanjiWallTexture('#F5EDE0', maxAnisotropy);
  disposables.push(floorTex, wallTex);

  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    roughness: 0.45,
    metalness: 0.04,
  });
  const wallMat = new THREE.MeshStandardMaterial({
    map: wallTex,
    roughness: 0.88,
    metalness: 0.0,
  });
  const cedarWoodMat = new THREE.MeshStandardMaterial({
    color: 0x7c4a24,
    roughness: 0.62,
    metalness: 0.04,
  });
  const warmOakMat = new THREE.MeshStandardMaterial({
    color: 0xa16a38,
    roughness: 0.52,
    metalness: 0.03,
  });
  const brassGoldMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.26,
    metalness: 0.78,
  });
  const cushionRedMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    roughness: 0.85,
    metalness: 0.0,
  });
  const cushionBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.85,
    metalness: 0.0,
  });
  const stonePedMat = new THREE.MeshStandardMaterial({
    color: 0xe7dfd3,
    roughness: 0.55,
    metalness: 0.04,
  });
  disposables.push(
    floorMat,
    wallMat,
    cedarWoodMat,
    warmOakMat,
    brassGoldMat,
    cushionRedMat,
    cushionBlueMat,
    stonePedMat,
  );

  // 1. Main 대청마루 Wooden Floor (34m x 34m)
  const floorGeo = new THREE.PlaneGeometry(34, 34);
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  floorMesh.name = 'SeodangMaruFloor';
  root.add(floorMesh);
  disposables.push(floorGeo);

  function addWall(x: number, z: number, w: number, h: number, d: number) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(x, h / 2, z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    root.add(mesh);
    disposables.push(geo);

    colliders.push({
      minX: x - w / 2 - 0.45,
      maxX: x + w / 2 + 0.45,
      minZ: z - d / 2 - 0.45,
      maxZ: z + d / 2 + 0.45,
    });
  }

  // Outer Hanok Perimeter Walls
  addWall(0, -17, 34, 5.4, 0.55);
  addWall(0, 17, 34, 5.4, 0.55);
  addWall(-17, 0, 0.55, 5.4, 34);
  addWall(17, 0, 0.55, 5.4, 34);

  // Interior Hanok Wing Partitions
  addWall(-6.5, -10.5, 0.42, 4.6, 12.5);
  addWall(-6.5, 10.5, 0.42, 4.6, 12.5);
  addWall(6.5, -10.5, 0.42, 4.6, 12.5);
  addWall(6.5, 10.5, 0.42, 4.6, 12.5);
  addWall(-11.2, -6.5, 9.4, 4.6, 0.42);
  addWall(11.2, -6.5, 9.4, 4.6, 0.42);

  // Hanok Round Wooden Pillars
  const pillarGeo = new THREE.CylinderGeometry(0.24, 0.27, 5.4, 16);
  const pillarCoords: [number, number][] = [
    [-6.5, -4.2],
    [-6.5, 4.2],
    [6.5, -4.2],
    [6.5, 4.2],
    [-6.5, -6.5],
    [6.5, -6.5],
    [-16.5, -16.5],
    [16.5, -16.5],
    [-16.5, 16.5],
    [16.5, 16.5],
  ];
  pillarCoords.forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(pillarGeo, cedarWoodMat);
    pillar.position.set(px, 2.7, pz);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    root.add(pillar);
  });
  disposables.push(pillarGeo);

  // Overhead Hanok Rafters & Crossbeams
  const mainBeamGeo = new THREE.BoxGeometry(34, 0.34, 0.42);
  for (let bz = -12; bz <= 12; bz += 6) {
    const beam = new THREE.Mesh(mainBeamGeo, cedarWoodMat);
    beam.position.set(0, 5.2, bz);
    root.add(beam);
  }
  const crossBeamGeo = new THREE.BoxGeometry(0.24, 0.24, 34);
  for (let bx = -12; bx <= 12; bx += 6) {
    const cBeam = new THREE.Mesh(crossBeamGeo, cedarWoodMat);
    cBeam.position.set(bx, 5.38, 0);
    root.add(cBeam);
  }
  disposables.push(mainBeamGeo, crossBeamGeo);

  // Traditional Korean Cheongsachorong Lanterns
  const lanternCoords: [number, number][] = [
    [-4.2, -4.2],
    [4.2, -4.2],
    [-4.2, 4.2],
    [4.2, 4.2],
    [-11.5, 0],
    [11.5, 0],
    [0, -11.5],
  ];
  const lanternCordGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.1, 8);
  const lanternTopGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.36, 16);
  const lanternBotGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.36, 16);
  const redSilkMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    emissive: 0xf43f5e,
    emissiveIntensity: 0.35,
    roughness: 0.6,
  });
  const blueSilkMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.3,
    roughness: 0.6,
  });
  disposables.push(lanternCordGeo, lanternTopGeo, lanternBotGeo, redSilkMat, blueSilkMat);

  lanternCoords.forEach(([lx, lz]) => {
    const lGroup = new THREE.Group();
    lGroup.position.set(lx, 4.6, lz);
    const cord = new THREE.Mesh(lanternCordGeo, cedarWoodMat);
    cord.position.y = 0.2;
    const topSilk = new THREE.Mesh(lanternTopGeo, redSilkMat);
    topSilk.position.y = -0.35;
    const botSilk = new THREE.Mesh(lanternBotGeo, blueSilkMat);
    botSilk.position.y = -0.7;
    lGroup.add(cord, topSilk, botSilk);
    root.add(lGroup);
  });

  // Woven Silk Floor Runner Strips
  function addGuideStrip(x: number, z: number, w: number, d: number, hex: string) {
    const geo = new THREE.PlaneGeometry(w, d);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hex),
      roughness: 0.75,
      metalness: 0.02,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const strip = new THREE.Mesh(geo, mat);
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(x, 0.025, z);
    strip.receiveShadow = true;
    root.add(strip);
    disposables.push(geo, mat);
  }
  addGuideStrip(-5.5, 0, 7.0, 0.85, '#38BDF8'); // To 1방 따봄쌤의 밈 방
  addGuideStrip(5.5, 0, 7.0, 0.85, '#34D399');  // To 2방 따봄쌤의 바른 우리말 방
  addGuideStrip(0, -5.5, 0.85, 7.0, '#FB7185'); // To 3방 마음 거울방

  function addFramedArtwork(opts: {
    id: string;
    zone: MuseumZoneId;
    exhibitId?: string;
    title: string;
    x: number;
    y: number;
    z: number;
    rotY: number;
    width: number;
    height: number;
    texture: THREE.Texture;
  }) {
    const frameGroup = new THREE.Group();
    frameGroup.position.set(opts.x, opts.y, opts.z);
    frameGroup.rotation.y = opts.rotY;

    const borderGeo = new THREE.BoxGeometry(opts.width + 0.3, opts.height + 0.3, 0.12);
    const borderMesh = new THREE.Mesh(borderGeo, cedarWoodMat);
    borderMesh.castShadow = true;
    frameGroup.add(borderMesh);

    const artGeo = new THREE.PlaneGeometry(opts.width, opts.height);
    const artMat = new THREE.MeshStandardMaterial({
      map: opts.texture,
      roughness: 0.5,
      metalness: 0.02,
    });
    const artMesh = new THREE.Mesh(artGeo, artMat);
    artMesh.position.z = 0.07;
    artMesh.layers.enable(1);
    frameGroup.add(artMesh);

    root.add(frameGroup);
    disposables.push(borderGeo, artGeo, artMat);

    interactables.push({
      id: opts.id,
      zone: opts.zone,
      exhibitId: opts.exhibitId,
      title: opts.title,
      position: new THREE.Vector3(opts.x, 0, opts.z),
      hitMesh: artMesh,
    });
  }

  const animatedRings: THREE.Mesh[] = [];
  function addStationPedestal(opts: {
    id: string;
    zone: MuseumZoneId;
    title: string;
    x: number;
    z: number;
    accentHex: string;
  }) {
    const pedGroup = new THREE.Group();
    pedGroup.position.set(opts.x, 0, opts.z);

    const ringGeo = new THREE.RingGeometry(0.95, 1.15, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(opts.accentHex),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.78,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    pedGroup.add(ring);
    animatedRings.push(ring);

    const standGeo = new THREE.BoxGeometry(0.86, 0.95, 0.62);
    const stand = new THREE.Mesh(standGeo, warmOakMat);
    stand.position.y = 0.475;
    stand.castShadow = true;
    stand.receiveShadow = true;
    pedGroup.add(stand);

    const capGeo = new THREE.BoxGeometry(0.98, 0.1, 0.72);
    const capMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(opts.accentHex),
      roughness: 0.35,
      metalness: 0.15,
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.98;
    cap.rotation.x = 0.25;
    cap.castShadow = true;
    cap.layers.enable(1);
    pedGroup.add(cap);

    const orbGeo = new THREE.OctahedronGeometry(0.2, 0);
    const orbMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(opts.accentHex),
      emissive: new THREE.Color(opts.accentHex),
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.3,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.y = 1.55;
    orb.layers.enable(1);
    pedGroup.add(orb);

    root.add(pedGroup);
    disposables.push(ringGeo, ringMat, standGeo, capGeo, capMat, orbGeo, orbMat);

    colliders.push({
      minX: opts.x - 0.6,
      maxX: opts.x + 0.6,
      minZ: opts.z - 0.6,
      maxZ: opts.z + 0.6,
    });

    interactables.push({
      id: opts.id,
      zone: opts.zone,
      title: opts.title,
      position: new THREE.Vector3(opts.x, 0, opts.z),
      hitMesh: orb,
    });
  }

  const deskTopGeo = new THREE.BoxGeometry(1.4, 0.1, 0.75);
  const deskLegGeo = new THREE.BoxGeometry(0.12, 0.42, 0.65);
  const cushionGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.08, 16);
  disposables.push(deskTopGeo, deskLegGeo, cushionGeo);

  function addSeoanDesk(x: number, z: number, rotY: number, isRedCushion: boolean) {
    const dGroup = new THREE.Group();
    dGroup.position.set(x, 0, z);
    dGroup.rotation.y = rotY;

    const top = new THREE.Mesh(deskTopGeo, warmOakMat);
    top.position.y = 0.45;
    top.castShadow = true;
    top.receiveShadow = true;
    const legL = new THREE.Mesh(deskLegGeo, cedarWoodMat);
    legL.position.set(-0.56, 0.21, 0);
    const legR = new THREE.Mesh(deskLegGeo, cedarWoodMat);
    legR.position.set(0.56, 0.21, 0);
    const cushion = new THREE.Mesh(cushionGeo, isRedCushion ? cushionRedMat : cushionBlueMat);
    cushion.position.set(0, 0.04, 0.62);
    cushion.receiveShadow = true;
    dGroup.add(top, legL, legR, cushion);
    root.add(dGroup);

    colliders.push({
      minX: x - (Math.abs(Math.sin(rotY)) > 0.5 ? 0.5 : 0.78),
      maxX: x + (Math.abs(Math.sin(rotY)) > 0.5 ? 0.5 : 0.78),
      minZ: z - (Math.abs(Math.sin(rotY)) > 0.5 ? 0.78 : 0.5),
      maxZ: z + (Math.abs(Math.sin(rotY)) > 0.5 ? 0.78 : 0.5),
    });
  }

  // ==========================================================
  // CENTRAL 대청마루 & 질문·답변방
  // ==========================================================
  addFramedArtwork({
    id: 'art_welcome',
    zone: 'atrium',
    title: '반짝반짝 바른 우리말 서당 안내',
    x: 0,
    y: 2.5,
    z: 16.6,
    rotY: Math.PI,
    width: 6.4,
    height: 3.6,
    texture: welcomeTex,
  });

  const centerPed = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.75, 1.4), cedarWoodMat);
  centerPed.position.set(0, 0.375, 0);
  centerPed.receiveShadow = true;
  centerPed.castShadow = true;
  root.add(centerPed);
  disposables.push(centerPed.geometry);
  colliders.push({ minX: -1.4, maxX: 1.4, minZ: -0.85, maxZ: 0.85 });

  const hangulGroup = new THREE.Group();
  hangulGroup.position.set(0, 1.75, 0);
  const blockDefs = [
    { char: '바', bg: '#0284C7', x: -0.82, y: 0.2 },
    { char: '른', bg: '#059669', x: 0, y: 0.45 },
    { char: '말', bg: '#E11D48', x: 0.82, y: 0.2 },
  ];
  const blockGeo = new THREE.BoxGeometry(0.68, 0.68, 0.68);
  disposables.push(blockGeo);
  blockDefs.forEach((b) => {
    const tex = createHangulBlockTexture(b.char, b.bg, '#FFFFFF', maxAnisotropy);
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.38, metalness: 0.05 });
    const mesh = new THREE.Mesh(blockGeo, mat);
    mesh.position.set(b.x, b.y, 0);
    mesh.castShadow = true;
    mesh.layers.enable(1);
    hangulGroup.add(mesh);
    disposables.push(tex, mat);
    interactables.push({
      id: `hangul_${b.char}`,
      zone: 'lounge',
      title: '따봄쌤 질문·답변방 열기',
      position: new THREE.Vector3(0, 0, 0),
      hitMesh: mesh,
    });
  });
  root.add(hangulGroup);

  addStationPedestal({
    id: 'station_lounge',
    zone: 'lounge',
    title: '따봄쌤 질문·답변방 열기',
    x: 0,
    z: 2.3,
    accentHex: '#7C3AED',
  });

  addSeoanDesk(-3.8, 7.0, 0, true);
  addSeoanDesk(3.8, 7.0, 0, false);

  // ==========================================================
  // 1방: 따봄쌤의 요즘 밈 방 (West Wing)
  // ==========================================================
  addFramedArtwork({
    id: 'art_zone_meme',
    zone: 'meme_meaning',
    title: '1방 · 따봄쌤의 요즘 밈 방',
    x: -16.6,
    y: 2.5,
    z: 0,
    rotY: Math.PI / 2,
    width: 4.8,
    height: 3.6,
    texture: youngTeacherTex,
  });

  const memePlaques = [
    { id: 'take_the_l', word: 'L을 가져가', sub: 'Take the L! 게임에서 졌을 때 장난치며 쓰는 말', z: -9.5, x: -16.6, rotY: Math.PI / 2 },
    { id: 'six_seven', word: '67 (식스세븐)', sub: '리듬에 맞춰 손을 흔들며 외치는 요즘 유행 밈', z: 9.5, x: -16.6, rotY: Math.PI / 2 },
    { id: 'eojjeoltv', word: '어쩔티비', sub: '어쩌라고 TV나 봐! 장난스러운 대답 밈', x: -11.8, z: -16.6, rotY: 0 },
    { id: 'kingbatne', word: '킹받네', sub: '왕(King) + 열받네, 크게 속상할 때 쓰는 말', x: -11.8, z: 16.6, rotY: Math.PI },
  ];
  memePlaques.forEach((p) => {
    const tex = createPlaqueTexture(p.word, p.sub, '#0284C7', '1방 · 따봄쌤 밈 풀이', maxAnisotropy);
    disposables.push(tex);
    addFramedArtwork({
      id: `frame_${p.id}`,
      zone: 'meme_meaning',
      exhibitId: p.id,
      title: `${p.word} 풀이 보기`,
      x: p.x,
      y: 2.35,
      z: p.z,
      rotY: p.rotY,
      width: 3.4,
      height: 2.55,
      texture: tex,
    });
  });

  addSeoanDesk(-11.5, -5.5, 0, false);
  addSeoanDesk(-11.5, 5.5, Math.PI, true);

  addStationPedestal({
    id: 'station_meme_meaning',
    zone: 'meme_meaning',
    title: '1방 · 따봄쌤의 밈 방 열기',
    x: -11.5,
    z: 0,
    accentHex: '#0284C7',
  });

  // ==========================================================
  // 2방: 따봄쌤의 바른 우리말 방 (East Wing)
  // ==========================================================
  addFramedArtwork({
    id: 'art_zone_proper',
    zone: 'proper_korean',
    title: '2방 · 따봄쌤의 바른 우리말 방',
    x: 16.6,
    y: 2.5,
    z: 0,
    rotY: -Math.PI / 2,
    width: 4.8,
    height: 3.6,
    texture: properKoreanTex,
  });

  const properPlaques = [
    { id: 'take_the_l', word: 'L을 가져가 → 고운 말', sub: '아쉽지만 이번엔 내가 이겼네! 다음엔 같이 잘하자', z: -9.5, x: 16.6, rotY: -Math.PI / 2 },
    { id: 'six_seven', word: '67(식스세븐) → 바른 말', sub: '우와 67쪽이네! 우리 이제 수업에 집중해 보자', z: 9.5, x: 16.6, rotY: -Math.PI / 2 },
    { id: 'eojjeoltv', word: '어쩔티비 → 바른 말', sub: '지금 조금 바빠서 쉬는 시간에 다시 이야기하자', x: 11.8, z: -16.6, rotY: 0 },
    { id: 'kingbatne', word: '킹받네 → 바른 말', sub: '열심히 했는데 무너져서 정말 아쉽고 속상해', x: 11.8, z: 16.6, rotY: Math.PI },
  ];
  properPlaques.forEach((p) => {
    const tex = createPlaqueTexture(p.word, p.sub, '#059669', '2방 · 따봄쌤 바른 우리말', maxAnisotropy);
    disposables.push(tex);
    addFramedArtwork({
      id: `proper_${p.id}`,
      zone: 'proper_korean',
      exhibitId: p.id,
      title: `${p.word} 변신 연습`,
      x: p.x,
      y: 2.35,
      z: p.z,
      rotY: p.rotY,
      width: 3.4,
      height: 2.55,
      texture: tex,
    });
  });

  const archGroup = new THREE.Group();
  archGroup.position.set(11.5, 0, -4.5);
  const archBeam = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.32, 0.36), cedarWoodMat);
  archBeam.position.y = 3.2;
  const gatePillarGeo = new THREE.CylinderGeometry(0.18, 0.22, 3.2, 14);
  const pLeft = new THREE.Mesh(gatePillarGeo, cedarWoodMat);
  pLeft.position.set(-2.0, 1.6, 0);
  const pRight = new THREE.Mesh(gatePillarGeo, cedarWoodMat);
  pRight.position.set(2.0, 1.6, 0);
  archGroup.add(archBeam, pLeft, pRight);
  root.add(archGroup);
  disposables.push(archBeam.geometry, gatePillarGeo);

  addSeoanDesk(11.5, 5.5, Math.PI, true);

  addStationPedestal({
    id: 'station_proper_korean',
    zone: 'proper_korean',
    title: '2방 · 따봄쌤의 바른 우리말 방 열기',
    x: 11.5,
    z: 0,
    accentHex: '#059669',
  });

  // ==========================================================
  // 3방: 마음 거울방 (North Wing)
  // ==========================================================
  addFramedArtwork({
    id: 'art_zone_empathy',
    zone: 'empathy_mirror',
    title: '3방 · 마음 거울방 (듣는 사람의 마음)',
    x: 0,
    y: 2.5,
    z: -16.6,
    rotY: 0,
    width: 4.8,
    height: 3.6,
    texture: empathyMirrorTex,
  });

  const empathyPlaques = [
    { id: 'take_the_l', word: '할머니의 마음', sub: 'L을 가져가라니 알파벳 물건을 주라는 건가 궁금하구나', x: -4.6, z: -16.6, rotY: 0 },
    { id: 'six_seven', word: '전학생 친구의 마음', sub: '67이 왜 웃긴지 나만 몰라서 혼자 멈춰 있게 돼', x: 4.6, z: -16.6, rotY: 0 },
  ];
  empathyPlaques.forEach((p) => {
    const tex = createPlaqueTexture(p.word, p.sub, '#E11D48', '3방 · 마음 거울', maxAnisotropy);
    disposables.push(tex);
    addFramedArtwork({
      id: `empathy_${p.id}`,
      zone: 'empathy_mirror',
      exhibitId: p.id,
      title: `${p.word} 들어보기`,
      x: p.x,
      y: 2.3,
      z: p.z,
      rotY: p.rotY,
      width: 3.2,
      height: 2.4,
      texture: tex,
    });
  });

  const mirrorGroup = new THREE.Group();
  mirrorGroup.position.set(0, 0, -13.2);
  const mirrorBase = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.35, 0.9), stonePedMat);
  mirrorBase.position.y = 0.175;
  const mirrorFrame = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.12, 12, 36), brassGoldMat);
  mirrorFrame.position.y = 2.0;
  mirrorFrame.scale.set(0.85, 1.15, 1);
  const mirrorGlassMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xfb7185,
    emissiveIntensity: 0.25,
    roughness: 0.1,
    metalness: 0.85,
  });
  const mirrorGlass = new THREE.Mesh(new THREE.CircleGeometry(1.26, 32), mirrorGlassMat);
  mirrorGlass.position.set(0, 2.0, 0.04);
  mirrorGlass.scale.set(0.85, 1.15, 1);
  mirrorGlass.layers.enable(1);
  mirrorGroup.add(mirrorBase, mirrorFrame, mirrorGlass);
  root.add(mirrorGroup);
  disposables.push(mirrorBase.geometry, mirrorFrame.geometry, mirrorGlass.geometry, mirrorGlassMat);
  colliders.push({ minX: -1.4, maxX: 1.4, minZ: -13.8, maxZ: -12.6 });

  interactables.push({
    id: 'mirror_centerpiece',
    zone: 'empathy_mirror',
    title: '마음의 거울 들여다보기',
    position: new THREE.Vector3(0, 0, -13.2),
    hitMesh: mirrorGlass,
  });

  addStationPedestal({
    id: 'station_empathy_mirror',
    zone: 'empathy_mirror',
    title: '3방 · 마음 거울방 열기',
    x: 0,
    z: -10.0,
    accentHex: '#E11D48',
  });

  // Instanced Potted Seodang Plants
  const planterCoords: [number, number][] = [
    [-5.5, -5.5],
    [5.5, -5.5],
    [-5.5, 5.5],
    [5.5, 5.5],
    [-15.5, -15.5],
    [15.5, -15.5],
    [-15.5, 15.5],
    [15.5, 15.5],
  ];
  const potGeo = new THREE.CylinderGeometry(0.45, 0.34, 0.65, 16);
  const potMat = new THREE.MeshStandardMaterial({ color: 0x78502b, roughness: 0.78, metalness: 0.02 });
  const leafGeo = new THREE.DodecahedronGeometry(0.32, 0);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7, metalness: 0.0 });
  const leafInstances = new THREE.InstancedMesh(leafGeo, leafMat, planterCoords.length * 4);
  leafInstances.castShadow = true;

  const dummy = new THREE.Object3D();
  const tintColor = new THREE.Color();
  let instanceIdx = 0;

  planterCoords.forEach(([px, pz], pIdx) => {
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.set(px, 0.325, pz);
    pot.castShadow = true;
    pot.receiveShadow = true;
    root.add(pot);

    for (let k = 0; k < 4; k++) {
      const angle = (k / 4) * Math.PI * 2 + pIdx * 0.4;
      const r = k === 3 ? 0 : 0.22;
      const s = 0.85 + ((pIdx + k) % 3) * 0.14;
      dummy.position.set(px + Math.cos(angle) * r, 0.82 + (k === 3 ? 0.25 : 0), pz + Math.sin(angle) * r);
      dummy.scale.set(s, s * 1.15, s);
      dummy.rotation.set(0.2 * k, angle, 0.1 * k);
      dummy.updateMatrix();
      leafInstances.setMatrixAt(instanceIdx, dummy.matrix);
      tintColor.setHSL(0.35 + ((k % 3) - 1) * 0.02, 0.55, 0.42 + (k % 2) * 0.06);
      leafInstances.setColorAt(instanceIdx, tintColor);
      instanceIdx++;
    }
  });
  leafInstances.instanceMatrix.needsUpdate = true;
  if (leafInstances.instanceColor) leafInstances.instanceColor.needsUpdate = true;
  leafInstances.computeBoundingSphere();
  root.add(leafInstances);
  disposables.push(potGeo, potMat, leafGeo, leafMat);

  function update(elapsed: number) {
    hangulGroup.children.forEach((child, idx) => {
      child.position.y = (idx === 1 ? 0.45 : 0.2) + Math.sin(elapsed * 1.6 + idx * 1.1) * 0.08;
      child.rotation.y = Math.sin(elapsed * 0.7 + idx) * 0.22;
    });

    animatedRings.forEach((ring, idx) => {
      const pulse = 1 + Math.sin(elapsed * 2.5 + idx) * 0.06;
      ring.scale.set(pulse, pulse, 1);
    });

    interactables.forEach((item, idx) => {
      if (item.id.startsWith('station_')) {
        item.hitMesh.rotation.y = elapsed * 1.2 + idx;
        item.hitMesh.position.y = 1.55 + Math.sin(elapsed * 2.0 + idx) * 0.08;
      }
    });

    mirrorGlassMat.emissiveIntensity = 0.22 + Math.sin(elapsed * 1.8) * 0.08;
  }

  function dispose() {
    disposables.forEach((d) => d.dispose());
  }

  return {
    root,
    interactables,
    colliders,
    floorMesh,
    update,
    dispose,
  };
}
