"use strict";
/* GÖLGEN PEŞİNDE / CHASED BY YOUR SHADOW — Web (YouTube Playables) port
   Ported 1:1 from golge_sonsuz.py (desktop pygame version). Same rules, same visuals, same sounds. */

// ============================ SABİTLER ============================
const W = 800, H = 1325;
const FPS = 60;
const DELAY = 150;
const BALL_R = 20, ECHO_R = 14, TARGET_R = 44;
const SPEED = 5.3;
const DASH_DIST = 150, DASH_COOLDOWN = FPS * 3;

// Dikey (mobil-öncelikli) pencere: arena ortada, HUD üst+alt bantlarda.
// Playables ağırlıklı mobil dikeyde oynanıyor - PC/genişte bu pillarbox olur (ekosistemde normal).
const VIEW_W = 600;
const VIEW_H = Math.round(VIEW_W * H / W);
const BAND_TOP = 130, BAND_BOT = 150;
const ARENA_X = 0;
const WIN_W = VIEW_W, WIN_H = BAND_TOP + VIEW_H + BAND_BOT;
const SX = VIEW_W / W, SY = VIEW_H / H;

function mx(x) { return ARENA_X + x * SX; }
function my(y) { return BAND_TOP + y * SY; }
function ms(r) { return r * SX * 1.15; }

// NASIL OYNANIR gösterimi: kendi ayrı üst bandı var (gerçek HUD bandıyla karışmaz, arenanın ÜSTÜNE binmez)
const DEMO_TOP = 230;
const DEMO_ARENA_H = WIN_H - DEMO_TOP - BAND_BOT;
const DEMO_SY = DEMO_ARENA_H / H;
function dmy(y) { return DEMO_TOP + y * DEMO_SY; }
function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
function segDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const L = dx * dx + dy * dy;
  const t = L === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / L));
  return dist(px, py, x1 + dx * t, y1 + dy * t);
}

// ---- METİNLER (TR / EN) ----
const CH_NAME = {
  TR: ["PİŞMANLIK", "KAYGI", "KORKU", "ÖFKE", "ALIŞKANLIK",
       "TAKINTI", "YÜZLEŞME", "KABULLENİŞ", "AFFEDİŞ", "ÖZGÜRLÜK"],
  EN: ["REGRET", "ANXIETY", "FEAR", "ANGER", "HABIT",
       "OBSESSION", "FACING IT", "ACCEPTANCE", "FORGIVENESS", "FREEDOM"],
};
const CH_RULE = {
  TR: ["Gölgen 2.5 sn geride - ısın", "gölgenin gecikmesi DALGALANIR!",
       "görüş daralır - dikkatli ol", "iz KIZIL ve daha uzun!",
       "arena hep aynı - yolu ezberle", "+1 ekstra gölge peşinde",
       "gölge tam görünür halde", "iz kısalır - yük hafifler",
       "her dalga KALKANLA başlarsın", "daha hızlı, daha az engel - KAÇ!"],
  EN: ["your shadow trails 2.5s - warm up", "the shadow's delay FLUCTUATES!",
       "vision narrows - stay sharp", "the trail is CRIMSON and longer!",
       "same arena every wave - memorize it", "+1 extra shadow chasing you",
       "the shadow is fully visible", "shorter trail - lighter burden",
       "you start each wave WITH A SHIELD", "faster, fewer obstacles - RUN!"],
};
const CH_DONE = {
  TR: ["PİŞMANLIKLARINDAN KURTULDUN", "KAYGILARINDAN KURTULDUN", "KORKULARINDAN KURTULDUN",
       "ÖFKENDEN KURTULDUN", "ALIŞKANLIKLARINDAN KURTULDUN", "TAKINTILARINDAN KURTULDUN",
       "YÜZLEŞMEYİ BAŞARDIN", "KABULLENMEYİ BAŞARDIN", "AFFETMEYİ BAŞARDIN", "ÖZGÜRLÜĞÜNE KAVUŞTUN"],
  EN: ["FREED FROM YOUR REGRETS", "FREED FROM YOUR ANXIETY", "FREED FROM YOUR FEARS",
       "FREED FROM YOUR ANGER", "FREED FROM YOUR HABITS", "FREED FROM YOUR OBSESSIONS",
       "YOU DARED TO FACE IT", "YOU LEARNED TO ACCEPT", "YOU LEARNED TO FORGIVE", "YOU REACHED FREEDOM"],
};
const CH_QUOTE = {
  TR: ["Geçmişi değiştiremezsin, ama|geleceğini şekillendirebilirsin.",
       "Bugüne odaklanmak, yarının|en güçlü hazırlığıdır.",
       "Cesaret, korkunun olmadığı yerde|değil; ona rağmen atılan adımdadır.",
       "Güç, tepki vermekte değil;|seçim yapabilmektedir.",
       "Küçük değişimler, büyük|dönüşümlerin başlangıcıdır.",
       "Her düşünceye inanmak|zorunda değilsin.",
       "Yüzleşmek, değişimin|kapısını aralar.",
       "Kabullenmek, vazgeçmek değil;|bulunduğun yerden güç almaktır.",
       "Affetmek, yüklerini|hafifletmeyi seçmektir.",
       "Gerçek özgürlük, kendin|olabildiğin yerde başlar."],
  EN: ["You cannot change the past, but|you can shape your future.",
       "Focusing on today is the strongest|preparation for tomorrow.",
       "Courage is not the absence of fear;|it is the step taken despite it.",
       "Strength is not in reacting;|it is in being able to choose.",
       "Small changes are the beginning|of great transformations.",
       "You do not have to believe|every thought you have.",
       "Facing it opens|the door to change.",
       "Acceptance is not giving up;|it is drawing strength from where you stand.",
       "To forgive is to choose|to lighten your burdens.",
       "True freedom begins where|you can be yourself."],
};
const TUT = {
  TR: [["BU SENSİN", "Bu Top Sensin"], ["GÖLGEN", "Gölgen Senin PEŞİNDE!"],
       ["ÖLÜMCÜL İZ", "Kısa süre YASAKTIR"], ["KALKAN", "bir vuruşu emer"],
       ["DONMA", "dünyayı 3 sn dondurur"], ["HIZLAN", "5 sn çok hızlanırsın"],
       ["KARADELİK", "seni çeker - UZAK DUR!"], ["GEÇİT AÇILDI", "İÇİNE GİR"],
       ["HEDEF: GEÇİT", "bu halkaya ULAŞ"]],
  EN: [["THIS IS YOU", "move with arrows/mouse"], ["YOUR SHADOW", "it HUNTS you!"],
       ["DEADLY TRAIL", "forbidden briefly"], ["SHIELD", "absorbs one hit"],
       ["FREEZE", "freezes the world"], ["SPEED", "much faster"],
       ["BLACK HOLE", "STAY AWAY!"], ["GATE IS OPEN", "GO INSIDE"],
       ["GOAL: THE GATE", "REACH this ring"]],
};
const GUIDE_TITLE = { TR: "NASIL OYNANIR", EN: "HOW TO PLAY" };
const GUIDE = {
  TR: [
    ["BU SENSİN", "ok tuşları / WASD / fare ile hareket et"],
    ["GÖLGEN", "2.5 sn önceki halin - ASLA dokunma"],
    ["ÖLÜMCÜL İZ", "gölgenin turuncu izi kısa süre yasak"],
    ["KALKAN", "turkuaz küre - bir vuruşu emer, seni kurtarır"],
    ["DONMA", "buz mavisi küre - dünyayı 3 sn dondurur"],
    ["HIZLAN", "sarı küre - 5 sn çok hızlanırsın"],
    ["KARADELİK", "mor girdap - UZAK DUR, seni yutar"],
    ["GEÇİT", "dolup yeşile dönünce içine gir - yeni dalga"],
    ["YILDIZ", "yıldız topla - her 10 yıldızda yeni gölge katılır"],
    ["CANLAR", "3 top x 3 can - hepsi biterse oyun biter"],
    ["ATAK (SAĞ TIK)", "fare/dokunuş yönüne hızlı atılım - bekleme süreli"],
  ],
  EN: [
    ["THIS IS YOU", "move with arrows / WASD / mouse"],
    ["YOUR SHADOW", "you 2.5s ago - NEVER touch it"],
    ["DEADLY TRAIL", "the shadow's orange trail is forbidden briefly"],
    ["SHIELD", "turquoise orb - absorbs one hit, saves you"],
    ["FREEZE", "ice-blue orb - freezes the world for 3s"],
    ["SPEED", "yellow orb - you become much faster for 5s"],
    ["BLACK HOLE", "purple vortex - STAY AWAY, it swallows you"],
    ["GATE", "turns green when charged - enter it for a new wave"],
    ["STARS", "collect them - every 10 stars adds a new shadow"],
    ["LIVES", "3 balls x 3 hearts - game over when all are gone"],
    ["DASH (RIGHT-CLICK)", "quick burst toward the cursor/touch - has a cooldown"],
  ],
};
const UI = {
  TR: {
    score: "SKOR", shadow: "GÖLGE", ball: "TOP", chapter: "BÖLÜM", wave: "DALGA",
    opening: "AÇILIYOR", bonus: "BONUS!", paused: "DURAKLATILDI",
    paused_hint: "ESC: devam    M: ana menü    R: yeniden",
    title: "GÖLGEN PEŞİNDE", slogan: "Gölgen = Geçmişin...Ona Yakalanma!",
    play: "OYNA", menu_info: "BÖLÜM {0}'e kadar açık   REKOR {1}",
    menu_keys: "TIK: başla      ESC: duraklat",
    done: "TAMAMLANDI", next_ch: "sırada", cont: "DEVAM: TIK",
    over: "OYUN BİTTİ", reached: "Ulaştığın dalga", total: "TOPLAM SKOR",
    record: "Rekor", over_keys: "ESC: Ana Menü",
    won: "GEÇMİŞİNDEN KURTULDUN!", won_sub: "100 dalga boyunca gölgen sana yetişemedi",
    credit: "YAPIM: İBRAHİM KARAKUZU — KARAKUZU GAMES", won_key: "TIK: ana menü",
    swallow: "YUTULDUN! gölgenin dibine fırlatıldın - KAÇ!",
    shield_save: "KALKAN seni kurtardı!", hit_shadow: "gölgene ÇARPTIN!",
    hit_trail: "ölümcül ize DOKUNDUN!", hit_obs: "engele çarptın!",
    hit_laser: "ışına değdin!", hit_rocket: "rokete çarptın!",
    left_heart: "kalan kalp", ball_pop: "TOP PATLADI! kalan top", closed: "GEÇMİŞ KAPANDI",
    new_shadow: "YENİ GÖLGE PEŞİNDE!", new_shadow_sub: "geçmişin birikiyor - dikkat",
    over_continue: "DEVAM ET", over_restart: "YENİDEN BAŞLA",
    over_continue_sub: "aynı dalgadan - puanlar sıfırlanır",
    gates_left: "{0} BÖLÜMÜNDE {1} GEÇİT KALDI",
    dash_ready: "SAĞ TIK/ATAK: HAZIR", dash_cd: "ATAK: {0}sn",
    dash_btn: "ATAK",
    pause_menu_btn: "ANA MENÜ",
    demo_title: "NASIL OYNANIR", demo_skip: "GEÇ »", watch_again: "▶ TEKRAR İZLE",
    demo_replay: "▶ TEKRAR İZLE", demo_start: "OYUNA BAŞLA",
    demo_b1: "BU SENSİN - bu topu sen kontrol edersin",
    demo_b2: "Gölgen seni takip eder - 2.5 saniye önceki halin",
    demo_b3: "SANA DOKUNURSA can kaybedersin!",
    demo_b4: "FÜZELER aşağıdan yükselir - çarpma!",
    demo_b5: "Dönen UYDULAR da tehlikelidir - onlardan da kaç",
    demo_b6: "KALKAN: bir vuruşu emer, seni korur",
    demo_b7: "DONMA: dünyayı birkaç saniye durdurur",
    demo_b8: "HIZLANMA: bir süre çok hızlı kaçarsın",
    demo_b9: "Gölge yaklaşırsa ATAK'a dokunup kaç!",
    demo_b10: "Yıldızlar puan verir ve GEÇİDİ ERKEN AÇAR",
    demo_b11: "...ama her 10 yıldızda bir YENİ GÖLGE katılır!",
    demo_b12: "Parlayan GEÇİDE ulaş - yeni dalga başlar!",
    demo_b13: "Hazır mısın? Haydi başlayalım!",
  },
  EN: {
    score: "SCORE", shadow: "SHADOW", ball: "BALL", chapter: "CHAPTER", wave: "WAVE",
    opening: "OPENING", bonus: "BONUS!", paused: "PAUSED",
    paused_hint: "ESC: resume    M: main menu    R: restart",
    title: "CHASED BY YOUR SHADOW", slogan: "your shadow = your past... don't get caught!",
    play: "PLAY", menu_info: "Chapters open up to {0}   BEST {1}",
    menu_keys: "CLICK: start      ESC: pause",
    done: "COMPLETE", next_ch: "next", cont: "CONTINUE: CLICK",
    over: "GAME OVER", reached: "Wave reached", total: "TOTAL SCORE",
    record: "best", over_keys: "ESC: main menu",
    won: "YOU ESCAPED YOUR PAST!", won_sub: "for 100 waves your shadow never caught you",
    credit: "MADE BY İBRAHİM KARAKUZU — KARAKUZU GAMES", won_key: "CLICK: main menu",
    swallow: "SWALLOWED! spat out right next to your shadow - RUN!",
    shield_save: "The SHIELD saved you!", hit_shadow: "you TOUCHED your shadow!",
    hit_trail: "you TOUCHED the deadly trail!", hit_obs: "you hit an obstacle!",
    hit_laser: "you touched a laser!", hit_rocket: "you hit a rocket!",
    left_heart: "hearts left", ball_pop: "BALL LOST! balls left", closed: "THE PAST HAS CLOSED",
    new_shadow: "A NEW SHADOW JOINS!", new_shadow_sub: "your past is piling up - beware",
    over_continue: "CONTINUE", over_restart: "RESTART",
    over_continue_sub: "same wave - score resets",
    gates_left: "{1} GATES LEFT IN {0}",
    dash_ready: "RIGHT-CLICK/DASH: READY", dash_cd: "DASH: {0}s",
    dash_btn: "DASH",
    pause_menu_btn: "MAIN MENU",
    demo_title: "HOW TO PLAY", demo_skip: "SKIP »", watch_again: "▶ WATCH AGAIN",
    demo_replay: "▶ WATCH AGAIN", demo_start: "START GAME",
    demo_b1: "THIS IS YOU - you control this ball",
    demo_b2: "Your shadow follows you - it's you, 2.5 seconds ago",
    demo_b3: "IF IT TOUCHES YOU, you lose a heart!",
    demo_b4: "ROCKETS rise from below - don't get hit!",
    demo_b5: "Spinning SATELLITES are dangerous too - avoid them",
    demo_b6: "SHIELD: absorbs one hit and protects you",
    demo_b7: "FREEZE: stops the world for a few seconds",
    demo_b8: "SPEED: makes you much faster for a while",
    demo_b9: "Getting chased? Tap ATAK to dash to safety!",
    demo_b10: "Stars give points and open the GATE faster",
    demo_b11: "...but every 10 stars adds a NEW shadow!",
    demo_b12: "Reach the glowing GATE to start a new wave!",
    demo_b13: "Ready? Let's go!",
  },
};

const CHAPTER_TINT = [[70,110,200],[60,80,170],[120,110,190],[190,70,80],[80,160,200],
                       [70,60,110],[220,140,60],[120,60,140],[60,180,160],[200,80,160]];

const BG = "rgb(22,34,74)";
const ARENA_B = [18,28,58];
const BLUE = [55,138,221], ORANGE = [255,140,60], GREEN = [99,200,90], YELLOW = [240,200,60];
const WHITE = [240,240,240], HEARTC = [210,50,70], CYAN = [80,200,220], GRAYOB = [118,132,168];
const FRAGILE = [220,40,140], PANEL = [60,120,210];
const SHIELDC = [70,215,195], BOLTC = [255,210,70], FREEZEC = [185,230,255], LASERC = [226,75,74];

function rgb(c, a) { return a === undefined ? `rgb(${c[0]|0},${c[1]|0},${c[2]|0})` : `rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`; }
function lerp3(a, b, t) { return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t]; }

// ============================ SES (Web Audio) ============================
// Python'daki matematiksel sentezle birebir aynı formüller (harici dosya yok).
const SR = 22050;

class Sfx {
  constructor() {
    this.ok = false;
    this.on = true;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.buffers = {
        star:    this._mk([620, 70, 0.30, 880]),
        power:   this._mk([440, 90, 0.34, 520], [660, 140, 0.28]),
        save:    this._mk([330, 90, 0.36], [415, 90, 0.34], [523, 170, 0.32]),
        hit:     this._mk([430, 60, 0.4, 200], [140, 130, 0.45, 55]),
        ball:    this._mk([200, 120, 0.45, 120], [110, 230, 0.45, 70]),
        gate:    this._mk([523, 90, 0.3], [659, 150, 0.26]),
        wave:    this._mk([523, 80, 0.3], [659, 80, 0.3], [784, 190, 0.28]),
        portal:  this._mk([300, 150, 0.3, 700]),
        swallow: this._mk([500, 300, 0.4, 90]),
        freeze:  this._mk([700, 70, 0.26], [560, 140, 0.22]),
        boost:   this._mk([320, 130, 0.34, 720]),
        over:    this._mk([90, 130, 0.55, 42], [349, 190, 0.34], [294, 190, 0.34], [220, 200, 0.34], [165, 420, 0.4]),
        win:     this._mk([523, 110, 0.34], [659, 110, 0.34], [784, 110, 0.34], [880, 280, 0.3]),
        click:   this._mk([500, 45, 0.25]),
        shadow:  this._mk([196, 110, 0.30], [247, 160, 0.26, 220]),
        dash:    this._mk([260, 110, 0.32, 560]),
      };
      this._music();
      this.ok = true;
    } catch (e) { /* audio unavailable */ }
  }

  _tone(freq, ms, vol, f2) {
    vol = vol === undefined ? 0.35 : vol;
    f2 = f2 || freq;
    const n = Math.max(1, Math.round(SR * ms / 1000));
    const buf = this.ctx.createBuffer(1, n, SR);
    const d = buf.getChannelData(0);
    let ph = 0;
    const atk = SR * 0.004;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const f = freq + (f2 - freq) * t;
      ph += 2 * Math.PI * f / SR;
      const v = Math.sin(ph) + 0.30 * Math.sin(ph * 2);
      const env = Math.min(1, i / atk) * Math.pow(1 - t, 1.4);
      d[i] = Math.max(-1, Math.min(1, v * env * vol));
    }
    return buf;
  }

  _mk(...parts) {
    const bufs = parts.map(p => this._tone(...p));
    const total = bufs.reduce((a, b) => a + b.length, 0);
    const out = this.ctx.createBuffer(1, total, SR);
    const d = out.getChannelData(0);
    let off = 0;
    for (const b of bufs) { d.set(b.getChannelData(0), off); off += b.length; }
    return out;
  }

  play(name) {
    if (!this.ok || !this.on) return;
    try {
      const src = this.ctx.createBufferSource();
      src.buffer = this.buffers[name];
      src.connect(this.ctx.destination);
      src.start();
    } catch (e) {}
  }

  // ---- arka fon müziği: masaüstü ile birebir aynı sentez (Am-F-C-G arpej) ----
  _buildTrack(seq, noteDur, amp, subOct) {
    const noteN = Math.max(1, Math.round(SR * noteDur));
    const total = noteN * seq.length;
    const buf = this.ctx.createBuffer(1, total, SR);
    const d = buf.getChannelData(0);
    for (let k = 0; k < seq.length; k++) {
      const freq = 440.0 * Math.pow(2, (seq[k] - 69) / 12);
      for (let i = 0; i < noteN; i++) {
        const u = i / noteN;
        const env = Math.sin(Math.PI * u) * (1 - 0.4 * u);
        const t = i / SR;
        const v = Math.sin(2 * Math.PI * freq * t)
                + 0.35 * Math.sin(2 * Math.PI * freq * 2 * t)
                + subOct * Math.sin(2 * Math.PI * (freq * 0.5) * t);
        d[k * noteN + i] = Math.max(-1, Math.min(1, v * env * amp));
      }
    }
    return buf;
  }

  _music() {
    const seqMain = [
      57,60,64,60, 53,57,60,57, 48,52,55,52, 55,59,62,59,
      57,60,64,67, 53,57,60,64, 48,52,55,60, 55,59,62,55,
      50,53,57,62, 57,60,64,69, 52,56,59,64, 57,60,64,60,
      50,53,57,53, 57,60,64,57, 52,56,59,56, 45,52,57,64,
    ];
    const seqMenu = [57,64,60,55, 53,60,57,52, 48,55,52,60, 55,62,59,55];
    this.gameMusic = this._buildTrack(seqMain, 0.32, 0.16, 0.5);
    this.gameMusicIntense = this._buildTrack(seqMain, 0.23, 0.19, 0.65);
    this.menuMusic = this._buildTrack(seqMenu, 0.55, 0.12, 0.7);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.on ? 1 : 0;
    this.musicGain.connect(this.ctx.destination);
    this.musicSrc = null;
    this.curMusic = null;
  }

  updateMusic(buf) {
    if (!this.ok) return;
    if (this.curMusic !== buf) {
      this.curMusic = buf;
      if (this.musicSrc) { try { this.musicSrc.stop(); } catch (e) {} }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(this.musicGain);
      src.start();
      this.musicSrc = src;
    }
  }

  setMuted(muted) {
    this.on = !muted;
    if (this.musicGain) this.musicGain.gain.value = muted ? 0 : 1;
  }

  suspend() { if (this.ctx && this.ctx.state === "running") this.ctx.suspend(); }
  unsuspend() { if (this.ctx && this.ctx.state === "suspended") this.ctx.resume(); }

  resume() {
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }
}

// ============================ SEEDED RNG (bölüm 5: arena hep aynı) ============================
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
class Rnd {
  constructor(seed) { this.f = seed === null ? Math.random : mulberry32(seed); }
  random() { return this.f(); }
  uniform(a, b) { return a + this.f() * (b - a); }
  choice(arr) { return arr[Math.floor(this.f() * arr.length)]; }
  randint(a, b) { return a + Math.floor(this.f() * (b - a + 1)); }
}

// ============================ OBSTACLE / LASER ============================
class Obstacle {
  constructor(x, y, r, vx, vy, fragile, rnd) {
    this.x = x; this.y = y; this.r = r; this.vx = vx; this.vy = vy; this.fragile = fragile;
    this.alive = true;
    this.isSatellite = !fragile && rnd.random() < 0.5;
    this.spin = rnd.random() * 6.2832;
  }
  step() {
    this.x += this.vx; this.y += this.vy;
    if (this.x < this.r || this.x > W - this.r) this.vx *= -1;
    if (this.y < this.r || this.y > H - this.r) this.vy *= -1;
    this.spin += 0.012;
  }
}

class LaserObj {
  constructor(x1, y1, x2, y2, pulse) { this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2; this.pulse = pulse; }
  active(frame) { return Math.floor(frame / this.pulse) % 2 === 0; }
}

// ============================ GAME (bir koşu) ============================
class Game {
  constructor(chapter) {
    chapter = chapter || 1;
    this.wave = (chapter - 1) * 10 + 1;
    this.startWave = this.wave;
    this.ballsLeft = 3; this.lives = 3; this.inv = 0;
    this.score = 0; this.starsRun = 0; this.combo = 1;
    this.shield = false;
    this.freeze = 0; this.boost = 0;
    this.dashCd = 0;
    this.ghostCount = chapter > 1 ? Math.min(1 + Math.floor((chapter - 1) / 2), 4) : 1;
    this.ghostThreshold = 10 + (this.ghostCount - 1) * 10;
    this.finaleT = 0; this.finGone = 0;
    this.newWave(true);
  }
  chapter() { return Math.min(10, Math.floor((this.wave - 1) / 10) + 1); }
  waveDelay() { return Math.max(90, DELAY - (this.wave - 1) * 3); }
  wallLen() {
    let wl = Math.min(70, 40 + (this.chapter() - 1) * 6);
    if (this.chapter() === 4) wl = Math.floor(wl * 3 / 2);
    else if (this.chapter() === 8) wl = Math.floor(wl * 2 / 3);
    return wl;
  }
  echoIdx(spawn) {
    let idx = this.frame - spawn;
    if (this.chapter() === 2) idx += Math.floor(Math.sin(this.frame * 0.02) * 22);
    return idx;
  }
  gateLock() {
    const base = Math.floor(FPS * Math.min(12.0, 7.0 + this.wave * 0.25));
    return Math.max(FPS * 2, base - this.coinsGot * Math.floor(FPS * 2.5));
  }
  gateOpen() { return this.frame >= this.gateLock(); }

  // DEVAM ET: aynı dalgadan, 3 top x 3 kalple sürdür. Skor/yıldız sıfırlanır, gölge sayısı KORUNUR.
  continueRun() {
    this.ballsLeft = 3; this.lives = 3; this.inv = 180;
    this.score = 0; this.starsRun = 0; this.ghostThreshold = 10; this.combo = 1;
    this.startWave = this.wave;
    this.wave -= 1;
    this.newWave(false);
  }

  newWave(first) {
    if (!first) {
      this.score += 150 * this.combo;
      this.combo = Math.min(5, this.combo + 1);
      this.wave += 1;
    }
    const ch = this.chapter();
    const rnd = new Rnd(ch === 5 ? (this.startWave * 7919 + 555) : null);
    this.frame = 0;
    this.bx = W / 2; this.by = 250.0;
    this.hist = []; this.trail = [];
    const wd = this.waveDelay();
    const ec = this.ghostCount + (ch === 6 ? 1 : 0);
    this.echoSpawns = [];
    for (let k = 0; k < ec; k++) this.echoSpawns.push((k + 1) * wd);
    if (ch === 9) this.shield = true;

    const d = Math.min(1.0, 0.02 + this.wave * 0.018);
    const obsCap = this.wave <= 1 ? 0 : (this.wave === 2 ? 2 : (this.wave === 3 ? 3 : 99));
    const lasCap = this.wave <= 2 ? 0 : (this.wave === 3 ? 1 : 99);

    while (true) {
      this.tx = rnd.uniform(80, W - 80); this.ty = rnd.uniform(80, H - 80);
      if (dist(this.bx, this.by, this.tx, this.ty) >= 220) break;
    }
    const spd = 1.5 + d * 4.0;
    this.tvx = spd * rnd.choice([-1, 1]); this.tvy = spd * 0.7 * rnd.choice([-1, 1]);

    let nObs = Math.min(obsCap, Math.max(2, Math.min(5, Math.floor(2 + d * 3.5))));
    if (ch === 10) nObs = Math.min(nObs, 3);
    this.obstacles = [];
    for (let i = 0; i < nObs * 10 && this.obstacles.length < nObs; i++) {
      const ox = rnd.uniform(80, W - 80), oy = rnd.uniform(80, H - 80);
      if (dist(this.bx, this.by, ox, oy) < 150 || dist(this.tx, this.ty, ox, oy) < 60) continue;
      const sp = (0.8 + d * 2.0) * rnd.uniform(0.8, 1.3);
      this.obstacles.push(new Obstacle(ox, oy, rnd.uniform(18, 28),
        sp * rnd.choice([-1, 1]), sp * rnd.uniform(0.5, 1.0) * rnd.choice([-1, 1]),
        rnd.random() < 0.3, rnd));
    }

    this.lasers = [];
    if (d > 0.08 && lasCap > 0) {
      const nL = Math.min(lasCap, Math.max(1, Math.min(6, Math.floor((d - 0.08) * 7))));
      const pulse = Math.max(38, Math.floor(100 - d * 65));
      for (let i = 0; i < nL * 10 && this.lasers.length < nL; i++) {
        if (rnd.random() < 0.5) {
          const lx = rnd.uniform(100, W - 200), ly = rnd.uniform(80, H - 80);
          this.lasers.push(new LaserObj(lx, ly, lx + rnd.uniform(220, 420), ly, pulse));
        } else {
          const lx = rnd.uniform(80, W - 80), ly = rnd.uniform(80, H - 200);
          this.lasers.push(new LaserObj(lx, ly, lx, ly + rnd.uniform(220, 380), pulse));
        }
      }
    }

    this.portal = null;
    if (this.wave >= 4 && rnd.random() < 0.40 + d * 0.45) {
      for (let i = 0; i < 40; i++) {
        const p = [rnd.uniform(80, W - 80), rnd.uniform(80, H - 80), rnd.uniform(80, W - 80), rnd.uniform(80, H - 80)];
        if (dist(p[0], p[1], p[2], p[3]) < 300) continue;
        if (this.lasers.some(l => segDist(p[0], p[1], l.x1, l.y1, l.x2, l.y2) < 70 ||
                                    segDist(p[2], p[3], l.x1, l.y1, l.x2, l.y2) < 70)) continue;
        this.portal = p; break;
      }
    }
    this.portalCd = 0;

    this.coins = [];
    if (this.wave >= 2) {
      const nCoins = rnd.randint(2, 4);
      for (let i = 0; i < nCoins; i++) {
        for (let t = 0; t < 40; t++) {
          const cx = rnd.uniform(80, W - 80), cy = rnd.uniform(80, H - 80);
          if (this.coins.some(c => dist(cx, cy, c[0], c[1]) < 170)) continue;
          if (this.lasers.some(l => segDist(cx, cy, l.x1, l.y1, l.x2, l.y2) < 70)) continue;
          this.coins.push([cx, cy, false]); break;
        }
      }
    }
    this.coinsGot = 0;

    this.wells = [];
    if (this.wave > 4 && rnd.random() < 0.45) {
      for (let i = 0; i < 25; i++) {
        const wx = rnd.uniform(160, W - 160), wy = rnd.uniform(200, H - 120);
        if (this.lasers.some(l => segDist(wx, wy, l.x1, l.y1, l.x2, l.y2) < 110)) continue;
        this.wells.push([wx, wy, 62.0, 0.9]); break;
      }
    }
    this.wellCd = 0;

    this.powerups = [];
    this.puCd = FPS * 6;
    this.rockets = [];
    this.gateFx = false;

    if (this.wave === 100) this.setupFinale();
    if (!first && this.wave % 20 === 0) this.lives = 3;
  }

  setupFinale() {
    this.obstacles = []; this.lasers = []; this.portal = null; this.powerups = []; this.rockets = [];
    this.echoSpawns = [];
    this.wells = [[W / 2, 560.0, 70.0, 0.0]];
    this.tx = -900; this.ty = -900; this.tvx = 0; this.tvy = 0;
    this.finaleT = 15 * FPS; this.finGone = 0;
    this.inv = 15 * FPS;
    this.coins = [];
    for (let i = 0; i < 7; i++) {
      const bx = 120 + i * (W - 240) / 6;
      this.coins.push([bx, 170.0, false]); this.coins.push([bx, 1000.0, false]);
    }
    for (let i = 1; i < 5; i++) {
      const by = 170 + i * 166;
      this.coins.push([110.0, by, false]); this.coins.push([W - 110.0, by, false]);
    }
  }
}

// ============================ APP (durum makinesi + girdi + ciz) ============================
class App {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.sfx = new Sfx();
    this.lang = "EN";
    this.scene = "MENU";
    this.g = null;
    this.paused = false;
    this.maxChapter = 1;
    this.high = 0;
    this.breakIdx = 0;
    this.msg = ""; this.msgT = -999;
    this.ticks = 0;
    this.systemPaused = false;   // YouTube onPause: TUM calisma (mantik+render+ses) durur
    this.keys = {};
    this.mouse = { x: 0, y: 0, down: false };
    this.logo = null;
    this.introSeen = false;
    this._loadLogo();
    this._loadSave();

    // dikdortgenler (menu/over ekranlari)
    this.trRect = { x: WIN_W / 2 - 104, y: 12, w: 96, h: 56 };   // >=48dp dokunma hedefi (best practice)
    this.enRect = { x: WIN_W / 2 + 8, y: 12, w: 96, h: 56 };
    this.overContRect = { x: WIN_W / 2 - 250, y: 797, w: 230, h: 70 };
    this.overRestartRect = { x: WIN_W / 2 + 20, y: 797, w: 230, h: 70 };
    this.dashBtnRect = { x: VIEW_W - 106, y: BAND_TOP + VIEW_H - 122, w: 88, h: 88 };   // drawPlay() her karede gunceller

    this._bindInput();
  }

  _loadLogo() {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // siyah zemini alfa'ya cevir (max(r,g,b) tabanli anahtar), tıpkı masaüstündeki gibi
      const off = document.createElement("canvas");
      off.width = img.width; off.height = img.height;
      const octx = off.getContext("2d");
      octx.drawImage(img, 0, 0);
      const id = octx.getImageData(0, 0, off.width, off.height);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        const lum = Math.max(d[i], d[i + 1], d[i + 2]);
        d[i + 3] = Math.min(255, lum * 1.5);
      }
      octx.putImageData(id, 0, 0);
      this.logo = off;
    };
    img.src = "logo_kg.png";
  }

  T(key) { return UI[this.lang][key]; }
  CN(i) { return CH_NAME[this.lang][i]; }
  CR(i) { return CH_RULE[this.lang][i]; }
  note(m) { this.msg = m; this.msgT = this.ticks; }

  // ---- kayit (bölüm progresi + rekor + dil + ilk-oynanış ipucu bayrağı): YouTube save varsa onu, yoksa localStorage ----
  _loadSave() {
    try {
      const raw = localStorage.getItem("golge_save");
      if (raw) {
        const d = JSON.parse(raw);
        this.maxChapter = d.maxChapter || 1;
        this.high = d.high || 0;
        this.lang = d.lang || "EN";
        this.introSeen = !!d.introSeen;
      }
    } catch (e) {}
  }
  saveNow() {
    const data = { maxChapter: this.maxChapter, high: this.high, lang: this.lang, introSeen: this.introSeen };
    if (window.ytInPlayables) {
      // Playables icinde: SADECE resmi bulut kaydi kullanilir (kendi yerel mekanizmamiz devre disi)
      if (window.ytSaveData) window.ytSaveData(data);
    } else {
      try { localStorage.setItem("golge_save", JSON.stringify(data)); } catch (e) {}
    }
  }

  // ---- çizim yardımcıları ----
  text(t, x, y, col, opts) {
    opts = opts || {};
    const ctx = this.ctx;
    ctx.font = `${opts.bold === false ? "" : "bold "}${opts.size || 20}px "Segoe UI", Arial, sans-serif`;
    ctx.fillStyle = rgb(col);
    ctx.textAlign = opts.center === false ? "left" : "center";
    ctx.textBaseline = opts.center === false ? "top" : "middle";
    ctx.fillText(t, x, y);
  }
  textWidth(t, size) {
    this.ctx.font = `bold ${size}px "Segoe UI", Arial, sans-serif`;
    return this.ctx.measureText(t).width;
  }
  wrap(t, maxw, size) {
    const words = t.split(" ");
    const lines = []; let cur = "";
    for (const w of words) {
      const cand = (cur + " " + w).trim();
      if (cur && this.textWidth(cand, size) > maxw) { lines.push(cur); cur = w; }
      else cur = cand;
    }
    if (cur) lines.push(cur);
    return lines;
  }
  glow(x, y, r, col, a) {
    const ctx = this.ctx;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgb(col, a / 255));
    g.addColorStop(1, rgb(col, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  circle(x, y, r, col, lw) {
    const ctx = this.ctx;
    ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, 7);
    if (lw) { ctx.strokeStyle = rgb(col); ctx.lineWidth = lw; ctx.stroke(); }
    else { ctx.fillStyle = rgb(col); ctx.fill(); }
  }
  orb(x, y, r, col) {
    this.circle(x, y, r, col);
    if (r > 5) {
      const hl = [Math.min(255, col[0] + 60), Math.min(255, col[1] + 60), Math.min(255, col[2] + 60)];
      this.circle(x - r * 0.32, y - r * 0.38, Math.max(1, r * 0.34), hl);
    }
  }
  star(x, y, r, col) {
    const ctx = this.ctx;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang = -Math.PI / 2 + i * Math.PI / 5;
      const rr = i % 2 === 0 ? r : r * 0.45;
      const px = x + Math.cos(ang) * rr, py = y + Math.sin(ang) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = rgb(col);
    ctx.fill();
  }
  heart(x, y, r, col) {
    const ctx = this.ctx;
    this.circle(x - r / 2, y, r / 1.6, col);
    this.circle(x + r / 2, y, r / 1.6, col);
    ctx.beginPath();
    ctx.moveTo(x - r, y + r * 0.15);
    ctx.lineTo(x + r, y + r * 0.15);
    ctx.lineTo(x, y + r * 1.4);
    ctx.closePath();
    ctx.fillStyle = rgb(col);
    ctx.fill();
  }
  line(x1, y1, x2, y2, col, lw) {
    const ctx = this.ctx;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = rgb(col); ctx.lineWidth = lw; ctx.stroke();
  }
  drawLogo(cx, cy, size) {
    if (!this.logo) return;
    const w = size, h = size * this.logo.height / this.logo.width;
    this.ctx.drawImage(this.logo, cx - w / 2, cy - h / 2, w, h);
  }
  button(rect, label, col, sub) {
    const ctx = this.ctx;
    ctx.fillStyle = "rgb(16,24,48)";
    this._roundRect(rect.x, rect.y, rect.w, rect.h, 12);
    ctx.fill();
    ctx.strokeStyle = rgb(col); ctx.lineWidth = 3;
    this._roundRect(rect.x, rect.y, rect.w, rect.h, 12);
    ctx.stroke();
    const cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
    if (sub) {
      const maxw = rect.w - 28;
      const lines = this.wrap(sub, maxw, 12);
      this.text(label, cx, rect.y + 23, col, { size: 21 });
      let sy = rect.y + rect.h - 10 - (lines.length - 1) * 13;
      for (const line of lines) { this.text(line, cx, sy, [170, 185, 205], { size: 12 }); sy += 13; }
    } else {
      this.text(label, cx, cy, col, { size: 26 });
    }
  }
  _roundRect(x, y, w, h, r) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  guideIcon(i, cx, cy) {
    const r = 13;
    if (i === 0) { this.orb(cx, cy, r, BLUE); this.circle(cx, cy, r + 2, WHITE, 2); }
    else if (i === 1) { this.circle(cx, cy, r, [12, 12, 16]); this.circle(cx, cy, r + 2, ORANGE, 3); }
    else if (i === 2) { for (let k = 0; k < 3; k++) this.circle(cx - 12 + k * 12, cy, 4 + k, ORANGE); }
    else if (i === 3) { this.orb(cx, cy, r, SHIELDC); this.circle(cx, cy, r + 3, SHIELDC, 2); }
    else if (i === 4) { this.orb(cx, cy, r, FREEZEC); this.circle(cx, cy, r + 3, FREEZEC, 2); }
    else if (i === 5) { this.orb(cx, cy, r, BOLTC); this.circle(cx, cy, r + 3, BOLTC, 2); }
    else if (i === 6) {
      for (let ri = 0; ri < 3; ri++) this.circle(cx, cy, r - ri * 3, [60 + ri * 45, 20, 90 + ri * 40], 2);
      this.circle(cx, cy, r * 0.4, [2, 2, 6]);
    }
    else if (i === 7) { this.circle(cx, cy, r, GREEN, 3); this.circle(cx, cy, r * 0.4, [200, 255, 220]); }
    else if (i === 8) { this.star(cx, cy, r, YELLOW); }
    else if (i === 9) { this.heart(cx, cy, r * 0.9, HEARTC); }
    else if (i === 10) {
      const ctx = this.ctx;
      ctx.beginPath(); ctx.moveTo(cx - 6, cy - 10); ctx.lineTo(cx - 6, cy + 10); ctx.lineTo(cx + 12, cy);
      ctx.closePath(); ctx.fillStyle = rgb(CYAN); ctx.fill();
      this.line(cx - 17, cy - 6, cx - 9, cy - 6, CYAN, 3);
      this.line(cx - 17, cy + 6, cx - 9, cy + 6, CYAN, 3);
    }
  }

  // ---------------- oyun adımı ----------------
  step() {
    const g = this.g;
    const ch = g.chapter();
    if (g.finaleT === 0) {
      if (g.wave === 3) {
        if (g.frame === 240) g.powerups.push([200, 520, 0, 20 * FPS]);
        if (g.frame === 480) g.powerups.push([400, 470, 3, 20 * FPS]);
      }
      if (g.wave === 4 && g.frame === 240) g.powerups.push([600, 520, 2, 20 * FPS]);
    }

    if (g.finaleT > 0) {
      this.stepFinale();
      if (this.scene !== "PLAY") return;
    }

    const frozen = g.freeze > 0;
    if (g.freeze > 0) g.freeze -= 1;
    if (g.boost > 0) g.boost -= 1;
    if (g.inv > 0) g.inv -= 1;
    if (g.dashCd > 0) g.dashCd -= 1;

    let dx = (this.keys["ArrowRight"] || this.keys["KeyD"] ? 1 : 0) - (this.keys["ArrowLeft"] || this.keys["KeyA"] ? 1 : 0);
    let dy = (this.keys["ArrowDown"] || this.keys["KeyS"] ? 1 : 0) - (this.keys["ArrowUp"] || this.keys["KeyW"] ? 1 : 0);
    if (this.mouse.down) {
      const ax = (this.mouse.x - ARENA_X) / SX, ay = (this.mouse.y - BAND_TOP) / SY;
      const vx = ax - g.bx, vy = ay - g.by;
      const m = Math.hypot(vx, vy);
      if (m > 6) { dx = vx / m; dy = vy / m; }
    }
    const m = Math.hypot(dx, dy);
    if (m > 0) {
      const sp = SPEED * (g.boost > 0 ? 2.0 : 1.0) * (ch === 10 ? 1.15 : 1.0);
      g.bx += dx / m * sp; g.by += dy / m * sp;
    }
    g.bx = Math.max(BALL_R, Math.min(W - BALL_R, g.bx));
    g.by = Math.max(BALL_R, Math.min(H - BALL_R, g.by));
    g.trail.push([g.bx, g.by]);
    if (g.trail.length > 18) g.trail.shift();

    if (g.portalCd > 0) g.portalCd -= 1;
    if (g.portal && g.portalCd === 0) {
      const p = g.portal;
      const pairs = [[0, 2], [2, 0]];
      for (const pr of pairs) {
        const a = pr[0], b = pr[1];
        if (dist(g.bx, g.by, p[a], p[a + 1]) < BALL_R + 26) {
          g.bx = p[b]; g.by = p[b + 1]; g.portalCd = 30; g.trail = [];
          this.sfx.play("portal"); break;
        }
      }
    }

    if (g.wellCd > 0) g.wellCd -= 1;
    if (g.finaleT === 0 && g.wellCd === 0) {
      for (const w of g.wells) {
        const wx = w[0], wy = w[1], wr = w[2], pull = w[3];
        const dd = dist(g.bx, g.by, wx, wy) + 0.001;
        if (dd < wr * 0.6) {
          const ang = Math.random() * 6.2832;
          let ex, ey;
          if (g.hist.length && g.echoSpawns.length) {
            const i0 = Math.max(0, Math.min(g.hist.length - 1, g.echoIdx(g.echoSpawns[0])));
            ex = g.hist[i0][0]; ey = g.hist[i0][1];
          } else { ex = wx; ey = wy; }
          g.bx = Math.max(BALL_R, Math.min(W - BALL_R, ex + Math.cos(ang) * 130));
          g.by = Math.max(BALL_R, Math.min(H - 60, ey + Math.sin(ang) * 130));
          g.wellCd = 55; g.inv = Math.max(g.inv, 50); g.trail = [];
          this.note(this.T("swallow")); this.sfx.play("swallow");
        } else if (dd < wr * 4) {
          const t = 1 - dd / (wr * 4);
          const f = pull * t * t * 2.2;
          g.bx += (wx - g.bx) / dd * f; g.by += (wy - g.by) / dd * f;
        }
      }
    }

    for (const c of g.coins) {
      if (!c[2] && dist(g.bx, g.by, c[0], c[1]) < BALL_R + 22) {
        c[2] = true; g.coinsGot += 1; g.starsRun += 1; g.score += 25;
        this.sfx.play("star");
        if (g.finaleT === 0 && g.starsRun >= g.ghostThreshold) {
          g.ghostCount += 1; g.ghostThreshold += 15;
          g.echoSpawns.push(g.frame + g.echoSpawns.length * g.waveDelay());
          this.note(this.T("new_shadow")); this.sfx.play("shadow");
        }
      }
    }

    if (g.finaleT === 0 && g.wave >= 3) {
      if (g.puCd > 0) g.puCd -= 1;
      if (g.puCd === 0 && g.powerups.length < 2) {
        const x = Math.random() * (W - 140) + 70, y = Math.random() * (H - 150) + 70;
        if (dist(x, y, g.bx, g.by) > 140 && !g.lasers.some(l => segDist(x, y, l.x1, l.y1, l.x2, l.y2) < 70)) {
          const kind = [0, 0, 2, 2, 3, 3][Math.floor(Math.random() * 6)];
          g.powerups.push([x, y, kind, 8 * FPS]);
          g.puCd = (11 + Math.floor(Math.random() * 8)) * FPS;
        }
      }
    }
    for (let i = g.powerups.length - 1; i >= 0; i--) {
      const pu = g.powerups[i];
      pu[3] -= 1;
      if (pu[3] <= 0) { g.powerups.splice(i, 1); continue; }
      if (dist(g.bx, g.by, pu[0], pu[1]) < BALL_R + 40) {
        if (pu[2] === 0) { g.shield = true; this.sfx.play("power"); }
        else if (pu[2] === 2) { g.boost = 5 * FPS; this.sfx.play("boost"); }
        else if (pu[2] === 3) { g.freeze = 3 * FPS; this.sfx.play("freeze"); }
        g.powerups.splice(i, 1);
      }
    }

    if (g.finaleT === 0 && !frozen && g.wave >= 3) {
      if (g.rockets.length < 2 && g.frame > 60 && Math.random() < 0.0025) {
        g.rockets.push([Math.random() * (W - 120) + 60, H + 30, Math.random() * 6, 45]);
      }
      for (let i = g.rockets.length - 1; i >= 0; i--) {
        const r = g.rockets[i];
        if (r[3] > 0) { r[3] -= 1; continue; }
        r[1] -= 2.6; r[2] += 0.08;
        if (r[1] < -40) g.rockets.splice(i, 1);
      }
    }

    if (!g.gateFx && g.gateOpen()) { g.gateFx = true; this.sfx.play("gate"); }
    if (!frozen && g.finaleT === 0) {
      g.tx += g.tvx; g.ty += g.tvy;
      if (g.tx < 30 || g.tx > W - 30) g.tvx *= -1;
      if (g.ty < 30 || g.ty > H - 60) g.tvy *= -1;
    }
    if (g.gateOpen() && dist(g.bx, g.by, g.tx, g.ty) < TARGET_R + BALL_R) {
      if (g.wave >= 100) { this.win(); return; }
      const prevCh = g.chapter();
      g.newWave(false);
      this.sfx.play("wave");
      this.maxChapter = Math.max(this.maxChapter, g.chapter());
      if (g.chapter() !== prevCh) {
        this.breakIdx = prevCh - 1;
        this.scene = "BREAK";
        this.saveNow();
        this.showChapterAd();
        return;
      }
    }

    if (!frozen) {
      for (const o of g.obstacles) if (o.alive) o.step();
      g.hist.push([g.bx, g.by]);
      g.frame += 1;
    }

    if (g.inv === 0 && g.finaleT === 0) {
      let hit = null;
      for (const spawn of g.echoSpawns) {
        const idx = g.echoIdx(spawn);
        if (idx >= 0 && idx < g.hist.length) {
          const ex = g.hist[idx][0], ey = g.hist[idx][1];
          if (idx >= 45 && dist(g.bx, g.by, ex, ey) < BALL_R + ECHO_R) hit = this.T("hit_shadow");
          const j0 = Math.max(0, idx - g.wallLen());
          for (let j = j0; j < idx; j += 4) {
            const wxp = g.hist[j][0], wyp = g.hist[j][1];
            if (dist(g.bx, g.by, wxp, wyp) < BALL_R + 9) { hit = this.T("hit_trail"); break; }
          }
        }
        if (hit) break;
      }
      if (!hit) {
        for (const o of g.obstacles) {
          if (o.alive && dist(g.bx, g.by, o.x, o.y) < BALL_R + o.r) {
            if (o.fragile && g.boost > 0) o.alive = false;
            else hit = this.T("hit_obs");
            break;
          }
        }
      }
      if (!hit) {
        for (const l of g.lasers) {
          if (l.active(g.frame) && segDist(g.bx, g.by, l.x1, l.y1, l.x2, l.y2) < BALL_R + 5) { hit = this.T("hit_laser"); break; }
        }
      }
      if (!hit) {
        for (const r of g.rockets) {
          if (r[3] === 0 && dist(g.bx, g.by, r[0] + Math.sin(r[2]) * 12, r[1]) < BALL_R + 16) { hit = this.T("hit_rocket"); break; }
        }
      }
      if (hit) {
        if (g.shield) {
          g.shield = false; g.inv = 90; this.note(this.T("shield_save")); this.sfx.play("save");
        } else {
          g.combo = 1; g.lives -= 1; g.inv = 120;
          this.note(hit + "  " + this.T("left_heart") + ": " + g.lives); this.sfx.play("hit");
          if (g.lives <= 0) {
            g.ballsLeft -= 1;
            if (g.ballsLeft <= 0) { this.gameOver(); return; }
            g.lives = 3; g.inv = 180;
            this.note(this.T("ball_pop") + ": " + g.ballsLeft); this.sfx.play("ball");
          }
        }
      }
    }
  }

  stepFinale() {
    const g = this.g;
    const elapsed = 15 * FPS - g.finaleT;
    g.finaleT -= 1;
    const w = g.wells.length ? g.wells[0] : null;
    let gone = 0;
    for (let k = 0; k < 6; k++) if (this.finProg(elapsed, k) >= 1) gone++;
    if (gone > g.finGone) g.finGone = gone;
    if (gone < 6 && elapsed % 26 === 0 && w) {
      const sx = Math.random() * (W - 180) + 90, sy = Math.random() * (H - 240) + 140;
      if (dist(sx, sy, w[0], w[1]) > w[2] * 1.5) g.coins.push([sx, sy, false]);
    }
    const FIN_IMP = 555;
    if (w && FIN_IMP - 75 < elapsed && elapsed < FIN_IMP) {
      for (const c of g.coins) {
        if (c[2]) continue;
        c[0] += (w[0] - c[0]) * 0.13; c[1] += (w[1] - c[1]) * 0.13;
        if (dist(c[0], c[1], w[0], w[1]) < w[2] * 0.5) c[2] = true;
      }
    }
    if (w && elapsed === FIN_IMP) {
      for (const c of g.coins) c[2] = true;
      g.wells = [];
      this.note(this.T("closed"));
    }
    if (g.finaleT <= 0) this.win();
  }
  finProg(elapsed, k) { return Math.max(0, Math.min(1, (elapsed - (60 + k * 45)) / 210.0)); }

  tryDash(px, py) {
    const g = this.g;
    if (!g || g.dashCd > 0 || g.finaleT > 0) return;
    const ax = (px - ARENA_X) / SX, ay = (py - BAND_TOP) / SY;
    const vx = ax - g.bx, vy = ay - g.by;
    const m = Math.hypot(vx, vy);
    if (m < 1) return;
    g.bx = Math.max(BALL_R, Math.min(W - BALL_R, g.bx + vx / m * DASH_DIST));
    g.by = Math.max(BALL_R, Math.min(H - BALL_R, g.by + vy / m * DASH_DIST));
    g.inv = Math.max(g.inv, 20);
    g.dashCd = DASH_COOLDOWN;
    this.sfx.play("dash");
  }

  gameOver() {
    this.high = Math.max(this.high, this.g.score);
    this.scene = "OVER";
    this.sfx.play("over");
    this.saveNow();
    if (window.ytReportScore) window.ytReportScore(this.high);
  }
  win() {
    this.high = Math.max(this.high, this.g.score);
    this.scene = "WON"; this.wonT = this.ticks;
    this.sfx.play("win");
    this.saveNow();
    if (window.ytReportScore) window.ytReportScore(this.high);
  }

  // ---------------- çizimler ----------------
  drawPlay() {
    const g = this.g, ch = g.chapter(), tint = CHAPTER_TINT[ch - 1];
    const ctx = this.ctx;
    ctx.fillStyle = "rgb(6,8,16)";
    ctx.fillRect(0, 0, WIN_W, WIN_H);
    const top = [32 + (tint[0] / 8 | 0), 44 + (tint[1] / 8 | 0), 86 + (tint[2] / 6 | 0)];
    for (let b = 0; b < 14; b++) {
      const f = b / 13;
      const col = lerp3(top, ARENA_B, f);
      ctx.fillStyle = rgb(col);
      ctx.fillRect(ARENA_X, BAND_TOP + b * VIEW_H / 14, VIEW_W, VIEW_H / 14 + 1);
    }
    this.glow(mx(W / 2), my(260), ms(220), tint, 9);

    if (g.finaleT > 0) {
      for (let i = 0; i < 16; i++) {
        const px = ARENA_X + 16 + i * (VIEW_W - 32) / 15;
        const tw = 8 + 4 * Math.sin(this.ticks / 8 + i);
        this.circle(px, BAND_TOP + 12, Math.max(2, tw / 2), YELLOW);
        this.circle(px, BAND_TOP + VIEW_H - 12, Math.max(2, tw / 2), YELLOW);
      }
    }

    if (g.finaleT === 0) {
      const go = g.gateOpen();
      const prog = Math.min(1, g.frame / g.gateLock());
      const gcol = go ? GREEN : [75 + (GREEN[0] - 75) * prog * 0.8, 75 + (GREEN[1] - 75) * prog * 0.8, 75 + (GREEN[2] - 75) * prog * 0.8];
      const gr = ms(TARGET_R) * (1 + (go ? 0.07 * Math.sin(this.ticks / 3) : -0.1));
      if (go) this.glow(mx(g.tx), my(g.ty), gr * 1.7, GREEN, 38);
      this.circle(mx(g.tx), my(g.ty), gr, gcol, go ? 4 : 3);
      this.circle(mx(g.tx), my(g.ty), gr * 1.3, [gcol[0]/2, gcol[1]/2, gcol[2]/2], 2);
      if (!go) {
        ctx.beginPath();
        ctx.arc(mx(g.tx), my(g.ty), gr * 1.15, Math.PI / 2 - prog * 6.2832, Math.PI / 2, true);
        ctx.strokeStyle = rgb(GREEN); ctx.lineWidth = 3; ctx.stroke();
        this.text(this.T("opening") + " " + Math.max(0, Math.floor((g.gateLock() - g.frame) / FPS)),
          mx(g.tx), my(g.ty) - gr - 16, [185, 195, 210], { size: 16 });
      } else {
        this.circle(mx(g.tx), my(g.ty), gr * 0.4, [200, 255, 220]);
      }
    }

    if (g.portal) {
      const p = g.portal;
      const pts = [[[p[0], p[1]], CYAN], [[p[2], p[3]], ORANGE]];
      for (const pt of pts) {
        const px = pt[0][0], py = pt[0][1], col = pt[1];
        this.glow(mx(px), my(py), ms(40), col, 32);
        this.circle(mx(px), my(py), ms(30), col, 4);
      }
    }

    for (const c of g.coins) {
      if (c[2]) continue;
      const cy2 = c[1] + Math.sin(this.ticks / 4 + c[0]) * 3;
      this.glow(mx(c[0]), my(cy2), ms(34), YELLOW, 36);
      this.star(mx(c[0]), my(cy2), ms(24), YELLOW);
    }

    for (const o of g.obstacles) {
      if (!o.alive) continue;
      const ox = mx(o.x), oy = my(o.y), orr = ms(o.r);
      const col = o.fragile ? FRAGILE : GRAYOB;
      const oc = o.fragile ? [255, 90, 190] : [130, 200, 240];
      if (o.fragile) this.glow(ox, oy, orr * 1.9, FRAGILE, 30);
      this.orb(ox, oy, orr, col);
      this.circle(ox, oy, orr + 2, oc, 2);
      if (o.isSatellite) {
        const dxs = Math.cos(o.spin), dys = Math.sin(o.spin);
        const off = orr * 1.5;
        for (const sgn of [-1, 1]) {
          const p1x = ox + dxs * (off - orr * 0.55) * sgn, p1y = oy + dys * (off - orr * 0.55) * sgn;
          const p2x = ox + dxs * (off + orr * 0.55) * sgn, p2y = oy + dys * (off + orr * 0.55) * sgn;
          this.line(p1x, p1y, p2x, p2y, PANEL, 7);
        }
      }
    }

    for (const l of g.lasers) {
      const ax = mx(l.x1), ay = my(l.y1), bx = mx(l.x2), by = my(l.y2);
      if (l.active(g.frame)) {
        this.line(ax, ay, bx, by, [120, 40, 40], 11);
        this.line(ax, ay, bx, by, LASERC, 5);
      } else {
        this.line(ax, ay, bx, by, [110, 55, 55], 2);
      }
    }

    for (const r of g.rockets) {
      if (r[3] > 0) {
        if (Math.floor(r[3] / 5) % 2 === 0) this.circle(mx(r[0]), my(H - 22), ms(10), [255, 150, 50]);
        continue;
      }
      const x = mx(r[0] + Math.sin(r[2]) * 12), y = my(r[1]);
      this.circle(x, y + ms(26) + Math.sin(r[2] * 3) * 3, ms(9), [255, 170, 60]);
      for (const sgn of [-1, 1]) {
        this.line(x + sgn * ms(8), y + ms(8), x + sgn * ms(15), y + ms(24), [200, 70, 60], 4);
      }
      ctx.fillStyle = "rgb(210,214,224)";
      this._roundRect(x - ms(7), y - ms(12), ms(14), ms(26), ms(6));
      ctx.fill();
      this.circle(x, y - ms(16), ms(8), [220, 80, 70]);
    }

    for (const w of g.wells) {
      const wx = w[0], wy = w[1], wr = w[2];
      const kx = mx(wx), ky = my(wy);
      for (let ri = 0; ri < 3; ri++) {
        const t = ri / 2;
        const cc = [24 + 86 * t, 16 + 54 * t, 44 + 126 * t];
        this.circle(kx, ky, ms(wr * (0.55 + 0.28 * ri)), cc, 3);
      }
      for (let i = 0; i < 6; i++) {
        const frac = (this.ticks * 0.0075 + i / 6) % 1.0;
        const orbR = wr * (1.6 - 1.5 * frac);
        const ang = this.ticks * 0.084 + i * 2.1 + frac * 10;
        const pc = [200 - 110 * frac, 190 - 130 * frac, 230 - 90 * frac];
        this.circle(mx(wx + Math.cos(ang) * orbR), my(wy + Math.sin(ang) * orbR),
          Math.max(1, ms(3 * (1 - frac) + 1)), pc);
      }
      this.circle(kx, ky, ms(wr * 0.28), [2, 2, 6]);
      if (g.finaleT === 0) this.text(TUT[this.lang][6][0], kx, ky - ms(wr) * 1.05 - 12, [225, 150, 255], { size: 16 });
    }

    if (g.finaleT > 0 && g.wells.length) {
      const w = g.wells[0];
      const elapsed = 15 * FPS - g.finaleT;
      for (let k = 0; k < 6; k++) {
        const p = this.finProg(elapsed, k);
        if (p >= 1) continue;
        const ang = 0.6 + elapsed * 0.02 + p * p * 6 - k * 0.55;
        const rad = 330 * (1 - p) + w[2] * 0.4 * p;
        const ex = w[0] + Math.cos(ang) * rad, ey = w[1] + Math.sin(ang) * rad * 0.9;
        const er = ms(ECHO_R) * (1 - p * 0.55);
        this.circle(mx(ex), my(ey), er, [12, 12, 16]);
        this.circle(mx(ex), my(ey), er + 3, ORANGE, 3);
      }
    }

    for (const pu of g.powerups) {
      const col = pu[2] === 0 ? SHIELDC : (pu[2] === 2 ? BOLTC : FREEZEC);
      const px = mx(pu[0]), py = my(pu[1] + Math.sin(this.ticks / 3 + pu[0]) * 4);
      this.glow(px, py, ms(28), col, 42);
      this.circle(px, py, ms(13), col);
      this.circle(px, py, ms(17), col, 2);
      const lbl = TUT[this.lang][pu[2] === 0 ? 3 : (pu[2] === 2 ? 5 : 4)][0];
      this.text(lbl, px, py - ms(30), col, { size: 16 });
    }

    for (const spawn of g.echoSpawns) {
      const idx = g.echoIdx(spawn);
      if (!(idx >= 0 && idx < g.hist.length)) continue;
      const ex = g.hist[idx][0], ey = g.hist[idx][1];
      const grace = idx < 45;
      const wl = g.wallLen();
      const hot = ch === 4 ? [255, 60, 40] : ORANGE;
      if (!grace) {
        const j0 = Math.max(0, idx - wl);
        for (let j = j0; j < idx; j += 5) {
          const f = (j - j0) / wl;
          const wxp = g.hist[j][0], wyp = g.hist[j][1];
          const cc = lerp3([120, 45, 15], hot, f);
          this.circle(mx(wxp), my(wyp), ms(5 * (0.45 + 0.45 * f)) + 2, cc);
        }
      }
      const er = ms(ECHO_R) * (grace ? 0.75 : 1);
      if (!grace) this.glow(mx(ex), my(ey), er * 2.3, ORANGE, 26);
      this.circle(mx(ex), my(ey), er, [12, 12, 16]);
      this.circle(mx(ex), my(ey), er + 3, ch === 4 ? hot : ORANGE, grace ? 2 : (ch === 7 ? 4 : 3));
    }

    for (let i = 0; i < g.trail.length; i += 2) {
      const idx2 = i / 2;
      const f = (idx2 + 1) / Math.max(1, g.trail.length / 2);
      const tp = g.trail[i];
      this.circle(mx(tp[0]), my(tp[1]), ms(BALL_R * 0.7 * f), BLUE);
    }
    const blink = g.inv > 0 && Math.floor(this.ticks / 5) % 2 === 0;
    if (!blink) {
      const col = g.boost > 0 ? CYAN : BLUE;
      this.glow(mx(g.bx), my(g.by), ms(BALL_R) * 2.2, col, 44);
      this.circle(mx(g.bx), my(g.by), ms(BALL_R), col);
      this.circle(mx(g.bx), my(g.by), ms(BALL_R) + 3, WHITE, 2);
      if (g.shield) this.circle(mx(g.bx), my(g.by), ms(BALL_R) + 8, SHIELDC, 3);
    }

    if (ch === 3) {
      for (let t = 0; t < 3; t++) {
        const a = (90 - t * 28) / 255, th = 30 + t * 26;
        ctx.fillStyle = `rgba(0,0,0,${a})`;
        ctx.fillRect(ARENA_X, BAND_TOP, VIEW_W, th);
        ctx.fillRect(ARENA_X, BAND_TOP + VIEW_H - th, VIEW_W, th);
        ctx.fillRect(ARENA_X, BAND_TOP, th, VIEW_H);
        ctx.fillRect(ARENA_X + VIEW_W - th, BAND_TOP, th, VIEW_H);
      }
    }
    if (g.freeze > 0) {
      ctx.fillStyle = "rgba(120,200,235,0.10)";
      ctx.fillRect(ARENA_X, BAND_TOP, VIEW_W, VIEW_H);
    }

    // ust + alt HUD bantlari (dikey/mobil-oncelikli duzen)
    ctx.fillStyle = "rgb(6,8,16)";
    ctx.fillRect(0, 0, WIN_W, BAND_TOP);
    ctx.fillRect(0, WIN_H - BAND_BOT, WIN_W, BAND_BOT);
    ctx.fillStyle = "rgb(70,150,190)";
    ctx.fillRect(0, BAND_TOP - 3, WIN_W, 3);
    ctx.fillRect(0, WIN_H - BAND_BOT, WIN_W, 3);

    const xL = WIN_W * 0.22, xC = WIN_W / 2, xR = WIN_W * 0.83;
    this.text(this.CN(ch - 1), xL, 26, [150, 220, 235], { size: 17 });
    this.text(this.T("shadow") + " X" + g.echoSpawns.length, xL, 52, ORANGE, { size: 13 });
    this.star(xL - 20, 76, 10, YELLOW);
    this.text(String(g.starsRun), xL + 14, 76, YELLOW, { size: 15 });
    this.text(this.T("score"), xC, 20, [180, 186, 198], { size: 15 });
    this.text(String(g.score), xC, 60, YELLOW, { size: 34 });
    for (let hh = 0; hh < 3; hh++) {
      const col = hh < g.lives ? HEARTC : [64, 54, 60];
      this.heart(xR - 24 + hh * 24, 26, 9, col);
    }
    this.text(this.T("ball") + " X" + g.ballsLeft, xR, 56, WHITE, { size: 15 });
    if (g.finaleT === 0) {
      const nLeft = ch * 10 - g.wave + 1;
      const msg2 = this.T("gates_left").replace("{0}", this.CN(ch - 1)).replace("{1}", nLeft);
      this.text(msg2, xC, 104, [200, 212, 232], { size: 13 });
    }

    this.text(this.T("chapter") + " " + ch + ": " + this.CN(ch - 1), xC, WIN_H - BAND_BOT + 38, [220, 230, 243], { size: 22 });
    this.text(this.T("wave") + " " + g.wave, xC, WIN_H - BAND_BOT + 74, [220, 230, 243], { size: 22 });
    this.text("KARAKUZU GAMES", xC, WIN_H - 14, [110, 125, 148], { size: 13 });

    // ATAK: arenanin sag-alt kosesinde yuzen dairesel aksiyon dugmesi (mobil konvansiyonu)
    {
      const dcx = VIEW_W - 62, dcy = BAND_TOP + VIEW_H - 78, dr = 44;
      const ready = g.dashCd <= 0;
      const dcol = ready ? [120, 230, 150] : [90, 100, 120];
      ctx.fillStyle = "rgba(10,16,30,0.75)";
      ctx.beginPath(); ctx.arc(dcx, dcy, dr, 0, 7); ctx.fill();
      ctx.strokeStyle = rgb(dcol); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(dcx, dcy, dr, 0, 7); ctx.stroke();
      if (ready) this.text(this.T("dash_btn"), dcx, dcy, dcol, { size: 18 });
      else this.text(String(Math.floor(g.dashCd / FPS) + 1), dcx, dcy, dcol, { size: 24 });
      this.dashBtnRect = { x: dcx - dr, y: dcy - dr, w: dr * 2, h: dr * 2 };
    }

    if (this.ticks - this.msgT < 150 && this.msg) {
      const tw = this.textWidth(this.msg, 20), th2 = 20;
      ctx.fillStyle = "rgba(4,7,15,0.68)";
      ctx.fillRect(WIN_W / 2 - tw / 2 - 14, BAND_TOP + 34 - th2 / 2 - 6, tw + 28, th2 + 12);
      this.text(this.msg, WIN_W / 2, BAND_TOP + 34, [255, 190, 120], { size: 20 });
    }

    if (g.frame < 120 && g.finaleT === 0) {
      this.text(this.CN(ch - 1), WIN_W / 2, BAND_TOP + VIEW_H / 2 - 30,
        [Math.min(255, tint[0] + 90), Math.min(255, tint[1] + 90), Math.min(255, tint[2] + 90)], { size: 26 });
      this.text(this.CR(ch - 1), WIN_W / 2, BAND_TOP + VIEW_H / 2 + 6, [230, 200, 120], { size: 20 });
    }
    if (g.finaleT > 0) this.text(this.T("bonus") + " " + (Math.floor(g.finaleT / FPS) + 1), WIN_W / 2, BAND_TOP + 60, YELLOW, { size: 26 });

    // ust-sol duraklat dugmesi: dokunmatikte ESC tusu karsiligi, her zaman erisilebilir olmali
    {
      const px = 32, py = 32, pr = 27;   // >=48dp dokunma hedefine yakin (best practice)
      ctx.fillStyle = "rgba(10,16,30,0.75)";
      ctx.beginPath(); ctx.arc(px, py, pr, 0, 7); ctx.fill();
      ctx.strokeStyle = "rgb(150,165,190)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(px, py, pr, 0, 7); ctx.stroke();
      if (this.paused) {
        ctx.beginPath(); ctx.moveTo(px - 6, py - 8); ctx.lineTo(px + 8, py); ctx.lineTo(px - 6, py + 8); ctx.closePath();
        ctx.fillStyle = "rgb(150,165,190)"; ctx.fill();
      } else {
        ctx.fillStyle = "rgb(150,165,190)";
        ctx.fillRect(px - 7, py - 8, 5, 16); ctx.fillRect(px + 2, py - 8, 5, 16);
      }
      this.pauseBtnRect = { x: px - pr, y: py - pr, w: pr * 2, h: pr * 2 };
    }

    if (this.paused) {
      ctx.fillStyle = "rgba(0,0,0,0.67)";
      ctx.fillRect(0, 0, WIN_W, WIN_H);
      this.text(this.T("paused"), WIN_W / 2, WIN_H / 2 - 100, CYAN, { size: 42 });
      this.text(this.T("paused_hint"), WIN_W / 2, WIN_H / 2 - 44, WHITE, { size: 17 });
      this.pauseMenuRect = { x: WIN_W / 2 - 210, y: WIN_H / 2 + 10, w: 190, h: 64 };
      this.pauseRestartRect = { x: WIN_W / 2 + 20, y: WIN_H / 2 + 10, w: 190, h: 64 };
      this.button(this.pauseMenuRect, this.T("pause_menu_btn"), CYAN);
      this.button(this.pauseRestartRect, this.T("over_restart"), [226, 120, 90]);
    }
  }

  drawLangButtons() {
    for (const rc of [[this.trRect, "TR"], [this.enRect, "EN"]]) {
      const rect = rc[0], code = rc[1];
      const on = this.lang === code;
      const ctx = this.ctx;
      ctx.fillStyle = on ? "rgb(40,60,110)" : "rgb(16,24,48)";
      this._roundRect(rect.x, rect.y, rect.w, rect.h, 10); ctx.fill();
      ctx.strokeStyle = on ? rgb(YELLOW) : "rgb(90,110,150)"; ctx.lineWidth = 3;
      this._roundRect(rect.x, rect.y, rect.w, rect.h, 10); ctx.stroke();
      this.text(code, rect.x + rect.w / 2, rect.y + rect.h / 2, on ? WHITE : [170, 185, 205], { size: 20 });
    }
  }

  drawMenu() {
    const ctx = this.ctx;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, WIN_W, WIN_H);
    for (let i = 0; i < 60; i++) {
      const x = (i * 337) % WIN_W, y = (i * 691) % WIN_H;
      this.circle(x, y, 1 + (i % 2), [200, 214, 255]);
    }

    const cx = WIN_W / 2;
    this.drawLangButtons();
    this.text(this.T("title"), cx, 100, CYAN, { size: 36 });
    this.text(this.T("slogan"), cx, 148, [185, 205, 225], { size: 17 });
    this.circle(cx, 278, 92, [236, 192, 52]);
    this.text(this.T("play"), cx, 278, [60, 44, 8], { size: 38 });
    this.text(this.T("menu_info").replace("{0}", this.maxChapter).replace("{1}", this.high),
      cx, 410, [235, 205, 125], { size: 17 });
    this.text(this.T("menu_keys"), cx, 444, [185, 200, 220], { size: 15 });
    this.drawLogo(cx, 520, 130);

    // NASIL OYNANIR: tek satirlik ikon+baslik+aciklama listesi (genis tuvalde satir basina sigar)
    this.text(GUIDE_TITLE[this.lang], cx, 610, CYAN, { size: 22 });
    this.watchAgainRect = { x: cx - 90, y: 630, w: 180, h: 38 };
    ctx.fillStyle = "rgba(70,150,190,0.15)";
    this._roundRect(this.watchAgainRect.x, this.watchAgainRect.y, this.watchAgainRect.w, this.watchAgainRect.h, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(120,200,235,0.7)"; ctx.lineWidth = 2;
    this._roundRect(this.watchAgainRect.x, this.watchAgainRect.y, this.watchAgainRect.w, this.watchAgainRect.h, 10);
    ctx.stroke();
    this.text(this.T("watch_again"), cx, this.watchAgainRect.y + this.watchAgainRect.h / 2, [150, 220, 245], { size: 16 });
    ctx.strokeStyle = "rgba(70,150,190,0.5)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, 686); ctx.lineTo(WIN_W - 40, 686); ctx.stroke();
    let gy = 714;
    const guide = GUIDE[this.lang];
    for (let i = 0; i < guide.length; i++) {
      const title = guide[i][0], desc = guide[i][1];
      this.guideIcon(i, 38, gy);
      this.text(title, 64, gy, YELLOW, { size: 17, center: false });
      const tw = this.textWidth(title, 17);
      this.text(desc, 64 + tw + 12, gy, [195, 208, 226], { size: 15, center: false });
      gy += 45;
    }
  }

  drawBreak() {
    const ctx = this.ctx;
    ctx.fillStyle = BG; ctx.fillRect(0, 0, WIN_W, WIN_H);
    const i = this.breakIdx;
    this.drawLogo(WIN_W / 2, 290, 130);
    this.text(this.T("chapter") + " " + (i + 1) + " " + this.T("done"), WIN_W / 2, 380, [130, 205, 225], { size: 20 });
    this.text(CH_DONE[this.lang][i], WIN_W / 2, 450, [255, 220, 90], { size: 26 });
    for (let k = 0; k < 3; k++) this.star(WIN_W / 2 - 70 + k * 70, 530, 22, YELLOW);
    const q = CH_QUOTE[this.lang][i].split("|");
    this.text(q[0], WIN_W / 2, 640, WHITE, { size: 26 });
    if (q.length > 1) this.text(q[1], WIN_W / 2, 680, WHITE, { size: 26 });
    const nx = Math.min(i + 1, 9);
    this.text(this.T("next_ch") + ": " + this.CN(nx), WIN_W / 2, 800, [185, 205, 225], { size: 20 });
    this.text(this.CR(nx), WIN_W / 2, 836, [232, 202, 125], { size: 20 });
    this.text(this.T("cont"), WIN_W / 2, 980, GREEN, { size: 26 });
  }

  drawOver() {
    const ctx = this.ctx;
    ctx.fillStyle = BG; ctx.fillRect(0, 0, WIN_W, WIN_H);
    this.drawLogo(WIN_W / 2, 327, 130);
    this.text(this.T("over"), WIN_W / 2, 412, [226, 75, 74], { size: 42 });
    this.text(this.T("reached") + ": " + this.g.wave, WIN_W / 2, 492, CYAN, { size: 26 });
    this.text(this.T("total") + ": " + this.g.score, WIN_W / 2, 537, YELLOW, { size: 26 });
    this.text(this.T("record") + ": " + this.high, WIN_W / 2, 582, [185, 200, 215], { size: 20 });
    this.button(this.overContRect, this.T("over_continue"), GREEN, this.T("over_continue_sub"));
    this.button(this.overRestartRect, this.T("over_restart"), [226, 120, 90]);
    this.text(this.T("over_keys"), WIN_W / 2, 907, [150, 165, 185], { size: 16 });
  }

  drawWon() {
    const ctx = this.ctx;
    ctx.fillStyle = BG; ctx.fillRect(0, 0, WIN_W, WIN_H);
    const t = (this.ticks - this.wonT) / FPS;
    this.drawLogo(WIN_W / 2, 337, 130);
    this.text(this.T("won"), WIN_W / 2, 409, [255, 225, 90], { size: 42 });
    this.text(this.T("won_sub"), WIN_W / 2, 464, [214, 226, 238], { size: 20 });
    const q = CH_QUOTE[this.lang][9].split("|");
    this.text(q[0], WIN_W / 2, 534, WHITE, { size: 26 });
    this.text(q[1], WIN_W / 2, 574, WHITE, { size: 26 });
    this.circle(WIN_W / 2, 689, 46, [250, 216, 100]);
    this.circle(WIN_W / 2, 689, 52, WHITE, 3);
    this.text(this.T("total") + ": " + this.g.score, WIN_W / 2, 799, YELLOW, { size: 26 });
    this.text(this.T("credit"), WIN_W / 2, 849, [185, 198, 215], { size: 20 });
    if (t > 2) this.text(this.T("won_key"), WIN_W / 2, 919, CYAN, { size: 26 });
  }

  start(chapter) {
    this.sfx.resume();
    this.sfx.play("click");
    this.g = new Game(chapter || 1);
    this.paused = false;
    this.scene = "PLAY";
  }

  // OYNA'ya basınca: ilk kez oynayan biriyse önce otomatik "NASIL OYNANIR" gösterimi, sonra gerçek dalga 1
  playPressed() {
    this.sfx.resume();
    if (!this.introSeen) this.startDemo();
    else this.start(1);
  }

  // ============ NASIL OYNANIR: otomatik oynanan, yavaş akan tam tanıtım (gerçek istatistik/ilerleme yok) ============
  // Sure sabit degil - asagidaki "beat" listesinin toplam uzunlugu neyse o kadar surer.
  static DEMO_BEATS = [
    ["demo_b1", 150],   // bu sensin
    ["demo_b2", 260],   // golgen 2.5sn once
    ["demo_b3", 190],   // dokunursan can kaybedersin (sahnelenmis vurus)
    ["demo_b4", 210],   // fuzeler
    ["demo_b5", 210],   // donen uydular
    ["demo_b6", 210],   // kalkan
    ["demo_b7", 210],   // donma
    ["demo_b8", 210],   // hizlanma
    ["demo_b9", 210],   // atak/dash
    ["demo_b10", 160],  // yildiz -> gecit erken acilir
    ["demo_b11", 160],  // yildiz -> yeni golge
    ["demo_b12", 260],  // gecit: dolar, acilir, girilir
    ["demo_b13", 130],  // hazir misin
  ];

  startDemo() {
    this.scene = "DEMO";
    this.demoSkipRect = { x: WIN_W - 110, y: 12, w: 98, h: 40 };
    let t = 0;
    const beats = App.DEMO_BEATS.map(([key, len]) => { const b = { key, start: t, end: t + len }; t += len; return b; });
    const at = (key, offset) => beats.find(b => b.key === key).start + (offset || 0);
    this.demo = {
      frame: 0, total: t, beats, finished: false,
      hist: [], echoSpawns: [150],
      rocket: { x: 620, y: 0 },
      sat: { x: 190, y: 950, r: 26, spin: 0 },
      star: { x: 250, y: 300, got: false, gotFrame: at("demo_b10", 60) },
      shieldPU: { x: 560, y: 260, got: false, gotFrame: at("demo_b6", 80) },
      freezePU: { x: 180, y: 1080, got: false, gotFrame: at("demo_b7", 80) },
      speedPU: { x: 600, y: 1150, got: false, gotFrame: at("demo_b8", 80) },
      gate: { x: 400, y: 640, entered: false },
      hitFrame: at("demo_b3", 90),
      dashFrame: at("demo_b9", 90),
      rocketStart: at("demo_b4"), rocketEnd: beats.find(b => b.key === "demo_b4").end,
      gateChargeStart: at("demo_b12"), gateEnterFrame: at("demo_b12", 190),
      hitFlash: 0, dashFlash: 0,
      fired: {},
    };
  }

  endDemo() {
    this.introSeen = true;
    this.saveNow();
    this.start(1);
  }

  // Yavas, sakip takip edilebilir genis bir gezinme yolu (uzun tanitim boyunca tekrarlanir)
  demoPos(t) {
    return [400 + 210 * Math.sin(t * 0.007), 620 + 320 * Math.cos(t * 0.005)];
  }

  stepDemo() {
    const d = this.demo;
    if (d.finished) return;
    const [bx, by] = this.demoPos(d.frame);
    d.bx = bx; d.by = by;
    d.hist.push([bx, by]);
    if (d.hitFlash > 0) d.hitFlash--;
    if (d.dashFlash > 0) d.dashFlash--;
    d.sat.spin += 0.012;

    if (d.frame === d.hitFrame) { this.sfx.play("hit"); d.hitFlash = 24; }
    if (d.frame === d.dashFrame) { this.sfx.play("dash"); d.dashFlash = 30; }
    if (d.frame === d.star.gotFrame) { this.sfx.play("star"); d.star.got = true; }
    if (d.frame === d.shieldPU.gotFrame) { this.sfx.play("power"); d.shieldPU.got = true; }
    if (d.frame === d.freezePU.gotFrame) { this.sfx.play("freeze"); d.freezePU.got = true; }
    if (d.frame === d.speedPU.gotFrame) { this.sfx.play("boost"); d.speedPU.got = true; }
    if (d.frame === d.gateEnterFrame) { this.sfx.play("gate"); this.sfx.play("wave"); d.gate.entered = true; }

    d.frame++;
    if (d.frame >= d.total) { d.finished = true; this.introSeen = true; this.saveNow(); }
  }

  demoActiveBeat() {
    const f = this.demo.frame;
    return this.demo.beats.find(b => f >= b.start && f < b.end) || this.demo.beats[this.demo.beats.length - 1];
  }

  drawDemo() {
    const ctx = this.ctx;
    const d = this.demo;

    ctx.fillStyle = "rgb(6,8,16)"; ctx.fillRect(0, 0, WIN_W, WIN_H);
    const top = [46, 58, 106], bot = ARENA_B;
    for (let b = 0; b < 14; b++) {
      const f = b / 13;
      ctx.fillStyle = rgb(lerp3(top, bot, f));
      ctx.fillRect(0, DEMO_TOP + b * DEMO_ARENA_H / 14, VIEW_W, DEMO_ARENA_H / 14 + 1);
    }

    const shieldActive = d.shieldPU.got && d.frame < d.beats.find(b => b.key === "demo_b6").end;
    const freezeActive = d.freezePU.got && d.frame < d.freezePU.gotFrame + 110;
    const speedActive = d.speedPU.got && d.frame < d.speedPU.gotFrame + 140;

    // gecit: b12'de dolar, acilir, girilir - oncesinde kapali/gri durur
    {
      const gb = d.beats.find(b => b.key === "demo_b12");
      const chargeProg = Math.max(0, Math.min(1, (d.frame - gb.start) / 130));
      const open = d.frame >= d.gateEnterFrame - 15;
      const gcol = open ? GREEN : [75 + (GREEN[0] - 75) * chargeProg, 75 + (GREEN[1] - 75) * chargeProg, 75 + (GREEN[2] - 75) * chargeProg];
      if (open) this.glow(mx(d.gate.x), dmy(d.gate.y), ms(TARGET_R) * 1.7, GREEN, 38);
      this.circle(mx(d.gate.x), dmy(d.gate.y), ms(TARGET_R), gcol, open ? 4 : 3);
      if (!open && d.frame >= gb.start) {
        ctx.beginPath();
        ctx.arc(mx(d.gate.x), dmy(d.gate.y), ms(TARGET_R) * 1.15, -Math.PI / 2, -Math.PI / 2 + chargeProg * 6.2832);
        ctx.strokeStyle = rgb(GREEN); ctx.lineWidth = 3; ctx.stroke();
      }
      if (d.gate.entered) this.circle(mx(d.gate.x), dmy(d.gate.y), ms(TARGET_R) * 0.4, [200, 255, 220]);
    }

    // uydu (donen panelli engel) - b5'ten itibaren gorunur, sonrasinda da arka planda kalir
    if (d.frame >= d.beats.find(b => b.key === "demo_b5").start) {
      const ox = mx(d.sat.x), oy = dmy(d.sat.y), orr = ms(d.sat.r);
      this.orb(ox, oy, orr, GRAYOB);
      this.circle(ox, oy, orr + 2, [130, 200, 240], 2);
      const dxs = Math.cos(d.sat.spin), dys = Math.sin(d.sat.spin), off = orr * 1.5;
      for (const sgn of [-1, 1]) {
        this.line(ox + dxs * (off - orr * 0.55) * sgn, oy + dys * (off - orr * 0.55) * sgn,
                  ox + dxs * (off + orr * 0.55) * sgn, oy + dys * (off + orr * 0.55) * sgn, PANEL, 7);
      }
    }

    // fuze - sadece kendi bolumunde asagidan yukari yukselir
    if (d.frame >= d.rocketStart && d.frame <= d.rocketEnd) {
      const prog = (d.frame - d.rocketStart) / (d.rocketEnd - d.rocketStart);
      const ry = H + 60 - prog * (H + 140);
      const rx = mx(d.rocket.x + Math.sin(d.frame * 0.1) * 12), ryS = dmy(ry);
      this.circle(rx, ryS + ms(26), ms(9), [255, 170, 60]);
      for (const sgn of [-1, 1]) this.line(rx + sgn * ms(8), ryS + ms(8), rx + sgn * ms(15), ryS + ms(24), [200, 70, 60], 4);
      ctx.fillStyle = "rgb(210,214,224)";
      this._roundRect(rx - ms(7), ryS - ms(12), ms(14), ms(26), ms(6)); ctx.fill();
      this.circle(rx, ryS - ms(16), ms(8), [220, 80, 70]);
    }

    // yildiz
    if (!d.star.got) { this.glow(mx(d.star.x), dmy(d.star.y), ms(34), YELLOW, 36); this.star(mx(d.star.x), dmy(d.star.y), ms(24), YELLOW); }
    // kalkan
    if (!d.shieldPU.got) {
      this.glow(mx(d.shieldPU.x), dmy(d.shieldPU.y), ms(28), SHIELDC, 42);
      this.circle(mx(d.shieldPU.x), dmy(d.shieldPU.y), ms(13), SHIELDC); this.circle(mx(d.shieldPU.x), dmy(d.shieldPU.y), ms(17), SHIELDC, 2);
    }
    // donma
    if (!d.freezePU.got) {
      this.glow(mx(d.freezePU.x), dmy(d.freezePU.y), ms(28), FREEZEC, 42);
      this.circle(mx(d.freezePU.x), dmy(d.freezePU.y), ms(13), FREEZEC); this.circle(mx(d.freezePU.x), dmy(d.freezePU.y), ms(17), FREEZEC, 2);
    }
    // hizlanma
    if (!d.speedPU.got) {
      this.glow(mx(d.speedPU.x), dmy(d.speedPU.y), ms(28), BOLTC, 42);
      this.circle(mx(d.speedPU.x), dmy(d.speedPU.y), ms(13), BOLTC); this.circle(mx(d.speedPU.x), dmy(d.speedPU.y), ms(17), BOLTC, 2);
    }

    if (freezeActive) { ctx.fillStyle = "rgba(120,200,235,0.14)"; ctx.fillRect(0, DEMO_TOP, VIEW_W, DEMO_ARENA_H); }

    // golgenin izi + golge
    for (const spawn of d.echoSpawns) {
      const idx = d.frame - spawn;
      if (idx >= 0 && idx < d.hist.length) {
        const ex = d.hist[idx][0], ey = d.hist[idx][1];
        const grace = idx < 45;
        const er = ms(ECHO_R) * (grace ? 0.75 : 1);
        if (!grace) this.glow(mx(ex), dmy(ey), er * 2.3, ORANGE, 26);
        this.circle(mx(ex), dmy(ey), er, [12, 12, 16]);
        this.circle(mx(ex), dmy(ey), er + 3, ORANGE, grace ? 2 : 3);
      }
    }

    // iz + top
    for (let i = 0; i < d.hist.length; i += 2) {
      const f2 = (i / 2 + 1) / Math.max(1, d.hist.length / 2);
      const tp = d.hist[i];
      this.circle(mx(tp[0]), dmy(tp[1]), ms(BALL_R * 0.7 * f2), speedActive ? CYAN : BLUE);
    }
    const ballCol = d.hitFlash > 0 && Math.floor(d.hitFlash / 4) % 2 === 0 ? [255, 90, 90] : (speedActive ? CYAN : BLUE);
    this.glow(mx(d.bx), dmy(d.by), ms(BALL_R) * 2.2, ballCol, 44);
    this.circle(mx(d.bx), dmy(d.by), ms(BALL_R), ballCol);
    this.circle(mx(d.bx), dmy(d.by), ms(BALL_R) + 3, WHITE, 2);
    if (shieldActive) this.circle(mx(d.bx), dmy(d.by), ms(BALL_R) + 8, SHIELDC, 3);

    // ATAK dugmesi (gercek oyunla ayni konum) + tanitim aninda parlama
    {
      const dcx = VIEW_W - 62, dcy = DEMO_TOP + DEMO_ARENA_H - 78, dr = 44;
      const pulsing = Math.abs(d.frame - d.dashFrame) < 45;
      ctx.fillStyle = "rgba(10,16,30,0.75)";
      ctx.beginPath(); ctx.arc(dcx, dcy, dr, 0, 7); ctx.fill();
      if (pulsing) this.glow(dcx, dcy, dr * 2, [120, 230, 150], 60 + 40 * Math.sin(d.frame / 3));
      ctx.strokeStyle = pulsing ? "rgb(160,255,190)" : "rgb(120,230,150)";
      ctx.lineWidth = pulsing ? 5 : 3;
      ctx.beginPath(); ctx.arc(dcx, dcy, dr, 0, 7); ctx.stroke();
      this.text(this.T("dash_btn"), dcx, dcy, [120, 230, 150], { size: 18 });
    }

    // ust: buyuk, okunakli aciklama bandi (arenanin USTUNE binmez, ayri kendi bandi)
    const capH = DEMO_TOP;
    ctx.fillStyle = "rgb(6,8,16)"; ctx.fillRect(0, 0, WIN_W, capH);
    ctx.fillStyle = "rgb(70,150,190)"; ctx.fillRect(0, capH - 3, WIN_W, 3);
    this.text(this.T("demo_title"), WIN_W / 2, 24, CYAN, { size: 19 });
    const beat = this.demoActiveBeat();
    const lines = this.wrap(this.T(beat.key), WIN_W - 60, 28);
    let cy = lines.length > 1 ? 92 : 120;
    for (const line of lines) { this.text(line, WIN_W / 2, cy, [255, 220, 140], { size: 28 }); cy += 38; }
    // ilerleme cubugu: ne kadar kaldigini gosterir
    const pw = WIN_W - 80;
    ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(40, capH - 16, pw, 5);
    ctx.fillStyle = "rgb(120,200,235)"; ctx.fillRect(40, capH - 16, pw * Math.min(1, d.frame / d.total), 5);
    this.text(this.T("demo_skip"), this.demoSkipRect.x + this.demoSkipRect.w / 2,
      this.demoSkipRect.y + this.demoSkipRect.h / 2, [210, 220, 235], { size: 16 });
    ctx.strokeStyle = "rgba(150,165,190,0.7)"; ctx.lineWidth = 2;
    this._roundRect(this.demoSkipRect.x, this.demoSkipRect.y, this.demoSkipRect.w, this.demoSkipRect.h, 10);
    ctx.stroke();

    // alt bant
    ctx.fillStyle = "rgb(6,8,16)"; ctx.fillRect(0, WIN_H - BAND_BOT, WIN_W, BAND_BOT);
    ctx.fillStyle = "rgb(70,150,190)"; ctx.fillRect(0, WIN_H - BAND_BOT, WIN_W, 3);
    this.text(this.T("demo_title"), WIN_W / 2, WIN_H - BAND_BOT + 60, [140, 150, 170], { size: 16 });

    // tanitim bitince: TEKRAR IZLE / OYUNA BASLA secim ekrani
    if (d.finished) {
      ctx.fillStyle = "rgba(0,0,0,0.72)"; ctx.fillRect(0, 0, WIN_W, WIN_H);
      this.demoReplayRect = { x: WIN_W / 2 - 210, y: WIN_H / 2 - 30, w: 190, h: 70 };
      this.demoStartRect = { x: WIN_W / 2 + 20, y: WIN_H / 2 - 30, w: 190, h: 70 };
      this.button(this.demoReplayRect, this.T("demo_replay"), CYAN);
      this.button(this.demoStartRect, this.T("demo_start"), [120, 230, 150]);
    }
  }

  continueFromOver() {
    this.sfx.play("click");
    this.g.continueRun();
    this.paused = false;
    this.scene = "PLAY";
  }

  // ---- bölüm arası geçiş reklamı (her 10 dalgada bir, dogal duraklama noktasi) ----
  async showChapterAd() {
    if (!window.ytShowInterstitial) return;
    this.sfx.suspend();
    try { await window.ytShowInterstitial(); } catch (e) {}
    this.sfx.unsuspend();
  }

  // ---- ekran koordinatindan mantik koordinatina cevir (canvas CSS olcegini hesaba katar) ----
  _toLogical(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = WIN_W / rect.width, scaleY = WIN_H / rect.height;
    return [(clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY];
  }
  _inRect(x, y, r) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }

  _handlePrimary(x, y) {
    if (this.scene === "MENU") {
      if (this._inRect(x, y, this.trRect)) { this.lang = "TR"; this.saveNow(); }
      else if (this._inRect(x, y, this.enRect)) { this.lang = "EN"; this.saveNow(); }
      else if (this.watchAgainRect && this._inRect(x, y, this.watchAgainRect)) this.startDemo();
      else if (y < 600) this.playPressed();   // rehber listesine (asagida) tiklamak baslatmaz
    } else if (this.scene === "BREAK") {
      this.scene = "PLAY";
    } else if (this.scene === "OVER") {
      if (this._inRect(x, y, this.overContRect)) this.continueFromOver();
      else if (this._inRect(x, y, this.overRestartRect)) this.start(1);
    } else if (this.scene === "WON") {
      this.scene = "MENU";
    } else if (this.scene === "DEMO") {
      if (this.demo.finished) {
        if (this.demoReplayRect && this._inRect(x, y, this.demoReplayRect)) this.startDemo();
        else if (this.demoStartRect && this._inRect(x, y, this.demoStartRect)) this.start(1);
      } else if (this._inRect(x, y, this.demoSkipRect)) this.endDemo();
    } else if (this.scene === "PLAY") {
      if (this.pauseBtnRect && this._inRect(x, y, this.pauseBtnRect)) { this.paused = !this.paused; return; }
      if (this.paused) {
        if (this.pauseMenuRect && this._inRect(x, y, this.pauseMenuRect)) { this.scene = "MENU"; this.paused = false; }
        else if (this.pauseRestartRect && this._inRect(x, y, this.pauseRestartRect)) this.start(1);
        return;   // duraklatilmisken arenaya dokunmak atagi tetiklemesin
      }
      if (this._inRect(x, y, this.dashBtnRect)) this.tryDash(x, y);
    }
  }

  _bindInput() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
      this.sfx.resume();
      if (this.scene === "MENU") {
        if (e.code === "Enter" || e.code === "Space") this.playPressed();
        else if (e.code >= "Digit1" && e.code <= "Digit9") {
          const n = parseInt(e.code.slice(5), 10);
          if (n <= this.maxChapter) this.start(n);
        } else if (e.code === "Digit0" && this.maxChapter >= 10) this.start(10);
      } else if (this.scene === "PLAY") {
        if (e.code === "Escape") this.paused = !this.paused;
        else if (this.paused && e.code === "KeyM") this.scene = "MENU";
        else if (this.paused && e.code === "KeyR") this.start(1);
      } else if (this.scene === "BREAK" && (e.code === "Enter" || e.code === "Space")) {
        this.scene = "PLAY";
      } else if (this.scene === "OVER") {
        if (e.code === "Enter" || e.code === "Space") this.continueFromOver();
        else if (e.code === "KeyR") this.start(1);
        else if (e.code === "KeyM" || e.code === "Escape") this.scene = "MENU";
      } else if (this.scene === "WON" && (e.code === "Enter" || e.code === "Escape")) {
        this.scene = "MENU";
      } else if (this.scene === "DEMO") {
        if (this.demo.finished) {
          if (e.code === "Enter" || e.code === "Space") this.start(1);
          else if (e.code === "Escape") this.startDemo();
        } else if (e.code === "Enter" || e.code === "Space" || e.code === "Escape") {
          this.endDemo();
        }
      }
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code)) e.preventDefault();
    });
    window.addEventListener("keyup", (e) => { this.keys[e.code] = false; });

    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    this.canvas.addEventListener("mousedown", (e) => {
      this.sfx.resume();
      const [x, y] = this._toLogical(e.clientX, e.clientY);
      if (e.button === 2) {
        if (this.scene === "PLAY" && !this.paused) this.tryDash(x, y);
      } else {
        this.mouse.down = true; this.mouse.x = x; this.mouse.y = y;
        this._handlePrimary(x, y);
      }
    });
    window.addEventListener("mousemove", (e) => {
      const [x, y] = this._toLogical(e.clientX, e.clientY);
      this.mouse.x = x; this.mouse.y = y;
    });
    window.addEventListener("mouseup", () => { this.mouse.down = false; });

    // dokunma: surukleyerek hareket (sol tik gibi); ATAK butonu dokunmayla da calisir
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.sfx.resume();
      const t = e.changedTouches[0];
      const [x, y] = this._toLogical(t.clientX, t.clientY);
      this.mouse.down = true; this.mouse.x = x; this.mouse.y = y;
      this._handlePrimary(x, y);
    }, { passive: false });
    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      const [x, y] = this._toLogical(t.clientX, t.clientY);
      this.mouse.x = x; this.mouse.y = y;
    }, { passive: false });
    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.mouse.down = false;
    }, { passive: false });

    // resize: canvas'i pencereye orantili sigdir (pillarbox/letterbox, ic cozunurluk sabit)
    window.addEventListener("resize", () => this.fitCanvas());
    window.addEventListener("orientationchange", () => this.fitCanvas());
    this.fitCanvas();
  }

  fitCanvas() {
    const scale = Math.min(window.innerWidth / WIN_W, window.innerHeight / WIN_H);
    this.canvas.style.width = Math.round(WIN_W * scale) + "px";
    this.canvas.style.height = Math.round(WIN_H * scale) + "px";
  }

  draw() {
    if (this.scene === "MENU") this.drawMenu();
    else if (this.scene === "PLAY") this.drawPlay();
    else if (this.scene === "BREAK") this.drawBreak();
    else if (this.scene === "OVER") this.drawOver();
    else if (this.scene === "WON") this.drawWon();
    else if (this.scene === "DEMO") this.drawDemo();
  }

  // sabit 60Hz mantik adimi (frame-sayimina dayali tum zamanlayicilar bu yuzden dogru kalir)
  update() {
    if (this.scene === "PLAY" && !this.paused) this.step();
    else if (this.scene === "DEMO") this.stepDemo();
    if (this.scene === "MENU") this.sfx.updateMusic(this.sfx.menuMusic);
    else if (this.g) this.sfx.updateMusic(this.g.wave >= 10 ? this.sfx.gameMusicIntense : this.sfx.gameMusic);
    this.ticks += 1;
  }
  render() { this.draw(); }
}

// ============================ ANA DONGU (sabit 60fps mantik, degisken render) ============================
window.GolgeApp = null;
window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game");
  const dpr = window.devicePixelRatio || 1;   // yuksek yogunluklu ekranlarda bulanik gorunmesin
  canvas.width = Math.round(WIN_W * dpr); canvas.height = Math.round(WIN_H * dpr);
  canvas.getContext("2d").scale(dpr, dpr);
  const app = new App(canvas);
  window.GolgeApp = app;

  let last = performance.now();
  let acc = 0;
  let firstFrameDone = false;
  const STEP = 1 / FPS;
  function frame(now) {
    requestAnimationFrame(frame);
    if (app.systemPaused) { last = now; return; }   // YouTube onPause: hicbir sey calismaz/cizilmez
    let dt = (now - last) / 1000;
    if (dt > 0.25) dt = 0.25;
    last = now;
    acc += dt;
    let steps = 0;
    while (acc >= STEP && steps < 5) { app.update(); acc -= STEP; steps++; }
    app.render();
    if (!firstFrameDone) {
      firstFrameDone = true;
      if (window.ytFirstFrame) window.ytFirstFrame();
    }
  }
  requestAnimationFrame(frame);
});
