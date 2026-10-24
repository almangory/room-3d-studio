/**
 * كتالوج الأثاث الموسع والمكونات المعمارية ومخططات المنازل الكاملة متعددة الغرف
 * جميع الأبعاد بالسنتيمتر (cm) والنظام يحولها داخلياً إلى المتر (1m = 100cm)
 */

window.ROOM_MATERIALS = {
  floors: [
    // باركيه وأخشاب
    { id: 'oak_parquet', name: 'باركيه بلوط طبيعي', color: '#c89d6c', roughness: 0.4, type: 'parquet' },
    { id: 'walnut_wood', name: 'خشب جوز داكن فخم', color: '#6e472b', roughness: 0.35, type: 'parquet' },
    { id: 'ash_light_wood', name: 'باركيه خشب دردار فاتح', color: '#e2cfb8', roughness: 0.4, type: 'parquet' },
    { id: 'cherry_wood', name: 'باركيه خشب كرز دافئ', color: '#8d493a', roughness: 0.38, type: 'parquet' },
    // رخام وسيراميك
    { id: 'white_marble', name: 'رخام كرارا أبيض', color: '#f1f5f9', roughness: 0.15, type: 'marble' },
    { id: 'black_marble', name: 'رخام أسود ملكي بعروق', color: '#1e293b', roughness: 0.15, type: 'marble' },
    { id: 'beige_ceramic', name: 'سيراميك بيج دافئ', color: '#e6dcc8', roughness: 0.25, type: 'tiles' },
    { id: 'gray_concrete', name: 'بورسلين رمادي عصري', color: '#94a3b8', roughness: 0.5, type: 'tiles' },
    { id: 'kitchen_tiles', name: 'بلاط شطرنجي للمطابخ', color: '#cbd5e1', roughness: 0.3, type: 'checker' },
    { id: 'aqua_tiles', name: 'سيراميك حمامات أكوا', color: '#bae6fd', roughness: 0.2, type: 'tiles' },
    // جميع تدرجات الموكيت السجاد الكامل للغرف (Full Carpet / Moquette Gradients)
    { id: 'soft_carpet', name: 'موكيت بيج رملي ناعم', color: '#d6ccc2', roughness: 0.92, type: 'carpet' },
    { id: 'carpet_ivory', name: 'موكيت أوف وايت / لؤلؤي', color: '#f5f0e6', roughness: 0.92, type: 'carpet' },
    { id: 'carpet_silver_gray', name: 'موكيت رمادي فضي فاتح', color: '#cbd5e1', roughness: 0.92, type: 'carpet' },
    { id: 'carpet_warm_gray', name: 'موكيت رمادي دافئ (غريج)', color: '#9ca3af', roughness: 0.92, type: 'carpet' },
    { id: 'carpet_charcoal', name: 'موكيت رمادي فحمي داكن', color: '#334155', roughness: 0.92, type: 'carpet' },
    { id: 'carpet_camel', name: 'موكيت جملي / كافيه دافئ', color: '#b08968', roughness: 0.92, type: 'carpet' },
    { id: 'carpet_mocha', name: 'موكيت بني موكا فخم', color: '#6c584c', roughness: 0.92, type: 'carpet' },
    { id: 'carpet_navy', name: 'موكيت كحلي فندقي ملكي', color: '#1e3a8a', roughness: 0.92, type: 'carpet' },
    { id: 'carpet_sky', name: 'موكيت أزرق سماوي هادئ', color: '#7dd3fc', roughness: 0.92, type: 'carpet' },
    { id: 'carpet_emerald', name: 'موكيت أخضر زمردي فخم', color: '#065f46', roughness: 0.92, type: 'carpet' },
    { id: 'carpet_sage', name: 'موكيت أخضر ميرمية زيتوني', color: '#84a98c', roughness: 0.92, type: 'carpet' },
    { id: 'carpet_burgundy', name: 'موكيت عنابي / خمري ملكي', color: '#7f1d1d', roughness: 0.92, type: 'carpet' },
    { id: 'carpet_blush_pink', name: 'موكيت وردي بودرة ناعم', color: '#f4acb7', roughness: 0.92, type: 'carpet' },
    { id: 'carpet_lavender', name: 'موكيت لافندر بنفسجي هادئ', color: '#c4b5fd', roughness: 0.92, type: 'carpet' }
  ],
  walls: [
    { id: 'warm_white', name: 'أبيض دافئ (أوف وايت)', color: '#f8fafc' },
    { id: 'cream_beige', name: 'كريمي هادئ', color: '#f5ebe0' },
    { id: 'sage_green', name: 'أخضر ميرمية عصري', color: '#cbd5c0' },
    { id: 'sky_breeze', name: 'أزرق سماوي هادئ', color: '#dbeafe' },
    { id: 'slate_gray', name: 'رمادي فحمي أنيق', color: '#cbd5e1' },
    { id: 'terracotta', name: 'بيج رملي دافئ', color: '#e3d5ca' },
    { id: 'lavender_soft', name: 'لافندر ناعم', color: '#ede9fe' },
    { id: 'blush_rose', name: 'وردي باستيل دافئ', color: '#fce7f3' },
    { id: 'pale_olive', name: 'زيتوني فاتح', color: '#ecfccb' },
    { id: 'navy_accent', name: 'كحلي عصري عميق', color: '#1e293b' }
  ],
  furnitureColors: [
    // تدرجات الأبيض والبيج والرمادي
    { name: 'أبيض ناصع', hex: '#f8fafc' },
    { name: 'أوف وايت كريمي', hex: '#f5ebe0' },
    { name: 'بيج كتان فاتح', hex: '#e6ccb2' },
    { name: 'بيج رملي', hex: '#d6ccc2' },
    { name: 'غريج دافئ', hex: '#a8a29e' },
    { name: 'رمادي فضي فاتح', hex: '#cbd5e1' },
    { name: 'رمادي متوسط', hex: '#64748b' },
    { name: 'رمادي عصري داكن', hex: '#475569' },
    { name: 'رمادي أنثراسيت', hex: '#334155' },
    { name: 'أسود مطفي فخم', hex: '#1e293b' },
    // تدرجات الأخشاب والجلود والبني
    { name: 'خشب صنوبر فاتح', hex: '#deb887' },
    { name: 'خشب بلوط طبيعي', hex: '#a97142' },
    { name: 'خشب عسلي دافئ', hex: '#c87d55' },
    { name: 'جملي جلد طبيعي', hex: '#b45309' },
    { name: 'بني كاكاو', hex: '#7f5539' },
    { name: 'خشب جوز داكن', hex: '#5c3a21' },
    { name: 'خشب إسبريسو محروق', hex: '#3b2314' },
    // تدرجات الأزرق والتركواز
    { name: 'أزرق ثلجي فاتح', hex: '#bae6fd' },
    { name: 'أزرق سماوي', hex: '#38bdf8' },
    { name: 'أزرق بترولي', hex: '#0284c7' },
    { name: 'كحلي ملكي', hex: '#1e3a8a' },
    { name: 'كحلي ليلي عميق', hex: '#172554' },
    { name: 'تركواز بحري', hex: '#0f766e' },
    // تدرجات الأخضر والزيتوني
    { name: 'أخضر نعناعي فاتح', hex: '#a7f3d0' },
    { name: 'أخضر ميرمية هادئ', hex: '#84a98c' },
    { name: 'أخضر زيتوني', hex: '#4d7c0f' },
    { name: 'أخضر زمردي ملكي', hex: '#065f46' },
    { name: 'أخضر غابات داكن', hex: '#14532d' },
    // تدرجات الأصفر والبرتقالي والأحمر والوردي والبنفسجي
    { name: 'أصفر خردلي (مسطردة)', hex: '#eab308' },
    { name: 'ذهبي معدني', hex: '#d97706' },
    { name: 'برتقالي تيراكوتا', hex: '#ea580c' },
    { name: 'مرجاني دافئ', hex: '#f43f5e' },
    { name: 'وردي بودرة ناعم', hex: '#f472b6' },
    { name: 'وردي كشمير فخم', hex: '#be185d' },
    { name: 'عنابي خمري ملكي', hex: '#7f1d1d' },
    { name: 'لافندر بنفسجي فاتح', hex: '#a78bfa' },
    { name: 'بنفسجي ملكي عميق', hex: '#581c87' }
  ],
  beddingColors: [
    { name: 'أبيض فندقي ناصع', hex: '#ffffff' },
    { name: 'أوف وايت حريري', hex: '#f8f5f0' },
    { name: 'بيج كتان دافئ', hex: '#e3d5ca' },
    { name: 'كافيه لاتيه', hex: '#b08968' },
    { name: 'رمادي لؤلؤي فاتح', hex: '#e2e8f0' },
    { name: 'رمادي فحمي مودرن', hex: '#475569' },
    { name: 'أزرق سماوي هادئ', hex: '#bae6fd' },
    { name: 'أزرق ملكي كحلي', hex: '#1e3a8a' },
    { name: 'تركواز بترولي', hex: '#0f766e' },
    { name: 'أخضر ميرمية ناعم', hex: '#a3b18a' },
    { name: 'أخضر زمردي فخم', hex: '#065f46' },
    { name: 'وردي كشمير هادئ', hex: '#f4acb7' },
    { name: 'توتي / عنابي دافئ', hex: '#9d174d' },
    { name: 'أصفر خردلي عصري', hex: '#eab308' },
    { name: 'لافندر مريح للعين', hex: '#ddd6fe' },
    { name: 'مشمشي / تيراكوتا', hex: '#fdba74' }
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
    id: 'tv_wall_55', name: 'تلفزيون حائط ذكي 55 بوصة (4K)', category: 'living', categories: ['living', 'bedroom'],
    width: 123, depth: 7, height: 71, elevation: 115,
    color: '#0f172a', secondaryColor: '#38bdf8', icon: '📺',
    tvSize: 55, tvAmbilight: '#38bdf8'
  },
  {
    id: 'tv_wall_65', name: 'تلفزيون حائط ذكي 65 بوصة (QLED)', category: 'living', categories: ['living', 'bedroom'],
    width: 145, depth: 7, height: 83, elevation: 110,
    color: '#0f172a', secondaryColor: '#38bdf8', icon: '📺',
    tvSize: 65, tvAmbilight: '#38bdf8'
  },
  {
    id: 'tv_wall_75', name: 'تلفزيون حائط سينمائي 75 بوصة (8K)', category: 'living', categories: ['living'],
    width: 168, depth: 8, height: 96, elevation: 105,
    color: '#0f172a', secondaryColor: '#38bdf8', icon: '📺',
    tvSize: 75, tvAmbilight: '#38bdf8'
  },
  {
    id: 'tv_wall_85', name: 'شاشة حائط عملاقة 85 بوصة (Cinema)', category: 'living', categories: ['living'],
    width: 190, depth: 8, height: 108, elevation: 100,
    color: '#0f172a', secondaryColor: '#38bdf8', icon: '📺',
    tvSize: 85, tvAmbilight: '#38bdf8'
  },
  {
    id: 'tv_frame_art', name: 'شاشة حائط The Frame 65" (إطار فني)', category: 'decor', categories: ['decor', 'living', 'bedroom'],
    width: 145, depth: 5, height: 84, elevation: 110,
    color: '#c89d6c', secondaryColor: '#1e293b', icon: '🖼️',
    tvSize: 65, tvAmbilight: '#ffe4c4'
  },
  {
    id: 'ac_split', name: 'مكيف حائط فريون سبليت 24 ألف وحدة', category: 'living', categories: ['living', 'bedroom', 'arch'],
    width: 105, depth: 25, height: 32, elevation: 230,
    color: '#f8fafc', secondaryColor: '#38bdf8', icon: '❄️',
    acTemp: 18, acMode: 'cool'
  },
  {
    id: 'ac_split_small', name: 'مكيف حائط فريون سبليت 18 ألف وحدة', category: 'bedroom', categories: ['bedroom', 'living', 'arch'],
    width: 88, depth: 23, height: 29, elevation: 230,
    color: '#f8fafc', secondaryColor: '#38bdf8', icon: '❄️',
    acTemp: 20, acMode: 'cool'
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

  // ================= المعمارية والأبواب والنوافذ (Architecture) =================
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

  // ================= الستائر وإكسسوارات النوافذ (Curtains & Window Treatments) =================
  {
    id: 'curtain_drape', name: 'ستارة قماشية ويفي طويلة للنوافذ', category: 'decor',
    width: 170, depth: 18, height: 245, elevation: 15,
    color: '#1e3a8a', secondaryColor: '#d97706', icon: '🎐'
  },
  {
    id: 'curtain_sheer_double', name: 'ستارة فندقية مزدوجة (شيفون + بلاك أوت)', category: 'decor',
    width: 200, depth: 22, height: 250, elevation: 15,
    color: '#334155', secondaryColor: '#f8fafc', icon: '🪟'
  },
  {
    id: 'curtain_roller_blinds', name: 'ستارة رول شرائح عصرية (Zebra Blinds)', category: 'decor',
    width: 155, depth: 12, height: 145, elevation: 85,
    color: '#e2e8f0', secondaryColor: '#475569', icon: '📜'
  },
  {
    id: 'curtain_roman', name: 'ستارة رومانية مطوية أنيقة للنافذة', category: 'decor',
    width: 150, depth: 14, height: 150, elevation: 85,
    color: '#d6ccc2', secondaryColor: '#a97142', icon: '🎗️'
  },

  // ================= أشجار ونباتات الزينة الطبيعية (Ornamental Trees & Plants) =================
  {
    id: 'plant_pot', name: 'شجرة فيكس / مونستيرا كبيرة بأصيص', category: 'decor',
    width: 60, depth: 60, height: 145, elevation: 0,
    color: '#065f46', secondaryColor: '#f8fafc', icon: '🪴'
  },
  {
    id: 'plant_palm_tall', name: 'شجرة نخيل أريكا استوائية طويلة للركن', category: 'decor',
    width: 75, depth: 75, height: 185, elevation: 0,
    color: '#15803d', secondaryColor: '#d6ccc2', icon: '🌴'
  },
  {
    id: 'plant_olive_tree', name: 'شجرة زيتون ديكورية بأصيص حجري', category: 'decor',
    width: 65, depth: 65, height: 165, elevation: 0,
    color: '#3f6212', secondaryColor: '#e2e8f0', icon: '🌳'
  },
  {
    id: 'plant_hanging_ivy', name: 'نبتة زينة متسلقة متدلية للحائط', category: 'decor',
    width: 45, depth: 30, height: 85, elevation: 140,
    color: '#166534', secondaryColor: '#a97142', icon: '🌿'
  },
  {
    id: 'flower_vase_table', name: 'فازة ورد طبيعي فاخرة للطاولات', category: 'decor',
    width: 32, depth: 32, height: 52, elevation: 45,
    color: '#be185d', secondaryColor: '#f8fafc', icon: '💐'
  },
  {
    id: 'plant_succulent_set', name: 'طقم صباريات ونباتات طاولة صغيرة', category: 'decor',
    width: 42, depth: 22, height: 26, elevation: 55,
    color: '#0f766e', secondaryColor: '#f5ebe0', icon: '🌵'
  },

  // ================= الأباجورات والنجف ووحدات الإضاءة (Lamps & Lighting) =================
  {
    id: 'floor_lamp', name: 'أباجورة أرضية كلاسيكية طويلة', category: 'decor',
    width: 45, depth: 45, height: 165, elevation: 0,
    color: '#fef3c7', secondaryColor: '#d97706', icon: '💡'
  },
  {
    id: 'floor_lamp_arc', name: 'أباجورة أرضية مقوسة مودرن (Arc Lamp)', category: 'decor',
    width: 85, depth: 45, height: 195, elevation: 0,
    color: '#fef3c7', secondaryColor: '#d97706', icon: '🏮'
  },
  {
    id: 'table_lamp_luxury', name: 'أباجورة طاولة وكومودينو فندقية', category: 'decor',
    width: 34, depth: 34, height: 55, elevation: 55,
    color: '#fef3c7', secondaryColor: '#d97706', icon: '🛋️'
  },
  {
    id: 'wall_sconce_light', name: 'أبليك جداري مضيء مزدوج', category: 'decor',
    width: 24, depth: 16, height: 48, elevation: 155,
    color: '#fef3c7', secondaryColor: '#d97706', icon: '🕯️'
  },
  {
    id: 'chandelier', name: 'نجفة سقف كريستال مودرن', category: 'decor',
    width: 80, depth: 80, height: 60, elevation: 230,
    color: '#f59e0b', secondaryColor: '#fef3c7', icon: '✨'
  },

  // ================= أدوات الزينة وإكسسوارات الغرف (Room Accessories & Decor) =================
  {
    id: 'mirror_standing_arch', name: 'مرآة أرضية طويلة مقوسة بإطار ذهبي', category: 'decor',
    width: 75, depth: 12, height: 185, elevation: 0,
    color: '#d97706', secondaryColor: '#7dd3fc', icon: '🪞'
  },
  {
    id: 'wall_clock_modern', name: 'ساعة حائط ديكورية كبيرة عقارب ذهبية', category: 'decor',
    width: 65, depth: 8, height: 65, elevation: 170,
    color: '#1e293b', secondaryColor: '#d97706', icon: '🕰️'
  },
  {
    id: 'wall_art', name: 'لوحة جدارية فنية محتشمة', category: 'decor',
    width: 110, depth: 6, height: 75, elevation: 135,
    color: '#0f766e', secondaryColor: '#d97706', icon: '🖼️'
  },
  {
    id: 'wall_art_triptych', name: 'طقم 3 لوحات جدارية متناسقة مودرن', category: 'decor',
    width: 155, depth: 6, height: 75, elevation: 135,
    color: '#1e3a8a', secondaryColor: '#d97706', icon: '🎨'
  },
  {
    id: 'floating_shelf_decor', name: 'رف حائط عائم مع تحف وكتب ديكورية', category: 'decor',
    width: 110, depth: 24, height: 35, elevation: 140,
    color: '#a97142', secondaryColor: '#0f766e', icon: '🏺'
  },
  {
    id: 'decor_tray_candles', name: 'صينية عطور وشموع ومبخرة للطاولة', category: 'decor',
    width: 42, depth: 28, height: 22, elevation: 45,
    color: '#d97706', secondaryColor: '#f8fafc', icon: '🕯️'
  },
  {
    id: 'coat_stand_wood', name: 'شماعة ملابس وحقائب خشبية قائمة', category: 'decor',
    width: 45, depth: 45, height: 178, elevation: 0,
    color: '#5c3a21', secondaryColor: '#d97706', icon: '🧥'
  },
  {
    id: 'laundry_basket_woven', name: 'سلة تنظيم وغسيل خوص منسوجة بغطاء', category: 'decor',
    width: 46, depth: 46, height: 62, elevation: 0,
    color: '#d6ccc2', secondaryColor: '#a97142', icon: '🧺'
  },
  {
    id: 'rug_large', name: 'سجادة أرضية مستطيلة منقوشة', category: 'decor',
    width: 240, depth: 170, height: 2, elevation: 0,
    color: '#991b1b', secondaryColor: '#f5ebe0', rugShape: 'rect', rugPattern: 'persian', icon: '🧶'
  },
  {
    id: 'rug_round_boho', name: 'سجادة دائرية بوهيمية ناعمة للغرف', category: 'decor',
    width: 160, depth: 160, height: 2, elevation: 0,
    color: '#d6ccc2', secondaryColor: '#b45309', rugShape: 'round', rugPattern: 'berber', icon: '⭕'
  },
  {
    id: 'rug_oval_luxury', name: 'سجادة بيضاوية فاخرة للصالات وغرف النوم', category: 'decor',
    width: 220, depth: 150, height: 2, elevation: 0,
    color: '#1e3a8a', secondaryColor: '#eab308', rugShape: 'oval', rugPattern: 'persian', icon: '🥚'
  },
  {
    id: 'rug_runner_corridor', name: 'سجادة مشاية طويلة للممرات وجانب السرير', category: 'decor',
    width: 85, depth: 240, height: 2, elevation: 0,
    color: '#065f46', secondaryColor: '#f5ebe0', rugShape: 'runner', rugPattern: 'geometric', icon: '🛤️'
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

// ==================== باليتات التناسق اللوني العالمية وقاعدة 60-30-10 ====================
window.HARMONY_PALETTES = [
  {
    id: 'japandi_warm',
    name: '🍂 ياباندي وبيج دافئ (Japandi Warmth)',
    category: 'هادئ وعصري',
    description: 'مزيج البساطة اليابانية والراحة الإسكندنافية بتدرجات البيج والكتان وأخشاب البلوط الطبيعية.',
    dominant: { wallId: 'cream_beige', floorId: 'oak_parquet', hex: '#f5ebe0', label: '60% دهان كريمي وأرضية بلوط' },
    secondary: { furnitureColor: '#d6ccc2', woodTone: '#a97142', rugPrimary: '#e6ccb2', rugAccent: '#7f5539', rugPattern: 'berber', label: '30% كنب وسجاد بيج' },
    accent: { beddingColor: '#ffffff', pillowColor: '#b08968', curtainColor: '#e3d5ca', decorColor: '#5c3a21', label: '10% مفرش أبيض ولمسات كاكاو' },
    colors: ['#f5ebe0', '#c89d6c', '#d6ccc2', '#7f5539']
  },
  {
    id: 'nordic_sage',
    name: '🌿 إسكندنافي وميرمية هادئة (Nordic Sage)',
    category: 'طبيعي ومنعش',
    description: 'تناغم الأخضر الميرمية والرمادي الفاتح مع خشب الدردار يمنح رحابة وانتعاشاً طبيعياً.',
    dominant: { wallId: 'sage_green', floorId: 'ash_light_wood', hex: '#cbd5c0', label: '60% دهان ميرمية ودردار فاتح' },
    secondary: { furnitureColor: '#84a98c', woodTone: '#a97142', rugPrimary: '#f5ebe0', rugAccent: '#84a98c', rugPattern: 'geometric', label: '30% أثاث وسجاد زيتي وميرمية' },
    accent: { beddingColor: '#ffffff', pillowColor: '#a3b18a', curtainColor: '#cbd5c0', decorColor: '#065f46', label: '10% وسائد خضراء ولمسات زمردية' },
    colors: ['#cbd5c0', '#e2cfb8', '#84a98c', '#065f46']
  },
  {
    id: 'royal_navy_gold',
    name: '👑 فندقي كحلي وذهبي (Royal Navy & Gold)',
    category: 'فندقي فاخر',
    description: 'فخامة ملكية متوازنة بين الأزرق الكحلي العميق واللمسات الذهبية مع رخام كرارا الأبيض.',
    dominant: { wallId: 'warm_white', floorId: 'white_marble', hex: '#f8fafc', label: '60% حوائط بيضاء ورخام كرارا' },
    secondary: { furnitureColor: '#1e3a8a', woodTone: '#d97706', rugPrimary: '#1e3a8a', rugAccent: '#d97706', rugPattern: 'border', label: '30% كنب وسجاد كحلي ملكي' },
    accent: { beddingColor: '#f8f5f0', pillowColor: '#d97706', curtainColor: '#1e293b', decorColor: '#eab308', label: '10% وسائد ذهبية ولمسات معدنية' },
    colors: ['#f8fafc', '#1e3a8a', '#d97706', '#f1f5f9']
  },
  {
    id: 'boho_terracotta',
    name: '🏺 بوهيمي ترابي وتيراكوتا (Boho Earth)',
    category: 'دافئ وترابي',
    description: 'طاقة دافئة مستوحاة من الطين الفخاري (تيراكوتا) والخردل الدافئ مع موكيت الكراميل.',
    dominant: { wallId: 'terracotta', floorId: 'carpet_camel', hex: '#e3d5ca', label: '60% جدران رملية وموكيت كراميل' },
    secondary: { furnitureColor: '#ea580c', woodTone: '#6e472b', rugPrimary: '#f5ebe0', rugAccent: '#ea580c', rugPattern: 'berber', label: '30% كنب وسجاد بوهيمي برتقالي' },
    accent: { beddingColor: '#fdba74', pillowColor: '#eab308', curtainColor: '#e3d5ca', decorColor: '#7f5539', label: '10% وسائد خردلية ولمسات فخار' },
    colors: ['#e3d5ca', '#b08968', '#ea580c', '#eab308']
  },
  {
    id: 'modern_industrial',
    name: '🏙️ مودرن صناعي وفحم داكن (Modern Industrial)',
    category: 'عصري جريء',
    description: 'طابع لوفت نيويوركي مع الفحم الداكن وجلود الكراميل وخشب الجوز الصلب.',
    dominant: { wallId: 'slate_gray', floorId: 'walnut_wood', hex: '#cbd5e1', label: '60% دهان رمادي وباركيه جوز' },
    secondary: { furnitureColor: '#334155', woodTone: '#5c3a21', rugPrimary: '#334155', rugAccent: '#cbd5e1', rugPattern: 'geometric', label: '30% كنب رمادي أنثراسيت وسجاد مودرن' },
    accent: { beddingColor: '#ffffff', pillowColor: '#b45309', curtainColor: '#475569', decorColor: '#1e293b', label: '10% وسائد جلد جملي ولمسات سوداء' },
    colors: ['#cbd5e1', '#334155', '#6e472b', '#b45309']
  },
  {
    id: 'emerald_cream_luxury',
    name: '💎 زمردي ملكي وكريمي (Emerald & Cream)',
    category: 'فندقي فاخر',
    description: 'أناقة كلاسيكية معاصرة تمزج الأخضر الزمردي المخملي مع رخام أسود ولمسات كريمية ناعمة.',
    dominant: { wallId: 'cream_beige', floorId: 'black_marble', hex: '#f5ebe0', label: '60% حوائط كريمية ورخام أسود' },
    secondary: { furnitureColor: '#065f46', woodTone: '#3b2314', rugPrimary: '#065f46', rugAccent: '#f5ebe0', rugPattern: 'persian', label: '30% كنب وسجاد زمردي فارسي' },
    accent: { beddingColor: '#f8f5f0', pillowColor: '#065f46', curtainColor: '#065f46', decorColor: '#d97706', label: '10% وسائد حريرية ولمسات نحاسية' },
    colors: ['#f5ebe0', '#1e293b', '#065f46', '#d97706']
  },
  {
    id: 'cozy_mocha_latte',
    name: '☕ قهوة وموكا دافئة (Mocha & Latte)',
    category: 'كلاسيك دافئ',
    description: 'أجواء استرخاء عائلية بنكهة الموكا واللاتيه والكافيه الدافئ مع موكيت الشوكولاتة المريح.',
    dominant: { wallId: 'cream_beige', floorId: 'carpet_mocha', hex: '#f5ebe0', label: '60% دهان كريمي وموكيت موكا' },
    secondary: { furnitureColor: '#7f5539', woodTone: '#5c3a21', rugPrimary: '#b08968', rugAccent: '#f5ebe0', rugPattern: 'border', label: '30% أثاث كاكاو وسجاد كافيه' },
    accent: { beddingColor: '#e3d5ca', pillowColor: '#6c584c', curtainColor: '#b08968', decorColor: '#deb887', label: '10% مفارش بيج ولمسات صنوبر' },
    colors: ['#f5ebe0', '#6c584c', '#7f5539', '#e3d5ca']
  },
  {
    id: 'pastel_serenity',
    name: '🌸 باستيل هادئ ولافندر (Pastel Serenity)',
    category: 'باستيل مريح',
    description: 'سكينة بصرية مريحة للأعصاب لغرف النوم مع اللافندر الناعم والوردي البودري والأوف وايت.',
    dominant: { wallId: 'lavender_soft', floorId: 'carpet_ivory', hex: '#ede9fe', label: '60% دهان لافندر وموكيت لؤلؤي' },
    secondary: { furnitureColor: '#a78bfa', woodTone: '#e2cfb8', rugPrimary: '#f5f0e6', rugAccent: '#a78bfa', rugPattern: 'striped', label: '30% أثاث وسجاد لافندر مخطط' },
    accent: { beddingColor: '#ddd6fe', pillowColor: '#f472b6', curtainColor: '#ede9fe', decorColor: '#c4b5fd', label: '10% وسائد كشمير وردية ناعمة' },
    colors: ['#ede9fe', '#f5f0e6', '#a78bfa', '#f472b6']
  },
  {
    id: 'modern_monochrome',
    name: '♟️ مونوكروم أبيض وأسود (Modern Monochrome)',
    category: 'عصري جريء',
    description: 'تباين درامي قوي ونقي بين الأبيض الناصع والأسود المطفي مع أرضيات الشطرنج أو الرخام.',
    dominant: { wallId: 'warm_white', floorId: 'kitchen_tiles', hex: '#f8fafc', label: '60% جدران ناصعة وبلاط شطرنج' },
    secondary: { furnitureColor: '#1e293b', woodTone: '#334155', rugPrimary: '#1e293b', rugAccent: '#f8fafc', rugPattern: 'striped', label: '30% أثاث أسود وسجاد مقلم' },
    accent: { beddingColor: '#ffffff', pillowColor: '#475569', curtainColor: '#334155', decorColor: '#64748b', label: '10% مفارش ناصعة ووسائد فحمية' },
    colors: ['#f8fafc', '#1e293b', '#cbd5e1', '#ffffff']
  },
  {
    id: 'coastal_breeze',
    name: '🌊 نسيم ساحلي وبحري (Coastal Breeze)',
    category: 'طبيعي ومنعش',
    description: 'شعور بالانتعاش والهدوء مستوحى من مياه البحر المتوسط والأخشاب الفاتحة ورمال الشاطئ.',
    dominant: { wallId: 'sky_breeze', floorId: 'ash_light_wood', hex: '#dbeafe', label: '60% حوائط سماوية وخشب فاتح' },
    secondary: { furnitureColor: '#0284c7', woodTone: '#deb887', rugPrimary: '#bae6fd', rugAccent: '#0284c7', rugPattern: 'geometric', label: '30% كنب بترولي وسجاد سماوي' },
    accent: { beddingColor: '#ffffff', pillowColor: '#38bdf8', curtainColor: '#dbeafe', decorColor: '#0f766e', label: '10% وسائد زرقاء ولمسات تركواز' },
    colors: ['#dbeafe', '#e2cfb8', '#0284c7', '#38bdf8']
  }
];
