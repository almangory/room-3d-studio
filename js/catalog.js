/**
 * كتالوج الأثاث الموسع والمكونات المعمارية ومخططات المنازل الكاملة متعددة الغرف
 * جميع الأبعاد بالسنتيمتر (cm) والنظام يحولها داخلياً إلى المتر (1m = 100cm)
 */

window.ROOM_MATERIALS = {
  floors: [
    { id: 'oak_parquet', name: 'باركيه بلوط طبيعي', color: '#c89d6c', roughness: 0.4, type: 'parquet' },
    { id: 'walnut_wood', name: 'خشب جوز داكن فخم', color: '#6e472b', roughness: 0.35, type: 'parquet' },
    { id: 'white_marble', name: 'رخام كرارا أبيض', color: '#f1f5f9', roughness: 0.15, type: 'marble' },
    { id: 'beige_ceramic', name: 'سيراميك بيج دافئ', color: '#e6dcc8', roughness: 0.25, type: 'tiles' },
    { id: 'gray_concrete', name: 'بورسلين رمادي عصري', color: '#94a3b8', roughness: 0.5, type: 'tiles' },
    { id: 'kitchen_tiles', name: 'بلاط شطرنجي للمطابخ', color: '#cbd5e1', roughness: 0.3, type: 'checker' },
    { id: 'aqua_tiles', name: 'سيراميك حمامات أكوا', color: '#bae6fd', roughness: 0.2, type: 'tiles' },
    { id: 'soft_carpet', name: 'موكيت بيج ناعم', color: '#d6ccc2', roughness: 0.9, type: 'carpet' }
  ],
  walls: [
    { id: 'warm_white', name: 'أبيض دافئ (أوف وايت)', color: '#f8fafc' },
    { id: 'cream_beige', name: 'كريمي هادئ', color: '#f5ebe0' },
    { id: 'sage_green', name: 'أخضر ميرمية عصري', color: '#cbd5c0' },
    { id: 'sky_breeze', name: 'أزرق سماوي هادئ', color: '#dbeafe' },
    { id: 'slate_gray', name: 'رمادي فحمي أنيق', color: '#cbd5e1' },
    { id: 'terracotta', name: 'بيج رملي دافئ', color: '#e3d5ca' },
    { id: 'lavender_soft', name: 'لافندر ناعم', color: '#ede9fe' }
  ],
  furnitureColors: [
    { name: 'رمادي عصري', hex: '#475569' },
    { name: 'بيج كتان', hex: '#d6ccc2' },
    { name: 'كحلي ملكي', hex: '#1e3a8a' },
    { name: 'أخضر زمردي', hex: '#065f46' },
    { name: 'جملي جلد', hex: '#b45309' },
    { name: 'خشب بلوط', hex: '#a97142' },
    { name: 'خشب جوز', hex: '#5c3a21' },
    { name: 'أبيض ناصع', hex: '#f8fafc' },
    { name: 'أسود مطفي', hex: '#1e293b' },
    { name: 'وردي هادئ', hex: '#be185d' },
    { name: 'ذهبي معدني', hex: '#d97706' },
    { name: 'تركواز', hex: '#0f766e' },
    { name: 'فضي ستانلس', hex: '#94a3b8' },
    { name: 'عنابي فخم', hex: '#7f1d1d' }
  ]
};

window.FURNITURE_CATALOG = [
  // ================= غرفة المعيشة والصالون (Living Room) =================
  {
    id: 'sofa_3seat', name: 'كنبة 3 مقاعد فخمة', category: 'living',
    width: 220, depth: 95, height: 85, elevation: 0,
    color: '#475569', secondaryColor: '#a97142', icon: '🛋️'
  },
  {
    id: 'sofa_2seat', name: 'كنبة مقعدين (Loveseat)', category: 'living',
    width: 160, depth: 90, height: 85, elevation: 0,
    color: '#334155', secondaryColor: '#a97142', icon: '🛋️'
  },
  {
    id: 'sofa_lshape', name: 'ركنة حرف L عصرية', category: 'living',
    width: 260, depth: 175, height: 85, elevation: 0,
    color: '#334155', secondaryColor: '#cbd5e1', icon: '🛋️'
  },
  {
    id: 'armchair', name: 'كرسي فوتيه مفرد', category: 'living',
    width: 85, depth: 85, height: 82, elevation: 0,
    color: '#065f46', secondaryColor: '#a97142', icon: '🪑'
  },
  {
    id: 'ottoman_pouf', name: 'بوف / مسند قدم مبطن', category: 'living',
    width: 60, depth: 60, height: 42, elevation: 0,
    color: '#b45309', secondaryColor: '#d97706', icon: '🟠'
  },
  {
    id: 'coffee_table', name: 'طاولة قهوة وسطية', category: 'living',
    width: 120, depth: 65, height: 45, elevation: 0,
    color: '#a97142', secondaryColor: '#1e293b', icon: '🪵'
  },
  {
    id: 'tv_unit', name: 'وحدة تلفزيون وشاشة 65"', category: 'living',
    width: 180, depth: 45, height: 135, elevation: 0,
    color: '#5c3a21', secondaryColor: '#0f172a', icon: '📺'
  },
  {
    id: 'fireplace_modern', name: 'مدفأة ديكور حجرية', category: 'living',
    width: 140, depth: 38, height: 115, elevation: 0,
    color: '#334155', secondaryColor: '#f97316', icon: '🔥'
  },
  {
    id: 'console_table', name: 'كونسول مدخل مع مرآة', category: 'living',
    width: 120, depth: 38, height: 170, elevation: 0,
    color: '#a97142', secondaryColor: '#d97706', icon: '🪞'
  },
  {
    id: 'side_table', name: 'طاولة جانبية دائرية', category: 'living',
    width: 50, depth: 50, height: 55, elevation: 0,
    color: '#f8fafc', secondaryColor: '#d97706', icon: '⚪'
  },

  // ================= غرفة النوم (Bedroom) =================
  {
    id: 'bed_king', name: 'سرير مزدوج (King Size)', category: 'bedroom',
    width: 180, depth: 210, height: 110, elevation: 0,
    color: '#d6ccc2', secondaryColor: '#5c3a21', icon: '🛏️'
  },
  {
    id: 'bed_single', name: 'سرير مفرد (Single)', category: 'bedroom',
    width: 110, depth: 200, height: 95, elevation: 0,
    color: '#1e3a8a', secondaryColor: '#a97142', icon: '🛌'
  },
  {
    id: 'bunk_bed', name: 'سرير طابقين للأطفال', category: 'bedroom',
    width: 115, depth: 205, height: 175, elevation: 0,
    color: '#0284c7', secondaryColor: '#a97142', icon: '🪜'
  },
  {
    id: 'baby_crib', name: 'سرير طفل رضيع بحواجز', category: 'bedroom',
    width: 75, depth: 135, height: 95, elevation: 0,
    color: '#f8fafc', secondaryColor: '#e2e8f0', icon: '👶'
  },
  {
    id: 'wardrobe_large', name: 'دولاب ملابس 4 ضلف', category: 'bedroom',
    width: 200, depth: 60, height: 220, elevation: 0,
    color: '#f8fafc', secondaryColor: '#a97142', icon: '🚪'
  },
  {
    id: 'wardrobe_corner', name: 'دولاب ملابس زاوية', category: 'bedroom',
    width: 130, depth: 130, height: 220, elevation: 0,
    color: '#a97142', secondaryColor: '#5c3a21', icon: '衣'
  },
  {
    id: 'nightstand', name: 'كومودينو جانبي', category: 'bedroom',
    width: 50, depth: 45, height: 55, elevation: 0,
    color: '#5c3a21', secondaryColor: '#d97706', icon: '🗄️'
  },
  {
    id: 'dresser_mirror', name: 'تسريحة مع مرآة مضيئة', category: 'bedroom',
    width: 120, depth: 50, height: 165, elevation: 0,
    color: '#f8fafc', secondaryColor: '#d97706', icon: '💄'
  },
  {
    id: 'shoe_rack', name: 'جزامة وخزانة أحذية', category: 'bedroom',
    width: 90, depth: 35, height: 105, elevation: 0,
    color: '#5c3a21', secondaryColor: '#f8fafc', icon: '👞'
  },

  // ================= المطبخ والحمام (Kitchen & Bath) =================
  {
    id: 'kitchen_counter', name: 'وحدة مطبخ وحوض غسيل', category: 'kitchen',
    width: 220, depth: 62, height: 90, elevation: 0,
    color: '#334155', secondaryColor: '#f8fafc', icon: '🚰'
  },
  {
    id: 'kitchen_island', name: 'جزيرة مطبخ وسطية بكراسي', category: 'kitchen',
    width: 160, depth: 90, height: 92, elevation: 0,
    color: '#1e293b', secondaryColor: '#f8fafc', icon: '🏝️'
  },
  {
    id: 'fridge_double', name: 'ثلاجة دولابي ببابين', category: 'kitchen',
    width: 92, depth: 75, height: 182, elevation: 0,
    color: '#94a3b8', secondaryColor: '#1e293b', icon: '🧊'
  },
  {
    id: 'stove_oven', name: 'بوتاجاز وفرن 5 شعلة', category: 'kitchen',
    width: 90, depth: 62, height: 88, elevation: 0,
    color: '#cbd5e1', secondaryColor: '#0f172a', icon: '🍳'
  },
  {
    id: 'washing_machine', name: 'غسالة ملابس أوتوماتيك', category: 'kitchen',
    width: 62, depth: 62, height: 85, elevation: 0,
    color: '#f8fafc', secondaryColor: '#334155', icon: '🫧'
  },
  {
    id: 'bathtub', name: 'بانيو استحمام رخامي', category: 'kitchen',
    width: 170, depth: 80, height: 60, elevation: 0,
    color: '#f8fafc', secondaryColor: '#38bdf8', icon: '🛁'
  },
  {
    id: 'shower_cabin', name: 'كابينة شاور زجاجية', category: 'kitchen',
    width: 95, depth: 95, height: 205, elevation: 0,
    color: '#bae6fd', secondaryColor: '#94a3b8', icon: '🚿'
  },
  {
    id: 'vanity_sink', name: 'حوض حمام بخزانة ومرآة', category: 'kitchen',
    width: 90, depth: 50, height: 175, elevation: 0,
    color: '#5c3a21', secondaryColor: '#f8fafc', icon: '🪥'
  },
  {
    id: 'toilet_wc', name: 'كرسي حمام قياسي (WC)', category: 'kitchen',
    width: 45, depth: 68, height: 78, elevation: 0,
    color: '#f8fafc', secondaryColor: '#cbd5e1', icon: '🚽'
  },

  // ================= السفرة والمكتب (Dining & Office) =================
  {
    id: 'dining_set_6', name: 'طاولة سفرة مستطيلة 6 كراسي', category: 'dining',
    width: 180, depth: 100, height: 78, elevation: 0,
    color: '#5c3a21', secondaryColor: '#d6ccc2', icon: '🍽️'
  },
  {
    id: 'dining_round_4', name: 'طاولة طعام دائرية 4 كراسي', category: 'dining',
    width: 120, depth: 120, height: 78, elevation: 0,
    color: '#a97142', secondaryColor: '#334155', icon: '🥘'
  },
  {
    id: 'buffet_sideboard', name: 'بوفيه سفرة وخزانة أطباق', category: 'dining',
    width: 160, depth: 45, height: 86, elevation: 0,
    color: '#5c3a21', secondaryColor: '#d97706', icon: '🥂'
  },
  {
    id: 'office_desk', name: 'مكتب عمل ودراسة مع حاسوب', category: 'dining',
    width: 140, depth: 70, height: 76, elevation: 0,
    color: '#a97142', secondaryColor: '#1e293b', icon: '💻'
  },
  {
    id: 'office_chair', name: 'كرسي مكتب طبي دوار', category: 'dining',
    width: 65, depth: 65, height: 105, elevation: 0,
    color: '#1e293b', secondaryColor: '#64748b', icon: '💺'
  },
  {
    id: 'bookshelf', name: 'مكتبة كتب وأرفف مفتوحة', category: 'dining',
    width: 100, depth: 38, height: 195, elevation: 0,
    color: '#a97142', secondaryColor: '#1e3a8a', icon: '📚'
  },

  // ================= المعمارية والأبواب والديكور (Architecture & Decor) =================
  {
    id: 'door_wood', name: 'باب غرفة خشبي مفرد', category: 'arch',
    width: 95, depth: 16, height: 215, elevation: 0,
    color: '#5c3a21', secondaryColor: '#d97706', icon: '🚪'
  },
  {
    id: 'door_double', name: 'باب صالة مزدوج فخم', category: 'arch',
    width: 160, depth: 18, height: 220, elevation: 0,
    color: '#5c3a21', secondaryColor: '#d97706', icon: '🚪'
  },
  {
    id: 'door_sliding_glass', name: 'باب بلكونة زجاجي جرار', category: 'arch',
    width: 180, depth: 16, height: 215, elevation: 0,
    color: '#1e293b', secondaryColor: '#38bdf8', icon: '🪟'
  },
  {
    id: 'archway_open', name: 'قوس معماري مفتوح بين الغرف', category: 'arch',
    width: 150, depth: 22, height: 230, elevation: 0,
    color: '#f8fafc', secondaryColor: '#cbd5e1', icon: '⛩️'
  },
  {
    id: 'window_glass', name: 'نافذة زجاجية عريضة', category: 'arch',
    width: 150, depth: 16, height: 130, elevation: 90,
    color: '#f8fafc', secondaryColor: '#38bdf8', icon: '🪟'
  },
  {
    id: 'curtain_drape', name: 'ستارة قماشية طويلة', category: 'arch',
    width: 170, depth: 15, height: 245, elevation: 0,
    color: '#1e3a8a', secondaryColor: '#d97706', icon: '🎐'
  },
  {
    id: 'partition_screen', name: 'بارتشن / قاطع خشبي مفرغ', category: 'arch',
    width: 140, depth: 18, height: 210, elevation: 0,
    color: '#a97142', secondaryColor: '#5c3a21', icon: '🚧'
  },
  {
    id: 'column_pillar', name: 'عمود خرساني / رخامي', category: 'arch',
    width: 40, depth: 40, height: 300, elevation: 0,
    color: '#f1f5f9', secondaryColor: '#cbd5e1', icon: '🏛️'
  },
  {
    id: 'stairs_straight', name: 'سلم داخلي للطابق العلوي', category: 'arch',
    width: 105, depth: 280, height: 270, elevation: 0,
    color: '#a97142', secondaryColor: '#1e293b', icon: '🪜'
  },
  {
    id: 'ac_split', name: 'مكيف هواء سبليت حائطي', category: 'arch',
    width: 105, depth: 26, height: 32, elevation: 225,
    color: '#f8fafc', secondaryColor: '#1e293b', icon: '❄️'
  },
  {
    id: 'chandelier', name: 'نجفة سقف كريستال مودرن', category: 'arch',
    width: 75, depth: 75, height: 55, elevation: 230,
    color: '#f59e0b', secondaryColor: '#fef3c7', icon: '✨'
  },
  {
    id: 'wall_art', name: 'لوحة جدارية فنية محتشمة', category: 'arch',
    width: 110, depth: 6, height: 75, elevation: 135,
    color: '#0f766e', secondaryColor: '#d97706', icon: '🖼️'
  },
  {
    id: 'rug_large', name: 'سجادة أرضية منقوشة', category: 'arch',
    width: 240, depth: 170, height: 2, elevation: 0,
    color: '#b45309', secondaryColor: '#f5ebe0', icon: '🧶'
  },
  {
    id: 'floor_lamp', name: 'أباجورة أرضية طويلة', category: 'arch',
    width: 45, depth: 45, height: 165, elevation: 0,
    color: '#f5ebe0', secondaryColor: '#d97706', icon: '💡'
  },
  {
    id: 'plant_pot', name: 'نبتة زينة طبيعية كبيرة', category: 'arch',
    width: 55, depth: 55, height: 135, elevation: 0,
    color: '#065f46', secondaryColor: '#f8fafc', icon: '🪴'
  }
];

/**
 * قوالب جاهزة تشمل غرفاً مفردة أو شققاً ومنازل كاملة متعددة الغرف المتجاورة
 * كل غرفة لها موقع (offsetX, offsetZ) بالسنتيمتر لتتلاصق مع الغرف المجاورة
 */
window.HOUSE_PRESETS = {
  saved_bedroom_315x364: {
    name: '⭐ مشروعي المحفوظ (غرفة نوم 315×364 سم)',
    lightingMode: 'night',
    snapStep: 5,
    showDimensions: true,
    rooms: [
      {
        id: 'room_saved_315x364',
        name: 'غرفة النوم المحفوظة (315×364 سم)',
        width: 315,
        depth: 364,
        height: 300,
        offsetX: 0,
        offsetZ: 0,
        floorId: 'walnut_wood',
        wallId: 'sage_green'
      }
    ],
    items: [
      {
        uid: 'item_1792843630365_1066',
        catalogId: 'wardrobe_large',
        name: 'دولاب ملابس كبير 4 ضلف',
        width: 222,
        depth: 50,
        height: 220,
        elevation: 0,
        x: 132,
        z: -71,
        rotation: 270,
        color: '#1e293b',
        secondaryColor: '#a97142'
      },
      {
        uid: 'item_1792843752749_6889',
        catalogId: 'door_wood',
        name: 'باب غرفة خشبي قياسي',
        width: 111,
        depth: 15,
        height: 217,
        elevation: 0,
        x: 85,
        z: 175,
        rotation: 0,
        color: '#5c3a21',
        secondaryColor: '#d97706'
      },
      {
        uid: 'item_1792844149410_8069',
        catalogId: 'bed_king',
        name: 'سرير مزدوج (King Size)',
        width: 190,
        depth: 200,
        height: 110,
        elevation: 0,
        x: -57,
        z: -35,
        rotation: 90,
        color: '#1e293b',
        secondaryColor: '#5c3a21'
      },
      {
        uid: 'item_1792844231515_9657',
        catalogId: 'nightstand',
        name: 'كومودينو جانبي',
        width: 50,
        depth: 50,
        height: 55,
        elevation: 0,
        x: -132,
        z: -157,
        rotation: 90,
        color: '#1e293b',
        secondaryColor: '#d97706'
      },
      {
        uid: 'item_1792844706728_7219',
        catalogId: 'nightstand',
        name: 'كومودينو جانبي',
        width: 50,
        depth: 45,
        height: 55,
        elevation: 0,
        x: -85,
        z: 90,
        rotation: 90,
        color: '#1e293b',
        secondaryColor: '#d97706'
      },
      {
        uid: 'item_1792845011801_7211',
        catalogId: 'dresser_mirror',
        name: 'تسريحة مع مرآة مضيئة',
        width: 122,
        depth: 40,
        height: 180,
        elevation: 0,
        x: -96,
        z: 162,
        rotation: 180,
        color: '#1e293b',
        secondaryColor: '#d97706'
      },
      {
        uid: 'item_1792845279640_4880',
        catalogId: 'window_glass',
        name: 'نافذة زجاجية عريضة',
        width: 150,
        depth: 16,
        height: 130,
        elevation: 90,
        x: -149,
        z: 0,
        rotation: 90,
        color: '#f8fafc',
        secondaryColor: '#38bdf8'
      },
      {
        uid: 'item_1792845353662_4704',
        catalogId: 'ac_split',
        name: 'مكيف هواء سبليت حائطي',
        width: 105,
        depth: 26,
        height: 32,
        elevation: 225,
        x: -150,
        z: -120,
        rotation: 270,
        color: '#5c3a21',
        secondaryColor: '#1e293b'
      }
    ]
  },

  full_apartment_4rooms: {
    name: '🏡 شقة سكنية كاملة (4 غرف متجاورة)',
    rooms: [
      {
        id: 'room_living',
        name: 'صالة المعيشة والصالون',
        width: 500, depth: 420, height: 300,
        offsetX: -250, offsetZ: -210,
        floorId: 'oak_parquet', wallId: 'warm_white'
      },
      {
        id: 'room_bedroom1',
        name: 'غرفة النوم الرئيسية',
        width: 440, depth: 420, height: 300,
        offsetX: 220, offsetZ: -210,
        floorId: 'walnut_wood', wallId: 'cream_beige'
      },
      {
        id: 'room_kitchen_dining',
        name: 'المطبخ والسفرة',
        width: 500, depth: 360, height: 300,
        offsetX: -250, offsetZ: 180,
        floorId: 'beige_ceramic', wallId: 'sage_green'
      },
      {
        id: 'room_bath_office',
        name: 'غرفة الأطفال / المكتب والحمام',
        width: 440, depth: 360, height: 300,
        offsetX: 220, offsetZ: 180,
        floorId: 'white_marble', wallId: 'sky_breeze'
      }
    ],
    items: [
      // أثاث صالة المعيشة (غرفة 1: مركزها -250, -210)
      { catalogId: 'sofa_lshape', x: -270, z: -310, rotation: 0, color: '#334155' },
      { catalogId: 'coffee_table', x: -260, z: -195, rotation: 0, color: '#a97142' },
      { catalogId: 'rug_large', x: -260, z: -210, rotation: 0, width: 260, depth: 190, color: '#b45309' },
      { catalogId: 'tv_unit', x: -260, z: -40, rotation: 180, color: '#5c3a21' },
      { catalogId: 'plant_pot', x: -450, z: -360, rotation: 0, color: '#065f46' },
      { catalogId: 'chandelier', x: -250, z: -210, rotation: 0, elevation: 235 },
      { catalogId: 'window_glass', x: -260, z: -415, rotation: 0, elevation: 90 },

      // أبواب وقواطع بين الغرف المتجاورة
      { catalogId: 'archway_open', x: -120, z: 0, rotation: 0 },
      { catalogId: 'door_wood', x: 0, z: -110, rotation: 90 },
      { catalogId: 'door_wood', x: 0, z: 110, rotation: 90 },

      // أثاث غرفة النوم الرئيسية (غرفة 2: مركزها +220, -210)
      { catalogId: 'bed_king', x: 230, z: -300, rotation: 0, color: '#d6ccc2' },
      { catalogId: 'nightstand', x: 105, z: -380, rotation: 0, color: '#5c3a21' },
      { catalogId: 'nightstand', x: 355, z: -380, rotation: 0, color: '#5c3a21' },
      { catalogId: 'wardrobe_large', x: 400, z: -150, rotation: -90, color: '#f8fafc' },
      { catalogId: 'dresser_mirror', x: 180, z: -35, rotation: 180, color: '#f8fafc' },
      { catalogId: 'rug_large', x: 230, z: -210, rotation: 0, width: 220, depth: 160, color: '#1e3a8a' },
      { catalogId: 'window_glass', x: 230, z: -415, rotation: 0, elevation: 90 },

      // أثاث المطبخ والسفرة (غرفة 3: مركزها -250, +180)
      { catalogId: 'kitchen_counter', x: -350, z: 320, rotation: 180, color: '#334155' },
      { catalogId: 'fridge_double', x: -185, z: 315, rotation: 180, color: '#94a3b8' },
      { catalogId: 'dining_set_6', x: -240, z: 120, rotation: 0, color: '#5c3a21' },

      // أثاث غرفة المكتب/الأطفال والحمام (غرفة 4: مركزها +220, +180)
      { catalogId: 'bunk_bed', x: 365, z: 120, rotation: -90, color: '#0284c7' },
      { catalogId: 'office_desk', x: 160, z: 315, rotation: 180, color: '#a97142' },
      { catalogId: 'office_chair', x: 160, z: 245, rotation: 0, color: '#1e293b' },
      { catalogId: 'bookshelf', x: 380, z: 330, rotation: 180, color: '#a97142' }
    ]
  },

  single_living_room: {
    name: '🛋️ غرفة معيشة وصالون مفردة (5.0م × 4.0م)',
    rooms: [
      {
        id: 'room_main',
        name: 'غرفة المعيشة الرئيسية',
        width: 500, depth: 400, height: 300,
        offsetX: 0, offsetZ: 0,
        floorId: 'oak_parquet', wallId: 'warm_white'
      }
    ],
    items: [
      { catalogId: 'sofa_3seat', x: 0, z: -140, rotation: 0, color: '#334155' },
      { catalogId: 'armchair', x: -165, z: -30, rotation: 90, color: '#065f46' },
      { catalogId: 'armchair', x: 165, z: -30, rotation: -90, color: '#065f46' },
      { catalogId: 'coffee_table', x: 0, z: -30, rotation: 0, color: '#a97142' },
      { catalogId: 'rug_large', x: 0, z: -35, rotation: 0, width: 260, depth: 190, color: '#b45309' },
      { catalogId: 'tv_unit', x: 0, z: 170, rotation: 180, color: '#5c3a21' },
      { catalogId: 'plant_pot', x: -200, z: -150, rotation: 0, color: '#065f46' },
      { catalogId: 'floor_lamp', x: 190, z: -150, rotation: 0, color: '#f5ebe0' },
      { catalogId: 'window_glass', x: 0, z: -195, rotation: 0, elevation: 90 },
      { catalogId: 'door_wood', x: -245, z: 110, rotation: 90 }
    ]
  },

  single_bedroom: {
    name: '🛏️ جناح نوم رئيسي مع حمام مجاور (غرفتان)',
    rooms: [
      {
        id: 'room_bed',
        name: 'غرفة النوم الرئيسية',
        width: 460, depth: 400, height: 300,
        offsetX: -120, offsetZ: 0,
        floorId: 'walnut_wood', wallId: 'cream_beige'
      },
      {
        id: 'room_bath',
        name: 'الحمام وغرفة الملابس',
        width: 240, depth: 400, height: 300,
        offsetX: 230, offsetZ: 0,
        floorId: 'aqua_tiles', wallId: 'warm_white'
      }
    ],
    items: [
      { catalogId: 'bed_king', x: -120, z: -90, rotation: 0, color: '#d6ccc2' },
      { catalogId: 'nightstand', x: -245, z: -170, rotation: 0, color: '#5c3a21' },
      { catalogId: 'nightstand', x: 5, z: -170, rotation: 0, color: '#5c3a21' },
      { catalogId: 'wardrobe_large', x: -315, z: 40, rotation: 90, color: '#f8fafc' },
      { catalogId: 'dresser_mirror', x: -120, z: 170, rotation: 180, color: '#f8fafc' },
      { catalogId: 'door_wood', x: 110, z: 90, rotation: 90 },
      { catalogId: 'bathtub', x: 260, z: -150, rotation: 0, color: '#f8fafc' },
      { catalogId: 'vanity_sink', x: 315, z: 10, rotation: -90, color: '#5c3a21' },
      { catalogId: 'toilet_wc', x: 310, z: 145, rotation: -90, color: '#f8fafc' }
    ]
  }
};
