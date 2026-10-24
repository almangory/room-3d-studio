/**
 * محرك التوليد الهندسي للأثاث والخامات والأبعاد ثلاثية الأبعاد (Procedural 3D Furniture & Dimension Builder)
 * يحول الأبعاد بالسنتيمتر (cm) إلى وحدات المشهد (1 وحدة = 1 متر = 100 سم)
 */

window.ProceduralBuilder = {
  /**
   * توليد خامات (Textures) برمجية للأرضيات بدون صور خارجية
   */
  createFloorTexture(type, baseColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    if (type === 'parquet') {
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 2;
      const rows = 8;
      const cols = 2;
      const rh = 512 / rows;
      const cw = 512 / cols;
      for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * (cw / 2);
        for (let c = -1; c <= cols; c++) {
          const x = c * cw + offset;
          const y = r * rh;
          ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
          ctx.fillRect(x, y, cw, rh);
          ctx.strokeRect(x, y, cw, rh);
        }
      }
    } else if (type === 'checker') {
      const step = 128;
      for (let x = 0; x < 512; x += step) {
        for (let y = 0; y < 512; y += step) {
          const isDark = ((x / step) + (y / step)) % 2 === 0;
          ctx.fillStyle = isDark ? 'rgba(15,23,42,0.18)' : 'rgba(255,255,255,0.22)';
          ctx.fillRect(x, y, step, step);
        }
      }
    } else if (type === 'tiles' || type === 'marble') {
      ctx.strokeStyle = type === 'marble' ? 'rgba(148,163,184,0.35)' : 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 3;
      const step = 128;
      for (let x = 0; x <= 512; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
      }
      for (let y = 0; y <= 512; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
      }
      if (type === 'marble') {
        ctx.strokeStyle = 'rgba(100,116,139,0.12)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random() * 512, 0);
          ctx.bezierCurveTo(Math.random() * 512, 170, Math.random() * 512, 340, Math.random() * 512, 512);
          ctx.stroke();
        }
      }
    } else if (type === 'carpet') {
      for (let i = 0; i < 4000; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  },

  /**
   * إنشاء لافتة نصية ثنائية الأبعاد عائمة في الفضاء الثلاثي (3D Dimension Label Sprite)
   * ملاحظة هامة: جميع اللافتات تحمل userData.ignoreRaycast = true لمنع تداخل النقر والتحديد!
   */
  createLabelSprite(text, bgColor = 'rgba(15, 23, 42, 0.90)', textColor = '#38bdf8', scale = 0.65) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 4;
    const r = 24;
    ctx.beginPath();
    ctx.roundRect(10, 14, 492, 100, r);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 40px Tajawal, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(scale * 2.2, scale * 0.55, 1);
    sprite.renderOrder = 999;
    sprite.userData.ignoreRaycast = true;
    return sprite;
  },

  /**
   * بناء مجسم قطعة الأثاث بالكامل حسب أبعادها الحقيقية بالسنتيمتر
   */
  buildFurnitureMesh(itemData) {
    const group = new THREE.Group();
    const W = itemData.width / 100;  // تحويل من سم إلى متر
    const D = itemData.depth / 100;
    const H = itemData.height / 100;

    const mainMat = new THREE.MeshStandardMaterial({
      color: itemData.color || '#475569',
      roughness: 0.6,
      metalness: 0.1
    });

    const secColor = itemData.secondaryColor || '#a97142';
    const secMat = new THREE.MeshStandardMaterial({
      color: secColor,
      roughness: 0.45,
      metalness: 0.15
    });

    const metalMat = new THREE.MeshStandardMaterial({
      color: '#d97706',
      roughness: 0.25,
      metalness: 0.8
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.15,
      metalness: 0.9
    });

    const darkMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.3,
      metalness: 0.4
    });

    const whiteMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.5
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: '#7dd3fc',
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      metalness: 0.3
    });

    const addBox = (w, h, d, x, y, z, mat, castShadow = true) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = castShadow;
      mesh.receiveShadow = true;
      mesh.userData.isHitTarget = true;
      group.add(mesh);
      return mesh;
    };

    const addCyl = (rt, rb, h, x, y, z, mat) => {
      const geo = new THREE.CylinderGeometry(rt, rb, h, 20);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.isHitTarget = true;
      group.add(mesh);
      return mesh;
    };

    const type = itemData.catalogId;

    switch (type) {
      case 'sofa_3seat':
      case 'sofa_2seat':
      case 'armchair': {
        const legH = H * 0.12;
        const baseH = H * 0.32;
        const armW = Math.min(W * 0.12, 0.18);
        const backD = D * 0.2;
        const lx = W / 2 - 0.06;
        const lz = D / 2 - 0.06;
        addCyl(0.025, 0.015, legH, -lx, legH / 2, -lz, secMat);
        addCyl(0.025, 0.015, legH, lx, legH / 2, -lz, secMat);
        addCyl(0.025, 0.015, legH, -lx, legH / 2, lz, secMat);
        addCyl(0.025, 0.015, legH, lx, legH / 2, lz, secMat);
        addBox(W, baseH, D, 0, legH + baseH / 2, 0, mainMat);
        const backH = H - legH - baseH;
        addBox(W, backH, backD, 0, legH + baseH + backH / 2, -D / 2 + backD / 2, mainMat);
        const armH = (H - legH) * 0.68;
        addBox(armW, armH, D, -W / 2 + armW / 2, legH + armH / 2, 0, mainMat);
        addBox(armW, armH, D, W / 2 - armW / 2, legH + armH / 2, 0, mainMat);
        const cushions = type === 'sofa_3seat' ? 3 : (type === 'sofa_2seat' ? 2 : 1);
        const innerW = W - armW * 2;
        const cw = innerW / cushions - 0.02;
        for (let i = 0; i < cushions; i++) {
          const cx = -innerW / 2 + (i + 0.5) * (innerW / cushions);
          addBox(cw, H * 0.12, D - backD - 0.04, cx, legH + baseH + H * 0.05, backD / 2, mainMat);
        }
        break;
      }

      case 'sofa_lshape': {
        const baseH = H * 0.42;
        const backD = 0.2;
        const mainDepth = Math.min(D * 0.55, 0.95);
        const chaiseW = W * 0.38;
        addBox(W, baseH, mainDepth, 0, baseH / 2, -D / 2 + mainDepth / 2, mainMat);
        addBox(chaiseW, baseH, D - mainDepth, W / 2 - chaiseW / 2, baseH / 2, mainDepth / 2, mainMat);
        addBox(W, H - baseH, backD, 0, baseH + (H - baseH) / 2, -D / 2 + backD / 2, mainMat);
        addBox(0.16, H * 0.65, mainDepth, -W / 2 + 0.08, H * 0.325, -D / 2 + mainDepth / 2, mainMat);
        addBox(0.16, H * 0.65, D, W / 2 - 0.08, H * 0.325, 0, mainMat);
        break;
      }

      case 'ottoman_pouf': {
        addCyl(W * 0.48, W * 0.45, H * 0.85, 0, H * 0.5, 0, mainMat);
        addCyl(W * 0.42, W * 0.42, H * 0.15, 0, H * 0.075, 0, metalMat);
        break;
      }

      case 'coffee_table': {
        const topT = 0.05;
        addBox(W, topT, D, 0, H - topT / 2, 0, mainMat);
        addBox(W * 0.88, 0.03, D * 0.85, 0, H * 0.3, 0, secMat);
        const lx = W / 2 - 0.05;
        const lz = D / 2 - 0.05;
        addBox(0.04, H - topT, 0.04, -lx, (H - topT) / 2, -lz, secMat);
        addBox(0.04, H - topT, 0.04, lx, (H - topT) / 2, -lz, secMat);
        addBox(0.04, H - topT, 0.04, -lx, (H - topT) / 2, lz, secMat);
        addBox(0.04, H - topT, 0.04, lx, (H - topT) / 2, lz, secMat);
        break;
      }

      case 'side_table': {
        addCyl(W / 2, W / 2, 0.04, 0, H - 0.02, 0, mainMat);
        addCyl(0.03, 0.03, H - 0.04, 0, (H - 0.04) / 2, 0, metalMat);
        addCyl(W * 0.35, W * 0.35, 0.03, 0, 0.015, 0, metalMat);
        break;
      }

      case 'tv_unit': {
        const cabH = H * 0.36;
        addBox(W, cabH, D, 0, cabH / 2, 0, mainMat);
        addBox(W * 0.3, cabH * 0.75, 0.02, -W * 0.32, cabH / 2, D / 2 + 0.01, whiteMat);
        addBox(W * 0.3, cabH * 0.75, 0.02, W * 0.32, cabH / 2, D / 2 + 0.01, whiteMat);
        const tvW = W * 0.82;
        const tvH = H * 0.56;
        addBox(tvW, tvH, 0.04, 0, cabH + 0.08 + tvH / 2, 0, darkMat);
        addBox(0.25, 0.08, 0.18, 0, cabH + 0.04, 0, darkMat);
        break;
      }

      case 'fireplace_modern': {
        addBox(W, H, D, 0, H / 2, 0, mainMat);
        addBox(W + 0.08, 0.08, D + 0.06, 0, H - 0.04, 0, whiteMat);
        addBox(W * 0.65, H * 0.55, 0.06, 0, H * 0.35, D / 2 - 0.01, darkMat);
        const fireMat = new THREE.MeshStandardMaterial({ color: '#f97316', emissive: '#ea580c', emissiveIntensity: 0.8 });
        addBox(W * 0.45, H * 0.25, 0.04, 0, H * 0.25, D / 2 + 0.01, fireMat);
        break;
      }

      case 'console_table':
      case 'dresser_mirror': {
        const tableH = H * 0.48;
        addBox(W, tableH, D, 0, tableH / 2, 0, mainMat);
        const mirW = W * 0.65;
        const mirH = H - tableH - 0.06;
        addBox(mirW + 0.06, mirH + 0.06, 0.04, 0, tableH + mirH / 2 + 0.03, -D / 2 + 0.05, metalMat);
        addBox(mirW, mirH, 0.05, 0, tableH + mirH / 2 + 0.03, -D / 2 + 0.055, glassMat);
        break;
      }

      case 'bed_king':
      case 'bed_single': {
        const frameH = H * 0.28;
        const mattH = H * 0.22;
        const headD = 0.12;
        addBox(W, frameH, D, 0, frameH / 2, 0, secMat);
        addBox(W * 0.94, mattH, D * 0.92, 0, frameH + mattH / 2, 0.04, whiteMat);
        addBox(W * 0.95, mattH + 0.02, D * 0.62, 0, frameH + mattH / 2 + 0.01, D * 0.16, mainMat);
        addBox(W, H, headD, 0, H / 2, -D / 2 + headD / 2, mainMat);
        const pillows = type === 'bed_king' ? 2 : 1;
        const pw = (W * 0.75) / pillows;
        for (let i = 0; i < pillows; i++) {
          const px = pillows === 2 ? (i === 0 ? -W * 0.22 : W * 0.22) : 0;
          addBox(pw, 0.12, 0.28, px, frameH + mattH + 0.06, -D / 2 + headD + 0.18, whiteMat);
        }
        break;
      }

      case 'bunk_bed': {
        // 4 قوائم ركنية + سريرين سفلي وعلوي + سلم
        const p = 0.06;
        addBox(p, H, p, -W / 2 + p / 2, H / 2, -D / 2 + p / 2, secMat);
        addBox(p, H, p, W / 2 - p / 2, H / 2, -D / 2 + p / 2, secMat);
        addBox(p, H, p, -W / 2 + p / 2, H / 2, D / 2 - p / 2, secMat);
        addBox(p, H, p, W / 2 - p / 2, H / 2, D / 2 - p / 2, secMat);
        // السرير السفلي
        addBox(W - 0.04, 0.18, D - 0.04, 0, 0.32, 0, mainMat);
        addBox(W * 0.7, 0.1, 0.25, 0, 0.45, -D / 2 + 0.22, whiteMat);
        // السرير العلوي
        addBox(W - 0.04, 0.18, D - 0.04, 0, H * 0.68, 0, mainMat);
        addBox(W * 0.7, 0.1, 0.25, 0, H * 0.68 + 0.13, -D / 2 + 0.22, whiteMat);
        // حواجز أمان علوية
        addBox(0.03, 0.25, D, -W / 2 + 0.03, H * 0.82, 0, secMat);
        addBox(0.03, 0.25, D * 0.7, W / 2 - 0.03, H * 0.82, -D * 0.15, secMat);
        break;
      }

      case 'baby_crib': {
        addBox(W, 0.15, D, 0, 0.35, 0, whiteMat);
        addBox(W, H, 0.04, 0, H / 2, -D / 2 + 0.02, mainMat);
        addBox(W, H, 0.04, 0, H / 2, D / 2 - 0.02, mainMat);
        addBox(0.04, H, D, -W / 2 + 0.02, H / 2, 0, mainMat);
        addBox(0.04, H, D, W / 2 - 0.02, H / 2, 0, mainMat);
        break;
      }

      case 'wardrobe_large':
      case 'shoe_rack': {
        addBox(W, H, D, 0, H / 2, 0, mainMat);
        const doors = type === 'wardrobe_large' ? 4 : 2;
        const dw = W / doors;
        for (let i = 0; i < doors; i++) {
          const dx = -W / 2 + (i + 0.5) * dw;
          addBox(dw - 0.02, H - 0.06, 0.02, dx, H / 2, D / 2 + 0.01, mainMat);
          const hx = dx + (i % 2 === 0 ? dw * 0.35 : -dw * 0.35);
          addBox(0.02, 0.25, 0.03, hx, H * 0.5, D / 2 + 0.025, metalMat);
        }
        break;
      }

      case 'wardrobe_corner': {
        addBox(W, H, D * 0.48, 0, H / 2, -D / 2 + D * 0.24, mainMat);
        addBox(W * 0.48, H, D * 0.52, -W / 2 + W * 0.24, H / 2, D * 0.24, mainMat);
        break;
      }

      case 'nightstand': {
        addBox(W, H, D, 0, H / 2, 0, mainMat);
        addBox(W * 0.88, H * 0.38, 0.02, 0, H * 0.72, D / 2 + 0.01, secMat);
        addBox(W * 0.88, H * 0.38, 0.02, 0, H * 0.28, D / 2 + 0.01, secMat);
        addBox(0.1, 0.02, 0.03, 0, H * 0.72, D / 2 + 0.02, metalMat);
        addBox(0.1, 0.02, 0.03, 0, H * 0.28, D / 2 + 0.02, metalMat);
        break;
      }

      case 'kitchen_counter':
      case 'kitchen_island':
      case 'buffet_sideboard': {
        addBox(W, H - 0.04, D - 0.02, 0, (H - 0.04) / 2, 0, mainMat);
        // رخامة علوية
        addBox(W + 0.02, 0.04, D + 0.02, 0, H - 0.02, 0, whiteMat);
        if (type === 'kitchen_counter') {
          // حوض ستانلس وصنبور مياه
          addBox(0.55, 0.02, 0.4, 0.3, H + 0.005, 0, chromeMat);
          addCyl(0.015, 0.015, 0.24, 0.3, H + 0.12, -0.18, chromeMat);
        }
        break;
      }

      case 'fridge_double': {
        addBox(W, H, D, 0, H / 2, 0, mainMat);
        addBox(W / 2 - 0.015, H - 0.04, 0.03, -W / 4, H / 2, D / 2 + 0.01, mainMat);
        addBox(W / 2 - 0.015, H - 0.04, 0.03, W / 4, H / 2, D / 2 + 0.01, mainMat);
        addBox(0.02, 0.5, 0.04, -0.05, H * 0.55, D / 2 + 0.03, darkMat);
        addBox(0.02, 0.5, 0.04, 0.05, H * 0.55, D / 2 + 0.03, darkMat);
        break;
      }

      case 'stove_oven': {
        addBox(W, H, D, 0, H / 2, 0, mainMat);
        // زجاج الفرن
        addBox(W * 0.78, H * 0.52, 0.02, 0, H * 0.42, D / 2 + 0.01, darkMat);
        // عيون البوتاجاز
        const positions = [[-0.25, -0.12], [0.25, -0.12], [-0.25, 0.12], [0.25, 0.12], [0, 0]];
        positions.forEach(([bx, bz]) => {
          addCyl(0.08, 0.08, 0.02, bx, H + 0.01, bz, darkMat);
        });
        break;
      }

      case 'washing_machine': {
        addBox(W, H, D, 0, H / 2, 0, mainMat);
        addCyl(W * 0.3, W * 0.3, 0.04, 0, H * 0.48, D / 2 + 0.01, darkMat);
        break;
      }

      case 'bathtub': {
        addBox(W, H, D, 0, H / 2, 0, mainMat);
        const waterMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.1 });
        addBox(W - 0.16, 0.03, D - 0.16, 0, H - 0.06, 0, waterMat);
        break;
      }

      case 'shower_cabin': {
        addBox(W, 0.12, D, 0, 0.06, 0, whiteMat);
        addBox(W, H - 0.12, D, 0, (H + 0.12) / 2, 0, glassMat);
        break;
      }

      case 'vanity_sink': {
        const cabH = H * 0.48;
        addBox(W, cabH, D, 0, cabH / 2, 0, mainMat);
        addBox(W + 0.02, 0.06, D + 0.02, 0, cabH + 0.03, 0, whiteMat);
        // مرآة الحمام
        addBox(W * 0.85, H * 0.44, 0.03, 0, cabH + 0.12 + H * 0.22, -D / 2 + 0.03, glassMat);
        break;
      }

      case 'toilet_wc': {
        addBox(W * 0.85, H * 0.52, D * 0.65, 0, H * 0.26, D * 0.15, mainMat);
        addBox(W * 0.9, H * 0.5, D * 0.32, 0, H * 0.72, -D * 0.32, mainMat);
        break;
      }

      case 'dining_set_6': {
        const topT = 0.05;
        addBox(W, topT, D, 0, H - topT / 2, 0, mainMat);
        const lx = W / 2 - 0.08;
        const lz = D / 2 - 0.08;
        addBox(0.06, H - topT, 0.06, -lx, (H - topT) / 2, -lz, mainMat);
        addBox(0.06, H - topT, 0.06, lx, (H - topT) / 2, -lz, mainMat);
        addBox(0.06, H - topT, 0.06, -lx, (H - topT) / 2, lz, mainMat);
        addBox(0.06, H - topT, 0.06, lx, (H - topT) / 2, lz, mainMat);
        const chairPositions = [
          [-W * 0.25, -D / 2 - 0.15, 0],
          [W * 0.25, -D / 2 - 0.15, 0],
          [-W * 0.25, D / 2 + 0.15, Math.PI],
          [W * 0.25, D / 2 + 0.15, Math.PI]
        ];
        chairPositions.forEach(([cx, cz, rot]) => {
          addBox(0.42, 0.05, 0.42, cx, 0.45, cz, secMat);
          const backZ = cz + (rot === 0 ? -0.19 : 0.19);
          addBox(0.42, 0.45, 0.04, cx, 0.68, backZ, secMat);
        });
        break;
      }

      case 'dining_round_4': {
        addCyl(W / 2, W / 2, 0.05, 0, H - 0.025, 0, mainMat);
        addCyl(0.08, 0.12, H - 0.05, 0, (H - 0.05) / 2, 0, mainMat);
        addCyl(W * 0.28, W * 0.28, 0.03, 0, 0.015, 0, mainMat);
        break;
      }

      case 'office_desk': {
        const topT = 0.04;
        addBox(W, topT, D, 0, H - topT / 2, 0, mainMat);
        addBox(W * 0.28, H - topT, D * 0.92, W / 2 - W * 0.14, (H - topT) / 2, 0, secMat);
        addBox(0.05, H - topT, D * 0.9, -W / 2 + 0.04, (H - topT) / 2, 0, darkMat);
        addBox(0.52, 0.32, 0.03, -0.1, H + 0.22, -D * 0.2, darkMat);
        addBox(0.06, 0.08, 0.06, -0.1, H + 0.04, -D * 0.2, darkMat);
        break;
      }

      case 'office_chair': {
        addCyl(0.28, 0.28, 0.04, 0, 0.06, 0, darkMat);
        addCyl(0.03, 0.03, H * 0.42, 0, H * 0.21, 0, darkMat);
        addBox(W * 0.85, 0.07, D * 0.85, 0, H * 0.45, 0, mainMat);
        addBox(W * 0.8, H * 0.52, 0.06, 0, H * 0.72, -D * 0.38, mainMat);
        break;
      }

      case 'bookshelf': {
        addBox(0.04, H, D, -W / 2 + 0.02, H / 2, 0, mainMat);
        addBox(0.04, H, D, W / 2 - 0.02, H / 2, 0, mainMat);
        addBox(W, H, 0.02, 0, H / 2, -D / 2 + 0.01, mainMat);
        const shelves = 5;
        for (let i = 0; i <= shelves; i++) {
          const sy = (i / shelves) * (H - 0.04) + 0.02;
          addBox(W - 0.04, 0.03, D, 0, sy, 0, mainMat);
          if (i < shelves && i > 0) {
            addBox(W * 0.25, 0.22, D * 0.7, -W * 0.2, sy + 0.12, 0, secMat);
            addBox(W * 0.18, 0.25, D * 0.7, W * 0.15, sy + 0.14, 0, metalMat);
          }
        }
        break;
      }

      case 'rug_large': {
        addBox(W, 0.015, D, 0, 0.008, 0, mainMat, false);
        addBox(W * 0.86, 0.018, D * 0.84, 0, 0.01, 0, secMat, false);
        addBox(W * 0.72, 0.02, D * 0.68, 0, 0.012, 0, mainMat, false);
        break;
      }

      case 'rug_round_boho': {
        const radius = Math.min(W, D) / 2;
        addCyl(radius, radius, 0.014, 0, 0.007, 0, mainMat);
        addCyl(radius * 0.76, radius * 0.76, 0.018, 0, 0.010, 0, secMat);
        addCyl(radius * 0.45, radius * 0.45, 0.021, 0, 0.012, 0, mainMat);
        break;
      }

      case 'floor_lamp': {
        addCyl(W * 0.35, W * 0.35, 0.03, 0, 0.015, 0, metalMat);
        addCyl(0.02, 0.02, H * 0.78, 0, H * 0.39, 0, metalMat);
        const shadeMat = new THREE.MeshStandardMaterial({
          color: itemData.color || '#fef3c7',
          emissive: '#f59e0b',
          emissiveIntensity: 0.45,
          roughness: 0.5
        });
        addCyl(W * 0.35, W * 0.5, H * 0.22, 0, H * 0.88, 0, shadeMat);
        break;
      }

      case 'floor_lamp_arc': {
        // قاعدة رخامية ثقيلة + عمود مقوس يمتد للأمام + قبة مضيئة
        addCyl(0.18, 0.2, 0.06, -W * 0.32, 0.03, 0, secMat);
        addCyl(0.018, 0.022, H * 0.82, -W * 0.32, H * 0.42, 0, metalMat);
        const topArm = addBox(W * 0.68, 0.025, 0.025, 0.02, H * 0.88, 0, metalMat);
        topArm.rotation.z = -0.15;
        const glowShade = new THREE.MeshStandardMaterial({
          color: itemData.color || '#fef3c7',
          emissive: '#f59e0b',
          emissiveIntensity: 0.65,
          roughness: 0.3
        });
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.65), glowShade);
        dome.position.set(W * 0.32, H * 0.78, 0);
        dome.castShadow = true;
        dome.userData.isHitTarget = true;
        group.add(dome);
        break;
      }

      case 'table_lamp_luxury': {
        // أباجورة طاولة وكومودينو فندقية بقاعدة سيراميك/ذهب وشابوه مضيء
        addCyl(W * 0.28, W * 0.34, 0.04, 0, 0.02, 0, metalMat);
        addCyl(W * 0.22, W * 0.28, H * 0.42, 0, H * 0.23, 0, secMat);
        const shadeMat = new THREE.MeshStandardMaterial({
          color: itemData.color || '#fef3c7',
          emissive: '#f59e0b',
          emissiveIntensity: 0.55,
          roughness: 0.45
        });
        addCyl(W * 0.36, W * 0.48, H * 0.44, 0, H * 0.72, 0, shadeMat);
        break;
      }

      case 'wall_sconce_light': {
        // أبليك جداري مزدوج يضيء للأعلى والأسفل
        addBox(W * 0.55, H * 0.36, 0.03, 0, H / 2, -D / 2 + 0.02, secMat);
        const bulbMat = new THREE.MeshStandardMaterial({
          color: itemData.color || '#fef3c7',
          emissive: '#f59e0b',
          emissiveIntensity: 0.85,
          roughness: 0.2
        });
        addCyl(W * 0.22, W * 0.16, H * 0.38, 0, H * 0.74, 0.02, bulbMat);
        addCyl(W * 0.16, W * 0.22, H * 0.38, 0, H * 0.26, 0.02, bulbMat);
        break;
      }

      case 'chandelier': {
        addCyl(0.02, 0.02, H * 0.5, 0, H * 0.75, 0, metalMat);
        const glowMat = new THREE.MeshStandardMaterial({
          color: '#fef3c7',
          emissive: '#f59e0b',
          emissiveIntensity: 0.85,
          roughness: 0.2
        });
        addCyl(W * 0.48, W * 0.48, 0.08, 0, H * 0.35, 0, metalMat);
        addCyl(W * 0.32, W * 0.32, 0.12, 0, H * 0.15, 0, glowMat);
        break;
      }

      case 'plant_pot': {
        const potH = H * 0.32;
        addCyl(W * 0.36, W * 0.26, potH, 0, potH / 2, 0, secMat);
        addCyl(0.025, 0.035, H * 0.42, 0, potH + H * 0.18, 0, new THREE.MeshStandardMaterial({ color: '#5c3a21' }));
        const foliageMat = new THREE.MeshStandardMaterial({ color: itemData.color || '#065f46', roughness: 0.75 });
        const positions = [
          [0, potH + H * 0.38, 0, W * 0.44],
          [-W * 0.22, potH + H * 0.25, W * 0.15, W * 0.32],
          [W * 0.22, potH + H * 0.28, -W * 0.12, W * 0.34],
          [0, potH + H * 0.54, 0.04, W * 0.3]
        ];
        positions.forEach(([fx, fy, fz, r]) => {
          const sph = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), foliageMat);
          sph.position.set(fx, fy, fz);
          sph.castShadow = true;
          sph.userData.isHitTarget = true;
          group.add(sph);
        });
        break;
      }

      case 'plant_palm_tall': {
        // شجرة نخيل أريكا استوائية طويلة بسعف متفرع
        const potH = H * 0.26;
        addCyl(W * 0.28, W * 0.20, potH, 0, potH / 2, 0, secMat);
        const leafMat = new THREE.MeshStandardMaterial({ color: itemData.color || '#15803d', roughness: 0.65 });
        const stemAngles = [0, 1.05, 2.1, 3.14, 4.2, 5.25];
        stemAngles.forEach((ang, idx) => {
          const frondGroup = new THREE.Group();
          frondGroup.position.set(0, potH * 0.9, 0);
          frondGroup.rotation.y = ang;
          const tilt = 0.28 + (idx % 2) * 0.16;
          const stemLen = H * (0.62 + (idx % 3) * 0.08);
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.14, stemLen, 0.03), leafMat);
          blade.position.set(0, stemLen / 2, 0.08);
          blade.rotation.x = tilt;
          blade.castShadow = true;
          blade.userData.isHitTarget = true;
          frondGroup.add(blade);
          group.add(frondGroup);
        });
        break;
      }

      case 'plant_olive_tree': {
        // شجرة زيتون ديكورية بجذع خشبي رفيع وتاج كروي متدرج
        const potH = H * 0.28;
        addCyl(W * 0.32, W * 0.25, potH, 0, potH / 2, 0, secMat);
        const trunkMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.85 });
        addCyl(0.025, 0.04, H * 0.48, 0, potH + H * 0.22, 0, trunkMat);
        const oliveMat = new THREE.MeshStandardMaterial({ color: itemData.color || '#3f6212', roughness: 0.8 });
        const clusters = [
          [0, H * 0.78, 0, W * 0.38],
          [-W * 0.18, H * 0.68, 0.08, W * 0.26],
          [W * 0.18, H * 0.72, -0.06, W * 0.28],
          [0.05, H * 0.88, -0.05, W * 0.25]
        ];
        clusters.forEach(([cx, cy, cz, cr]) => {
          const cMesh = new THREE.Mesh(new THREE.SphereGeometry(cr, 14, 14), oliveMat);
          cMesh.position.set(cx, cy, cz);
          cMesh.castShadow = true;
          cMesh.userData.isHitTarget = true;
          group.add(cMesh);
        });
        break;
      }

      case 'plant_hanging_ivy': {
        // نبتة متسلقة متدلية للحائط أو الأرفف
        addBox(W * 0.7, 0.14, D * 0.7, 0, H - 0.08, 0, secMat);
        const ivyMat = new THREE.MeshStandardMaterial({ color: itemData.color || '#166534', roughness: 0.75 });
        const vines = 6;
        for (let i = 0; i < vines; i++) {
          const vx = -W * 0.28 + (i / (vines - 1)) * (W * 0.56);
          const vLen = H * (0.55 + (i % 3) * 0.14);
          addBox(0.05, vLen, 0.05, vx, H - 0.12 - vLen / 2, D * 0.18, ivyMat);
        }
        break;
      }

      case 'flower_vase_table': {
        // فازة ورد طبيعي للطاولات
        addCyl(W * 0.24, W * 0.32, H * 0.55, 0, H * 0.275, 0, secMat);
        const stemMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.7 });
        addCyl(W * 0.18, W * 0.12, H * 0.25, 0, H * 0.62, 0, stemMat);
        const bloomMat = new THREE.MeshStandardMaterial({ color: itemData.color || '#be185d', roughness: 0.5 });
        const blooms = [[0, H * 0.82, 0, 0.075], [-0.07, H * 0.76, 0.04, 0.06], [0.07, H * 0.76, -0.04, 0.06], [0, H * 0.75, 0.07, 0.055]];
        blooms.forEach(([bx, by, bz, br]) => {
          const b = new THREE.Mesh(new THREE.SphereGeometry(br, 12, 12), bloomMat);
          b.position.set(bx, by, bz);
          b.castShadow = true;
          b.userData.isHitTarget = true;
          group.add(b);
        });
        break;
      }

      case 'plant_succulent_set': {
        // طقم 3 صباريات أنيقة على صينية خشبية
        addBox(W, 0.025, D, 0, 0.012, 0, secMat);
        const sucMat = new THREE.MeshStandardMaterial({ color: itemData.color || '#0f766e', roughness: 0.65 });
        [-W * 0.3, 0, W * 0.3].forEach((px, i) => {
          addCyl(0.05, 0.04, H * 0.45, px, H * 0.25, 0, whiteMat);
          addCyl(0.045, 0.02, H * (0.4 + (i % 2) * 0.12), px, H * 0.68, 0, sucMat);
        });
        break;
      }

      case 'door_wood':
      case 'door_double':
      case 'door_sliding_glass':
      case 'window_glass': {
        const isWindow = type === 'window_glass';
        const isGlassDoor = type === 'door_sliding_glass';
        const defaultOpenType = (type === 'door_sliding_glass' || type === 'window_glass') ? 'sliding' : 'hinged';
        const openType = itemData.openType || defaultOpenType; // 'hinged' | 'sliding'
        const openDirection = itemData.openDirection || 'inward'; // 'inward' (+Z) | 'outward' (-Z)
        const defaultHinge = type === 'door_double' ? 'both' : 'right';
        const hingeSide = itemData.hingeSide || defaultHinge; // 'right' | 'left' | 'both'
        const openRatio = typeof itemData.openRatio === 'number' ? itemData.openRatio : 65; // 0..100
        const ratio01 = Math.max(0, Math.min(1, openRatio / 100));
        const dirSign = openDirection === 'outward' ? -1 : 1;
        const hasCollision = Boolean(itemData._hasSwingCollision);

        // 1. الحلق / الإطار الثابت المحيط بالباب أو النافذة (Outer Frame)
        const frameT = Math.min(0.055, W * 0.06);
        const frameD = D + 0.02;
        // القائم الأيسر والأيمن والعتبة العلوية
        addBox(frameT, H, frameD, -W / 2 + frameT / 2, H / 2, 0, mainMat);
        addBox(frameT, H, frameD, W / 2 - frameT / 2, H / 2, 0, mainMat);
        addBox(W, frameT, frameD, 0, H - frameT / 2, 0, mainMat);
        if (isWindow) {
          // جلسة النافذة السفلية (Window Sill)
          addBox(W + 0.06, frameT, frameD + 0.04, 0, frameT / 2, 0, mainMat);
        }

        const innerW = Math.max(0.2, W - frameT * 2);
        const innerH = Math.max(0.2, H - frameT - (isWindow ? frameT : 0.01));
        const leafCenterY = (isWindow ? frameT : 0.01) + innerH / 2;
        const panelThickness = Math.min(0.045, Math.max(0.03, D * 0.32));

        // دالة مساعدة لبناء ضلفة باب أو نافذة واحدة داخل مجموعة قابلة للتحريك أو التدوير
        const createLeafPanel = (leafW, isRightLeaf) => {
          const leafGroup = new THREE.Group();

          if (isWindow || isGlassDoor) {
            // إطار الضلفة الزجاجية
            const sashT = Math.min(0.04, leafW * 0.12);
            const topBar = new THREE.Mesh(new THREE.BoxGeometry(leafW, sashT, panelThickness), mainMat);
            topBar.position.set(0, innerH / 2 - sashT / 2, 0);
            const botBar = new THREE.Mesh(new THREE.BoxGeometry(leafW, sashT, panelThickness), mainMat);
            botBar.position.set(0, -innerH / 2 + sashT / 2, 0);
            const leftBar = new THREE.Mesh(new THREE.BoxGeometry(sashT, innerH, panelThickness), mainMat);
            leftBar.position.set(-leafW / 2 + sashT / 2, 0, 0);
            const rightBar = new THREE.Mesh(new THREE.BoxGeometry(sashT, innerH, panelThickness), mainMat);
            rightBar.position.set(leafW / 2 - sashT / 2, 0, 0);

            const glassPane = new THREE.Mesh(
              new THREE.BoxGeometry(Math.max(0.05, leafW - sashT * 2), Math.max(0.05, innerH - sashT * 2), panelThickness * 0.4),
              glassMat
            );
            const handleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.14, panelThickness + 0.03), metalMat);
            handleMesh.position.set(isRightLeaf ? -leafW * 0.38 : leafW * 0.38, 0, 0);

            [topBar, botBar, leftBar, rightBar, glassPane, handleMesh].forEach(m => {
              m.castShadow = true;
              m.receiveShadow = true;
              m.userData.isHitTarget = true;
              leafGroup.add(m);
            });
          } else {
            // ضلفة باب خشبي بحشوات ومقبض معدني
            const coreMesh = new THREE.Mesh(new THREE.BoxGeometry(leafW, innerH, panelThickness), mainMat);
            const upperInset = new THREE.Mesh(new THREE.BoxGeometry(leafW * 0.78, innerH * 0.38, panelThickness + 0.012), secMat);
            upperInset.position.set(0, innerH * 0.22, 0);
            const lowerInset = new THREE.Mesh(new THREE.BoxGeometry(leafW * 0.78, innerH * 0.34, panelThickness + 0.012), secMat);
            lowerInset.position.set(0, -innerH * 0.22, 0);

            const handleX = isRightLeaf ? -leafW * 0.36 : leafW * 0.36;
            const handleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.028, panelThickness + 0.055), metalMat);
            handleMesh.position.set(handleX, -innerH * 0.03, 0);

            [coreMesh, upperInset, lowerInset, handleMesh].forEach(m => {
              m.castShadow = true;
              m.receiveShadow = true;
              m.userData.isHitTarget = true;
              leafGroup.add(m);
            });
          }
          return leafGroup;
        };

        // 2. تركيب الضلف وحركتها (مفصلات Hinged أو سحب Sliding)
        const floorArcY = -( (itemData.elevation || 0) / 100 ) + 0.015; // رسم قوس المساحة على أرضية الغرفة دائماً
        const localArcY = isWindow ? 0.02 : Math.max(0.015, floorArcY);
        const arcColorHex = hasCollision ? 0xf43f5e : (openType === 'sliding' ? 0x10b981 : 0x38bdf8);

        if (openType === 'hinged') {
          const maxAngleRad = THREE.MathUtils.degToRad((openRatio / 100) * 90);
          const full90Rad = Math.PI / 2;

          // دالة لرسم قوس ومساحة تأرجح الضلفة المفصلية على الأرضية (Swing Clearance Sector)
          const addSwingArcVisual = (pivotX, pivotZ, radius, startAngle, endAngle, currentAngle) => {
            const segments = 28;
            const ptsOutline = [new THREE.Vector3(pivotX, localArcY, pivotZ)];
            for (let i = 0; i <= segments; i++) {
              const ang = startAngle + (endAngle - startAngle) * (i / segments);
              const px = pivotX + Math.cos(ang) * radius;
              const pz = pivotZ + Math.sin(ang) * radius;
              ptsOutline.push(new THREE.Vector3(px, localArcY, pz));
            }
            ptsOutline.push(new THREE.Vector3(pivotX, localArcY, pivotZ));

            // خط القوس الهندسي الكامل (90 درجة) لمعرفة أقصى مدى للفتح
            const arcLineMat = new THREE.LineBasicMaterial({
              color: arcColorHex,
              transparent: true,
              opacity: 0.9
            });
            const arcLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ptsOutline), arcLineMat);
            arcLine.userData.ignoreRaycast = true;
            group.add(arcLine);

            // تظليل أرضي شفاف لمساحة مسح الباب (Swept Floor Area Sector)
            const shapeGeometry = new THREE.BufferGeometry();
            const vertices = [];
            for (let i = 0; i < segments; i++) {
              const a1 = startAngle + (endAngle - startAngle) * (i / segments);
              const a2 = startAngle + (endAngle - startAngle) * ((i + 1) / segments);
              vertices.push(
                pivotX, localArcY - 0.003, pivotZ,
                pivotX + Math.cos(a1) * radius, localArcY - 0.003, pivotZ + Math.sin(a1) * radius,
                pivotX + Math.cos(a2) * radius, localArcY - 0.003, pivotZ + Math.sin(a2) * radius
              );
            }
            shapeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            const sectorMat = new THREE.MeshBasicMaterial({
              color: arcColorHex,
              transparent: true,
              opacity: hasCollision ? 0.34 : 0.18,
              side: THREE.DoubleSide,
              depthWrite: false
            });
            const sectorMesh = new THREE.Mesh(shapeGeometry, sectorMat);
            sectorMesh.userData.ignoreRaycast = true;
            group.add(sectorMesh);
          };

          if (hingeSide === 'both') {
            // ضلفتان تفتحان من الوسط نحو اليمين واليسار
            const halfLeafW = (innerW - 0.01) / 2;
            const pivotZ = dirSign * (D / 2);

            // الضلفة اليسرى (مفصلتها في أقصى اليسار)
            const leftPivot = new THREE.Group();
            leftPivot.position.set(-innerW / 2, leafCenterY, pivotZ);
            const leftLeaf = createLeafPanel(halfLeafW, false);
            leftLeaf.position.set(halfLeafW / 2, 0, 0);
            leftPivot.rotation.y = -dirSign * maxAngleRad;
            leftPivot.add(leftLeaf);
            group.add(leftPivot);

            // الضلفة اليمنى (مفصلتها في أقصى اليمين)
            const rightPivot = new THREE.Group();
            rightPivot.position.set(innerW / 2, leafCenterY, pivotZ);
            const rightLeaf = createLeafPanel(halfLeafW, true);
            rightLeaf.position.set(-halfLeafW / 2, 0, 0);
            rightPivot.rotation.y = dirSign * maxAngleRad;
            rightPivot.add(rightLeaf);
            group.add(rightPivot);

            // رسم قوسي الفتح للضلفتين
            addSwingArcVisual(-innerW / 2, pivotZ, halfLeafW, 0, dirSign * full90Rad, dirSign * maxAngleRad);
            addSwingArcVisual(innerW / 2, pivotZ, halfLeafW, Math.PI, Math.PI - dirSign * full90Rad, Math.PI - dirSign * maxAngleRad);
          } else {
            // ضلفة مفردة تفتح من اليمين أو اليسار
            const isRightHinge = hingeSide === 'right';
            const pivotX = isRightHinge ? innerW / 2 : -innerW / 2;
            const pivotZ = dirSign * (D / 2);

            const hingePivot = new THREE.Group();
            hingePivot.position.set(pivotX, leafCenterY, pivotZ);

            const leaf = createLeafPanel(innerW - 0.008, isRightHinge);
            leaf.position.set(isRightHinge ? -innerW / 2 : innerW / 2, 0, 0);
            hingePivot.rotation.y = isRightHinge ? (dirSign * maxAngleRad) : (-dirSign * maxAngleRad);
            hingePivot.add(leaf);
            group.add(hingePivot);

            if (isRightHinge) {
              addSwingArcVisual(pivotX, pivotZ, innerW, Math.PI, Math.PI - dirSign * full90Rad, Math.PI - dirSign * maxAngleRad);
            } else {
              addSwingArcVisual(pivotX, pivotZ, innerW, 0, dirSign * full90Rad, dirSign * maxAngleRad);
            }
          }
        } else {
          // آلية فتح سحب / جرار (Sliding Mechanism)
          const halfLeafW = innerW / 2 + 0.02;
          const maxSlideDist = (innerW / 2 - 0.06) * ratio01;

          if (hingeSide === 'both') {
            // ضلفتان تنزلقان للجانبين
            const leftLeaf = createLeafPanel(halfLeafW, false);
            leftLeaf.position.set(-innerW / 4 - maxSlideDist * 0.5, leafCenterY, -0.015);
            const rightLeaf = createLeafPanel(halfLeafW, true);
            rightLeaf.position.set(innerW / 4 + maxSlideDist * 0.5, leafCenterY, 0.015);
            group.add(leftLeaf, rightLeaf);
          } else {
            const isSlideRight = hingeSide === 'right';
            const fixedLeaf = createLeafPanel(halfLeafW, !isSlideRight);
            fixedLeaf.position.set(isSlideRight ? innerW / 4 : -innerW / 4, leafCenterY, -0.018);

            const movingLeaf = createLeafPanel(halfLeafW, isSlideRight);
            const startX = isSlideRight ? -innerW / 4 : innerW / 4;
            const slideDelta = isSlideRight ? maxSlideDist : -maxSlideDist;
            movingLeaf.position.set(startX + slideDelta, leafCenterY, 0.018);
            group.add(fixedLeaf, movingLeaf);
          }

          // رسم مسار السحب على الأرضية / الإطار لتوضيح عدم استهلاك مساحة تأرجح
          const trackZ = dirSign * (D / 2 + 0.08);
          const trackPts = [
            new THREE.Vector3(-innerW / 2, localArcY, trackZ),
            new THREE.Vector3(innerW / 2, localArcY, trackZ)
          ];
          const trackLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(trackPts),
            new THREE.LineBasicMaterial({ color: 0x10b981 })
          );
          trackLine.userData.ignoreRaycast = true;
          group.add(trackLine);
        }
        break;
      }

      case 'archway_open': {
        const pillarW = 0.18;
        const lintelH = 0.28;
        addBox(pillarW, H, D, -W / 2 + pillarW / 2, H / 2, 0, mainMat);
        addBox(pillarW, H, D, W / 2 - pillarW / 2, H / 2, 0, mainMat);
        addBox(W, lintelH, D, 0, H - lintelH / 2, 0, mainMat);
        break;
      }

      case 'curtain_drape':
      case 'curtain_sheer_double': {
        // ماسورة الستارة العلوية مع نهايات ذهبية + إمكانية فتح وإزاحة قماش الستارة للجانبين
        const openPct = typeof itemData.curtainOpenRatio === 'number' ? itemData.curtainOpenRatio : 25;
        const open01 = Math.max(0, Math.min(0.85, (openPct / 100) * 0.85));

        const rod = addCyl(0.016, 0.016, W + 0.14, 0, H - 0.03, 0, metalMat);
        rod.rotation.z = Math.PI / 2;

        // إذا كانت ستارة فندقية مزدوجة نضيف طبقة شيفون بيضاء شفافة خلفية تغطي عرض النافذة
        if (type === 'curtain_sheer_double') {
          const sheerMat = new THREE.MeshStandardMaterial({
            color: '#f8fafc',
            transparent: true,
            opacity: 0.52,
            roughness: 0.6
          });
          addBox(W * 0.94, H - 0.06, D * 0.3, 0, (H - 0.06) / 2, -D * 0.22, sheerMat);
        }

        // جانب الستارة الأيسر والأيمن (ينكمشان للجانبين عند زيادة نسبة فتح الستارة)
        const panelSpan = (W / 2) * (1 - open01 * 0.72);
        const foldsPerSide = 5;
        const foldW = panelSpan / foldsPerSide;

        // الجانب الأيسر
        for (let i = 0; i < foldsPerSide; i++) {
          const fx = -W / 2 + (i + 0.5) * foldW;
          const fz = (i % 2 === 0 ? 0.012 : -0.012) + (type === 'curtain_sheer_double' ? D * 0.18 : 0);
          addBox(foldW * 0.88, H - 0.05, D * 0.55, fx, (H - 0.05) / 2, fz, mainMat);
        }
        // الجانب الأيمن
        for (let i = 0; i < foldsPerSide; i++) {
          const fx = W / 2 - (i + 0.5) * foldW;
          const fz = (i % 2 === 0 ? 0.012 : -0.012) + (type === 'curtain_sheer_double' ? D * 0.18 : 0);
          addBox(foldW * 0.88, H - 0.05, D * 0.55, fx, (H - 0.05) / 2, fz, mainMat);
        }
        break;
      }

      case 'curtain_roller_blinds':
      case 'curtain_roman': {
        // ستارة رول أو رومانية ترتفع للأعلى حسب نسبة الفتح (curtainOpenRatio)
        const openPct = typeof itemData.curtainOpenRatio === 'number' ? itemData.curtainOpenRatio : 20;
        const closedFraction = Math.max(0.12, 1 - (openPct / 100) * 0.85);
        const boxHeaderH = 0.08;
        addBox(W, boxHeaderH, D, 0, H - boxHeaderH / 2, 0, secMat);

        const dropH = (H - boxHeaderH) * closedFraction;
        const dropCenterY = H - boxHeaderH - dropH / 2;

        if (type === 'curtain_roller_blinds') {
          // شرائح زيبرا أفقية متبادلة
          const stripes = 8;
          const sh = dropH / stripes;
          for (let i = 0; i < stripes; i++) {
            const sy = H - boxHeaderH - (i + 0.5) * sh;
            addBox(W * 0.96, sh * 0.85, 0.025, 0, sy, 0, i % 2 === 0 ? mainMat : glassMat);
          }
        } else {
          // طيات قماشية رومانية
          const pleats = 5;
          const ph = dropH / pleats;
          for (let i = 0; i < pleats; i++) {
            const py = H - boxHeaderH - (i + 0.5) * ph;
            addBox(W * 0.96, ph * 0.92, D * 0.45, 0, py, (i % 2) * 0.01, mainMat);
          }
        }
        // قضيب الثقل السفلي
        addBox(W * 0.97, 0.03, 0.04, 0, H - boxHeaderH - dropH, 0, secMat);
        break;
      }

      case 'mirror_standing_arch': {
        // مرآة أرضية طويلة بإطار ذهبي وسطح عاكس
        addBox(W, H, D * 0.5, 0, H / 2, 0, mainMat);
        const mirrorGlassMat = new THREE.MeshStandardMaterial({
          color: '#bae6fd',
          roughness: 0.05,
          metalness: 0.85
        });
        addBox(W - 0.08, H - 0.08, D * 0.5 + 0.015, 0, H / 2, 0.005, mirrorGlassMat);
        break;
      }

      case 'wall_clock_modern': {
        // ساعة حائط دائرية بإطار وعقارب ذهبية
        const radius = Math.min(W, H) / 2;
        const clockRing = addCyl(radius, radius, D, 0, H / 2, 0, mainMat);
        clockRing.rotation.x = Math.PI / 2;
        const clockFace = addCyl(radius * 0.88, radius * 0.88, D + 0.01, 0, H / 2, 0, whiteMat);
        clockFace.rotation.x = Math.PI / 2;
        // عقرب الساعات والدقائق
        addBox(0.02, radius * 0.55, 0.02, 0, H / 2 + radius * 0.22, D / 2 + 0.01, metalMat);
        addBox(radius * 0.45, 0.02, 0.02, radius * 0.18, H / 2, D / 2 + 0.01, metalMat);
        break;
      }

      case 'wall_art_triptych': {
        // طقم 3 لوحات جدارية متجاورة
        const panelW = (W - 0.12) / 3;
        [-panelW - 0.05, 0, panelW + 0.05].forEach((px, idx) => {
          addBox(panelW, H, D, px, H / 2, 0, secMat);
          addBox(panelW - 0.06, H - 0.06, D + 0.012, px, H / 2, 0.005, idx === 1 ? metalMat : mainMat);
        });
        break;
      }

      case 'floating_shelf_decor': {
        // رف حائط عائم مع كتب وفازة صغيرة
        addBox(W, 0.045, D, 0, 0.025, 0, mainMat);
        addBox(W * 0.22, H * 0.65, D * 0.7, -W * 0.28, 0.045 + H * 0.32, 0, secMat);
        addCyl(0.07, 0.05, H * 0.72, W * 0.22, 0.045 + H * 0.36, 0, metalMat);
        break;
      }

      case 'decor_tray_candles': {
        // صينية عطور وشموع ديكورية للطاولات
        addBox(W, 0.025, D, 0, 0.012, 0, mainMat);
        addCyl(0.045, 0.045, H * 0.75, -W * 0.2, H * 0.38, 0, whiteMat);
        addCyl(0.04, 0.04, H * 0.55, 0.02, H * 0.28, 0.03, whiteMat);
        addCyl(0.05, 0.035, H * 0.82, W * 0.22, H * 0.42, -0.02, metalMat);
        break;
      }

      case 'coat_stand_wood': {
        // شماعة ملابس قائمة
        addCyl(W * 0.38, W * 0.42, 0.04, 0, 0.02, 0, mainMat);
        addCyl(0.025, 0.032, H - 0.04, 0, H / 2, 0, mainMat);
        addBox(W * 0.65, 0.025, 0.025, 0, H * 0.88, 0, secMat);
        addBox(0.025, 0.025, D * 0.65, 0, H * 0.84, 0, secMat);
        break;
      }

      case 'laundry_basket_woven': {
        // سلة خوص أسطوانية بغطاء
        addCyl(W * 0.46, W * 0.38, H * 0.9, 0, H * 0.45, 0, mainMat);
        addCyl(W * 0.48, W * 0.48, H * 0.08, 0, H * 0.94, 0, secMat);
        break;
      }

      case 'partition_screen': {
        addBox(W, 0.06, D, 0, 0.03, 0, secMat);
        addBox(W, 0.06, D, 0, H - 0.03, 0, secMat);
        const slats = 10;
        const sw = W / slats;
        for (let i = 0; i < slats; i++) {
          addBox(0.04, H, D * 0.8, -W / 2 + (i + 0.5) * sw, H / 2, 0, mainMat);
        }
        break;
      }

      case 'stairs_straight': {
        const steps = 12;
        const stepD = D / steps;
        const stepH = H / steps;
        for (let i = 0; i < steps; i++) {
          const sy = (i + 1) * stepH;
          const sz = -D / 2 + (i + 0.5) * stepD;
          addBox(W, sy, stepD, 0, sy / 2, sz, mainMat);
        }
        break;
      }

      case 'wall_art': {
        addBox(W, H, D, 0, H / 2, 0, secMat);
        addBox(W - 0.08, H - 0.08, D + 0.01, 0, H / 2, 0, mainMat);
        break;
      }

      default: {
        addBox(W, H, D, 0, H / 2, 0, mainMat);
      }
    }

    return group;
  }
};
