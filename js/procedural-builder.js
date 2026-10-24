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

      case 'floor_lamp': {
        addCyl(W * 0.35, W * 0.35, 0.03, 0, 0.015, 0, metalMat);
        addCyl(0.02, 0.02, H * 0.78, 0, H * 0.39, 0, metalMat);
        const shadeMat = new THREE.MeshStandardMaterial({
          color: itemData.color || '#fef3c7',
          emissive: '#f59e0b',
          emissiveIntensity: 0.4,
          roughness: 0.5
        });
        addCyl(W * 0.35, W * 0.5, H * 0.22, 0, H * 0.88, 0, shadeMat);
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
        const potH = H * 0.35;
        addCyl(W * 0.38, W * 0.28, potH, 0, potH / 2, 0, secMat);
        const foliageMat = new THREE.MeshStandardMaterial({ color: itemData.color || '#065f46', roughness: 0.8 });
        const positions = [
          [0, potH + H * 0.35, 0, W * 0.45],
          [-W * 0.2, potH + H * 0.22, W * 0.15, W * 0.32],
          [W * 0.22, potH + H * 0.25, -W * 0.12, W * 0.35],
          [0, potH + H * 0.52, 0.05, W * 0.3]
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

      case 'door_wood':
      case 'door_double': {
        addBox(W, H, D, 0, H / 2, 0, mainMat);
        if (type === 'door_double') {
          addBox(W * 0.44, H * 0.85, D + 0.02, -W * 0.24, H * 0.5, 0, secMat);
          addBox(W * 0.44, H * 0.85, D + 0.02, W * 0.24, H * 0.5, 0, secMat);
          addBox(0.04, 0.22, D + 0.08, -0.06, H * 0.48, 0, metalMat);
          addBox(0.04, 0.22, D + 0.08, 0.06, H * 0.48, 0, metalMat);
        } else {
          addBox(W * 0.84, H * 0.42, D + 0.02, 0, H * 0.72, 0, secMat);
          addBox(W * 0.84, H * 0.38, D + 0.02, 0, H * 0.25, 0, secMat);
          addBox(0.12, 0.03, D + 0.08, W * 0.35, H * 0.48, 0, metalMat);
        }
        break;
      }

      case 'door_sliding_glass':
      case 'window_glass': {
        addBox(W, H, D, 0, H / 2, 0, mainMat);
        addBox(W * 0.9, H * 0.88, D + 0.02, 0, H / 2, 0, glassMat);
        addBox(0.04, H, D + 0.03, 0, H / 2, 0, mainMat);
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

      case 'curtain_drape': {
        addCyl(0.015, 0.015, W + 0.1, 0, H - 0.03, 0, metalMat).rotation.z = Math.PI / 2;
        const folds = 8;
        const fw = W / folds;
        for (let i = 0; i < folds; i++) {
          addBox(fw * 0.85, H - 0.05, D, -W / 2 + (i + 0.5) * fw, (H - 0.05) / 2, 0, mainMat);
        }
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
