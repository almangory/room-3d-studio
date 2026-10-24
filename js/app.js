/**
 * المحرك الرئيسي للاستوديو الهندسي ثلاثي الأبعاد للمنازل الكاملة وتنسيق الأثاث
 * يدعم:
 * 1. نظام التراجع والإعادة الكامل (Undo / Redo History Stack: Ctrl+Z / Ctrl+Y)
 * 2. تحديد دقيق جداً خالٍ من التداخل (يتجاهل اللافتات النصية وصناديق التحديد ويعطي أولوية للأثاث فوق السجاد)
 * 3. بناء وعرض غرف متجاورة لكامل المنزل مع إمكانية إضافة غرف مجاورة بنقرة واحدة
 */

class RoomStudioApp {
  constructor() {
    this.container = document.getElementById('viewport-container');

    // مصفوفة الغرف في المنزل (كل غرفة لها أبعادها وموقعها بالسنتيمتر)
    this.rooms = [
      {
        id: 'room_1',
        name: 'غرفة المعيشة الرئيسية',
        width: 500,
        depth: 400,
        height: 300,
        offsetX: 0,
        offsetZ: 0,
        floorId: 'oak_parquet',
        wallId: 'warm_white'
      }
    ];
    this.activeRoomId = 'room_1';

    this.settings = {
      snapStep: 5,
      showDimensions: true,
      lightingMode: 'day'
    };

    // إعدادات زوايا ولون وشدة الإضاءة والظلال
    this.lightingSettings = {
      azimuth: 135,
      elevation: 50,
      sunColor: '#fffbeb',
      ambientColor: '#ffffff',
      sunIntensity: 0.92,
      ambientIntensity: 0.68,
      shadowsEnabled: true,
      autoOrbit: false
    };

    this.items = []; // مصفوفة قطع الأثاث والمكونات المعمارية
    this.selectedItem = null;
    this.isDragging = false;
    this.dragMoved = false;
    this.viewMode = '3d';

    // سجل التراجع والإعادة (Undo / Redo Stack)
    this.historyStack = [];
    this.historyIndex = -1;
    this.isRestoringHistory = false;

    // مجموعات المشهد الثلاثي
    this.roomGroup = new THREE.Group();
    this.furnitureGroup = new THREE.Group();
    this.dimensionRulersGroup = new THREE.Group();
    this.clearanceLinesGroup = new THREE.Group();
    this.walls = [];

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.dragOffset = new THREE.Vector3();

    this.initThree();
    this.initLights();
    this.initInteractions();
    this.initUI();

    // تحميل المشروع المحفوظ أو آخر حالة محفوظة تلقائياً
    if (!this.restoreAutoSavedProject()) {
      this.loadPreset('saved_bedroom_315x364', false);
    }
    this.pushHistory('بدء المشروع');

    this.animate();
  }

  saveAutoProjectToStorage() {
    try {
      const payload = {
        version: '2.0',
        settings: this.settings,
        rooms: this.rooms,
        activeRoomId: this.activeRoomId,
        items: this.items.map(i => i.userData.itemData)
      };
      localStorage.setItem('room_studio_autosave_v2', JSON.stringify(payload));
    } catch (_) {
      // تجاهل قيود التخزين المحلي إن وجدت
    }
  }

  restoreAutoSavedProject() {
    try {
      const raw = localStorage.getItem('room_studio_autosave_v2');
      if (!raw) return false;
      const data = JSON.parse(raw);
      return this.applyImportedProjectData(data, false);
    } catch (_) {
      return false;
    }
  }

  // ==================== إدارة الغرفة النشطة ====================
  get activeRoom() {
    return this.rooms.find(r => r.id === this.activeRoomId) || this.rooms[0];
  }

  /**
   * إيجاد الغرفة التي تقع بداخلها النقطة الإحداثية (x, z) بالسنتيمتر
   */
  findRoomContainingPoint(xCm, zCm) {
    for (const r of this.rooms) {
      const halfW = r.width / 2;
      const halfD = r.depth / 2;
      if (
        xCm >= r.offsetX - halfW - 15 &&
        xCm <= r.offsetX + halfW + 15 &&
        zCm >= r.offsetZ - halfD - 15 &&
        zCm <= r.offsetZ + halfD + 15
      ) {
        return r;
      }
    }
    return this.activeRoom;
  }

  /**
   * حساب الصندوق المحيط بكامل المنزل (House Bounding Box) بالسنتيمتر
   */
  getHouseBoundsCm() {
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity, maxH = 300;
    this.rooms.forEach(r => {
      minX = Math.min(minX, r.offsetX - r.width / 2);
      maxX = Math.max(maxX, r.offsetX + r.width / 2);
      minZ = Math.min(minZ, r.offsetZ - r.depth / 2);
      maxZ = Math.max(maxZ, r.offsetZ + r.depth / 2);
      maxH = Math.max(maxH, r.height);
    });
    return { minX, maxX, minZ, maxZ, maxH };
  }

  // ==================== نظام التراجع والإعادة (Undo / Redo) ====================
  serializeState() {
    return JSON.stringify({
      rooms: this.rooms,
      activeRoomId: this.activeRoomId,
      items: this.items.map(g => g.userData.itemData)
    });
  }

  pushHistory(actionLabel = '') {
    if (this.isRestoringHistory) return;
    const snap = this.serializeState();
    if (this.historyIndex >= 0 && this.historyStack[this.historyIndex]?.snap === snap) {
      return; // لم يحدث تغيير فعلي
    }
    // حذف أي فروع مستقبلية بعد المؤشر الحالي
    this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
    this.historyStack.push({ snap, label: actionLabel });
    if (this.historyStack.length > 50) {
      this.historyStack.shift();
    } else {
      this.historyIndex++;
    }
    this.updateUndoRedoButtons();
    this.saveAutoProjectToStorage();
  }

  undo() {
    if (this.historyIndex <= 0) return;
    this.historyIndex--;
    this.restoreSnapshot(this.historyStack[this.historyIndex].snap);
    this.updateUndoRedoButtons();
    this.saveAutoProjectToStorage();
  }

  redo() {
    if (this.historyIndex >= this.historyStack.length - 1) return;
    this.historyIndex++;
    this.restoreSnapshot(this.historyStack[this.historyIndex].snap);
    this.updateUndoRedoButtons();
    this.saveAutoProjectToStorage();
  }

  restoreSnapshot(snapString) {
    this.isRestoringHistory = true;
    try {
      const state = JSON.parse(snapString);
      const prevSelectedUid = this.selectedItem?.userData?.itemData?.uid;

      this.selectItem(null);
      while (this.furnitureGroup.children.length > 0) {
        this.furnitureGroup.remove(this.furnitureGroup.children[0]);
      }
      this.items = [];

      this.rooms = state.rooms;
      this.activeRoomId = state.activeRoomId || this.rooms[0]?.id;

      this.buildAllRooms();
      this.renderRoomsTabsUI();
      this.syncActiveRoomInputsUI();

      state.items.forEach(itemConf => {
        this.addFurnitureItem(itemConf.catalogId, itemConf, false);
      });

      if (prevSelectedUid) {
        const found = this.items.find(g => g.userData.itemData.uid === prevSelectedUid);
        this.selectItem(found || null);
      } else {
        this.selectItem(null);
      }
      this.updateRoomStatsUI();
    } finally {
      this.isRestoringHistory = false;
    }
  }

  updateUndoRedoButtons() {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) {
      btnUndo.disabled = this.historyIndex <= 0;
      btnUndo.classList.toggle('opacity-40', this.historyIndex <= 0);
      btnUndo.classList.toggle('pointer-events-none', this.historyIndex <= 0);
    }
    if (btnRedo) {
      btnRedo.disabled = this.historyIndex >= this.historyStack.length - 1;
      btnRedo.classList.toggle('opacity-40', this.historyIndex >= this.historyStack.length - 1);
      btnRedo.classList.toggle('pointer-events-none', this.historyIndex >= this.historyStack.length - 1);
    }
  }

  // ==================== تهيئة المشهد الثلاثي (Three.js Setup) ====================
  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0f172a');

    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;

    this.perspCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 150);
    this.perspCamera.position.set(8.5, 8.2, 9.5);

    const aspect = w / h;
    const frustumSize = 11.5;
    this.orthoCamera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      80
    );
    this.orthoCamera.position.set(0, 18, 0);
    this.orthoCamera.lookAt(0, 0, 0);

    this.activeCamera = this.perspCamera;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(this.activeCamera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.screenSpacePanning = true;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.12;
    this.controls.minDistance = 0.25;
    this.controls.maxDistance = 55;
    this.controls.target.set(0, 0.4, 0);

    this.scene.add(this.roomGroup);
    this.scene.add(this.furnitureGroup);
    this.scene.add(this.dimensionRulersGroup);
    this.scene.add(this.clearanceLinesGroup);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initLights() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, this.lightingSettings.ambientIntensity);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x334155, 0.45);
    this.hemiLight.position.set(0, 14, 0);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfffbeb, this.lightingSettings.sunIntensity);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 50;
    const d = 12;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    this.warmRoomLight = new THREE.PointLight(0xf59e0b, 0.15, 18);
    this.warmRoomLight.position.set(0, 2.8, 0);
    this.scene.add(this.warmRoomLight);

    this.updateLights();
  }

  /**
   * تحديث زوايا وألوان وشدة الإضاءة وموقع الشمس في المشهد ثلاثي الأبعاد
   */
  updateLights() {
    if (!this.dirLight || !this.ambientLight) return;
    const s = this.lightingSettings;

    // 1. حساب زوايا الإضاءة بدقة (Azimuth & Elevation) باستخدام الإحداثيات الكروية
    const azRad = THREE.MathUtils.degToRad(s.azimuth);
    const elRad = THREE.MathUtils.degToRad(s.elevation);
    const R = 24; // مسافة مصدر الضوء عن مركز الغرفة

    const room = this.activeRoom || this.rooms[0];
    const cx = (room ? room.offsetX : 0) / 100;
    const cz = (room ? room.offsetZ : 0) / 100;

    const lx = cx + R * Math.cos(elRad) * Math.sin(azRad);
    const ly = Math.max(2.5, R * Math.sin(elRad));
    const lz = cz + R * Math.cos(elRad) * Math.cos(azRad);

    this.dirLight.position.set(lx, ly, lz);
    this.dirLight.target.position.set(cx, 0, cz);
    this.dirLight.target.updateMatrixWorld();

    // 2. تحديث لون وشدة الضوء المباشر
    this.dirLight.color.set(s.sunColor);
    this.dirLight.intensity = s.sunIntensity;

    // 3. تحديث لون وشدة الإضاءة المحيطية
    this.ambientLight.color.set(s.ambientColor);
    this.ambientLight.intensity = s.ambientIntensity;

    // 4. تفعيل أو إيقاف الظلال
    this.dirLight.castShadow = Boolean(s.shadowsEnabled);

    // 5. ضبط كاميرا الظلال بحسب اتساع الغرفة
    if (room) {
      const maxDim = Math.max(room.width, room.depth) / 100;
      const d = Math.max(12, maxDim * 1.4);
      this.dirLight.shadow.camera.left = -d;
      this.dirLight.shadow.camera.right = d;
      this.dirLight.shadow.camera.top = d;
      this.dirLight.shadow.camera.bottom = -d;
      this.dirLight.shadow.camera.updateProjectionMatrix();
    }
  }

  /**
   * مزامنة حقول وأشرطة التمرير في لوحة استوديو الإضاءة
   */
  syncLightingInputsUI(updateSliders = true) {
    const s = this.lightingSettings;
    if (!s) return;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };
    const setText = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    if (updateSliders) {
      setVal('light-azimuth', Math.round(s.azimuth));
      setVal('light-elevation', Math.round(s.elevation));
      setVal('light-intensity-sun', s.sunIntensity);
      setVal('light-intensity-ambient', s.ambientIntensity);
      setVal('light-sun-color', s.sunColor);
      setVal('light-ambient-color', s.ambientColor);
      const chk = document.getElementById('light-shadows-toggle');
      if (chk) chk.checked = Boolean(s.shadowsEnabled);
    }

    setText('light-azimuth-val', `${Math.round(s.azimuth)}°`);
    setText('light-elevation-val', `${Math.round(s.elevation)}°`);
    setText('light-intensity-sun-val', Number(s.sunIntensity).toFixed(2));
    setText('light-intensity-ambient-val', Number(s.ambientIntensity).toFixed(2));
    setText('light-sun-hex', s.sunColor);
    setText('light-ambient-hex', s.ambientColor);

    const orbitBtn = document.getElementById('btn-toggle-auto-orbit');
    const orbitLabel = document.getElementById('auto-orbit-label');
    const orbitIcon = document.getElementById('auto-orbit-icon');
    if (orbitBtn && orbitLabel && orbitIcon) {
      if (s.autoOrbit) {
        orbitBtn.className = 'w-full py-1.5 px-2 rounded-xl bg-amber-600 text-white border border-amber-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md';
        orbitLabel.textContent = 'إيقاف محاكاة حركة الشمس';
        orbitIcon.textContent = '⏸️';
      } else {
        orbitBtn.className = 'w-full py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-1.5';
        orbitLabel.textContent = 'تشغيل محاكاة حركة الشمس التلقائية';
        orbitIcon.textContent = '🔄';
      }
    }
  }

  /**
   * تطبيق وضع إضاءة وزوايا جاهزة
   */
  applyLightingPreset(presetId) {
    const s = this.lightingSettings;
    switch (presetId) {
      case 'morning':
        s.azimuth = 45;
        s.elevation = 25;
        s.sunColor = '#fff3e0';
        s.ambientColor = '#f1f5f9';
        s.sunIntensity = 1.05;
        s.ambientIntensity = 0.65;
        this.scene.background = new THREE.Color('#0f172a');
        break;
      case 'noon':
        s.azimuth = 90;
        s.elevation = 78;
        s.sunColor = '#ffffff';
        s.ambientColor = '#f8fafc';
        s.sunIntensity = 1.15;
        s.ambientIntensity = 0.72;
        this.scene.background = new THREE.Color('#0f172a');
        break;
      case 'golden':
        s.azimuth = 235;
        s.elevation = 18;
        s.sunColor = '#ffb066';
        s.ambientColor = '#fde68a';
        s.sunIntensity = 1.25;
        s.ambientIntensity = 0.55;
        this.scene.background = new THREE.Color('#1e1b4b');
        break;
      case 'studio':
        s.azimuth = 145;
        s.elevation = 48;
        s.sunColor = '#f8fafc';
        s.ambientColor = '#cbd5e1';
        s.sunIntensity = 0.95;
        s.ambientIntensity = 0.70;
        this.scene.background = new THREE.Color('#0f172a');
        break;
      case 'night':
        s.azimuth = 315;
        s.elevation = 35;
        s.sunColor = '#93c5fd';
        s.ambientColor = '#1e293b';
        s.sunIntensity = 0.35;
        s.ambientIntensity = 0.28;
        this.scene.background = new THREE.Color('#090d16');
        break;
    }
    this.updateLights();
    this.syncLightingInputsUI(true);
    this.pushHistory(`إضاءة: وضع ${presetId}`);
  }

  setLightingMode(mode) {
    this.settings.lightingMode = mode;
    if (mode === 'night') {
      this.applyLightingPreset('night');
    } else {
      this.applyLightingPreset('studio');
    }
  }

  // ==================== بناء غرف المنزل المتجاورة (Multi-Room Builder) ====================
  buildAllRooms() {
    while (this.roomGroup.children.length > 0) {
      this.roomGroup.remove(this.roomGroup.children[0]);
    }
    this.walls = [];

    const wallThickness = 0.10;

    this.rooms.forEach(room => {
      const W = room.width / 100;
      const D = room.depth / 100;
      const H = room.height / 100;
      const ox = room.offsetX / 100;
      const oz = room.offsetZ / 100;
      const isSelectedRoom = room.id === this.activeRoomId;

      const singleRoomContainer = new THREE.Group();
      singleRoomContainer.position.set(ox, 0, oz);

      // 1. أرضية وموكيت الغرفة
      const floorMatData = window.ROOM_MATERIALS.floors.find(f => f.id === room.floorId) || window.ROOM_MATERIALS.floors[0];
      const floorColor = room.customFloorColor || floorMatData.color;
      const floorType = room.customFloorColor ? 'carpet' : floorMatData.type;
      const floorTex = window.ProceduralBuilder.createFloorTexture(floorType, floorColor);
      floorTex.repeat.set(W / 1.5, D / 1.5);

      const floorGeo = new THREE.BoxGeometry(W, 0.08, D);
      const floorMat = new THREE.MeshStandardMaterial({
        map: floorTex,
        roughness: room.customFloorColor ? 0.95 : floorMatData.roughness
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.position.set(0, -0.04, 0);
      floorMesh.receiveShadow = true;
      floorMesh.userData.roomId = room.id;
      singleRoomContainer.add(floorMesh);

      // إطار مضيء حول أرضية الغرفة النشطة حالياً لتمييزها عند وجود عدة غرف
      if (isSelectedRoom && this.rooms.length > 1) {
        const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(W + 0.02, 0.09, D + 0.02));
        const borderMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
        const borderLine = new THREE.LineSegments(borderGeo, borderMat);
        borderLine.position.set(0, -0.03, 0);
        borderLine.userData.ignoreRaycast = true;
        singleRoomContainer.add(borderLine);
      }

      // 2. شبكة القياس الهندسية على الأرضية (كل 50 سم وكل 100 سم)
      const gridGroup = new THREE.Group();
      gridGroup.position.y = 0.003;
      const lineMatMain = new THREE.LineBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.22 });
      const lineMatSub = new THREE.LineBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.08 });

      for (let x = -W / 2; x <= W / 2 + 0.001; x += 0.5) {
        const isMeter = Math.abs((x + W / 2) % 1) < 0.01;
        const pts = [new THREE.Vector3(x, 0, -D / 2), new THREE.Vector3(x, 0, D / 2)];
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), isMeter ? lineMatMain : lineMatSub);
        line.userData.ignoreRaycast = true;
        gridGroup.add(line);
      }
      for (let z = -D / 2; z <= D / 2 + 0.001; z += 0.5) {
        const isMeter = Math.abs((z + D / 2) % 1) < 0.01;
        const pts = [new THREE.Vector3(-W / 2, 0, z), new THREE.Vector3(W / 2, 0, z)];
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), isMeter ? lineMatMain : lineMatSub);
        line.userData.ignoreRaycast = true;
        gridGroup.add(line);
      }
      singleRoomContainer.add(gridGroup);

      // 3. الحوائط الأربعة للغرفة
      const wallData = window.ROOM_MATERIALS.walls.find(w => w.id === room.wallId) || window.ROOM_MATERIALS.walls[0];
      const wallColor = room.customWallColor || wallData.color;

      const createWall = (w, h, d, lx, ly, lz, normalVec, side) => {
        // فحص هل هذا الحائط مشترك مع غرفة مجاورة أخرى (Internal Partition Wall)
        const worldWallX = room.offsetX + lx * 100;
        const worldWallZ = room.offsetZ + lz * 100;
        let isSharedInteriorWall = false;

        this.rooms.forEach(other => {
          if (other.id === room.id) return;
          const distToOtherCenterX = Math.abs(worldWallX - other.offsetX);
          const distToOtherCenterZ = Math.abs(worldWallZ - other.offsetZ);
          if (
            distToOtherCenterX <= other.width / 2 + 18 &&
            distToOtherCenterZ <= other.depth / 2 + 18
          ) {
            isSharedInteriorWall = true;
          }
        });

        const mat = new THREE.MeshStandardMaterial({
          color: wallColor,
          roughness: 0.85,
          transparent: true,
          opacity: 1.0
        });
        // الحوائط الداخلية الفاصلة بين الغرف المتجاورة تكون بارتفاع منخفض أو شبه شفافة لتسهيل رؤية المنزل بالكامل
        const actualHeight = isSharedInteriorWall ? H * 0.35 : H;
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, actualHeight, d), mat);
        mesh.position.set(lx, actualHeight / 2, lz);
        mesh.receiveShadow = true;
        mesh.userData.normal = normalVec;
        mesh.userData.isSharedInterior = isSharedInteriorWall;
        mesh.userData.ignoreRaycast = true;
        singleRoomContainer.add(mesh);
        this.walls.push(mesh);
      };

      createWall(W, H, wallThickness, 0, H / 2, -D / 2, new THREE.Vector3(0, 0, 1), 'north');
      createWall(W, H, wallThickness, 0, H / 2, D / 2, new THREE.Vector3(0, 0, -1), 'south');
      createWall(wallThickness, H, D, -W / 2, H / 2, 0, new THREE.Vector3(1, 0, 0), 'west');
      createWall(wallThickness, H, D, W / 2, H / 2, 0, new THREE.Vector3(-1, 0, 0), 'east');

      this.roomGroup.add(singleRoomContainer);
    });

    this.buildRoomRulers();
    this.validateAllItemsBounds();
    this.updateRoomStatsUI();
  }

  /**
   * رسم مساطر ولافتات أسماء الغرف وأبعادها
   */
  buildRoomRulers() {
    while (this.dimensionRulersGroup.children.length > 0) {
      this.dimensionRulersGroup.remove(this.dimensionRulersGroup.children[0]);
    }
    if (!this.settings.showDimensions) return;

    const rulerMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });

    this.rooms.forEach(room => {
      const W = room.width / 100;
      const D = room.depth / 100;
      const ox = room.offsetX / 100;
      const oz = room.offsetZ / 100;
      const isSelected = room.id === this.activeRoomId;

      // لافتة اسم الغرفة ومقاسها في زاويتها العلوية
      const titleSprite = window.ProceduralBuilder.createLabelSprite(
        `${room.name} (${room.width}×${room.depth} سم)`,
        isSelected ? 'rgba(2, 132, 199, 0.92)' : 'rgba(15, 23, 42, 0.85)',
        isSelected ? '#bae6fd' : '#64748b',
        0.65
      );
      titleSprite.position.set(ox, 0.12, oz - D / 2 + 0.35);
      this.dimensionRulersGroup.add(titleSprite);

      // إذا كانت الغرفة هي الغرفة النشطة نرسم مساطر الطول والعرض التفصيلية حولها
      if (isSelected) {
        const offset = 0.38;
        const wPts = [
          new THREE.Vector3(ox - W / 2, 0.03, oz + D / 2 + offset),
          new THREE.Vector3(ox + W / 2, 0.03, oz + D / 2 + offset)
        ];
        const wLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(wPts), rulerMat);
        wLine.userData.ignoreRaycast = true;
        this.dimensionRulersGroup.add(wLine);

        const wLabel = window.ProceduralBuilder.createLabelSprite(
          `العرض: ${room.width} سم (${W.toFixed(2)}م)`,
          'rgba(15, 23, 42, 0.92)',
          '#38bdf8',
          0.62
        );
        wLabel.position.set(ox, 0.18, oz + D / 2 + offset);
        this.dimensionRulersGroup.add(wLabel);

        const dPts = [
          new THREE.Vector3(ox + W / 2 + offset, 0.03, oz - D / 2),
          new THREE.Vector3(ox + W / 2 + offset, 0.03, oz + D / 2)
        ];
        const dLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(dPts), rulerMat);
        dLine.userData.ignoreRaycast = true;
        this.dimensionRulersGroup.add(dLine);

        const dLabel = window.ProceduralBuilder.createLabelSprite(
          `الطول: ${room.depth} سم (${D.toFixed(2)}م)`,
          'rgba(15, 23, 42, 0.92)',
          '#38bdf8',
          0.62
        );
        dLabel.position.set(ox + W / 2 + offset, 0.18, oz);
        this.dimensionRulersGroup.add(dLabel);
      }
    });
  }

  /**
   * إضافة غرفة جديدة ملاصقة للغرفة النشطة حالياً (يمين، يسار، أعلى، أسفل)
   */
  addAdjacentRoom(direction = 'east', customName = '') {
    const base = this.activeRoom;
    const newW = 400;
    const newD = 400;
    let offsetX = base.offsetX;
    let offsetZ = base.offsetZ;

    if (direction === 'east') {
      offsetX = base.offsetX + base.width / 2 + newW / 2;
    } else if (direction === 'west') {
      offsetX = base.offsetX - base.width / 2 - newW / 2;
    } else if (direction === 'south') {
      offsetZ = base.offsetZ + base.depth / 2 + newD / 2;
    } else if (direction === 'north') {
      offsetZ = base.offsetZ - base.depth / 2 - newD / 2;
    }

    const newRoom = {
      id: 'room_' + Date.now(),
      name: customName || `غرفة ${this.rooms.length + 1}`,
      width: newW,
      depth: newD,
      height: base.height,
      offsetX,
      offsetZ,
      floorId: 'oak_parquet',
      wallId: 'warm_white'
    };

    this.rooms.push(newRoom);
    this.activeRoomId = newRoom.id;
    this.buildAllRooms();
    this.renderRoomsTabsUI();
    this.syncActiveRoomInputsUI();
    this.pushHistory('إضافة غرفة مجاورة');
  }

  deleteActiveRoom() {
    if (this.rooms.length <= 1) {
      alert('لا يمكن حذف الغرفة الوحيدة في المنزل.');
      return;
    }
    this.rooms = this.rooms.filter(r => r.id !== this.activeRoomId);
    this.activeRoomId = this.rooms[0].id;
    this.buildAllRooms();
    this.renderRoomsTabsUI();
    this.syncActiveRoomInputsUI();
    this.pushHistory('حذف غرفة');
  }

  // ==================== تحريك ووزن الغرفة ومحاذاتها مع الغرف المجاورة ====================
  moveActiveRoom(deltaX, deltaZ, moveContents = true, historyLabel = 'تحريك الغرفة') {
    const r = this.activeRoom;
    if (!r) return;
    if (deltaX === 0 && deltaZ === 0) return;

    // 1. تحديد العناصر التابعة للغرفة النشطة قبل نقلها
    const roomItemsToMove = [];
    if (moveContents) {
      const halfW = r.width / 2;
      const halfD = r.depth / 2;
      const margin = 20;

      this.items.forEach(g => {
        const d = g.userData?.itemData;
        if (!d) return;

        // التحقق من وجود النقطة ضمن نطاق الغرفة الحالي
        if (
          d.x >= r.offsetX - halfW - margin &&
          d.x <= r.offsetX + halfW + margin &&
          d.z >= r.offsetZ - halfD - margin &&
          d.z <= r.offsetZ + halfD + margin
        ) {
          // مقارنة المسافة المعيارية لمركز الغرف لضمان عدم سحب قطع الغرفة المجاورة
          let bestRoom = r;
          let minNormDistSq = Infinity;
          for (const rm of this.rooms) {
            const rw = rm.width / 2 + margin;
            const rd = rm.depth / 2 + margin;
            if (
              d.x >= rm.offsetX - rw &&
              d.x <= rm.offsetX + rw &&
              d.z >= rm.offsetZ - rd &&
              d.z <= rm.offsetZ + rd
            ) {
              const ndx = (d.x - rm.offsetX) / (rm.width / 2);
              const ndz = (d.z - rm.offsetZ) / (rm.depth / 2);
              const distSq = ndx * ndx + ndz * ndz;
              if (distSq < minNormDistSq) {
                minNormDistSq = distSq;
                bestRoom = rm;
              }
            }
          }

          if (bestRoom.id === r.id) {
            roomItemsToMove.push(g);
          }
        }
      });
    }

    // 2. تحديث إحداثيات مركز الغرفة النشطة
    r.offsetX = Math.round(r.offsetX + deltaX);
    r.offsetZ = Math.round(r.offsetZ + deltaZ);

    // تحريك بؤرة الكاميرا بالتزامن مع الغرفة لمنع انحراف المشهد أثناء التحريك
    if (this.controls && this.activeRoomId === r.id) {
      this.controls.target.x += deltaX / 100;
      this.controls.target.z += deltaZ / 100;
      if (this.perspCamera) {
        this.perspCamera.position.x += deltaX / 100;
        this.perspCamera.position.z += deltaZ / 100;
      }
      this.controls.update();
    }

    // 3. نقل قطع الأثاث والأبواب والنوافذ التابعة لها
    if (moveContents && roomItemsToMove.length > 0) {
      roomItemsToMove.forEach(g => {
        const d = g.userData.itemData;
        d.x = Math.round(d.x + deltaX);
        d.z = Math.round(d.z + deltaZ);
        this.updateItemTransform(g);
      });
    }

    // 4. إعادة بناء مجسمات الغرف والجدران المشتركة والأرضيات والقياسات
    this.buildAllRooms();
    this.syncActiveRoomInputsUI();

    if (this.selectedItem) {
      this.syncInspectorValues();
      this.drawClearanceLines(this.selectedItem);
    }

    // 5. حفظ السجل والتخزين التلقائي
    if (historyLabel) {
      this.pushHistory(historyLabel);
    }
    this.saveAutoProjectToStorage();
  }

  alignActiveRoomWith(targetRoomId, alignMode) {
    const r1 = this.activeRoom;
    if (!r1) return;

    const r2 = this.rooms.find(rm => rm.id === targetRoomId);
    if (!r2 || r2.id === r1.id) return;

    const moveContents = document.getElementById('room-move-contents-toggle')?.checked ?? true;

    let targetX = r1.offsetX;
    let targetZ = r1.offsetZ;
    let modeLabel = '';

    const W1 = r1.width;
    const D1 = r1.depth;
    const W2 = r2.width;
    const D2 = r2.depth;

    switch (alignMode) {
      case 'flush_north':
        targetZ = r2.offsetZ - D2 / 2 + D1 / 2;
        modeLabel = `وزن الحافة الخلفية مع ${r2.name}`;
        break;
      case 'flush_south':
        targetZ = r2.offsetZ + D2 / 2 - D1 / 2;
        modeLabel = `وزن الحافة الأمامية مع ${r2.name}`;
        break;
      case 'flush_east':
        targetX = r2.offsetX + W2 / 2 - W1 / 2;
        modeLabel = `وزن الحافة اليمنى مع ${r2.name}`;
        break;
      case 'flush_west':
        targetX = r2.offsetX - W2 / 2 + W1 / 2;
        modeLabel = `وزن الحافة اليسرى مع ${r2.name}`;
        break;
      case 'center_x':
        targetX = r2.offsetX;
        modeLabel = `توسيط أفقي مع ${r2.name}`;
        break;
      case 'attach_east':
        targetX = r2.offsetX + W2 / 2 + W1 / 2;
        modeLabel = `التصاق يمين ${r2.name}`;
        break;
      case 'attach_west':
        targetX = r2.offsetX - W2 / 2 - W1 / 2;
        modeLabel = `التصاق يسار ${r2.name}`;
        break;
      case 'attach_north':
        targetZ = r2.offsetZ - D2 / 2 - D1 / 2;
        modeLabel = `التصاق خلف ${r2.name}`;
        break;
      case 'attach_south':
        targetZ = r2.offsetZ + D2 / 2 + D1 / 2;
        modeLabel = `التصاق أمام ${r2.name}`;
        break;
      default:
        return;
    }

    const deltaX = Math.round(targetX - r1.offsetX);
    const deltaZ = Math.round(targetZ - r1.offsetZ);

    if (deltaX !== 0 || deltaZ !== 0) {
      this.moveActiveRoom(deltaX, deltaZ, moveContents, modeLabel);
    }
  }

  // ==================== فحص تصنيف ونوعية العناصر الخاصة ====================
  isDoorOrWindow(catalogId) {
    return ['door_wood', 'door_double', 'door_sliding_glass', 'window_glass'].includes(catalogId);
  }

  isCurtain(catalogId) {
    return ['curtain_drape', 'curtain_sheer_double', 'curtain_roller_blinds', 'curtain_roman'].includes(catalogId);
  }

  isBed(catalogId) {
    return ['bed_king', 'bed_single', 'bunk_bed', 'baby_crib'].includes(catalogId);
  }

  isRug(catalogId) {
    return ['rug_persian', 'rug_large', 'rug_round_boho', 'rug_oval_luxury', 'rug_runner_corridor'].includes(catalogId);
  }

  isWallTV(catalogId) {
    return ['tv_wall_55', 'tv_wall_65', 'tv_wall_75', 'tv_wall_85', 'tv_frame_art'].includes(catalogId);
  }

  isAC(catalogId) {
    return ['ac_split', 'ac_split_small'].includes(catalogId);
  }

  // ==================== إضافة وتحديث قطع الأثاث ====================
  addFurnitureItem(catalogId, customProps = {}, recordHistory = true) {
    const catItem = window.FURNITURE_CATALOG.find(item => item.id === catalogId);
    if (!catItem) return null;

    const targetRoom = this.activeRoom;
    const isOpeningItem = this.isDoorOrWindow(catItem.id);
    const isCurtainItem = this.isCurtain(catItem.id);
    const isBedItem = this.isBed(catItem.id);
    const isRugItem = this.isRug(catItem.id);
    const isWallTVItem = this.isWallTV(catItem.id);
    const isACItem = this.isAC(catItem.id);
    const defaultOpenType = (catItem.id === 'door_sliding_glass' || catItem.id === 'window_glass') ? 'sliding' : 'hinged';
    const defaultHingeSide = catItem.id === 'door_double' ? 'both' : 'right';

    const defaultRugShape = catItem.id === 'rug_round_boho'
      ? 'round'
      : (catItem.id === 'rug_oval_luxury' ? 'oval' : (catItem.id === 'rug_runner_corridor' ? 'runner' : 'rect'));
    const defaultRugPattern = catItem.id === 'rug_round_boho'
      ? 'berber'
      : (catItem.id === 'rug_runner_corridor' ? 'geometric' : 'persian');

    const itemData = {
      uid: customProps.uid || ('item_' + Date.now() + '_' + Math.floor(Math.random() * 10000)),
      catalogId: catItem.id,
      name: customProps.name || catItem.name,
      width: customProps.width ?? catItem.width,
      depth: customProps.depth ?? catItem.depth,
      height: customProps.height ?? catItem.height,
      elevation: customProps.elevation ?? catItem.elevation ?? 0,
      x: customProps.x ?? targetRoom.offsetX,
      z: customProps.z ?? targetRoom.offsetZ,
      rotation: customProps.rotation ?? 0,
      color: customProps.color ?? catItem.color,
      secondaryColor: customProps.secondaryColor ?? catItem.secondaryColor,
      ...(isOpeningItem ? {
        openType: customProps.openType || defaultOpenType,
        openDirection: customProps.openDirection || 'inward',
        hingeSide: customProps.hingeSide || defaultHingeSide,
        openRatio: typeof customProps.openRatio === 'number' ? customProps.openRatio : 65
      } : {}),
      ...(isCurtainItem ? {
        curtainOpenRatio: typeof customProps.curtainOpenRatio === 'number' ? customProps.curtainOpenRatio : 25
      } : {}),
      ...(isBedItem ? {
        beddingColor: customProps.beddingColor || catItem.beddingColor || '#f8fafc',
        pillowColor: customProps.pillowColor || catItem.pillowColor || '#ffffff'
      } : {}),
      ...(isRugItem ? {
        rugShape: customProps.rugShape || catItem.rugShape || defaultRugShape,
        rugPattern: customProps.rugPattern || catItem.rugPattern || defaultRugPattern
      } : {}),
      ...(isWallTVItem ? {
        tvSize: customProps.tvSize || catItem.tvSize || 65,
        tvAmbilight: customProps.tvAmbilight || catItem.tvAmbilight || '#38bdf8'
      } : {}),
      ...(isACItem ? {
        acTemp: customProps.acTemp || catItem.acTemp || 18,
        acMode: customProps.acMode || catItem.acMode || 'cool'
      } : {})
    };

    const containerGroup = new THREE.Group();
    containerGroup.userData.itemData = itemData;

    this.rebuildItemVisuals(containerGroup);
    this.furnitureGroup.add(containerGroup);
    this.items.push(containerGroup);

    this.updateItemTransform(containerGroup);
    if (recordHistory) {
      this.selectItem(containerGroup);
      this.pushHistory(`إضافة ${itemData.name}`);
    }
    this.updateRoomStatsUI();
    return containerGroup;
  }

  /**
   * بناء مجسم قطعة الأثاث وإطار التحديد الدقيق (بدون تداخل مع Raycaster)
   */
  rebuildItemVisuals(containerGroup) {
    while (containerGroup.children.length > 0) {
      containerGroup.remove(containerGroup.children[0]);
    }
    const data = containerGroup.userData.itemData;
    const isCurrentlySelected = this.selectedItem === containerGroup;

    // 1. المجسم ثلاثي الأبعاد الحقيقي (فقط عناصره تحمل userData.isHitTarget = true)
    const meshGroup = window.ProceduralBuilder.buildFurnitureMesh(data);
    meshGroup.name = 'physicalMeshGroup';
    containerGroup.add(meshGroup);

    // 2. صندوق التحديد الدقيق (Selection Box) - معزول عن Raycaster تماماً
    const W = data.width / 100;
    const D = data.depth / 100;
    const H = data.height / 100;
    const boxGeo = new THREE.BoxGeometry(W + 0.02, H + 0.02, D + 0.02);
    const edges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: isCurrentlySelected ? 0.95 : 0.0
    });
    const selectionBox = new THREE.LineSegments(edges, lineMat);
    selectionBox.position.set(0, H / 2, 0);
    selectionBox.name = 'selectionBox';
    selectionBox.userData.ignoreRaycast = true;
    containerGroup.add(selectionBox);

    // 3. لافتة المقاس ومدى الفتح (تظهر للقطعة بدون إعاقة النقر)
    if (this.settings.showDimensions) {
      let dimText = `${data.width}×${data.depth} سم`;
      let badgeBorder = isCurrentlySelected ? '#38bdf8' : '#10b981';
      let badgeBg = isCurrentlySelected ? 'rgba(2, 132, 199, 0.95)' : 'rgba(15, 23, 42, 0.78)';

      if (this.isDoorOrWindow(data.catalogId)) {
        const metrics = this.getDoorWindowMetrics(data);
        if (data.openType === 'sliding') {
          dimText = `سحب ${data.width}سم (صافي ${metrics.clearOpeningCm}سم)`;
        } else {
          dimText = `${data.width}سم • مدى الفتح: ${metrics.swingRadiusCm}سم`;
        }
        if (data._hasSwingCollision) {
          dimText = `⚠️ عائق فتح! (${metrics.swingRadiusCm}سم)`;
          badgeBorder = '#f43f5e';
          badgeBg = 'rgba(159, 18, 57, 0.95)';
        }
      }

      const badge = window.ProceduralBuilder.createLabelSprite(
        dimText,
        badgeBg,
        badgeBorder,
        isCurrentlySelected ? 0.54 : 0.42
      );
      badge.position.set(0, H + 0.22, 0);
      badge.name = 'dimBadge';
      badge.userData.ignoreRaycast = true;
      containerGroup.add(badge);
    }
  }

  /**
   * حساب مقاسات الفتح ومساحة التأرجح وفحص التصادم مع الأثاث المجاور للأبواب والنوافذ
   */
  getDoorWindowMetrics(data) {
    const innerWidthCm = Math.max(20, data.width - 10);
    const openType = data.openType || ((data.catalogId === 'door_sliding_glass' || data.catalogId === 'window_glass') ? 'sliding' : 'hinged');
    const hingeSide = data.hingeSide || (data.catalogId === 'door_double' ? 'both' : 'right');

    if (openType === 'sliding') {
      const clearOpeningCm = Math.round(innerWidthCm * 0.48);
      return {
        openType: 'sliding',
        swingRadiusCm: 0,
        clearOpeningCm,
        sweptAreaM2: 0
      };
    }

    const swingRadiusCm = hingeSide === 'both' ? Math.round(innerWidthCm / 2) : Math.round(innerWidthCm);
    const rMeters = swingRadiusCm / 100;
    const sweptAreaM2 = hingeSide === 'both'
      ? 2 * (Math.PI * rMeters * rMeters) / 4
      : (Math.PI * rMeters * rMeters) / 4;

    return {
      openType: 'hinged',
      swingRadiusCm,
      clearOpeningCm: Math.round(innerWidthCm),
      sweptAreaM2
    };
  }

  /**
   * فحص ما إذا كان قوس فتح الباب أو النافذة يصطدم بأي قطعة أثاث أخرى في الغرفة
   */
  evaluateAllDoorSwingCollisions() {
    if (!this.items || this.items.length === 0) return;

    this.items.forEach(doorGroup => {
      const d = doorGroup.userData.itemData;
      if (!this.isDoorOrWindow(d.catalogId)) return;

      const metrics = this.getDoorWindowMetrics(d);
      const prevCollision = Boolean(d._hasSwingCollision);

      if (metrics.openType === 'sliding' || metrics.swingRadiusCm <= 2) {
        d._hasSwingCollision = false;
        d._collidingNames = [];
        if (prevCollision !== d._hasSwingCollision) {
          this.rebuildItemVisuals(doorGroup);
        }
        return;
      }

      // حساب المستطيل العالمي لمنطقة مسح الباب أثناء فتحه (Swing Clearance Zone in World Cm)
      const rad = THREE.MathUtils.degToRad(d.rotation);
      const dirSign = (d.openDirection || 'inward') === 'outward' ? -1 : 1;
      const swingR = metrics.swingRadiusCm;

      // المتجه الأمامي لاتجاه فتح الباب في إحداثيات الغرفة
      const normalX = Math.sin(rad) * dirSign;
      const normalZ = Math.cos(rad) * dirSign;

      // مركز منطقة مسح القوس يقع أمام الباب بنصف مدى الفتح
      const zoneCenterX = d.x + normalX * (d.depth / 2 + swingR * 0.5);
      const zoneCenterZ = d.z + normalZ * (d.depth / 2 + swingR * 0.5);

      const cos = Math.abs(Math.cos(rad));
      const sin = Math.abs(Math.sin(rad));
      const zoneHalfW = ((d.width * 0.92) * cos + swingR * sin) / 2;
      const zoneHalfD = ((d.width * 0.92) * sin + swingR * cos) / 2;

      const doorMinY = d.elevation || 0;
      const doorMaxY = doorMinY + d.height;

      const collidingNames = [];

      this.items.forEach(otherGroup => {
        if (otherGroup === doorGroup) return;
        const o = otherGroup.userData.itemData;
        if (this.isRug(o.catalogId)) return; // جميع أنواع السجاد الأرضي لا تعيق حركة الباب
        if (this.isDoorOrWindow(o.catalogId)) return;

        // فحص التداخل الرأسي (مثلاً تكييف عالي فوق الباب لا يعيق فتحه)
        const otherMinY = o.elevation || 0;
        const otherMaxY = otherMinY + o.height;
        if (otherMaxY <= doorMinY + 5 || otherMinY >= doorMaxY - 5) return;

        const { effWidth, effDepth } = this.getRotatedFootprintCm(o);
        const oHalfW = effWidth / 2;
        const oHalfD = effDepth / 2;

        const overlapX = Math.abs(zoneCenterX - o.x) < (zoneHalfW + oHalfW - 4);
        const overlapZ = Math.abs(zoneCenterZ - o.z) < (zoneHalfD + oHalfD - 4);

        if (overlapX && overlapZ) {
          collidingNames.push(o.name);
        }
      });

      d._hasSwingCollision = collidingNames.length > 0;
      d._collidingNames = collidingNames;

      if (prevCollision !== d._hasSwingCollision) {
        this.rebuildItemVisuals(doorGroup);
      }
    });
  }

  updateItemTransform(containerGroup) {
    const data = containerGroup.userData.itemData;
    containerGroup.position.set(data.x / 100, data.elevation / 100, data.z / 100);
    containerGroup.rotation.y = THREE.MathUtils.degToRad(data.rotation);

    this.evaluateAllDoorSwingCollisions();
    this.checkItemBounds(containerGroup);
    if (this.selectedItem === containerGroup) {
      this.drawClearanceLines(containerGroup);
      this.syncDoorWindowInspectorUI();
    }
  }

  getRotatedFootprintCm(data) {
    const rad = THREE.MathUtils.degToRad(data.rotation);
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const effWidth = data.width * cos + data.depth * sin;
    const effDepth = data.width * sin + data.depth * cos;
    return { effWidth, effDepth };
  }

  checkItemBounds(containerGroup) {
    const data = containerGroup.userData.itemData;
    const { effWidth, effDepth } = this.getRotatedFootprintCm(data);
    const house = this.getHouseBoundsCm();

    const outOfBounds =
      data.x - effWidth / 2 < house.minX - 5 ||
      data.x + effWidth / 2 > house.maxX + 5 ||
      data.z - effDepth / 2 < house.minZ - 5 ||
      data.z + effDepth / 2 > house.maxZ + 5 ||
      data.elevation + data.height > house.maxH + 5;

    containerGroup.userData.outOfBounds = outOfBounds;

    const selBox = containerGroup.getObjectByName('selectionBox');
    if (selBox) {
      if (outOfBounds) {
        selBox.material.color.setHex(0xf43f5e);
        selBox.material.opacity = 1.0;
      } else if (this.selectedItem === containerGroup) {
        selBox.material.color.setHex(0x38bdf8);
        selBox.material.opacity = 0.95;
      } else {
        selBox.material.opacity = 0.0;
      }
    }
  }

  validateAllItemsBounds() {
    this.items.forEach(item => this.checkItemBounds(item));
    if (this.selectedItem) {
      this.drawClearanceLines(this.selectedItem);
    }
  }

  /**
   * رسم خطوط قياس المسافات الحية عن حوائط الغرفة التي توجد بها القطعة المحددة حالياً
   */
  drawClearanceLines(containerGroup) {
    while (this.clearanceLinesGroup.children.length > 0) {
      this.clearanceLinesGroup.remove(this.clearanceLinesGroup.children[0]);
    }
    if (!containerGroup || !this.settings.showDimensions) return;

    const data = containerGroup.userData.itemData;
    const currentRoom = this.findRoomContainingPoint(data.x, data.z);
    if (!currentRoom) return;

    const { effWidth, effDepth } = this.getRotatedFootprintCm(data);
    const roomMinX = currentRoom.offsetX - currentRoom.width / 2;
    const roomMaxX = currentRoom.offsetX + currentRoom.width / 2;
    const roomMinZ = currentRoom.offsetZ - currentRoom.depth / 2;
    const roomMaxZ = currentRoom.offsetZ + currentRoom.depth / 2;

    const distLeft = Math.round((data.x - effWidth / 2) - roomMinX);
    const distRight = Math.round(roomMaxX - (data.x + effWidth / 2));
    const distBack = Math.round((data.z - effDepth / 2) - roomMinZ);
    const distFront = Math.round(roomMaxZ - (data.z + effDepth / 2));

    const setElText = (id, val) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = `${val} سم`;
        el.className = val < 0 ? 'font-bold text-rose-400' : 'font-bold text-emerald-400';
      }
    };
    setElText('dist-north', distBack);
    setElText('dist-south', distFront);
    setElText('dist-east', distRight);
    setElText('dist-west', distLeft);

    const yLevel = Math.max(0.06, (data.elevation + 10) / 100);
    const xM = data.x / 100;
    const zM = data.z / 100;
    const hwM = (effWidth / 2) / 100;
    const hdM = (effDepth / 2) / 100;

    const lineMat = new THREE.LineDashedMaterial({
      color: 0xf59e0b,
      dashSize: 0.1,
      gapSize: 0.06
    });

    const addMeasureLine = (p1, p2, cmValue) => {
      if (cmValue < 5 || cmValue > 1200) return;
      const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const line = new THREE.Line(geo, lineMat);
      line.computeLineDistances();
      line.userData.ignoreRaycast = true;
      this.clearanceLinesGroup.add(line);

      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.y += 0.12;
      const lbl = window.ProceduralBuilder.createLabelSprite(
        `${cmValue} سم`,
        'rgba(180, 83, 9, 0.92)',
        '#fde68a',
        0.40
      );
      lbl.position.copy(mid);
      this.clearanceLinesGroup.add(lbl);
    };

    addMeasureLine(new THREE.Vector3(roomMinX / 100, yLevel, zM), new THREE.Vector3(xM - hwM, yLevel, zM), distLeft);
    addMeasureLine(new THREE.Vector3(xM + hwM, yLevel, zM), new THREE.Vector3(roomMaxX / 100, yLevel, zM), distRight);
    addMeasureLine(new THREE.Vector3(xM, yLevel, roomMinZ / 100), new THREE.Vector3(xM, yLevel, zM - hdM), distBack);
    addMeasureLine(new THREE.Vector3(xM, yLevel, zM + hdM), new THREE.Vector3(xM, yLevel, roomMaxZ / 100), distFront);
  }

  // ==================== التحديد الدقيق الخالي من التداخل (Precision Selection) ====================
  selectItem(containerGroup) {
    const prevSelected = this.selectedItem;
    this.selectedItem = containerGroup;

    if (prevSelected && this.items.includes(prevSelected)) {
      this.rebuildItemVisuals(prevSelected);
      this.checkItemBounds(prevSelected);
    }
    if (containerGroup) {
      this.rebuildItemVisuals(containerGroup);
      this.checkItemBounds(containerGroup);

      // تفعيل الغرفة التي تقع فيها هذه القطعة تلقائياً
      const d = containerGroup.userData.itemData;
      const room = this.findRoomContainingPoint(d.x, d.z);
      if (room && room.id !== this.activeRoomId) {
        this.activeRoomId = room.id;
        this.buildAllRooms();
        this.renderRoomsTabsUI();
        this.syncActiveRoomInputsUI();
      }
    }

    const inspectorEmpty = document.getElementById('inspector-empty');
    const inspectorActive = document.getElementById('inspector-active');

    if (!containerGroup) {
      inspectorEmpty?.classList.remove('hidden');
      inspectorActive?.classList.add('hidden');
      while (this.clearanceLinesGroup.children.length > 0) {
        this.clearanceLinesGroup.remove(this.clearanceLinesGroup.children[0]);
      }
      return;
    }

    inspectorEmpty?.classList.add('hidden');
    inspectorActive?.classList.remove('hidden');

    this.syncInspectorValues();
    this.drawClearanceLines(containerGroup);
  }

  syncInspectorValues() {
    if (!this.selectedItem) return;
    const d = this.selectedItem.userData.itemData;
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = Math.round(val);
    };
    const nameEl = document.getElementById('selected-item-name');
    if (nameEl) nameEl.textContent = d.name;

    setVal('item-width', d.width);
    setVal('item-depth', d.depth);
    setVal('item-height', d.height);
    setVal('item-elevation', d.elevation);
    setVal('item-pos-x', d.x);
    setVal('item-pos-z', d.z);
    setVal('item-rotation', d.rotation);

    const rotLabel = document.getElementById('rotation-val-label');
    if (rotLabel) rotLabel.textContent = `${Math.round(d.rotation)}°`;

    // تحديث قيم اللون المختار للقطعة
    const colorInput = document.getElementById('item-custom-color');
    if (colorInput && d.color) {
      colorInput.value = d.color.startsWith('#') ? d.color : '#' + d.color;
    }
    const colorHex = document.getElementById('item-color-hex');
    if (colorHex && d.color) {
      colorHex.textContent = d.color;
    }

    // إظهار حقل اللون الثانوي إذا كانت القطعة تدعم لوناً إضافياً أو كانت سجادة
    const secWrap = document.getElementById('item-secondary-color-wrap');
    if (secWrap) {
      if (d.secondaryColor || this.isRug(d.catalogId)) {
        secWrap.classList.remove('hidden');
        const secInput = document.getElementById('item-secondary-color');
        if (secInput && d.secondaryColor) {
          secInput.value = d.secondaryColor.startsWith('#') ? d.secondaryColor : '#' + d.secondaryColor;
        }
        const secHex = document.getElementById('item-secondary-hex');
        if (secHex && d.secondaryColor) {
          secHex.textContent = d.secondaryColor;
        }
      } else {
        secWrap.classList.add('hidden');
      }
    }

    this.syncDoorWindowInspectorUI();
    this.syncCurtainInspectorUI();
    this.syncBeddingInspectorUI();
    this.syncRugInspectorUI();
    this.syncWallTVInspectorUI();
    this.syncACInspectorUI();
    this.syncContextualHarmonySuggestions();
  }

  /**
   * اقتراح ألوان متناسقة علمياً وفورياً للقطعة المحددة مع دهان وأرضية الغرفة
   */
  syncContextualHarmonySuggestions() {
    const container = document.getElementById('item-harmonious-palette');
    if (!container) return;
    container.innerHTML = '';

    if (!this.selectedItem || !window.ColorHarmonyEngine) return;
    const d = this.selectedItem.userData.itemData;
    const itemColor = d.color || '#475569';

    const r = this.activeRoom || this.rooms[0];
    const floorMatData = window.ROOM_MATERIALS.floors.find(f => f.id === r.floorId) || window.ROOM_MATERIALS.floors[0];
    const wallData = window.ROOM_MATERIALS.walls.find(w => w.id === r.wallId) || window.ROOM_MATERIALS.walls[0];
    const wallColor = r.customWallColor || wallData.color;
    const floorColor = r.customFloorColor || floorMatData.color;

    const suggestions = window.ColorHarmonyEngine.getContextualSuggestions(itemColor, wallColor, floorColor);

    suggestions.forEach(s => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = `${s.label} (${s.hex})`;
      btn.className = 'w-6 h-6 rounded-full border-2 border-slate-600 hover:scale-125 hover:border-violet-400 transition-all focus:outline-none focus:ring-2 focus:ring-violet-400 shrink-0 shadow-sm relative group';
      btn.style.backgroundColor = s.hex;

      btn.addEventListener('click', () => {
        d.color = s.hex;
        this.rebuildItemVisuals(this.selectedItem);
        this.updateItemTransform(this.selectedItem);
        this.syncInspectorValues();
        this.pushHistory(`تناسق لوني: ${s.label}`);
      });
      container.appendChild(btn);
    });
  }

  /**
   * مزامنة لوحة التحكم الخاصة بالستائر ومطابقتها لأحجام النوافذ
   */
  syncCurtainInspectorUI() {
    const panel = document.getElementById('curtain-controls');
    if (!panel) return;

    if (!this.selectedItem) {
      panel.classList.add('hidden');
      return;
    }

    const d = this.selectedItem.userData.itemData;
    if (!this.isCurtain(d.catalogId)) {
      panel.classList.add('hidden');
      return;
    }

    panel.classList.remove('hidden');

    const ratio = typeof d.curtainOpenRatio === 'number' ? d.curtainOpenRatio : 25;
    const slider = document.getElementById('item-curtain-open');
    if (slider) slider.value = Math.round(ratio);

    const badge = document.getElementById('curtain-open-badge');
    if (badge) {
      badge.textContent = ratio <= 0 ? 'مسدلة 0%' : `مفتوحة ${Math.round(ratio)}%`;
    }
  }

  /**
   * مطابقة حجم وموقع الستارة المحددة تلقائياً على أقرب نافذة في الغرفة
   */
  fitSelectedCurtainToNearestWindow() {
    if (!this.selectedItem) return;
    const cData = this.selectedItem.userData.itemData;
    if (!this.isCurtain(cData.catalogId)) return;

    const windows = this.items.filter(g => {
      const id = g.userData.itemData.catalogId;
      return id === 'window_glass' || id === 'door_sliding_glass';
    });

    if (windows.length === 0) {
      alert('لا توجد نافذة في الغرفة حالياً؛ يمكنك إضافة نافذة من الكتالوج أولاً أو ضبط مقاس الستارة مباشرة.');
      return;
    }

    // إيجاد أقرب نافذة إلى موقع الستارة الحالي
    let nearestWin = windows[0];
    let minDist = Infinity;
    windows.forEach(wGroup => {
      const wd = wGroup.userData.itemData;
      const dist = Math.hypot(wd.x - cData.x, wd.z - cData.z);
      if (dist < minDist) {
        minDist = dist;
        nearestWin = wGroup;
      }
    });

    const wd = nearestWin.userData.itemData;
    const isLongDrape = cData.catalogId === 'curtain_drape' || cData.catalogId === 'curtain_sheer_double';

    // جعل عرض الستارة أعرض من النافذة بـ 24 سم لتغطية الحواف بشكل جمالي
    cData.width = wd.width + (isLongDrape ? 26 : 10);
    cData.rotation = wd.rotation;

    if (isLongDrape) {
      const topY = (wd.elevation || 90) + wd.height + 12;
      cData.elevation = 2;
      cData.height = Math.max(180, topY - 2);
    } else {
      cData.elevation = Math.max(0, (wd.elevation || 90) - 5);
      cData.height = wd.height + 15;
    }

    // إزاحة الستارة بضعة سنتيمترات داخل الغرفة أمام النافذة مباشرة
    const room = this.findRoomContainingPoint(wd.x, wd.z) || this.activeRoom;
    const dirToCenterX = room.offsetX - wd.x;
    const dirToCenterZ = room.offsetZ - wd.z;
    const rad = THREE.MathUtils.degToRad(wd.rotation);
    const nx = Math.sin(rad);
    const nz = Math.cos(rad);
    const sign = (nx * dirToCenterX + nz * dirToCenterZ) >= 0 ? 1 : -1;

    cData.x = Math.round(wd.x + nx * sign * 12);
    cData.z = Math.round(wd.z + nz * sign * 12);

    this.rebuildItemVisuals(this.selectedItem);
    this.updateItemTransform(this.selectedItem);
    this.syncInspectorValues();
    this.pushHistory('مطابقة الستارة مع النافذة');
  }

  /**
   * مزامنة لوحة التحكم الخاصة بمفارش الأسرة وألوان الوسائد والشراشف
   */
  syncBeddingInspectorUI() {
    const panel = document.getElementById('bedding-controls');
    if (!panel) return;
    if (!this.selectedItem) {
      panel.classList.add('hidden');
      return;
    }
    const d = this.selectedItem.userData.itemData;
    if (!this.isBed(d.catalogId)) {
      panel.classList.add('hidden');
      return;
    }
    panel.classList.remove('hidden');

    const duvetColor = d.beddingColor || '#f8fafc';
    const duvetInput = document.getElementById('bed-custom-duvet');
    if (duvetInput) duvetInput.value = duvetColor.startsWith('#') ? duvetColor : '#' + duvetColor;
    const duvetHex = document.getElementById('bedding-duvet-hex');
    if (duvetHex) duvetHex.textContent = duvetColor;

    const pillowColor = d.pillowColor || '#ffffff';
    const pillowInput = document.getElementById('bed-custom-pillow');
    if (pillowInput) pillowInput.value = pillowColor.startsWith('#') ? pillowColor : '#' + pillowColor;
    const pillowHex = document.getElementById('bedding-pillow-hex');
    if (pillowHex) pillowHex.textContent = pillowColor;
  }

  /**
   * مزامنة لوحة التحكم الخاصة بأشكال ونقوش السجاد الأرضي
   */
  syncRugInspectorUI() {
    const panel = document.getElementById('rug-controls');
    if (!panel) return;
    if (!this.selectedItem) {
      panel.classList.add('hidden');
      return;
    }
    const d = this.selectedItem.userData.itemData;
    if (!this.isRug(d.catalogId)) {
      panel.classList.add('hidden');
      return;
    }
    panel.classList.remove('hidden');

    const currentShape = d.rugShape || 'rect';
    const currentPattern = d.rugPattern || 'persian';

    // تحديث أزرار الشكل
    document.querySelectorAll('.rug-shape-btn').forEach(btn => {
      const shape = btn.getAttribute('data-rug-shape');
      if (shape === currentShape) {
        btn.className = 'rug-shape-btn py-1.5 rounded-xl text-[10px] font-bold bg-amber-600 text-white shadow-sm transition-all';
      } else {
        btn.className = 'rug-shape-btn py-1.5 rounded-xl text-[10px] font-bold bg-slate-800 text-slate-200 hover:text-white transition-all';
      }
    });

    // شارة الشكل
    const shapeBadge = document.getElementById('rug-shape-badge');
    if (shapeBadge) {
      const shapeNames = { rect: 'مستطيل', round: 'دائري', oval: 'بيضاوي', runner: 'ممشى' };
      shapeBadge.textContent = shapeNames[currentShape] || currentShape;
    }

    // تحديث أزرار النقشة
    document.querySelectorAll('.rug-pattern-btn').forEach(btn => {
      const pattern = btn.getAttribute('data-rug-pattern');
      const isColSpan = pattern === 'border';
      const baseClass = isColSpan ? 'rug-pattern-btn py-1 px-1 rounded-xl text-[10px] font-bold col-span-2 transition-all' : 'rug-pattern-btn py-1 px-1 rounded-xl text-[10px] font-bold transition-all';
      if (pattern === currentPattern) {
        btn.className = `${baseClass} bg-amber-600 text-white shadow-sm`;
      } else {
        btn.className = `${baseClass} bg-slate-800 text-slate-200 hover:text-white`;
      }
    });

    // ألوان السجادة
    const primaryColor = d.color || '#991b1b';
    const primaryInput = document.getElementById('rug-custom-primary');
    if (primaryInput) primaryInput.value = primaryColor.startsWith('#') ? primaryColor : '#' + primaryColor;
    const primaryHex = document.getElementById('rug-primary-hex');
    if (primaryHex) primaryHex.textContent = primaryColor;

    const accentColor = d.secondaryColor || '#f5ebe0';
    const accentInput = document.getElementById('rug-custom-accent');
    if (accentInput) accentInput.value = accentColor.startsWith('#') ? accentColor : '#' + accentColor;
    const accentHex = document.getElementById('rug-accent-hex');
    if (accentHex) accentHex.textContent = accentColor;
  }

  /**
   * مزامنة لوحة التحكم الخاصة بفتح الأبواب والنوافذ وحساب مساحة الفتح
   */
  syncDoorWindowInspectorUI() {
    const panel = document.getElementById('door-window-controls');
    if (!panel) return;

    if (!this.selectedItem) {
      panel.classList.add('hidden');
      return;
    }

    const d = this.selectedItem.userData.itemData;
    if (!this.isDoorOrWindow(d.catalogId)) {
      panel.classList.add('hidden');
      return;
    }

    panel.classList.remove('hidden');

    const defaultOpenType = (d.catalogId === 'door_sliding_glass' || d.catalogId === 'window_glass') ? 'sliding' : 'hinged';
    const openType = d.openType || defaultOpenType;
    const openDirection = d.openDirection || 'inward';
    const hingeSide = d.hingeSide || (d.catalogId === 'door_double' ? 'both' : 'right');
    const openRatio = typeof d.openRatio === 'number' ? d.openRatio : 65;

    const ratioSlider = document.getElementById('item-open-ratio');
    if (ratioSlider) ratioSlider.value = Math.round(openRatio);

    const badgeEl = document.getElementById('door-open-percent-badge');
    if (badgeEl) {
      if (openRatio <= 0) {
        badgeEl.textContent = 'مغلق 0%';
      } else if (openType === 'hinged') {
        const deg = Math.round((openRatio / 100) * 90);
        badgeEl.textContent = `مفتوح ${openRatio}% (${deg}°)`;
      } else {
        badgeEl.textContent = `منزلق ${openRatio}%`;
      }
    }

    // تحديث حالة أزرار نوع الفتح (مفصلات / سحب)
    document.querySelectorAll('.door-opentype-btn').forEach(btn => {
      const active = btn.dataset.opentype === openType;
      btn.className = `door-opentype-btn py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
        active
          ? 'bg-sky-600 text-white border-sky-400 shadow-sm'
          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
      }`;
    });

    // إظهار أو إخفاء اتجاه التأرجح عند اختيار مفصلات أو سحب
    const swingDirGroup = document.getElementById('door-swing-dir-group');
    if (swingDirGroup) {
      swingDirGroup.classList.toggle('opacity-50', openType === 'sliding');
    }

    // تحديث حالة أزرار اتجاه الفتح (للداخل / للخارج)
    document.querySelectorAll('.door-opendir-btn').forEach(btn => {
      const active = btn.dataset.opendir === openDirection;
      btn.className = `door-opendir-btn py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
        active
          ? 'bg-sky-600 text-white border-sky-400 shadow-sm'
          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
      }`;
    });

    // تحديث حالة أزرار جهة المفصلة أو اتجاه السحب (يمين / يسار / ضلفتين)
    document.querySelectorAll('.door-hinge-btn').forEach(btn => {
      const active = btn.dataset.hingeside === hingeSide;
      btn.className = `door-hinge-btn py-1.5 px-1.5 rounded-xl text-[11px] font-bold border transition-all ${
        active
          ? 'bg-sky-600 text-white border-sky-400 shadow-sm'
          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
      }`;
    });

    // تحديث أرقام مساحة الفتح والتنبيه بالتعارض مع الأثاث
    const metrics = this.getDoorWindowMetrics(d);
    const depthEl = document.getElementById('door-clearance-depth');
    const areaEl = document.getElementById('door-clearance-area');
    const alertEl = document.getElementById('door-collision-alert');

    if (depthEl) {
      depthEl.textContent = metrics.openType === 'sliding'
        ? `0 سم (انزلاق داخلي • فتحة ${metrics.clearOpeningCm} سم)`
        : `${metrics.swingRadiusCm} سم داخل الغرفة`;
    }
    if (areaEl) {
      areaEl.textContent = metrics.openType === 'sliding'
        ? '0.00 م² (يوفر المساحة 100%)'
        : `${metrics.sweptAreaM2.toFixed(2)} م²`;
    }
    if (alertEl) {
      if (metrics.openType === 'sliding') {
        alertEl.className = 'pt-1 border-t border-slate-800/80 text-[11px] font-bold text-emerald-400 flex items-center gap-1';
        alertEl.innerHTML = '<span>✨</span><span>نظام السحب الجرار لا يستهلك أي مساحة أمام الباب/النافذة</span>';
      } else if (d._hasSwingCollision && d._collidingNames?.length) {
        alertEl.className = 'pt-1 border-t border-slate-800/80 text-[11px] font-bold text-rose-400 flex items-center gap-1';
        alertEl.innerHTML = `<span>⚠️</span><span>قوس الفتح يصطدم بـ: ${d._collidingNames.join('، ')}</span>`;
      } else {
        alertEl.className = 'pt-1 border-t border-slate-800/80 text-[11px] font-bold text-emerald-400 flex items-center gap-1';
        alertEl.innerHTML = '<span>✅</span><span>مسار الفتح خالٍ ولا يصطدم بأي أثاث</span>';
      }
    }
  }

  /**
   * مزامنة لوحة التحكم الخاصة بشاشات وتلفزيونات الحائط ومقاساتها القياسية
   */
  syncWallTVInspectorUI() {
    const panel = document.getElementById('tv-wall-controls');
    if (!panel) return;

    if (!this.selectedItem) {
      panel.classList.add('hidden');
      return;
    }
    const d = this.selectedItem.userData.itemData;
    if (!this.isWallTV(d.catalogId)) {
      panel.classList.add('hidden');
      return;
    }
    panel.classList.remove('hidden');

    const currentSize = d.tvSize || 65;
    const badgeEl = document.getElementById('tv-size-badge');
    if (badgeEl) {
      badgeEl.textContent = `${currentSize} بوصة`;
    }

    // تحديث أزرار مقاس الشاشة
    document.querySelectorAll('.tv-size-btn').forEach(btn => {
      const sz = Number(btn.dataset.tvSize);
      if (sz === currentSize) {
        btn.className = 'tv-size-btn py-1.5 rounded-xl text-[10px] font-bold bg-sky-600 text-white shadow-sm transition-all text-center';
      } else {
        btn.className = 'tv-size-btn py-1.5 rounded-xl text-[10px] font-bold bg-slate-800 text-slate-200 hover:text-white transition-all text-center';
      }
    });

    // تحديث أزرار ارتفاع التعليق
    const currentElev = Math.round(d.elevation);
    document.querySelectorAll('.tv-elev-btn').forEach(btn => {
      const elev = Number(btn.dataset.tvElev);
      const isClose = Math.abs(currentElev - elev) <= 5;
      if (isClose) {
        btn.className = 'tv-elev-btn py-1 px-1 rounded-lg bg-slate-900 text-sky-400 border border-sky-500/50 font-bold transition-colors';
      } else {
        btn.className = 'tv-elev-btn py-1 px-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold transition-colors';
      }
    });

    // تحديث أزرار الإضاءة الخلفية Ambilight
    const currentAmbi = (d.tvAmbilight || '#38bdf8').toLowerCase();
    document.querySelectorAll('.tv-ambi-btn').forEach(btn => {
      const color = (btn.dataset.tvAmbi || '').toLowerCase();
      if (color === currentAmbi || (color === 'transparent' && currentAmbi === 'transparent')) {
        btn.classList.add('ring-2', 'ring-sky-400', 'scale-110');
      } else {
        btn.classList.remove('ring-2', 'ring-sky-400', 'scale-110');
      }
    });
  }

  /**
   * مزامنة لوحة التحكم الخاصة بمكيف الحائط الفريون ودرجة الحرارة والأوضاع
   */
  syncACInspectorUI() {
    const panel = document.getElementById('ac-controls');
    if (!panel) return;

    if (!this.selectedItem) {
      panel.classList.add('hidden');
      return;
    }
    const d = this.selectedItem.userData.itemData;
    if (!this.isAC(d.catalogId)) {
      panel.classList.add('hidden');
      return;
    }
    panel.classList.remove('hidden');

    const currentTemp = d.acTemp || 18;
    const currentMode = d.acMode || 'cool';
    const modeIcons = { cool: '❄️', fan: '🍃', sleep: '🌙' };

    const badgeEl = document.getElementById('ac-temp-badge');
    if (badgeEl) {
      badgeEl.textContent = `${currentTemp}°C ${modeIcons[currentMode] || '❄️'}`;
    }

    // أزرار درجة الحرارة
    document.querySelectorAll('.ac-temp-btn').forEach(btn => {
      const temp = Number(btn.dataset.acTemp);
      if (temp === currentTemp) {
        btn.className = 'ac-temp-btn py-1.5 rounded-xl bg-cyan-600 text-white font-bold transition-all text-center';
      } else {
        btn.className = 'ac-temp-btn py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-cyan-600 hover:text-white transition-all text-center';
      }
    });

    // أزرار وضع التشغيل
    document.querySelectorAll('.ac-mode-btn').forEach(btn => {
      const mode = btn.dataset.acMode;
      if (mode === currentMode) {
        btn.className = 'ac-mode-btn py-1 px-1 rounded-lg bg-cyan-600 text-white font-bold transition-colors';
      } else {
        btn.className = 'ac-mode-btn py-1 px-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 font-semibold transition-colors';
      }
    });

    // أزرار ارتفاع التعليق
    const currentElev = Math.round(d.elevation);
    document.querySelectorAll('.ac-elev-btn').forEach(btn => {
      const elev = Number(btn.dataset.acElev);
      const isClose = Math.abs(currentElev - elev) <= 5;
      if (isClose) {
        btn.className = 'ac-elev-btn py-1 px-1 rounded-lg bg-slate-900 text-cyan-400 border border-cyan-500/50 font-bold transition-colors';
      } else {
        btn.className = 'ac-elev-btn py-1 px-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold transition-colors';
      }
    });
  }

  updateRoomStatsUI() {
    let totalHouseAreaM2 = 0;
    this.rooms.forEach(r => {
      totalHouseAreaM2 += (r.width / 100) * (r.depth / 100);
    });

    let furnitureAreaM2 = 0;
    this.items.forEach(item => {
      const d = item.userData.itemData;
      if (d.catalogId !== 'rug_large' && d.elevation < 50) {
        furnitureAreaM2 += (d.width / 100) * (d.depth / 100);
      }
    });

    const coveragePercent = Math.min(100, Math.round((furnitureAreaM2 / Math.max(1, totalHouseAreaM2)) * 100));

    const areaEl = document.getElementById('stat-room-area');
    const countEl = document.getElementById('stat-items-count');
    const covEl = document.getElementById('stat-coverage');

    if (areaEl) areaEl.textContent = `${totalHouseAreaM2.toFixed(1)} م² (${this.rooms.length} غرف)`;
    if (countEl) countEl.textContent = `${this.items.length} قطعة`;
    if (covEl) {
      covEl.textContent = `${coveragePercent}%`;
      covEl.className = coveragePercent > 65 ? 'font-bold text-amber-400' : 'font-bold text-emerald-400';
    }
  }

  // ==================== التفاعل الدقيق بالماوس ولوحة المفاتيح ====================
  initInteractions() {
    const dom = this.renderer.domElement;

    const getPointerNormalized = (e) => {
      const rect = dom.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      getPointerNormalized(e);
      this.raycaster.setFromCamera(this.pointer, this.activeCamera);

      // جمع المجسمات الفيزيائية الحقيقية فقط (تجاهل اللافتات النصية وصناديق التحديد تماماً لمنع التداخل!)
      const physicalMeshes = [];
      this.furnitureGroup.traverse(child => {
        if (child.isMesh && child.userData.isHitTarget && !child.userData.ignoreRaycast) {
          physicalMeshes.push(child);
        }
      });

      const rawHits = this.raycaster.intersectObjects(physicalMeshes, false);

      if (rawHits.length > 0) {
        // إعطاء أولوية لقطع الأثاث العادية فوق السجاد الأرضي (بحيث لا يسرق السجاد التحديد من الطاولة أو الكنبة التي فوقه!)
        const findRootItem = (meshObj) => {
          let curr = meshObj;
          while (curr.parent && curr.parent !== this.furnitureGroup) {
            curr = curr.parent;
          }
          return curr;
        };

        let chosenRoot = findRootItem(rawHits[0].object);
        if (chosenRoot?.userData?.itemData?.catalogId === 'rug_large' && rawHits.length > 1) {
          for (let i = 1; i < rawHits.length; i++) {
            const candidate = findRootItem(rawHits[i].object);
            if (candidate?.userData?.itemData?.catalogId !== 'rug_large') {
              chosenRoot = candidate;
              break;
            }
          }
        }

        if (chosenRoot && chosenRoot.userData && chosenRoot.userData.itemData) {
          this.selectItem(chosenRoot);
          this.isDragging = true;
          this.dragMoved = false;
          this.controls.enabled = false;

          const elevationM = chosenRoot.userData.itemData.elevation / 100;
          this.dragPlane.set(new THREE.Vector3(0, 1, 0), -elevationM);
          const hitPoint = new THREE.Vector3();
          if (this.raycaster.ray.intersectPlane(this.dragPlane, hitPoint)) {
            this.dragOffset.copy(chosenRoot.position).sub(hitPoint);
          }
          return;
        }
      }

      // إذا نقر المستخدم على أرضية غرفة معينة، نجعلها الغرفة النشطة ونلغي تحديد الأثاث
      const roomFloors = [];
      this.roomGroup.traverse(c => {
        if (c.isMesh && c.userData.roomId) roomFloors.push(c);
      });
      const floorHits = this.raycaster.intersectObjects(roomFloors, false);
      if (floorHits.length > 0) {
        const clickedRoomId = floorHits[0].object.userData.roomId;
        if (clickedRoomId && clickedRoomId !== this.activeRoomId) {
          this.activeRoomId = clickedRoomId;
          this.buildAllRooms();
          this.renderRoomsTabsUI();
          this.syncActiveRoomInputsUI();
        }
      }
      this.selectItem(null);
    };

    const onPointerMove = (e) => {
      if (!this.isDragging || !this.selectedItem) return;
      getPointerNormalized(e);
      this.raycaster.setFromCamera(this.pointer, this.activeCamera);

      const hitPoint = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.dragPlane, hitPoint)) {
        const targetPos = hitPoint.add(this.dragOffset);
        let newXCm = targetPos.x * 100;
        let newZCm = targetPos.z * 100;

        const snap = this.settings.snapStep;
        if (snap > 0) {
          newXCm = Math.round(newXCm / snap) * snap;
          newZCm = Math.round(newZCm / snap) * snap;
        }

        const d = this.selectedItem.userData.itemData;
        const { effWidth, effDepth } = this.getRotatedFootprintCm(d);
        const house = this.getHouseBoundsCm();

        newXCm = Math.max(house.minX + effWidth / 2, Math.min(house.maxX - effWidth / 2, newXCm));
        newZCm = Math.max(house.minZ + effDepth / 2, Math.min(house.maxZ - effDepth / 2, newZCm));

        if (d.x !== Math.round(newXCm) || d.z !== Math.round(newZCm)) {
          this.dragMoved = true;
          d.x = Math.round(newXCm);
          d.z = Math.round(newZCm);
          this.updateItemTransform(this.selectedItem);
          this.syncInspectorValues();
        }
      }
    };

    const onPointerUp = () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.controls.enabled = true;
        if (this.dragMoved) {
          this.pushHistory('تحريك قطعة أثاث');
          this.dragMoved = false;
        }
      }
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // اختصارات لوحة المفاتيح شاملة التراجع (Ctrl+Z) والإعادة (Ctrl+Y)
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        this.redo();
        return;
      }

      if (!this.selectedItem) return;
      const d = this.selectedItem.userData.itemData;
      const step = e.shiftKey ? 1 : (this.settings.snapStep || 5);

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        this.deleteSelectedItem();
      } else if (e.key.toLowerCase() === 'r') {
        d.rotation = (d.rotation + 45) % 360;
        this.updateItemTransform(this.selectedItem);
        this.syncInspectorValues();
        this.pushHistory('تدوير قطعة');
      } else if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        if (e.key === 'ArrowRight') d.x += step;
        if (e.key === 'ArrowLeft') d.x -= step;
        if (e.key === 'ArrowUp') d.z -= step;
        if (e.key === 'ArrowDown') d.z += step;
        this.updateItemTransform(this.selectedItem);
        this.syncInspectorValues();
        this.pushHistory('تحريك بالسهم');
      }
    });
  }

  // ==================== ربط عناصر الواجهة (UI Binding) ====================
  renderRoomsTabsUI() {
    const listEl = document.getElementById('rooms-tabs-container');
    if (!listEl) return;
    listEl.innerHTML = '';

    this.rooms.forEach((room, idx) => {
      const isSelected = room.id === this.activeRoomId;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
        isSelected
          ? 'bg-sky-600 text-white border-sky-400 shadow-sm'
          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
      }`;
      btn.innerHTML = `<span>🏠</span><span class="truncate max-w-[110px]">${room.name || ('غرفة ' + (idx + 1))}</span>`;
      btn.addEventListener('click', () => {
        this.activeRoomId = room.id;
        this.buildAllRooms();
        this.renderRoomsTabsUI();
        this.syncActiveRoomInputsUI();
        this.focusOnActiveRoom(true, false);
      });
      listEl.appendChild(btn);
    });
  }

  syncActiveRoomInputsUI() {
    const r = this.activeRoom;
    if (!r) return;
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };
    setVal('active-room-name', r.name);
    setVal('room-width-input', r.width);
    setVal('room-depth-input', r.depth);
    setVal('room-height-input', r.height);
    setVal('room-pos-x', Math.round(r.offsetX || 0));
    setVal('room-pos-z', Math.round(r.offsetZ || 0));
    setVal('room-floor-select', r.floorId);
    setVal('room-wall-select', r.wallId);

    const floorCustom = document.getElementById('room-floor-custom');
    if (floorCustom) {
      const floorMatData = window.ROOM_MATERIALS.floors.find(f => f.id === r.floorId);
      floorCustom.value = r.customFloorColor || floorMatData?.color || '#d8c5b0';
    }
    const wallCustom = document.getElementById('room-wall-custom');
    if (wallCustom) {
      const wallMatData = window.ROOM_MATERIALS.walls.find(w => w.id === r.wallId);
      wallCustom.value = r.customWallColor || wallMatData?.color || '#f8fafc';
    }

    // تحديث قائمة الغرف المرجعية للوزن والمحاذاة
    const alignSection = document.getElementById('room-alignment-section');
    const targetSelect = document.getElementById('room-align-target-select');
    if (targetSelect) {
      const otherRooms = this.rooms.filter(room => room.id !== r.id);
      const prevVal = targetSelect.value;
      targetSelect.innerHTML = '';

      if (otherRooms.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'لا توجد غرف مجاورة حالياً (أضف غرفة أولاً)';
        targetSelect.appendChild(opt);
        targetSelect.disabled = true;
        if (alignSection) {
          alignSection.classList.add('opacity-50', 'pointer-events-none');
        }
      } else {
        targetSelect.disabled = false;
        if (alignSection) {
          alignSection.classList.remove('opacity-50', 'pointer-events-none');
        }
        otherRooms.forEach(rm => {
          const opt = document.createElement('option');
          opt.value = rm.id;
          opt.textContent = `${rm.name} (${rm.width}×${rm.depth} سم)`;
          targetSelect.appendChild(opt);
        });

        if (prevVal && otherRooms.some(rm => rm.id === prevVal)) {
          targetSelect.value = prevVal;
        } else {
          targetSelect.value = otherRooms[0].id;
        }
      }
    }
  }

  initUI() {
    this.renderCatalogList('all');
    this.renderRoomsTabsUI();

    // 1. تبديل أقسام اللوحة الجانبية (الغرف / الكتالوج / عرض شامل)
    const btnTabRooms = document.getElementById('btn-sidebar-tab-rooms');
    const btnTabCatalog = document.getElementById('btn-sidebar-tab-catalog');
    const btnTabAll = document.getElementById('btn-sidebar-tab-all');
    const secRooms = document.getElementById('sidebar-section-rooms');
    const secCatalog = document.getElementById('sidebar-section-catalog');

    const setSidebarMode = (mode) => {
      [btnTabRooms, btnTabCatalog, btnTabAll].forEach(b => {
        b?.classList.remove('bg-sky-600', 'text-white', 'shadow');
        b?.classList.add('text-slate-400');
      });

      if (mode === 'rooms') {
        btnTabRooms?.classList.add('bg-sky-600', 'text-white', 'shadow');
        btnTabRooms?.classList.remove('text-slate-400');
        secRooms?.classList.remove('hidden');
        secCatalog?.classList.add('hidden');
      } else if (mode === 'catalog') {
        btnTabCatalog?.classList.add('bg-sky-600', 'text-white', 'shadow');
        btnTabCatalog?.classList.remove('text-slate-400');
        secRooms?.classList.add('hidden');
        secCatalog?.classList.remove('hidden');
      } else if (mode === 'all') {
        btnTabAll?.classList.add('bg-sky-600', 'text-white', 'shadow');
        btnTabAll?.classList.remove('text-slate-400');
        secRooms?.classList.remove('hidden');
        secCatalog?.classList.remove('hidden');
      }
    };

    btnTabRooms?.addEventListener('click', () => setSidebarMode('rooms'));
    btnTabCatalog?.addEventListener('click', () => setSidebarMode('catalog'));
    btnTabAll?.addEventListener('click', () => setSidebarMode('all'));

    // 2. تفعيل الأكورديون القابل للطي والفرد للأقسام
    document.querySelectorAll('[data-accordion-toggle]').forEach(header => {
      header.addEventListener('click', () => {
        const targetId = header.getAttribute('data-accordion-toggle');
        const content = document.getElementById(targetId);
        const arrow = header.querySelector('.accordion-arrow');
        if (content) {
          const isHidden = content.classList.toggle('hidden');
          if (arrow) {
            arrow.textContent = isHidden ? '◀' : '▼';
          }
        }
      });
    });

    // 3. بحث سريع داخل كتالوج الأثاث
    const catalogSearchInput = document.getElementById('catalog-search');
    if (catalogSearchInput) {
      catalogSearchInput.addEventListener('input', (e) => {
        this.catalogSearchQuery = e.target.value;
        this.renderCatalogList(this.currentCatalogCategory || 'all');
      });
    }

    // 4. أزرار شريط أدوات الكاميرا العائم أسفل شاشة العرض
    document.getElementById('btn-dock-focus-room')?.addEventListener('click', () => {
      this.focusOnActiveRoom(true, false);
    });

    document.getElementById('btn-dock-low-angle')?.addEventListener('click', () => {
      this.focusOnActiveRoom(true, true);
    });

    document.getElementById('btn-dock-fit-house')?.addEventListener('click', () => {
      this.fitAllRooms(true);
    });

    document.getElementById('btn-dock-zoom-in')?.addEventListener('click', () => {
      const dir = new THREE.Vector3().subVectors(this.controls.target, this.perspCamera.position).normalize();
      this.perspCamera.position.addScaledVector(dir, 1.2);
      this.controls.update();
    });

    document.getElementById('btn-dock-zoom-out')?.addEventListener('click', () => {
      const dir = new THREE.Vector3().subVectors(this.controls.target, this.perspCamera.position).normalize();
      this.perspCamera.position.addScaledVector(dir, -1.2);
      this.controls.update();
    });

    document.querySelectorAll('.btn-dock-nudge').forEach(btn => {
      btn.addEventListener('click', () => {
        const dx = Number(btn.dataset.dockNudgeX) || 0;
        const dz = Number(btn.dataset.dockNudgeZ) || 0;
        const moveContents = document.getElementById('room-move-contents-toggle')?.checked ?? true;
        this.moveActiveRoom(dx, dz, moveContents, 'إزاحة سريعة للغرفة');
      });
    });

    // أزرار التراجع والإعادة
    document.getElementById('btn-undo')?.addEventListener('click', () => this.undo());
    document.getElementById('btn-redo')?.addEventListener('click', () => this.redo());

    // فلاتر الكتالوج
    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-filter-btn').forEach(b => {
          b.classList.remove('bg-sky-600', 'text-white');
          b.classList.add('bg-slate-800', 'text-slate-300');
        });
        btn.classList.remove('bg-slate-800', 'text-slate-300');
        btn.classList.add('bg-sky-600', 'text-white');
        this.renderCatalogList(btn.dataset.cat);
      });
    });

    // أزرار إضافة غرف مجاورة لكامل المنزل
    document.querySelectorAll('.btn-add-adj-room').forEach(btn => {
      btn.addEventListener('click', () => {
        this.addAdjacentRoom(btn.dataset.dir);
      });
    });
    document.getElementById('btn-delete-room')?.addEventListener('click', () => {
      this.deleteActiveRoom();
    });

    // اسم الغرفة النشطة
    const roomNameInput = document.getElementById('active-room-name');
    if (roomNameInput) {
      roomNameInput.addEventListener('change', (e) => {
        this.activeRoom.name = e.target.value || 'غرفة';
        this.buildAllRooms();
        this.renderRoomsTabsUI();
        this.pushHistory('تغيير اسم الغرفة');
      });
    }

    // قوائم الأرضيات والحوائط وتدرجات الألوان الحرة
    const floorSelect = document.getElementById('room-floor-select');
    if (floorSelect) {
      window.ROOM_MATERIALS.floors.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = f.name;
        floorSelect.appendChild(opt);
      });
      floorSelect.addEventListener('change', (e) => {
        this.activeRoom.floorId = e.target.value;
        this.activeRoom.customFloorColor = null;
        this.buildAllRooms();
        this.syncActiveRoomInputsUI();
        this.pushHistory('تغيير أرضية الغرفة');
      });
    }

    const wallSelect = document.getElementById('room-wall-select');
    if (wallSelect) {
      window.ROOM_MATERIALS.walls.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.id;
        opt.textContent = w.name;
        wallSelect.appendChild(opt);
      });
      wallSelect.addEventListener('change', (e) => {
        this.activeRoom.wallId = e.target.value;
        this.activeRoom.customWallColor = null;
        this.buildAllRooms();
        this.syncActiveRoomInputsUI();
        this.pushHistory('تغيير لون الحائط');
      });
    }

    // تدرجات ألوان موكيت وأرضيات ودهانات الحوائط الحرة
    const floorCustom = document.getElementById('room-floor-custom');
    if (floorCustom) {
      floorCustom.addEventListener('input', (e) => {
        this.activeRoom.customFloorColor = e.target.value;
        this.buildAllRooms();
      });
      floorCustom.addEventListener('change', () => {
        this.pushHistory('تغيير تدرج موكيت/أرضية الغرفة');
      });
    }

    const wallCustom = document.getElementById('room-wall-custom');
    if (wallCustom) {
      wallCustom.addEventListener('input', (e) => {
        this.activeRoom.customWallColor = e.target.value;
        this.buildAllRooms();
      });
      wallCustom.addEventListener('change', () => {
        this.pushHistory('تغيير دهان جدران الغرفة');
      });
    }

    // أبعاد الغرفة النشطة بالسنتيمتر
    const bindRoomDim = (id, prop, min, max) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', () => {
        const val = Math.max(min, Math.min(max, Number(el.value) || min));
        el.value = val;
        this.activeRoom[prop] = val;
        this.buildAllRooms();
        this.pushHistory('تعديل أبعاد الغرفة');
      });
    };
    bindRoomDim('room-width-input', 'width', 150, 1500);
    bindRoomDim('room-depth-input', 'depth', 150, 1500);
    bindRoomDim('room-height-input', 'height', 220, 500);

    // إحداثيات وموقع الغرفة النشطة
    const posXInput = document.getElementById('room-pos-x');
    if (posXInput) {
      posXInput.addEventListener('change', () => {
        const val = Number(posXInput.value);
        if (Number.isNaN(val)) return;
        const deltaX = Math.round(val - (this.activeRoom?.offsetX || 0));
        const moveContents = document.getElementById('room-move-contents-toggle')?.checked ?? true;
        this.moveActiveRoom(deltaX, 0, moveContents, 'تعديل موضع الغرفة X');
      });
    }

    const posZInput = document.getElementById('room-pos-z');
    if (posZInput) {
      posZInput.addEventListener('change', () => {
        const val = Number(posZInput.value);
        if (Number.isNaN(val)) return;
        const deltaZ = Math.round(val - (this.activeRoom?.offsetZ || 0));
        const moveContents = document.getElementById('room-move-contents-toggle')?.checked ?? true;
        this.moveActiveRoom(0, deltaZ, moveContents, 'تعديل موضع الغرفة Z');
      });
    }

    // أزرار الإزاحة السريعة للغرفة (⬅️ ➡️ ⬆️ ⬇️)
    document.querySelectorAll('.btn-nudge-room').forEach(btn => {
      btn.addEventListener('click', () => {
        const rdx = Number(btn.dataset.rdx) || 0;
        const rdz = Number(btn.dataset.rdz) || 0;
        const moveContents = document.getElementById('room-move-contents-toggle')?.checked ?? true;
        this.moveActiveRoom(rdx, rdz, moveContents, 'إزاحة سريعة للغرفة');
      });
    });

    // أزرار وزن ومحاذاة الغرفة مع الغرف المجاورة
    document.querySelectorAll('.btn-align-room').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetSelect = document.getElementById('room-align-target-select');
        const targetRoomId = targetSelect?.value;
        const alignMode = btn.dataset.alignMode;
        if (targetRoomId && alignMode) {
          this.alignActiveRoomWith(targetRoomId, alignMode);
        }
      });
    });

    // حقول أبعاد وموقع قطعة الأثاث المحددة
    const bindItemDim = (id, prop, rebuild = true) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        if (!this.selectedItem) return;
        const val = Number(el.value);
        if (Number.isNaN(val)) return;
        const d = this.selectedItem.userData.itemData;
        d[prop] = rebuild ? Math.max(2, val) : val;
        if (rebuild) {
          this.rebuildItemVisuals(this.selectedItem);
        }
        this.updateItemTransform(this.selectedItem);
        this.updateRoomStatsUI();
      });
      el.addEventListener('change', () => {
        this.pushHistory('تعديل مقاس القطعة');
      });
    };

    bindItemDim('item-width', 'width', true);
    bindItemDim('item-depth', 'depth', true);
    bindItemDim('item-height', 'height', true);
    bindItemDim('item-elevation', 'elevation', false);
    bindItemDim('item-pos-x', 'x', false);
    bindItemDim('item-pos-z', 'z', false);

    const rotSlider = document.getElementById('item-rotation');
    if (rotSlider) {
      rotSlider.addEventListener('input', () => {
        if (!this.selectedItem) return;
        const d = this.selectedItem.userData.itemData;
        d.rotation = Number(rotSlider.value);
        const rotLabel = document.getElementById('rotation-val-label');
        if (rotLabel) rotLabel.textContent = `${Math.round(d.rotation)}°`;
        this.updateItemTransform(this.selectedItem);
      });
      rotSlider.addEventListener('change', () => this.pushHistory('تدوير قطعة'));
    }

    document.getElementById('btn-rot-left')?.addEventListener('click', () => {
      if (!this.selectedItem) return;
      const d = this.selectedItem.userData.itemData;
      d.rotation = (d.rotation - 90 + 360) % 360;
      this.updateItemTransform(this.selectedItem);
      this.syncInspectorValues();
      this.pushHistory('تدوير -90°');
    });
    document.getElementById('btn-rot-right')?.addEventListener('click', () => {
      if (!this.selectedItem) return;
      const d = this.selectedItem.userData.itemData;
      d.rotation = (d.rotation + 90) % 360;
      this.updateItemTransform(this.selectedItem);
      this.syncInspectorValues();
      this.pushHistory('تدوير +90°');
    });
    document.getElementById('btn-center-item')?.addEventListener('click', () => {
      if (!this.selectedItem) return;
      const d = this.selectedItem.userData.itemData;
      const r = this.activeRoom;
      d.x = r.offsetX;
      d.z = r.offsetZ;
      this.updateItemTransform(this.selectedItem);
      this.syncInspectorValues();
      this.pushHistory('توسيط في الغرفة');
    });

    // باليتة ألوان وتدرجات الأثاث
    const paletteContainer = document.getElementById('item-color-palette');
    if (paletteContainer) {
      window.ROOM_MATERIALS.furnitureColors.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.title = c.name;
        btn.className = 'w-7 h-7 rounded-full border-2 border-slate-600 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-sky-400 shrink-0';
        btn.style.backgroundColor = c.hex;
        btn.addEventListener('click', () => {
          if (!this.selectedItem) return;
          this.selectedItem.userData.itemData.color = c.hex;
          this.rebuildItemVisuals(this.selectedItem);
          this.updateItemTransform(this.selectedItem);
          this.syncInspectorValues();
          this.pushHistory(`تغيير لون إلى ${c.name}`);
        });
        paletteContainer.appendChild(btn);
      });
    }

    // اللون الحر للقطعة من عجلة الألوان
    const itemColorCustom = document.getElementById('item-custom-color');
    if (itemColorCustom) {
      itemColorCustom.addEventListener('input', (e) => {
        if (!this.selectedItem) return;
        const d = this.selectedItem.userData.itemData;
        d.color = e.target.value;
        const hex = document.getElementById('item-color-hex');
        if (hex) hex.textContent = e.target.value;
        this.rebuildItemVisuals(this.selectedItem);
        this.updateItemTransform(this.selectedItem);
      });
      itemColorCustom.addEventListener('change', () => {
        this.pushHistory('تخصيص لون القطعة');
      });
    }

    // اللون الثانوي المكمل (أرجل خشب، إطار، نقوش)
    const itemSecondaryCustom = document.getElementById('item-secondary-color');
    if (itemSecondaryCustom) {
      itemSecondaryCustom.addEventListener('input', (e) => {
        if (!this.selectedItem) return;
        const d = this.selectedItem.userData.itemData;
        d.secondaryColor = e.target.value;
        const hex = document.getElementById('item-secondary-hex');
        if (hex) hex.textContent = e.target.value;
        this.rebuildItemVisuals(this.selectedItem);
        this.updateItemTransform(this.selectedItem);
      });
      itemSecondaryCustom.addEventListener('change', () => {
        this.pushHistory('تخصيص اللون الثانوي للقطعة');
      });
    }

    document.getElementById('btn-duplicate-item')?.addEventListener('click', () => this.duplicateSelectedItem());
    document.getElementById('btn-delete-item')?.addEventListener('click', () => this.deleteSelectedItem());
    document.getElementById('btn-reset-dims')?.addEventListener('click', () => {
      if (!this.selectedItem) return;
      const d = this.selectedItem.userData.itemData;
      const orig = window.FURNITURE_CATALOG.find(c => c.id === d.catalogId);
      if (orig) {
        d.width = orig.width;
        d.depth = orig.depth;
        d.height = orig.height;
        d.elevation = orig.elevation || 0;
        this.rebuildItemVisuals(this.selectedItem);
        this.updateItemTransform(this.selectedItem);
        this.syncInspectorValues();
        this.updateRoomStatsUI();
        this.pushHistory('استعادة المقاس القياسي');
      }
    });

    // شريط الأدوات العلوي
    document.getElementById('btn-view-3d')?.addEventListener('click', () => this.setViewMode('3d'));
    document.getElementById('btn-view-2d')?.addEventListener('click', () => this.setViewMode('2d'));

    document.getElementById('btn-toggle-dims')?.addEventListener('click', (e) => {
      this.settings.showDimensions = !this.settings.showDimensions;
      const btn = e.currentTarget;
      btn.classList.toggle('bg-emerald-600', this.settings.showDimensions);
      btn.classList.toggle('bg-slate-800', !this.settings.showDimensions);
      this.buildRoomRulers();
      this.items.forEach(item => this.rebuildItemVisuals(item));
      this.validateAllItemsBounds();
    });

    // زر فتح / إغلاق جميع الأبواب والنوافذ في المنزل بنقرة واحدة
    document.getElementById('btn-toggle-all-doors')?.addEventListener('click', () => {
      const doorItems = this.items.filter(g => this.isDoorOrWindow(g.userData.itemData.catalogId));
      if (doorItems.length === 0) return;

      const anyClosedOrHalf = doorItems.some(g => (g.userData.itemData.openRatio ?? 65) < 90);
      const targetRatio = anyClosedOrHalf ? 100 : 0;

      doorItems.forEach(g => {
        g.userData.itemData.openRatio = targetRatio;
        this.rebuildItemVisuals(g);
        this.updateItemTransform(g);
      });

      const lbl = document.getElementById('all-doors-btn-label');
      if (lbl) {
        lbl.textContent = targetRatio === 100 ? 'إغلاق الأبواب والنوافذ' : 'فتح الأبواب والنوافذ';
      }
      this.syncDoorWindowInspectorUI();
      this.pushHistory(targetRatio === 100 ? 'فتح كافة الأبواب والنوافذ' : 'إغلاق كافة الأبواب والنوافذ');
    });

    // عناصر التحكم في فتح الأبواب والنوافذ (نسبة الفتح، مفصلات/سحب، اتجاه الفتح، جهة المفصلة)
    const applySelectedDoorChange = (mutatorFn, historyLabel) => {
      if (!this.selectedItem) return;
      const d = this.selectedItem.userData.itemData;
      if (!this.isDoorOrWindow(d.catalogId)) return;
      mutatorFn(d);
      this.evaluateAllDoorSwingCollisions();
      this.rebuildItemVisuals(this.selectedItem);
      this.updateItemTransform(this.selectedItem);
      this.syncDoorWindowInspectorUI();
      if (historyLabel) {
        this.pushHistory(historyLabel);
      }
    };

    const openRatioSlider = document.getElementById('item-open-ratio');
    if (openRatioSlider) {
      openRatioSlider.addEventListener('input', () => {
        applySelectedDoorChange(d => {
          d.openRatio = Number(openRatioSlider.value);
        }, '');
      });
      openRatioSlider.addEventListener('change', () => {
        this.pushHistory('تعديل نسبة فتح الباب/النافذة');
      });
    }

    document.getElementById('btn-door-close')?.addEventListener('click', () => {
      applySelectedDoorChange(d => { d.openRatio = 0; }, 'إغلاق الباب/النافذة');
    });
    document.getElementById('btn-door-half')?.addEventListener('click', () => {
      applySelectedDoorChange(d => { d.openRatio = 50; }, 'فتح نصف الباب/النافذة');
    });
    document.getElementById('btn-door-open')?.addEventListener('click', () => {
      applySelectedDoorChange(d => { d.openRatio = 100; }, 'فتح الباب/النافذة بالكامل');
    });

    document.querySelectorAll('.door-opentype-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const newType = btn.dataset.opentype;
        applySelectedDoorChange(d => {
          d.openType = newType;
          if ((d.openRatio ?? 0) === 0) d.openRatio = 75;
        }, `تغيير نوع الفتح إلى ${newType === 'sliding' ? 'سحب' : 'مفصلات'}`);
      });
    });

    document.querySelectorAll('.door-opendir-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const newDir = btn.dataset.opendir;
        applySelectedDoorChange(d => {
          d.openDirection = newDir;
          if ((d.openRatio ?? 0) === 0) d.openRatio = 75;
        }, `تغيير اتجاه الفتح إلى ${newDir === 'outward' ? 'للخارج' : 'للداخل'}`);
      });
    });

    document.querySelectorAll('.door-hinge-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const newHinge = btn.dataset.hingeside;
        applySelectedDoorChange(d => {
          d.hingeSide = newHinge;
          if ((d.openRatio ?? 0) === 0) d.openRatio = 75;
        }, 'تغيير جهة المفصلة/السحب');
      });
    });

    // عناصر التحكم في الستائر وأحجامها ومطابقتها للنوافذ
    const applySelectedCurtainChange = (mutatorFn, historyLabel) => {
      if (!this.selectedItem) return;
      const d = this.selectedItem.userData.itemData;
      if (!this.isCurtain(d.catalogId)) return;
      mutatorFn(d);
      this.rebuildItemVisuals(this.selectedItem);
      this.updateItemTransform(this.selectedItem);
      this.syncInspectorValues();
      if (historyLabel) {
        this.pushHistory(historyLabel);
      }
    };

    document.getElementById('btn-fit-curtain-window')?.addEventListener('click', () => {
      this.fitSelectedCurtainToNearestWindow();
    });

    const curtainOpenSlider = document.getElementById('item-curtain-open');
    if (curtainOpenSlider) {
      curtainOpenSlider.addEventListener('input', () => {
        applySelectedCurtainChange(d => {
          d.curtainOpenRatio = Number(curtainOpenSlider.value);
        }, '');
      });
      curtainOpenSlider.addEventListener('change', () => {
        this.pushHistory('تعديل نسبة فتح الستارة');
      });
    }

    document.getElementById('btn-curtain-closed')?.addEventListener('click', () => {
      applySelectedCurtainChange(d => { d.curtainOpenRatio = 0; }, 'إسدال الستارة بالكامل');
    });
    document.getElementById('btn-curtain-half')?.addEventListener('click', () => {
      applySelectedCurtainChange(d => { d.curtainOpenRatio = 50; }, 'فتح الستارة للنصف');
    });
    document.getElementById('btn-curtain-open')?.addEventListener('click', () => {
      applySelectedCurtainChange(d => { d.curtainOpenRatio = 85; }, 'فتح الستارة بالكامل');
    });

    document.querySelectorAll('.curtain-preset-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cw = Number(btn.dataset.cw) || 160;
        const ch = Number(btn.dataset.ch) || 160;
        const ce = Number(btn.dataset.ce) || 0;
        applySelectedCurtainChange(d => {
          d.width = cw;
          d.height = ch;
          d.elevation = ce;
        }, `تغيير مقاس الستارة (${cw}×${ch} سم)`);
      });
    });

    // عناصر التحكم في ألوان مفارش الأسرة والوسائد والشراشف
    const applySelectedBeddingChange = (mutatorFn, historyLabel) => {
      if (!this.selectedItem) return;
      const d = this.selectedItem.userData.itemData;
      if (!this.isBed(d.catalogId)) return;
      mutatorFn(d);
      this.rebuildItemVisuals(this.selectedItem);
      this.updateItemTransform(this.selectedItem);
      this.syncInspectorValues();
      if (historyLabel) {
        this.pushHistory(historyLabel);
      }
    };

    const duvetPalette = document.getElementById('bedding-duvet-palette');
    const pillowPalette = document.getElementById('bedding-pillow-palette');
    if (duvetPalette && window.ROOM_MATERIALS.beddingColors) {
      window.ROOM_MATERIALS.beddingColors.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.title = c.name;
        btn.className = 'w-6 h-6 rounded-full border-2 border-slate-600 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-indigo-400 shrink-0';
        btn.style.backgroundColor = c.hex;
        btn.addEventListener('click', () => {
          applySelectedBeddingChange(d => { d.beddingColor = c.hex; }, `تغيير لون المفرش إلى ${c.name}`);
        });
        duvetPalette.appendChild(btn);
      });
    }

    if (pillowPalette && window.ROOM_MATERIALS.beddingColors) {
      window.ROOM_MATERIALS.beddingColors.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.title = c.name;
        btn.className = 'w-6 h-6 rounded-full border-2 border-slate-600 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-indigo-400 shrink-0';
        btn.style.backgroundColor = c.hex;
        btn.addEventListener('click', () => {
          applySelectedBeddingChange(d => { d.pillowColor = c.hex; }, `تغيير لون الوسائد إلى ${c.name}`);
        });
        pillowPalette.appendChild(btn);
      });
    }

    const bedDuvetCustom = document.getElementById('bed-custom-duvet');
    if (bedDuvetCustom) {
      bedDuvetCustom.addEventListener('input', (e) => {
        applySelectedBeddingChange(d => { d.beddingColor = e.target.value; }, '');
      });
      bedDuvetCustom.addEventListener('change', () => {
        this.pushHistory('تخصيص لون مفرش السرير');
      });
    }

    const bedPillowCustom = document.getElementById('bed-custom-pillow');
    if (bedPillowCustom) {
      bedPillowCustom.addEventListener('input', (e) => {
        applySelectedBeddingChange(d => { d.pillowColor = e.target.value; }, '');
      });
      bedPillowCustom.addEventListener('change', () => {
        this.pushHistory('تخصيص لون وسائد السرير');
      });
    }

    // عناصر التحكم في أشكال وأنماط وألوان السجاد الأرضي
    const applySelectedRugChange = (mutatorFn, historyLabel) => {
      if (!this.selectedItem) return;
      const d = this.selectedItem.userData.itemData;
      if (!this.isRug(d.catalogId)) return;
      mutatorFn(d);
      this.rebuildItemVisuals(this.selectedItem);
      this.updateItemTransform(this.selectedItem);
      this.syncInspectorValues();
      if (historyLabel) {
        this.pushHistory(historyLabel);
      }
    };

    document.querySelectorAll('.rug-shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const shape = btn.getAttribute('data-rug-shape');
        applySelectedRugChange(d => {
          d.rugShape = shape;
          if (shape === 'round') {
            const side = Math.max(120, Math.min(d.width, d.depth));
            d.width = side;
            d.depth = side;
          } else if (shape === 'runner') {
            d.width = Math.min(d.width, 100);
            d.depth = Math.max(d.depth, 240);
          }
        }, `تغيير شكل السجادة إلى ${shape}`);
      });
    });

    document.querySelectorAll('.rug-pattern-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pattern = btn.getAttribute('data-rug-pattern');
        applySelectedRugChange(d => {
          d.rugPattern = pattern;
        }, `تغيير نمط السجادة إلى ${pattern}`);
      });
    });

    const rugPrimaryCustom = document.getElementById('rug-custom-primary');
    if (rugPrimaryCustom) {
      rugPrimaryCustom.addEventListener('input', (e) => {
        applySelectedRugChange(d => { d.color = e.target.value; }, '');
      });
      rugPrimaryCustom.addEventListener('change', () => {
        this.pushHistory('تغيير اللون الأساسي للسجادة');
      });
    }

    const rugAccentCustom = document.getElementById('rug-custom-accent');
    if (rugAccentCustom) {
      rugAccentCustom.addEventListener('input', (e) => {
        applySelectedRugChange(d => { d.secondaryColor = e.target.value; }, '');
      });
      rugAccentCustom.addEventListener('change', () => {
        this.pushHistory('تغيير لون زخرفة السجادة');
      });
    }

    // عناصر التحكم في شاشات وتلفزيونات الحائط (المقاس، الارتفاع، الإضاءة المحيطية)
    const tvDims = {
      55: { w: 123, h: 71, d: 7 },
      65: { w: 145, h: 83, d: 7 },
      75: { w: 168, h: 96, d: 8 },
      85: { w: 190, h: 108, d: 8 }
    };

    const applySelectedWallTVChange = (mutatorFn, historyLabel) => {
      if (!this.selectedItem) return;
      const d = this.selectedItem.userData.itemData;
      if (!this.isWallTV(d.catalogId)) return;
      mutatorFn(d);
      this.rebuildItemVisuals(this.selectedItem);
      this.updateItemTransform(this.selectedItem);
      this.syncInspectorValues();
      if (historyLabel) {
        this.pushHistory(historyLabel);
      }
    };

    document.querySelectorAll('.tv-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sz = Number(btn.dataset.tvSize);
        const dims = tvDims[sz] || tvDims[65];
        applySelectedWallTVChange(d => {
          d.tvSize = sz;
          d.width = dims.w;
          d.height = dims.h;
          d.depth = dims.d;
          if (d.name) {
            d.name = d.name.replace(/\d+\s*بوصة/, `${sz} بوصة`);
          }
        }, `تغيير مقاس الشاشة إلى ${sz} بوصة`);
      });
    });

    document.querySelectorAll('.tv-elev-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const elev = Number(btn.dataset.tvElev);
        applySelectedWallTVChange(d => {
          d.elevation = elev;
        }, `تعديل ارتفاع تعليق الشاشة إلى ${elev} سم`);
      });
    });

    document.querySelectorAll('.tv-ambi-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ambi = btn.dataset.tvAmbi;
        applySelectedWallTVChange(d => {
          d.tvAmbilight = ambi;
        }, ambi === 'transparent' ? 'إيقاف إضاءة خلفية الشاشة' : 'تغيير إضاءة خلفية الشاشة');
      });
    });

    // عناصر التحكم في مكيف الحائط الفريون (درجة الحرارة، وضع التبريد، الارتفاع)
    const applySelectedACChange = (mutatorFn, historyLabel) => {
      if (!this.selectedItem) return;
      const d = this.selectedItem.userData.itemData;
      if (!this.isAC(d.catalogId)) return;
      mutatorFn(d);
      this.rebuildItemVisuals(this.selectedItem);
      this.updateItemTransform(this.selectedItem);
      this.syncInspectorValues();
      if (historyLabel) {
        this.pushHistory(historyLabel);
      }
    };

    document.querySelectorAll('.ac-temp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const temp = Number(btn.dataset.acTemp);
        applySelectedACChange(d => {
          d.acTemp = temp;
        }, `ضبط حرارة المكيف على ${temp}°C`);
      });
    });

    document.querySelectorAll('.ac-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.acMode;
        applySelectedACChange(d => {
          d.acMode = mode;
        }, `تغيير وضع تبريد المكيف إلى ${mode === 'cool' ? 'تبريد فريون' : mode === 'fan' ? 'مروحة' : 'هادئ'}`);
      });
    });

    document.querySelectorAll('.ac-elev-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const elev = Number(btn.dataset.acElev);
        applySelectedACChange(d => {
          d.elevation = elev;
        }, `تعديل ارتفاع تركيب المكيف إلى ${elev} سم`);
      });
    });

    document.getElementById('btn-toggle-light')?.addEventListener('click', () => {
      const next = this.settings.lightingMode === 'day' ? 'night' : 'day';
      this.setLightingMode(next);
      const lbl = document.getElementById('light-mode-label');
      if (lbl) lbl.textContent = next === 'day' ? '☀️ نهاري' : '🌙 مسائي';
    });

    document.getElementById('preset-select')?.addEventListener('change', (e) => {
      if (e.target.value) {
        this.loadPreset(e.target.value, true);
      }
    });

    document.getElementById('btn-clear-room')?.addEventListener('click', () => {
      this.clearAllFurniture(true);
    });

    document.getElementById('btn-screenshot')?.addEventListener('click', () => this.exportScreenshot());
    document.getElementById('btn-save-json')?.addEventListener('click', () => this.exportProjectJSON());
    document.getElementById('input-load-json')?.addEventListener('change', (e) => this.importProjectJSON(e));

    // استوديو تناسق الألوان وقاعدة 60-30-10
    document.getElementById('btn-open-harmony')?.addEventListener('click', () => {
      this.openHarmonyStudioModal();
    });

    document.getElementById('btn-close-harmony')?.addEventListener('click', () => {
      this.closeHarmonyStudioModal();
    });

    document.getElementById('btn-done-harmony')?.addEventListener('click', () => {
      this.closeHarmonyStudioModal();
    });

    document.getElementById('harmony-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'harmony-modal') {
        this.closeHarmonyStudioModal();
      }
    });

    const seedColorInput = document.getElementById('harmony-custom-seed');
    if (seedColorInput) {
      seedColorInput.addEventListener('input', (e) => {
        this.renderGeneratedSchemes(e.target.value);
      });
    }

    // استوديو زوايا ولون الإضاءة والظلال
    document.getElementById('btn-open-lighting-studio')?.addEventListener('click', () => {
      this.toggleLightingStudioPanel();
    });

    document.getElementById('btn-close-lighting-studio')?.addEventListener('click', () => {
      this.toggleLightingStudioPanel(false);
    });

    // أشرطة زوايا الإضاءة (Azimuth & Elevation)
    const azSlider = document.getElementById('light-azimuth');
    if (azSlider) {
      azSlider.addEventListener('input', (e) => {
        this.lightingSettings.azimuth = Number(e.target.value);
        this.lightingSettings.autoOrbit = false;
        this.updateLights();
        this.syncLightingInputsUI(false);
      });
      azSlider.addEventListener('change', () => {
        this.pushHistory('تغيير زاوية دوران الإضاءة الأفقية');
      });
    }

    const elSlider = document.getElementById('light-elevation');
    if (elSlider) {
      elSlider.addEventListener('input', (e) => {
        this.lightingSettings.elevation = Number(e.target.value);
        this.updateLights();
        this.syncLightingInputsUI(false);
      });
      elSlider.addEventListener('change', () => {
        this.pushHistory('تغيير زاوية ميل وارتفاع الإضاءة');
      });
    }

    // زر محاكاة دوران الشمس التلقائي
    document.getElementById('btn-toggle-auto-orbit')?.addEventListener('click', () => {
      this.lightingSettings.autoOrbit = !this.lightingSettings.autoOrbit;
      this.syncLightingInputsUI(false);
    });

    // ألوان الضوء
    const sunColorInput = document.getElementById('light-sun-color');
    if (sunColorInput) {
      sunColorInput.addEventListener('input', (e) => {
        this.lightingSettings.sunColor = e.target.value;
        this.updateLights();
        this.syncLightingInputsUI(false);
      });
      sunColorInput.addEventListener('change', () => {
        this.pushHistory('تغيير لون الضوء المباشر');
      });
    }

    const ambientColorInput = document.getElementById('light-ambient-color');
    if (ambientColorInput) {
      ambientColorInput.addEventListener('input', (e) => {
        this.lightingSettings.ambientColor = e.target.value;
        this.updateLights();
        this.syncLightingInputsUI(false);
      });
      ambientColorInput.addEventListener('change', () => {
        this.pushHistory('تغيير لون الإضاءة المحيطية');
      });
    }

    // أزرار حرارة الإضاءة الجاهزة (كلفن)
    document.querySelectorAll('.light-temp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-temp-color');
        if (color) {
          this.lightingSettings.sunColor = color;
          this.updateLights();
          this.syncLightingInputsUI(true);
          this.pushHistory('تغيير حرارة الإضاءة');
        }
      });
    });

    // أوضاع الإضاءة وزواياها الجاهزة
    document.querySelectorAll('.light-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-light-preset');
        if (preset) {
          this.applyLightingPreset(preset);
        }
      });
    });

    // شدة الضوء المباشر والمحيطي
    const sunIntSlider = document.getElementById('light-intensity-sun');
    if (sunIntSlider) {
      sunIntSlider.addEventListener('input', (e) => {
        this.lightingSettings.sunIntensity = Number(e.target.value);
        this.updateLights();
        this.syncLightingInputsUI(false);
      });
    }

    const ambIntSlider = document.getElementById('light-intensity-ambient');
    if (ambIntSlider) {
      ambIntSlider.addEventListener('input', (e) => {
        this.lightingSettings.ambientIntensity = Number(e.target.value);
        this.updateLights();
        this.syncLightingInputsUI(false);
      });
    }

    // تفعيل / إيقاف الظلال
    const shadowToggle = document.getElementById('light-shadows-toggle');
    if (shadowToggle) {
      shadowToggle.addEventListener('change', (e) => {
        this.lightingSettings.shadowsEnabled = e.target.checked;
        this.updateLights();
        this.pushHistory('تبديل الظلال الحقيقية');
      });
    }
  }

  toggleLightingStudioPanel(forceState) {
    const panel = document.getElementById('lighting-studio-panel');
    if (!panel) return;
    const isVisible = !panel.classList.contains('hidden');
    const targetState = typeof forceState === 'boolean' ? forceState : !isVisible;
    if (targetState) {
      panel.classList.remove('hidden');
      this.syncLightingInputsUI(true);
    } else {
      panel.classList.add('hidden');
    }
  }

  // ==================== استوديو تناسق وتناغم الألوان وقاعدة 60-30-10 ====================

  openHarmonyStudioModal() {
    const modal = document.getElementById('harmony-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    this.updateHarmonyModalStats();
    this.renderHarmonyCuratedPalettes();
    const seed = document.getElementById('harmony-custom-seed')?.value || '#0f766e';
    this.renderGeneratedSchemes(seed);
  }

  closeHarmonyStudioModal() {
    const modal = document.getElementById('harmony-modal');
    if (modal) modal.classList.add('hidden');
  }

  updateHarmonyModalStats() {
    if (!window.ColorHarmonyEngine) return;
    const r = this.activeRoom || this.rooms[0];
    const analysis = window.ColorHarmonyEngine.analyzeRoomHarmony(r, this.items);

    const roomLabel = document.getElementById('harmony-active-room-label');
    if (roomLabel) roomLabel.textContent = `📍 الغرفة الحالية: ${r.name}`;

    const scoreBadge = document.getElementById('harmony-score-badge');
    if (scoreBadge) {
      scoreBadge.textContent = `${analysis.score}% • ${analysis.rating}`;
      scoreBadge.className = `px-3 py-1 rounded-full text-xs font-black border ${analysis.ratingBadgeClass}`;
    }

    const barDom = document.getElementById('harmony-bar-dominant');
    const barSec = document.getElementById('harmony-bar-secondary');
    const barAcc = document.getElementById('harmony-bar-accent');
    if (barDom) { barDom.style.backgroundColor = analysis.dominant.hex; barDom.title = `سائد 60%: ${analysis.dominant.hex}`; }
    if (barSec) { barSec.style.backgroundColor = analysis.secondary.hex; barSec.title = `ثانوي 30%: ${analysis.secondary.hex}`; }
    if (barAcc) { barAcc.style.backgroundColor = analysis.accent.hex; barAcc.title = `تمييز 10%: ${analysis.accent.hex}`; }

    const chipDom = document.getElementById('harmony-chip-dominant');
    const chipSec = document.getElementById('harmony-chip-secondary');
    const chipAcc = document.getElementById('harmony-chip-accent');
    if (chipDom) chipDom.style.backgroundColor = analysis.dominant.hex;
    if (chipSec) chipSec.style.backgroundColor = analysis.secondary.hex;
    if (chipAcc) chipAcc.style.backgroundColor = analysis.accent.hex;

    const tipEl = document.getElementById('harmony-tip-text');
    if (tipEl && analysis.tips.length > 0) {
      tipEl.textContent = analysis.tips.join(' ');
    }
  }

  renderHarmonyCuratedPalettes() {
    const grid = document.getElementById('harmony-palettes-grid');
    if (!grid || !window.HARMONY_PALETTES) return;
    grid.innerHTML = '';

    window.HARMONY_PALETTES.forEach(p => {
      const card = document.createElement('div');
      card.className = 'bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 hover:border-violet-500/60 transition-all flex flex-col justify-between gap-2.5 group';

      const circlesHtml = p.colors.map(c => `
        <span class="w-6 h-6 rounded-full border border-white/20 shadow-sm shrink-0" style="background-color: ${c};" title="${c}"></span>
      `).join('');

      card.innerHTML = `
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <h5 class="text-xs font-bold text-slate-100 group-hover:text-violet-300 transition-colors">${p.name}</h5>
            <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">${p.category}</span>
          </div>
          <p class="text-[11px] text-slate-400 leading-relaxed">${p.description}</p>
          <div class="flex items-center gap-1.5 pt-1">
            ${circlesHtml}
          </div>
        </div>
        <div class="flex items-center gap-2 pt-2 border-t border-slate-800/80">
          <button type="button" class="btn-apply-room-palette flex-1 py-1.5 rounded-xl bg-violet-600/90 hover:bg-violet-600 text-white text-xs font-bold transition-all shadow-sm">
            تطبيق على الغرفة
          </button>
          <button type="button" class="btn-apply-all-rooms-palette px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all" title="تطبيق هذا النمط على جميع غرف المنزل">
            المنزل بالكامل
          </button>
        </div>
      `;

      card.querySelector('.btn-apply-room-palette').addEventListener('click', () => {
        this.applyHarmonyPalette(p, 'active');
      });

      card.querySelector('.btn-apply-all-rooms-palette').addEventListener('click', () => {
        this.applyHarmonyPalette(p, 'all');
      });

      grid.appendChild(card);
    });
  }

  renderGeneratedSchemes(seedHex) {
    const container = document.getElementById('harmony-generated-schemes');
    if (!container || !window.ColorHarmonyEngine) return;
    container.innerHTML = '';

    const schemes = window.ColorHarmonyEngine.getHarmoniousSchemes(seedHex);
    Object.keys(schemes).forEach(key => {
      const s = schemes[key];
      const card = document.createElement('div');
      card.className = 'bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between gap-2';

      const chipsHtml = s.colors.map(c => `
        <span class="w-5 h-5 rounded-md border border-white/20 shrink-0" style="background-color: ${c};" title="${c}"></span>
      `).join('');

      card.innerHTML = `
        <div class="space-y-1">
          <h6 class="text-[11px] font-bold text-slate-200">${s.title}</h6>
          <div class="flex items-center gap-1 py-1">
            ${chipsHtml}
          </div>
        </div>
        <button type="button" class="w-full py-1 rounded-lg bg-slate-800 hover:bg-violet-600 text-slate-300 hover:text-white text-[10px] font-bold transition-colors">
          تطبيق على الغرفة
        </button>
      `;

      card.querySelector('button').addEventListener('click', () => {
        const customPalette = {
          id: `custom_${key}`,
          name: s.title,
          dominant: { wallId: 'warm_white', floorId: 'oak_parquet', hex: s.colors[2] },
          secondary: {
            furnitureColor: s.colors[0],
            woodTone: s.colors[1],
            rugPrimary: s.colors[0],
            rugAccent: s.colors[3],
            rugPattern: 'geometric'
          },
          accent: {
            beddingColor: s.colors[3],
            pillowColor: s.colors[1],
            curtainColor: s.colors[2],
            decorColor: s.colors[1]
          }
        };
        this.applyHarmonyPalette(customPalette, 'active');
      });

      container.appendChild(card);
    });
  }

  applyHarmonyPalette(palette, scope = 'active') {
    const targetRooms = scope === 'all' ? this.rooms : [this.activeRoom];

    targetRooms.forEach(room => {
      if (palette.dominant.wallId) {
        room.wallId = palette.dominant.wallId;
        room.customWallColor = null;
      } else if (palette.dominant.hex) {
        room.customWallColor = palette.dominant.hex;
      }

      if (palette.dominant.floorId) {
        room.floorId = palette.dominant.floorId;
        room.customFloorColor = null;
      } else if (palette.dominant.hex) {
        room.customFloorColor = palette.dominant.hex;
      }

      // تطبيق الألوان على قطع أثاث الغرفة وفق قاعدة 60-30-10
      const halfW = room.width / 2;
      const halfD = room.depth / 2;
      this.items.forEach(g => {
        const d = g.userData.itemData;
        const inThisRoom = (
          d.x >= room.offsetX - halfW - 20 &&
          d.x <= room.offsetX + halfW + 20 &&
          d.z >= room.offsetZ - halfD - 20 &&
          d.z <= room.offsetZ + halfD + 20
        );
        if (!inThisRoom) return;

        if (this.isBed(d.catalogId)) {
          d.color = palette.secondary.woodTone || palette.secondary.furnitureColor;
          d.beddingColor = palette.accent.beddingColor || '#ffffff';
          d.pillowColor = palette.accent.pillowColor || '#b08968';
        } else if (this.isRug(d.catalogId)) {
          d.color = palette.secondary.rugPrimary;
          d.secondaryColor = palette.secondary.rugAccent;
          if (palette.secondary.rugPattern) {
            d.rugPattern = palette.secondary.rugPattern;
          }
        } else if (this.isCurtain(d.catalogId)) {
          d.color = palette.accent.curtainColor || palette.secondary.furnitureColor;
        } else {
          d.color = palette.secondary.furnitureColor;
          if (d.secondaryColor && palette.secondary.woodTone) {
            d.secondaryColor = palette.secondary.woodTone;
          }
        }
        this.rebuildItemVisuals(g);
        this.updateItemTransform(g);
      });
    });

    this.buildAllRooms();
    this.syncActiveRoomInputsUI();
    if (this.selectedItem) {
      this.syncInspectorValues();
    }
    this.updateRoomStatsUI();
    this.updateHarmonyModalStats();
    this.pushHistory(`تناسق لوني: ${palette.name}`);
  }

  renderCatalogList(category = 'all') {
    this.currentCatalogCategory = category;
    const listEl = document.getElementById('catalog-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const q = (this.catalogSearchQuery || '').trim().toLowerCase();
    let filtered = category === 'all'
      ? window.FURNITURE_CATALOG
      : window.FURNITURE_CATALOG.filter(i => i.category === category || (Array.isArray(i.categories) && i.categories.includes(category)));

    if (q) {
      filtered = filtered.filter(i => 
        i.name.toLowerCase().includes(q) || 
        (i.category && i.category.toLowerCase().includes(q)) ||
        (Array.isArray(i.categories) && i.categories.some(c => c.toLowerCase().includes(q)))
      );
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="p-6 text-center text-slate-500 text-xs">
          <span>🔍 لا توجد عناصر تطابق البحث "${q}"</span>
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'group flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-sky-500 hover:bg-slate-800 transition-all cursor-pointer';
      card.innerHTML = `
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-lg shrink-0 border border-slate-700 group-hover:scale-105 transition-transform">
            ${item.icon}
          </div>
          <div class="min-w-0">
            <h4 class="text-xs font-bold text-slate-100 truncate group-hover:text-sky-400 transition-colors">${item.name}</h4>
            <p class="text-[10px] text-emerald-400 font-medium mt-0.5">
              ${item.width}×${item.depth} سم • ارتفاع ${item.height} سم
            </p>
          </div>
        </div>
        <button type="button" class="px-2 py-1 rounded-lg bg-sky-600/20 text-sky-400 group-hover:bg-sky-600 group-hover:text-white text-[11px] font-bold transition-colors shrink-0">
          + أضف
        </button>
      `;
      card.addEventListener('click', () => {
        this.addFurnitureItem(item.id, {}, true);
      });
      listEl.appendChild(card);
    });
  }

  setViewMode(mode) {
    this.viewMode = mode;
    const btn3d = document.getElementById('btn-view-3d');
    const btn2d = document.getElementById('btn-view-2d');

    if (mode === '2d') {
      this.activeCamera = this.orthoCamera;
      this.controls.object = this.orthoCamera;
      this.controls.enableRotate = false;
      this.orthoCamera.position.set(0, 18, 0);
      this.orthoCamera.lookAt(0, 0, 0);
      this.controls.target.set(0, 0, 0);
      btn2d?.classList.replace('bg-slate-800', 'bg-sky-600');
      btn3d?.classList.replace('bg-sky-600', 'bg-slate-800');
    } else {
      this.activeCamera = this.perspCamera;
      this.controls.object = this.perspCamera;
      this.controls.enableRotate = true;
      btn3d?.classList.replace('bg-slate-800', 'bg-sky-600');
      btn2d?.classList.replace('bg-sky-600', 'bg-slate-800');
    }
    this.controls.update();
  }

  duplicateSelectedItem() {
    if (!this.selectedItem) return;
    const d = this.selectedItem.userData.itemData;
    this.addFurnitureItem(d.catalogId, {
      width: d.width,
      depth: d.depth,
      height: d.height,
      elevation: d.elevation,
      x: d.x + 35,
      z: d.z + 35,
      rotation: d.rotation,
      color: d.color,
      secondaryColor: d.secondaryColor,
      openType: d.openType,
      openDirection: d.openDirection,
      hingeSide: d.hingeSide,
      openRatio: d.openRatio,
      curtainOpenRatio: d.curtainOpenRatio,
      beddingColor: d.beddingColor,
      pillowColor: d.pillowColor,
      rugShape: d.rugShape,
      rugPattern: d.rugPattern
    }, true);
  }

  deleteSelectedItem() {
    if (!this.selectedItem) return;
    const target = this.selectedItem;
    this.selectItem(null);
    this.furnitureGroup.remove(target);
    this.items = this.items.filter(i => i !== target);
    this.updateRoomStatsUI();
    this.pushHistory('حذف قطعة أثاث');
  }

  clearAllFurniture(recordHistory = true) {
    this.selectItem(null);
    while (this.furnitureGroup.children.length > 0) {
      this.furnitureGroup.remove(this.furnitureGroup.children[0]);
    }
    this.items = [];
    this.updateRoomStatsUI();
    if (recordHistory) {
      this.pushHistory('إفراغ الأثاث');
    }
  }

  loadPreset(presetKey, recordHistory = true) {
    const preset = window.HOUSE_PRESETS[presetKey];
    if (!preset) return;

    this.clearAllFurniture(false);
    this.rooms = JSON.parse(JSON.stringify(preset.rooms));
    this.activeRoomId = this.rooms[0].id;

    if (preset.lightingMode) {
      this.setLightingMode(preset.lightingMode);
      const lbl = document.getElementById('light-mode-label');
      if (lbl) lbl.textContent = preset.lightingMode === 'day' ? '☀️ نهاري' : '🌙 مسائي';
    }
    if (typeof preset.snapStep === 'number') {
      this.settings.snapStep = preset.snapStep;
    }
    if (typeof preset.showDimensions === 'boolean') {
      this.settings.showDimensions = preset.showDimensions;
      const dimsBtn = document.getElementById('btn-toggle-dims');
      if (dimsBtn) {
        dimsBtn.classList.toggle('bg-emerald-600', this.settings.showDimensions);
        dimsBtn.classList.toggle('bg-slate-800', !this.settings.showDimensions);
      }
    }

    this.buildAllRooms();
    this.renderRoomsTabsUI();
    this.syncActiveRoomInputsUI();

    preset.items.forEach(itemConf => {
      this.addFurnitureItem(itemConf.catalogId, itemConf, false);
    });
    this.selectItem(null);
    this.updateRoomStatsUI();

    // ضبط مدى الكاميرا حسب حجم القالب (شقة كاملة أو غرفة مفردة)
    if (this.rooms.length > 1) {
      this.perspCamera.position.set(8.5, 8.5, 9.8);
    } else {
      this.perspCamera.position.set(5.2, 5.0, 5.8);
    }
    this.controls.target.set(0, 0.4, 0);
    this.controls.update();

    if (recordHistory) {
      this.pushHistory(`تحميل قالب: ${preset.name}`);
    }
    this.saveAutoProjectToStorage();
  }

  exportScreenshot() {
    this.renderer.render(this.scene, this.activeCamera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `مخطط-منزل-3D-${Date.now()}.png`;
    a.click();
  }

  exportProjectJSON() {
    const firstRoom = this.activeRoom || this.rooms[0];
    const payload = {
      version: '2.0',
      settings: this.settings,
      lightingSettings: this.lightingSettings,
      room: firstRoom ? {
        width: firstRoom.width,
        depth: firstRoom.depth,
        height: firstRoom.height,
        floorId: firstRoom.floorId,
        wallId: firstRoom.wallId,
        snapStep: this.settings.snapStep,
        showDimensions: this.settings.showDimensions,
        lightingMode: this.settings.lightingMode
      } : undefined,
      rooms: this.rooms,
      activeRoomId: this.activeRoomId,
      items: this.items.map(i => i.userData.itemData)
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const dimTag = firstRoom ? `${firstRoom.width}x${firstRoom.depth}` : `${Date.now()}`;
    a.download = `مشروع-أثاث-${dimTag}.json`;
    a.click();
  }

  /**
   * دالة موحدة تدعم استيراد كلٍ من:
   * - مشاريع الإصدار v1.0 (ذات الكائن المفرد data.room مثل ملف مشروع-أثاث-315x364.json)
   * - مشاريع الإصدار v2.0 (ذات المصفوفة data.rooms للغرف المتجاورة)
   */
  applyImportedProjectData(data, recordHistory = true) {
    if (!data || !Array.isArray(data.items)) return false;

    let normalizedRooms = [];

    if (Array.isArray(data.rooms) && data.rooms.length > 0) {
      normalizedRooms = data.rooms.map((r, idx) => ({
        id: r.id || `room_${idx + 1}`,
        name: r.name || `غرفة ${idx + 1}`,
        width: Number(r.width) || 400,
        depth: Number(r.depth) || 400,
        height: Number(r.height) || 300,
        offsetX: Number(r.offsetX) || 0,
        offsetZ: Number(r.offsetZ) || 0,
        floorId: r.floorId || 'oak_parquet',
        wallId: r.wallId || 'warm_white',
        customFloorColor: r.customFloorColor || null,
        customWallColor: r.customWallColor || null
      }));
    } else if (data.room && typeof data.room === 'object') {
      const r = data.room;
      const w = Number(r.width) || 400;
      const d = Number(r.depth) || 400;
      normalizedRooms = [
        {
          id: r.id || 'room_1',
          name: r.name || `غرفة التصميم (${w}×${d} سم)`,
          width: w,
          depth: d,
          height: Number(r.height) || 300,
          offsetX: Number(r.offsetX) || 0,
          offsetZ: Number(r.offsetZ) || 0,
          floorId: r.floorId || 'oak_parquet',
          wallId: r.wallId || 'warm_white',
          customFloorColor: r.customFloorColor || null,
          customWallColor: r.customWallColor || null
        }
      ];

      // استعادة إعدادات الإضاءة والشبكة والأبعاد المحفوظة داخل data.room في الإصدار v1.0
      if (r.lightingMode) {
        this.setLightingMode(r.lightingMode);
        const lbl = document.getElementById('light-mode-label');
        if (lbl) lbl.textContent = r.lightingMode === 'day' ? '☀️ نهاري' : '🌙 مسائي';
      }
      if (typeof r.snapStep === 'number') {
        this.settings.snapStep = r.snapStep;
      }
      if (typeof r.showDimensions === 'boolean') {
        this.settings.showDimensions = r.showDimensions;
        const dimsBtn = document.getElementById('btn-toggle-dims');
        if (dimsBtn) {
          dimsBtn.classList.toggle('bg-emerald-600', this.settings.showDimensions);
          dimsBtn.classList.toggle('bg-slate-800', !this.settings.showDimensions);
        }
      }
    } else {
      return false;
    }

    if (data.settings && typeof data.settings === 'object') {
      if (data.settings.lightingMode) {
        this.setLightingMode(data.settings.lightingMode);
        const lbl = document.getElementById('light-mode-label');
        if (lbl) lbl.textContent = data.settings.lightingMode === 'day' ? '☀️ نهاري' : '🌙 مسائي';
      }
      if (typeof data.settings.snapStep === 'number') {
        this.settings.snapStep = data.settings.snapStep;
      }
      if (typeof data.settings.showDimensions === 'boolean') {
        this.settings.showDimensions = data.settings.showDimensions;
        const dimsBtn = document.getElementById('btn-toggle-dims');
        if (dimsBtn) {
          dimsBtn.classList.toggle('bg-emerald-600', this.settings.showDimensions);
          dimsBtn.classList.toggle('bg-slate-800', !this.settings.showDimensions);
        }
      }
    }

    if (data.lightingSettings && typeof data.lightingSettings === 'object') {
      Object.assign(this.lightingSettings, data.lightingSettings);
      this.updateLights();
      this.syncLightingInputsUI(true);
    }

    this.clearAllFurniture(false);
    this.rooms = normalizedRooms;
    this.activeRoomId = data.activeRoomId && this.rooms.some(rm => rm.id === data.activeRoomId)
      ? data.activeRoomId
      : this.rooms[0].id;

    this.buildAllRooms();
    this.renderRoomsTabsUI();
    this.syncActiveRoomInputsUI();

    data.items.forEach(itemConf => {
      this.addFurnitureItem(itemConf.catalogId, itemConf, false);
    });
    this.selectItem(null);
    this.updateRoomStatsUI();

    if (this.rooms.length > 1) {
      this.perspCamera.position.set(8.5, 8.5, 9.8);
    } else {
      this.perspCamera.position.set(5.2, 5.0, 5.8);
    }
    this.controls.target.set(0, 0.4, 0);
    this.controls.update();

    if (recordHistory) {
      this.pushHistory('استيراد ملف مشروع');
    }
    this.saveAutoProjectToStorage();
    return true;
  }

  importProjectJSON(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const ok = this.applyImportedProjectData(data, true);
        if (!ok) {
          alert('تنسيق ملف المشروع غير مدعوم.');
        }
      } catch (err) {
        alert('ملف التصميم غير صالح.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  onWindowResize() {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;

    this.perspCamera.aspect = w / h;
    this.perspCamera.updateProjectionMatrix();

    const aspect = w / h;
    const frustumSize = 11.5;
    this.orthoCamera.left = (-frustumSize * aspect) / 2;
    this.orthoCamera.right = (frustumSize * aspect) / 2;
    this.orthoCamera.top = frustumSize / 2;
    this.orthoCamera.bottom = -frustumSize / 2;
    this.orthoCamera.updateProjectionMatrix();

    this.renderer.setSize(w, h);
  }

  updateSmartWallsVisibility() {
    if (this.viewMode === '2d') {
      this.walls.forEach(w => { w.material.opacity = 0.25; });
      return;
    }
    const camDir = new THREE.Vector3();
    this.activeCamera.getWorldDirection(camDir);

    this.walls.forEach(wall => {
      if (wall.userData.isSharedInterior) {
        wall.material.opacity = 0.45;
        return;
      }
      const normal = wall.userData.normal;
      const dot = camDir.dot(normal);
      wall.material.opacity = dot > 0.15 ? 0.12 : 0.95;
    });
  }

  // ==================== تحكم وسلاسة الكاميرا ثلاثية الأبعاد (Smooth Camera Transitions) ====================
  startCameraTransition(toCamX, toCamY, toCamZ, toTgtX, toTgtY, toTgtZ, durationMs = 380) {
    if (this.viewMode === '2d') {
      this.setViewMode('3d');
    }
    this.cameraTransition = {
      startTime: performance.now(),
      duration: durationMs,
      startCam: this.perspCamera.position.clone(),
      endCam: new THREE.Vector3(toCamX, toCamY, toCamZ),
      startTgt: this.controls.target.clone(),
      endTgt: new THREE.Vector3(toTgtX, toTgtY, toTgtZ)
    };
  }

  updateCameraTransition() {
    if (!this.cameraTransition) return;
    const now = performance.now();
    const elapsed = now - this.cameraTransition.startTime;
    const progress = Math.min(1, elapsed / this.cameraTransition.duration);
    // Smooth easeInOutQuad
    const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

    this.perspCamera.position.lerpVectors(this.cameraTransition.startCam, this.cameraTransition.endCam, ease);
    this.controls.target.lerpVectors(this.cameraTransition.startTgt, this.cameraTransition.endTgt, ease);

    if (progress >= 1) {
      this.cameraTransition = null;
    }
  }

  focusOnActiveRoom(smooth = true, lowAngle = false) {
    const r = this.activeRoom;
    if (!r) return;
    const targetX = r.offsetX / 100;
    const targetZ = r.offsetZ / 100;
    const targetY = lowAngle ? 0.25 : 0.45;

    let camX, camY, camZ;
    if (lowAngle) {
      // زاوية أرضية منخفضة قريبة لرؤية الموكيت، أقدام الأثاث، والأجزاء السفلية
      camX = targetX + (r.width / 200) * 0.95;
      camY = 0.85;
      camZ = targetZ + (r.depth / 200) * 1.15;
    } else {
      // منظور علوي مريح ومائل للغرفة
      camX = targetX + Math.max(3.8, (r.width / 100) * 0.95);
      camY = Math.max(3.6, (r.height / 100) * 1.3);
      camZ = targetZ + Math.max(4.2, (r.depth / 100) * 1.05);
    }

    if (!smooth) {
      this.controls.target.set(targetX, targetY, targetZ);
      this.perspCamera.position.set(camX, camY, camZ);
      this.controls.update();
      return;
    }

    this.startCameraTransition(camX, camY, camZ, targetX, targetY, targetZ, 400);
  }

  fitAllRooms(smooth = true) {
    if (!this.rooms.length) return;
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    this.rooms.forEach(r => {
      minX = Math.min(minX, (r.offsetX - r.width / 2) / 100);
      maxX = Math.max(maxX, (r.offsetX + r.width / 2) / 100);
      minZ = Math.min(minZ, (r.offsetZ - r.depth / 2) / 100);
      maxZ = Math.max(maxZ, (r.offsetZ + r.depth / 2) / 100);
    });

    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const spanX = maxX - minX;
    const spanZ = maxZ - minZ;
    const maxSpan = Math.max(spanX, spanZ, 4.5);

    const dist = Math.max(7.5, maxSpan * 1.6);
    const camX = centerX + dist * 0.72;
    const camY = Math.max(6.5, dist * 0.88);
    const camZ = centerZ + dist * 0.78;

    if (!smooth) {
      this.controls.target.set(centerX, 0.45, centerZ);
      this.perspCamera.position.set(camX, camY, camZ);
      this.controls.update();
      return;
    }

    this.startCameraTransition(camX, camY, camZ, centerX, 0.45, centerZ, 480);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.cameraTransition) {
      this.updateCameraTransition();
    }
    if (this.lightingSettings?.autoOrbit) {
      this.lightingSettings.azimuth = (this.lightingSettings.azimuth + 0.35) % 360;
      this.updateLights();
      this.syncLightingInputsUI(false);
    }
    this.controls.update();
    this.updateSmartWallsVisibility();
    this.renderer.render(this.scene, this.activeCamera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.studioApp = new RoomStudioApp();
});
