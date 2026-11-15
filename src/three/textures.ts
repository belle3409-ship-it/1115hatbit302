import * as THREE from 'three';

export function createMaruFloorTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm honey-pine Korean 대청마루 floorboards
  ctx.fillStyle = '#C99E67';
  ctx.fillRect(0, 0, 512, 512);

  const plankW = 64;
  const plankH = 256;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 8; col++) {
      const x = col * plankW;
      const y = (row * plankH + (col % 2 === 0 ? 0 : 128)) % 512;
      const shade = ((row * 11 + col * 17) % 16) - 8;
      ctx.fillStyle = `rgb(${202 + shade}, ${158 + shade}, ${103 + Math.floor(shade * 0.7)})`;
      ctx.fillRect(x + 1, y + 1, plankW - 2, plankH - 2);

      // Natural pine wood grain lines
      ctx.strokeStyle = 'rgba(110, 70, 30, 0.16)';
      ctx.lineWidth = 1.2;
      for (let g = 0; g < 4; g++) {
        ctx.beginPath();
        ctx.moveTo(x + 8 + g * 14, y);
        ctx.bezierCurveTo(
          x + 12 + g * 14,
          y + plankH * 0.33,
          x + 6 + g * 14,
          y + plankH * 0.66,
          x + 10 + g * 14,
          y + plankH,
        );
        ctx.stroke();
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createHanjiWallTexture(baseHex: string, maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Warm plaster + Hanji paper upper panel
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  // Lower dark-cedar wainscoting band
  ctx.fillStyle = '#8B5E34';
  ctx.fillRect(0, 200, 256, 56);
  ctx.fillStyle = '#6D4724';
  ctx.fillRect(0, 196, 256, 5);

  // Traditional Korean 창호지 (hanji lattice window) pattern on middle-upper wall
  ctx.fillStyle = '#FBF7EE';
  ctx.fillRect(16, 24, 224, 152);
  ctx.strokeStyle = '#7C522B';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 24, 224, 152);

  // Lattice bars
  ctx.lineWidth = 2;
  for (let x = 53; x < 230; x += 37) {
    ctx.beginPath();
    ctx.moveTo(x, 24);
    ctx.lineTo(x, 176);
    ctx.stroke();
  }
  for (let y = 54; y < 170; y += 30) {
    ctx.beginPath();
    ctx.moveTo(16, y);
    ctx.lineTo(240, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
  grad.addColorStop(0, 'rgba(55, 35, 15, 0.55)');
  grad.addColorStop(0.55, 'rgba(55, 35, 15, 0.22)');
  grad.addColorStop(1, 'rgba(55, 35, 15, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createPlaqueTexture(
  title: string,
  subtitle: string,
  accentHex: string,
  badgeText: string,
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  // Traditional warm Hanji scroll paper
  ctx.fillStyle = '#FDF8EC';
  ctx.fillRect(0, 0, 512, 384);

  // Subtle hanji fiber speckle
  for (let i = 0; i < 600; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(180,150,110,0.08)' : 'rgba(255,255,255,0.25)';
    ctx.fillRect((i * 89) % 512, (i * 53) % 384, 3, 2);
  }

  // Double traditional scroll border
  ctx.strokeStyle = '#78502B';
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 14, 484, 356);
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 4;
  ctx.strokeRect(26, 26, 460, 332);

  // Header ribbon
  ctx.fillStyle = accentHex;
  ctx.fillRect(26, 26, 460, 62);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 25px "Noto Sans KR", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, 256, 57);

  // Main Title
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 48px "Noto Sans KR", sans-serif';
  ctx.fillText(title, 256, 175);

  // Subtitle wrap (2 lines)
  ctx.fillStyle = '#475569';
  ctx.font = '500 24px "Noto Sans KR", sans-serif';
  const words = subtitle.split(' ');
  let line1 = '';
  let line2 = '';
  for (const w of words) {
    if ((line1 + ' ' + w).trim().length <= 18) {
      line1 = (line1 + ' ' + w).trim();
    } else {
      line2 = (line2 + ' ' + w).trim();
    }
  }
  ctx.fillText(line1, 256, 255);
  if (line2) {
    ctx.fillText(line2, 256, 295);
  }

  // Red Korean seal stamp (낙관) in bottom-right corner
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(434, 304, 34, 34);
  ctx.fillStyle = '#FDF8EC';
  ctx.font = 'bold 18px "Noto Sans KR", sans-serif';
  ctx.fillText('바른', 451, 322);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createHangulBlockTexture(
  letter: string,
  bgHex: string,
  fgHex: string,
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = 'rgba(255,248,230,0.75)';
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 14, 228, 228);

  ctx.fillStyle = fgHex;
  ctx.font = 'bold 124px "Noto Sans KR", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, 128, 134);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}
