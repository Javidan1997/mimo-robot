export const CONTENT = {
  az: {
    features: [
      {
        icon: "SƏS",
        title: "Səsli ünsiyyət",
        body: "Mimo istifadəçinin niyyətini anlayır və qısa, aydın cavab verir. Məqsəd köməkçi ilə ünsiyyəti daha təbii və daha az yorucu etməkdir.",
      },
      {
        icon: "LED",
        title: "Reaksiya mühərriki",
        body: "Hər cavab eyni anda dörd kanalda gəlir: söz, üz ifadəsi, LED rəngi və hərəkət. Mimo cavab vermir — eyni vaxtda danışır, hiss edir, hərəkət edir və icra edir.",
      },
      {
        icon: "EV",
        title: "Mühit inteqrasiyası",
        body: "Gələcək mərhələlərdə Mimo işıq, temperatur və gündəlik rutinlər kimi ağıllı mühit funksiyalarına qoşula bilər.",
      },
      {
        icon: "İŞ",
        title: "Masaüstü köməkçi",
        body: "Fokus taymeri, xatırlatma, qısa xülasə və gündəlik tapşırıqlar üçün Mimo sadə və sürətli idarə paneli rolunu oynaya bilər.",
      },
      {
        icon: "AI",
        title: "Yaddaş və fərdiləşmə",
        body: "Qısamüddətli əhval, gündəlik tapşırıqlar və uzunmüddətli üstünlüklər ayrı yaddaş qatları kimi saxlanır. Mimo vaxt keçdikcə vərdişlərini öyrənir və xarakteri inkişaf edir.",
      },
      {
        icon: "OK",
        title: "Təhlükəsizlik qatları",
        body: "Sadə reaksiyalar dərhal işləyir, vacib əməliyyatlar təsdiq istəyir, riskli əmrlər isə standart olaraq bloklanır. API açarları yalnız backend-də qalır.",
      },
    ],
    scaleItems: [
      {
        marker: "01",
        title: "Veb prototip",
        body: "İlk mərhələ Mimonun 3D davranışını, səsini, əhval sistemini və istifadəçi reaksiyasını canlı mühitdə yoxlamaq üçündür.",
      },
      {
        marker: "02",
        title: "Modul arxitektura",
        body: "Şəxsiyyət, animasiya, səs, kamera, qısayollar və inteqrasiyalar ayrı qatlar kimi qurulur.",
      },
      {
        marker: "03",
        title: "Çoxkanallı istifadə",
        body: "Eyni xarakter veb, mobil tətbiq, kamera AR, sosial kontent, messencer və fiziki cihaz üzərində işləyə bilər.",
      },
      {
        marker: "04",
        title: "Fiziki məhsula keçid",
        body: "Rəqəmsal prototip funksiyaları prioritetləşdirmək və real masa robotu üçün düzgün məhsul məntiqi qurmaq üçündür.",
      },
    ],
    channels: [
      {
        icon: "IG",
        title: "Instagram",
        body: "Mimo ilə çəkilən kamera AR kontentini story və reel formatında paylaşmaq üçün hazır vizual axın.",
        badge: "Kontent axını",
      },
      {
        icon: "WA",
        title: "WhatsApp",
        body: "Sticker ixracı və paylaşım linkləri ilə Mimonu gündəlik söhbətlərə daşımaq.",
        badge: "Sticker dəstəyi",
      },
      {
        icon: "AR",
        title: "Kamera AR",
        body: "Mimonu masa, əl və ya selfie kadrında göstərərək rəqəmsal xarakteri real görüntüyə yaxınlaşdırmaq.",
        badge: "Canlı prototip",
      },
      {
        icon: "3D",
        title: "3D asset sistemi",
        body: "Model, üz ifadəsi, işıq və mikro-hərəkətləri vahid sistem kimi saxlayıb fərqli platformalara daşımaq.",
        badge: "Genişlənir",
      },
    ],
    roadmap: [
      {
        phase: "İndi",
        title: "Veb və kamera prototipi",
        body: "3D Mimo, əhval sistemi, səsli reaksiya, kliklə hərəkət və native kamera açılışı.",
        state: "live",
      },
      {
        phase: "Növbəti",
        title: "Companion və sosial axınlar",
        body: "Paylaşım axınları, kamera kontenti üçün hazır formatlar və mobil tətbiq istiqaməti.",
        state: "soon",
      },
      {
        phase: "Sonra",
        title: "iOS və Android tətbiqləri",
        body: "Mobil qısayollar, rutinlər, bildirişlər və Mimo ilə davamlı gündəlik əlaqə üçün native tətbiqlər.",
        state: "soon",
      },
      {
        phase: "Gələcək",
        title: "Fiziki masa robotu",
        body: "ESP32-S3 toxunma ekranlı üz, 6 artikulyasiyalı servo, məsafə + toxunuş + hərəkət sensorları, LED halqa və səs. Masa bazasından tam gövdəyə qədər təkmilləşmə yolu ilə.",
        state: "future",
      },
    ],
    stats: [
      { value: "6", label: "Artikulyasiyalı servo" },
      { value: "4", label: "Reaksiya kanalı" },
      { value: "5", label: "Canlı əhval" },
      { value: "3D", label: "Real-time model" },
    ],
    buildArchitecture: [
      {
        marker: "BODY",
        title: "Mimo Body — ESP32-S3",
        body: "Yerli kontroller: toxunma ekranlı üz, servolar, sensorlar, LED və səs. Yalnız kiçik əmrləri icra edir və telemetriya qaytarır — OpenAI və ya ağıllı ev brendlərini tanımır.",
      },
      {
        marker: "BRAIN",
        title: "Mimo Brain — backend",
        body: "Bütün ağır AI burada: düşüncə, şəxsiyyət, emosiya mühərriki, əmr marşrutlaşdırması, yaddaş və təhlükəsizlik. Tövsiyə olunan stack — FastAPI.",
      },
      {
        marker: "APP",
        title: "Mobil companion",
        body: "Səsli pult və idarə tətbiqi: push-to-talk, əhval tənzimləri, rutinlər, ağıllı ev qısayolları və telemetriya. React Native və ya PWA.",
      },
      {
        marker: "DESK",
        title: "Masaüstü köməkçi",
        body: "Developer və kompüter köməkçisi: layihə qısayolları, kodlama rejimi, xatırlatmalar və icazə verilmiş təhlükəsiz masaüstü əməliyyatlar. Tauri və ya Electron.",
      },
      {
        marker: "SKILL",
        title: "Plugin / skill qatı",
        body: "Hər funksiya modul skill kimi qurulur — TV, kondisioner, Home Assistant, taymerlər, kodlama köməkçisi, oyunlar. Monolit yox, genişlənən sistem.",
      },
    ],
    buildHardware: [
      {
        marker: "MCU",
        title: "Kontroller və üz",
        body: "ESP32-S3 2.8\" kapasitiv toxunma ekranı (8MB PSRAM, 16MB flash) üz interfeysini idarə edir və bütün modullarla danışır.",
      },
      {
        marker: "SRV",
        title: "Hərəkət",
        body: "PCA9685 16 kanallı sürücü + 6× MG90S 180° metal dişli servo: boyun, baş və qollar üçün dəqiq mövqe.",
      },
      {
        marker: "SNS",
        title: "Sensorlar",
        body: "VL53L0X məsafə, TTP223 kapasitiv toxunuş və MPU6050 gyro/accel — yaxınlıq və hərəkət reaksiyaları üçün.",
      },
      {
        marker: "I/O",
        title: "İşıq və səs",
        body: "WS2812B LED halqa emosiya işığı üçün, DFPlayer Mini + 3W dinamik səs və danışıq üçün.",
      },
      {
        marker: "PWR",
        title: "Enerji və təhlükəsizlik",
        body: "12V adapter → 5V 10A buck çeviricisi servo şinini qidalandırır. Paylaşılan torpaq; 12V heç vaxt birbaşa servoya verilmir.",
      },
    ],
  },
  en: {
    features: [
      {
        icon: "VOICE",
        title: "Voice interaction",
        body: "Mimo understands user intent and responds with short, clear answers. The goal is a more natural assistant experience with less friction.",
      },
      {
        icon: "LED",
        title: "Reaction engine",
        body: "Every answer lands on four channels at once: speech, expression, LED color, and motion. Mimo doesn't just reply — it answers, feels, moves, and acts together.",
      },
      {
        icon: "HOME",
        title: "Environment integration",
        body: "Future versions can connect Mimo to lighting, temperature, and daily routines in smart spaces.",
      },
      {
        icon: "DESK",
        title: "Desktop helper",
        body: "Mimo can provide a simple command layer for focus timers, reminders, short summaries, and daily tasks.",
      },
      {
        icon: "AI",
        title: "Memory and personalization",
        body: "Short-term mood, daily tasks, and long-term preferences live as separate memory layers. Mimo learns your habits over time, so its character grows instead of resetting.",
      },
      {
        icon: "OK",
        title: "Safety tiers",
        body: "Simple reactions run instantly, important actions ask for confirmation, and risky commands are blocked by default. API keys stay in the backend only.",
      },
    ],
    scaleItems: [
      {
        marker: "01",
        title: "Web prototype",
        body: "The first stage validates Mimo's 3D behavior, voice, mood system, and user response in a live environment.",
      },
      {
        marker: "02",
        title: "Modular architecture",
        body: "Personality, animation, voice, camera, shortcuts, and integrations are built as separate layers.",
      },
      {
        marker: "03",
        title: "Multi-channel use",
        body: "The same character can work across web, mobile apps, camera AR, social content, messengers, and a physical device.",
      },
      {
        marker: "04",
        title: "Hardware transition",
        body: "The digital prototype helps prioritize features and shape the product logic for a real desk robot.",
      },
    ],
    channels: [
      {
        icon: "IG",
        title: "Instagram",
        body: "A camera AR content flow for creating story and reel-ready Mimo visuals.",
        badge: "Content flow",
      },
      {
        icon: "WA",
        title: "WhatsApp",
        body: "Sticker export and share links for bringing Mimo into everyday conversations.",
        badge: "Sticker support",
      },
      {
        icon: "AR",
        title: "Camera AR",
        body: "Place Mimo on a desk, in your hand, or in a selfie frame to blend the character with a live camera view.",
        badge: "Live prototype",
      },
      {
        icon: "3D",
        title: "3D asset system",
        body: "Keep model, expression, light, and micro-motion in one system that can move across platforms.",
        badge: "Expanding",
      },
    ],
    roadmap: [
      {
        phase: "Now",
        title: "Web and camera prototype",
        body: "3D Mimo, mood system, voice reaction, click-to-move, and native camera capture.",
        state: "live",
      },
      {
        phase: "Next",
        title: "Companion and social flows",
        body: "Share flows, ready formats for camera content, and the mobile app direction.",
        state: "soon",
      },
      {
        phase: "Then",
        title: "iOS and Android apps",
        body: "Native apps for mobile shortcuts, routines, notifications, and continuous daily connection with Mimo.",
        state: "soon",
      },
      {
        phase: "Future",
        title: "Physical desk robot",
        body: "An ESP32-S3 touchscreen face, 6 articulated servos, distance + touch + motion sensors, an LED ring, and sound — with an upgrade path from desk base to a full body.",
        state: "future",
      },
    ],
    stats: [
      { value: "6", label: "Articulated servos" },
      { value: "4", label: "Reaction channels" },
      { value: "5", label: "Live moods" },
      { value: "3D", label: "Real-time model" },
    ],
    buildArchitecture: [
      {
        marker: "BODY",
        title: "Mimo Body — ESP32-S3",
        body: "The local controller: touchscreen face, servos, sensors, LED, and sound. It only runs small commands and returns telemetry — it knows nothing about OpenAI or smart-home brands.",
      },
      {
        marker: "BRAIN",
        title: "Mimo Brain — backend",
        body: "All the heavy AI lives here: reasoning, personality, the emotion engine, command routing, memory, and the safety guard. Recommended stack: FastAPI.",
      },
      {
        marker: "APP",
        title: "Mobile companion",
        body: "A voice remote and control app: push-to-talk, mood settings, routines, smart-home shortcuts, and telemetry. React Native or PWA.",
      },
      {
        marker: "DESK",
        title: "Desktop helper",
        body: "A developer and computer helper: project shortcuts, coding mode, reminders, and allow-listed safe desktop actions. Tauri or Electron.",
      },
      {
        marker: "SKILL",
        title: "Plugin / skill layer",
        body: "Every feature is a modular skill — TV, AC, Home Assistant, timers, coding helper, games. A system that grows, not a hardcoded monolith.",
      },
    ],
    buildHardware: [
      {
        marker: "MCU",
        title: "Controller & face",
        body: "An ESP32-S3 2.8\" capacitive touchscreen (8MB PSRAM, 16MB flash) drives the face UI and talks to every module.",
      },
      {
        marker: "SRV",
        title: "Motion",
        body: "A PCA9685 16-channel driver plus 6× MG90S 180° metal-gear servos give precise positioning for neck, head, and arms.",
      },
      {
        marker: "SNS",
        title: "Sensing",
        body: "VL53L0X distance, TTP223 capacitive touch, and an MPU6050 gyro/accel power proximity and motion reactions.",
      },
      {
        marker: "I/O",
        title: "Light & sound",
        body: "A WS2812B LED ring for emotion glow, plus a DFPlayer Mini and 3W speaker for voice and sound.",
      },
      {
        marker: "PWR",
        title: "Power & safety",
        body: "A 12V adapter → 5V 10A buck converter feeds the servo rail. Shared ground, and never 12V straight to the servos.",
      },
    ],
  },
};

export function getContent(language = "az") {
  return CONTENT[language] ?? CONTENT.az;
}
