import * as THREE from 'three';
import { AVATAR_COLORS, type AvatarColorId } from '../data/museumExhibits';
import { createContactShadowTexture } from './textures';

export interface ExplorerCharacter {
  group: THREE.Group;
  bodyPivot: THREE.Group;
  headGroup: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  sweaterMat: THREE.MeshStandardMaterial;
  capMat: THREE.MeshStandardMaterial;
  backpackMat: THREE.MeshStandardMaterial;
  walkPhase: number;
  setOutfitColor: (colorId: AvatarColorId) => void;
}

export function createExplorerCharacter(initialColor: AvatarColorId = 'sky'): ExplorerCharacter {
  const group = new THREE.Group();
  group.name = 'SeodangScholarCharacter';

  const palette = AVATAR_COLORS[initialColor];

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xffd7ba,
    roughness: 0.72,
    metalness: 0.0,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x231b17,
    roughness: 0.85,
    metalness: 0.04,
  });
  // Traditional Korean 배자 (hanbok vest)
  const sweaterMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(palette.hex),
    roughness: 0.75,
    metalness: 0.02,
  });
  // Crisp white 저고리 (inner sleeves & collar 동정)
  const jeogoriMat = new THREE.MeshStandardMaterial({
    color: 0xfdfbf6,
    roughness: 0.65,
    metalness: 0.0,
  });
  // Traditional 바지 (hanbok trousers)
  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.82,
    metalness: 0.02,
  });
  // 고무신 / 꽃신 (traditional Korean shoes)
  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.4,
    metalness: 0.05,
  });
  // 학동 복건/유건 (traditional scholar cap)
  const capMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(palette.hex),
    roughness: 0.65,
    metalness: 0.04,
  });
  // 책보 (traditional cloth book-bundle satchel)
  const backpackMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.75,
    metalness: 0.02,
  });
  const badgeMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.25,
    metalness: 0.6,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.2,
    metalness: 0.1,
  });
  const cheekMat = new THREE.MeshStandardMaterial({
    color: 0xfda4af,
    roughness: 0.8,
    metalness: 0.0,
  });

  // 1. Grounded contact shadow disc
  const shadowGeo = new THREE.PlaneGeometry(1.15, 1.15);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: createContactShadowTexture(),
    transparent: true,
    depthWrite: false,
    opacity: 0.6,
  });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.015;
  group.add(shadowPlane);

  const bodyPivot = new THREE.Group();
  group.add(bodyPivot);

  // 2 & 3. Left & Right Hanbok Trousers + Gomusin Shoes
  function buildLeg(xOffset: number): THREE.Group {
    const legPivot = new THREE.Group();
    legPivot.position.set(xOffset, 0.64, 0);

    const trouser = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.105, 0.5, 14), pantsMat);
    trouser.position.y = -0.25;
    trouser.castShadow = true;
    legPivot.add(trouser);

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.13, 0.28), shoeMat);
    shoe.position.set(0, -0.56, 0.04);
    shoe.castShadow = true;
    legPivot.add(shoe);

    return legPivot;
  }

  const leftLegPivot = buildLeg(-0.15);
  const rightLegPivot = buildLeg(0.15);
  bodyPivot.add(leftLegPivot, rightLegPivot);

  // 4. Torso (Colorful Hanbok 배자 vest + white 저고리 collar + gold knot goreum)
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.31, 0.66, 18), sweaterMat);
  torso.position.y = 0.97;
  torso.castShadow = true;
  torso.receiveShadow = true;
  bodyPivot.add(torso);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.045, 10, 20), jeogoriMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 1.29;
  bodyPivot.add(collar);

  // Traditional 옷고름 (chest ribbon accent)
  const goreum = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.26, 0.04), badgeMat);
  goreum.position.set(0.08, 1.07, 0.26);
  goreum.rotation.z = -0.2;
  bodyPivot.add(goreum);

  // 5. Traditional Cloth Book Bundle (책보) on back
  const bundleGroup = new THREE.Group();
  bundleGroup.position.set(0, 0.99, -0.27);
  const packMain = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.2), backpackMat);
  packMain.castShadow = true;
  const packKnot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), jeogoriMat);
  packKnot.position.set(0, 0.2, 0);
  bundleGroup.add(packMain, packKnot);
  bodyPivot.add(bundleGroup);

  // 6 & 7. Left & Right White 저고리 Sleeves
  function buildArm(xOffset: number): THREE.Group {
    const armPivot = new THREE.Group();
    armPivot.position.set(xOffset, 1.24, 0);

    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.09, 0.42, 12), jeogoriMat);
    sleeve.position.y = -0.2;
    sleeve.castShadow = true;
    armPivot.add(sleeve);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), skinMat);
    hand.position.y = -0.44;
    hand.castShadow = true;
    armPivot.add(hand);

    return armPivot;
  }

  const leftArmPivot = buildArm(-0.34);
  const rightArmPivot = buildArm(0.34);
  bodyPivot.add(leftArmPivot, rightArmPivot);

  // 8–12. Head Group (Neck + Head + Hair + Traditional Scholar Cap 복건 + Eyes + Cheeks)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.32, 0);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.14, 12), skinMat);
  neck.position.y = 0.05;
  headGroup.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), skinMat);
  head.position.y = 0.34;
  head.castShadow = true;
  headGroup.add(head);

  const hairBack = new THREE.Mesh(
    new THREE.SphereGeometry(0.295, 22, 22, 0, Math.PI * 2, 0, Math.PI * 0.62),
    hairMat,
  );
  hairBack.position.y = 0.36;
  hairBack.rotation.x = -0.35;
  headGroup.add(hairBack);

  // Traditional Seodang scholar cap (복건/유건 style)
  const capCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.16, 20), capMat);
  capCrown.position.set(0, 0.59, -0.02);
  capCrown.rotation.x = -0.15;
  capCrown.castShadow = true;
  headGroup.add(capCrown);

  const capGoldTrim = new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.27, 0.035, 20), badgeMat);
  capGoldTrim.position.set(0, 0.52, -0.01);
  capGoldTrim.rotation.x = -0.15;
  headGroup.add(capGoldTrim);

  // Eyes & Cheeks facing +Z
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.034, 12, 12), eyeMat);
  leftEye.position.set(-0.095, 0.35, 0.25);
  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.034, 12, 12), eyeMat);
  rightEye.position.set(0.095, 0.35, 0.25);

  const leftCheek = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), cheekMat);
  leftCheek.scale.set(1.2, 0.7, 0.5);
  leftCheek.position.set(-0.155, 0.27, 0.23);
  const rightCheek = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), cheekMat);
  rightCheek.scale.set(1.2, 0.7, 0.5);
  rightCheek.position.set(0.155, 0.27, 0.23);

  headGroup.add(leftEye, rightEye, leftCheek, rightCheek);
  bodyPivot.add(headGroup);

  const character: ExplorerCharacter = {
    group,
    bodyPivot,
    headGroup,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot,
    sweaterMat,
    capMat,
    backpackMat,
    walkPhase: 0,
    setOutfitColor(colorId: AvatarColorId) {
      const next = AVATAR_COLORS[colorId];
      sweaterMat.color.set(next.hex);
      capMat.color.set(next.hex);
    },
  };

  return character;
}

export function animateExplorerCharacter(
  char: ExplorerCharacter,
  isMoving: boolean,
  speedFactor: number,
  delta: number,
  elapsed: number,
) {
  if (isMoving) {
    char.walkPhase += delta * 10.5 * Math.max(0.6, speedFactor);
    const swing = Math.sin(char.walkPhase) * 0.65;
    char.leftLegPivot.rotation.x = swing;
    char.rightLegPivot.rotation.x = -swing;
    char.leftArmPivot.rotation.x = -swing * 0.85;
    char.rightArmPivot.rotation.x = swing * 0.85;
    char.bodyPivot.position.y = Math.abs(Math.sin(char.walkPhase)) * 0.055;
    char.headGroup.rotation.y = Math.sin(char.walkPhase * 0.5) * 0.06;
  } else {
    const damp = 1 - Math.exp(-10 * delta);
    char.leftLegPivot.rotation.x += (0 - char.leftLegPivot.rotation.x) * damp;
    char.rightLegPivot.rotation.x += (0 - char.rightLegPivot.rotation.x) * damp;
    char.leftArmPivot.rotation.x += (0 - char.leftArmPivot.rotation.x) * damp;
    char.rightArmPivot.rotation.x += (0 - char.rightArmPivot.rotation.x) * damp;
    char.bodyPivot.position.y += (Math.sin(elapsed * 2.2) * 0.015 - char.bodyPivot.position.y) * damp;
    char.headGroup.rotation.y += (Math.sin(elapsed * 0.9) * 0.08 - char.headGroup.rotation.y) * damp;
  }
}
