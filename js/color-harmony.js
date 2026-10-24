/**
 * محرك تناسق وتناغم الألوان الداخلي (Color Harmony & 60-30-10 Rule Engine)
 * يتضمن خوارزميات نظرية الألوان، حساب التناسق والتباين، وتطبيق الباليتات الذكية
 */

(function () {
  'use strict';

  // ==================== دوال تحويل وحساب الألوان الرياضية ====================

  function normalizeHex(hex) {
    if (!hex) return '#ffffff';
    let c = hex.replace('#', '').trim();
    if (c.length === 3) {
      c = c.split('').map(ch => ch + ch).join('');
    }
    return '#' + c.toLowerCase();
  }

  function hexToRgb(hex) {
    const clean = normalizeHex(hex).replace('#', '');
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHex(r, g, b) {
    const toHex = (n) => {
      const v = Math.max(0, Math.min(255, Math.round(n))).toString(16);
      return v.length === 1 ? '0' + v : v;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function hslToRgb(h, s, l) {
    h = (h % 360 + 360) % 360 / 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    if (s === 0) {
      const val = Math.round(l * 255);
      return { r: val, g: val, b: val };
    }

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
    const g = Math.round(hue2rgb(p, q, h) * 255);
    const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

    return { r, g, b };
  }

  function hexToHsl(hex) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHsl(r, g, b);
  }

  function hslToHex(h, s, l) {
    const { r, g, b } = hslToRgb(h, s, l);
    return rgbToHex(r, g, b);
  }

  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function getContrastRatio(hex1, hex2) {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  // ==================== توليد أنماط التناسق اللوني العلمي ====================

  /**
   * توليد عائلات الألوان المتناسقة لقاعدة لونية معينة (Color Harmony Schemes)
   */
  function getHarmoniousSchemes(baseHex) {
    const hsl = hexToHsl(baseHex);
    const h = hsl.h;
    const s = hsl.s;
    const l = hsl.l;

    return {
      // 1. التناسق التكميلي (Complementary): تباين حيوي متقابل بزاوية 180°
      complementary: {
        title: 'تناسق تكميلي (تباين متباين)',
        description: 'يخلق حيوية وجاذبية بصرية بمقابلة اللون مع نقيضه في عجلة الألوان',
        colors: [
          baseHex,
          hslToHex((h + 180) % 360, Math.min(85, s + 10), Math.max(30, l - 5)),
          hslToHex(h, Math.max(15, s - 25), Math.min(92, l + 25)),
          hslToHex((h + 180) % 360, Math.max(20, s - 15), Math.min(88, l + 20))
        ]
      },

      // 2. التناسق المتجاور (Analogous): تناغم هادئ مريح للعين (±30°)
      analogous: {
        title: 'تناسق متجاور (هادئ ومريح)',
        description: 'ألوان متجاورة في العجلة تعطي إحساساً بالسكينة والاتساع الطبيعي',
        colors: [
          hslToHex((h - 30 + 360) % 360, s, Math.min(85, l + 5)),
          baseHex,
          hslToHex((h + 30) % 360, s, Math.max(25, l - 5)),
          hslToHex(h, Math.max(10, s - 30), Math.min(94, l + 28))
        ]
      },

      // 3. التناسق الأحادي التدرج (Monochromatic): درجات متدرجة لنفس اللون
      monochromatic: {
        title: 'تناسق أحادي فندقي (Monochrome)',
        description: 'درجات مختلفة في الإضاءة والتشبع للون نفسه تمنح مظهراً فندقياً راقياً',
        colors: [
          hslToHex(h, Math.min(100, s + 15), Math.max(20, l - 25)),
          baseHex,
          hslToHex(h, Math.max(15, s - 10), Math.min(80, l + 18)),
          hslToHex(h, Math.max(10, s - 35), Math.min(95, l + 35))
        ]
      },

      // 4. التناسق الثلاثي المتوازن (Triadic): توازن متساوي الأبعاد (120° و 240°)
      triadic: {
        title: 'تناسق ثلاثي متوازن (Triadic)',
        description: 'توزيع ثلاثي متوازن يقدم تنوعاً لونياً غنياً دون فوضى بصرية',
        colors: [
          baseHex,
          hslToHex((h + 120) % 360, Math.max(30, s - 5), l),
          hslToHex((h + 240) % 360, Math.max(30, s - 5), l),
          hslToHex(h, Math.max(15, s - 20), Math.min(92, l + 30))
        ]
      }
    };
  }

  /**
   * اقتراح 6 إلى 8 ألوان فورية للقطعة المحددة متناسقة مع الغرفة
   */
  function getContextualSuggestions(itemColor, roomWallColor, roomFloorColor) {
    const suggestions = [];
    const pushUnique = (hex, label) => {
      const clean = normalizeHex(hex);
      if (!suggestions.some(s => s.hex === clean)) {
        suggestions.push({ hex: clean, label });
      }
    };

    const itemHsl = hexToHsl(itemColor);
    const wallHsl = hexToHsl(roomWallColor);
    const floorHsl = hexToHsl(roomFloorColor);

    // 1. لون مكمل للقطعة (Complementary)
    pushUnique(hslToHex((itemHsl.h + 180) % 360, Math.min(80, itemHsl.s), Math.max(35, itemHsl.l)), 'تكميلي متباين');

    // 2. لون متجاور دافئ (Analogous +30)
    pushUnique(hslToHex((itemHsl.h + 30) % 360, itemHsl.s, itemHsl.l), 'متجاور دافئ');

    // 3. لون متجاور هادئ (Analogous -30)
    pushUnique(hslToHex((itemHsl.h - 30 + 360) % 360, itemHsl.s, itemHsl.l), 'متجاور هادئ');

    // 4. درجة أفتح لنفس اللون (Light Tone)
    pushUnique(hslToHex(itemHsl.h, Math.max(15, itemHsl.s - 15), Math.min(92, itemHsl.l + 25)), 'درجة فاتحة');

    // 5. درجة أعمق لنفس اللون (Deep Tone)
    pushUnique(hslToHex(itemHsl.h, Math.min(100, itemHsl.s + 10), Math.max(22, itemHsl.l - 22)), 'درجة داكنة فخمة');

    // 6. لون متناغم مع جدران الغرفة
    pushUnique(hslToHex(wallHsl.h, Math.min(70, wallHsl.s + 20), Math.max(25, wallHsl.l - 35)), 'منسجم مع الحائط');

    // 7. لون متناغم مع أرضية الغرفة
    pushUnique(hslToHex(floorHsl.h, Math.min(75, floorHsl.s + 15), Math.max(30, floorHsl.l - 20)), 'منسجم مع الأرضية');

    // 8. لون حيادي ناعم يهدئ القطعة
    pushUnique('#f8f5f0', 'أوف وايت نيوترال');

    return suggestions.slice(0, 8);
  }

  // ==================== تحليل تناسق الغرفة الحالية وقاعدة 60-30-10 ====================

  /**
   * حساب التوزيع الفعلي لألوان الغرفة ومطابقتها لقاعدة 60-30-10 وحساب مؤشر التناسق
   */
  function analyzeRoomHarmony(room, items = []) {
    // 1. استخراج ألوان الغرفة
    const floorMatData = window.ROOM_MATERIALS.floors.find(f => f.id === room.floorId) || window.ROOM_MATERIALS.floors[0];
    const wallData = window.ROOM_MATERIALS.walls.find(w => w.id === room.wallId) || window.ROOM_MATERIALS.walls[0];

    const wallColor = normalizeHex(room.customWallColor || wallData.color);
    const floorColor = normalizeHex(room.customFloorColor || floorMatData.color);

    // 2. حصر ألوان الأثاث والمفارش والسجاد في الغرفة
    const roomItems = items.filter(g => {
      const d = g.userData.itemData;
      const rx = d.x;
      const rz = d.z;
      const halfW = room.width / 2;
      const halfD = room.depth / 2;
      return (
        rx >= room.offsetX - halfW - 20 &&
        rx <= room.offsetX + halfW + 20 &&
        rz >= room.offsetZ - halfD - 20 &&
        rz <= room.offsetZ + halfD + 20
      );
    });

    const furnitureColors = [];
    const accentColors = [];

    roomItems.forEach(g => {
      const d = g.userData.itemData;
      if (d.color) furnitureColors.push(normalizeHex(d.color));
      if (d.secondaryColor) furnitureColors.push(normalizeHex(d.secondaryColor));
      if (d.beddingColor) accentColors.push(normalizeHex(d.beddingColor));
      if (d.pillowColor) accentColors.push(normalizeHex(d.pillowColor));
    });

    // 3. تحديد الألوان الثلاثة السائدة لقاعدة 60-30-10
    // 60% اللون السائد (الجدران والأرضية)
    const dominantColor = wallColor;

    // 30% اللون الثانوي (الأثاث السائد)
    const secondaryColor = furnitureColors[0] || floorColor;

    // 10% لون التمييز والإكسسوار (المفارش، الوسائد، اللمسات الإضافية)
    const accentColor = accentColors[0] || (furnitureColors[1] ? furnitureColors[1] : hslToHex((hexToHsl(dominantColor).h + 180) % 360, 75, 50));

    // 4. تقييم درجة التناسق اللوني (Harmony Score 0 - 100%)
    let score = 80;
    const tips = [];

    // فحص التباين بين الجدار والأرضية
    const wallFloorContrast = getContrastRatio(wallColor, floorColor);
    if (wallFloorContrast >= 1.3 && wallFloorContrast <= 8) {
      score += 6;
      tips.push('التباين بين دهان الحوائط ولون الأرضية متوازن ويمنح الغرفة عمقاً معمارياً.');
    } else if (wallFloorContrast < 1.2) {
      score -= 5;
      tips.push('لون الحائط ولون الأرضية متقاربان جداً؛ جرّب أرضية أغمق أو أفتح قليلاً لإبراز مساحة الغرفة.');
    }

    // فحص التباين بين الأثاث والأرضية
    const furnFloorContrast = getContrastRatio(secondaryColor, floorColor);
    if (furnFloorContrast >= 1.5) {
      score += 8;
      tips.push('قطع الأثاث تبرز بوضوح وجمال فوق الأرضية دون أن تتطابق أو تضيع فيها.');
    } else {
      score -= 6;
      tips.push('لون الأثاث مقارب جداً للون الأرضية؛ يفضل استخدام سجادة أو تغيير تدرج الأثاث لتحقيق التباين.');
    }

    // فحص لون التمييز الـ 10%
    const accentDominantContrast = getContrastRatio(accentColor, dominantColor);
    if (accentDominantContrast >= 1.8) {
      score += 6;
      tips.push('لون التمييز (المفارش والإكسسوارات) يمنح الغرفة لمسة حيوية فندقية رائعة.');
    }

    // التناغم اللوني العام (زاوية الدوران بين الألوان في عجلة الألوان)
    const domHsl = hexToHsl(dominantColor);
    const secHsl = hexToHsl(secondaryColor);
    const accHsl = hexToHsl(accentColor);

    const diffDomSec = Math.abs(domHsl.h - secHsl.h);
    const isHarmonicHue = diffDomSec < 45 || (diffDomSec > 140 && diffDomSec < 220) || Math.abs(diffDomSec - 120) < 30;

    if (isHarmonicHue || domHsl.s < 15 || secHsl.s < 15) {
      score += 5;
      tips.push('تدرجات ألوان الغرفة تتبع قاعدة التناغم اللوني الهندسي بانسجام عالي.');
    }

    // ضبط النتيجة بين 65% و 98%
    score = Math.max(68, Math.min(98, score));

    let rating = 'تناسق لوني ممتاز';
    let ratingBadgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (score >= 90) {
      rating = 'تناسق فندقي متكامل 🌟';
      ratingBadgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    } else if (score >= 80) {
      rating = 'تناسق ديكوري جيد جداً ✨';
      ratingBadgeClass = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    } else {
      rating = 'متناسق ويحتاج لمسات تباين 🎨';
      ratingBadgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }

    return {
      score,
      rating,
      ratingBadgeClass,
      tips,
      dominant: {
        hex: dominantColor,
        pct: 60,
        label: 'اللون السائد (60%)',
        desc: 'الجدران والأسقف ومساحات الحوائط الرئيسية'
      },
      secondary: {
        hex: secondaryColor,
        pct: 30,
        label: 'اللون الثانوي (30%)',
        desc: 'الكنب، الدواليب، السجاد، والمفروشات الكبرى'
      },
      accent: {
        hex: accentColor,
        pct: 10,
        label: 'لون التمييز (10%)',
        desc: 'المفارش، الوسائد، الأباجورات، ولمسات الديكور'
      }
    };
  }

  // تصدير المحرك إلى النطاق العام للنافذة
  window.ColorHarmonyEngine = {
    normalizeHex,
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToRgb,
    hexToHsl,
    hslToHex,
    getContrastRatio,
    getHarmoniousSchemes,
    getContextualSuggestions,
    analyzeRoomHarmony
  };
})();
