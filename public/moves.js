// Animated exercise demos: key poses for a stick figure, one set per exercise.
// Coordinates are in a 200 × 160 box (floor at y = 150), side view facing right unless `front: true`.
// Each pose gives neck (n), hip (h), front/back hand (hf/hb) and foot (ff/fb). Elbows and knees are solved
// automatically (two-bone IK) toward a bend hint (ei / ki), or given directly (ef, eb, kf, kb).
// `sp` curves the spine (+ arches up, − sags), `hd` places the head directly, `hold` pauses on a pose.
(function (root) {
  const STAND = { n: [100, 46], h: [100, 90], hf: [101, 92], hb: [99, 92], ff: [102, 150], fb: [98, 150] };
  const PLANK_TOP = { n: [137, 106], h: [97, 124], hf: [140, 150], hb: [136, 150], ff: [42, 150], fb: [40, 150], ei: [-1, -1] };
  const TABLE = { n: [130, 104], h: [84, 120], hf: [134, 150], hb: [130, 150], kf: [86, 150], kb: [82, 150], ff: [52, 150], fb: [50, 150] };
  const LIE = { n: [56, 142], h: [100, 144] }; // on the back, head to the left
  const pedal = (deg) => [100 + 14 * Math.cos((deg * Math.PI) / 180), 128 + 14 * Math.sin((deg * Math.PI) / 180)];
  const bike = (a) => ({ n: [118, 60], h: [90, 98], hf: [140, 78], hb: [138, 78], ei: [0, 1], ki: [1, -1], ff: pedal(a), fb: pedal(a + 180) });

  const MOVES = {
    // ---------- Legs ----------
    bodyweightSquat: {
      frames: [
        { ...STAND, label: "Stand tall, feet shoulder-width" },
        { n: [104, 82], h: [78, 118], hf: [146, 74], hb: [144, 76], ff: [102, 150], fb: [98, 150], label: "Sit back & down, arms forward" },
      ],
    },
    gobletSquat: {
      props: [{ t: "kb" }],
      frames: [
        { ...STAND, hf: [114, 62], hb: [112, 64], ei: [0, 1], label: "Hold the weight at your chest" },
        { n: [102, 80], h: [80, 118], hf: [118, 94], hb: [116, 96], ff: [102, 150], fb: [98, 150], ei: [0, 1], label: "Squat until hips reach knee height" },
      ],
    },
    backSquat: {
      props: [{ t: "plate" }],
      frames: [
        { ...STAND, hf: [96, 50], hb: [94, 52], ei: [0, 1], label: "Bar on upper back, brace" },
        { n: [102, 80], h: [80, 118], hf: [98, 84], hb: [96, 86], ff: [102, 150], fb: [98, 150], ei: [0, 1], label: "Sit down to parallel, drive up" },
      ],
    },
    romanianDeadlift: {
      props: [{ t: "db" }],
      frames: [
        { ...STAND, hf: [104, 92], hb: [102, 92], label: "Stand tall, weights at thighs" },
        { n: [129, 82], h: [86, 92], hf: [131, 128], hb: [129, 128], ff: [102, 150], fb: [98, 150], label: "Push hips back, flat back" },
      ],
    },
    walkingLunge: {
      props: [{ t: "db" }],
      frames: [
        { ...STAND, label: "Stand tall" },
        { n: [102, 68], h: [100, 110], hf: [102, 112], hb: [100, 112], ff: [136, 150], fb: [62, 150], kbi: [0, 1], label: "Long step, back knee toward floor" },
      ],
    },
    gluteBridge: {
      props: [{ t: "mat" }],
      frames: [
        { ...LIE, hf: [96, 148], hb: [94, 148], ff: [132, 150], fb: [128, 150], ki: [0, -1], label: "Lie back, knees bent" },
        { n: [52, 140], h: [98, 118], hf: [96, 148], hb: [94, 148], ff: [132, 150], fb: [128, 150], ki: [0, -1], label: "Drive hips up, squeeze glutes" },
      ],
    },
    // ---------- Upper body ----------
    pushUp: {
      frames: [
        { ...PLANK_TOP, label: "Straight-arm plank" },
        { ...PLANK_TOP, n: [137, 132], h: [95, 140], label: "Lower chest, elbows at 45°" },
      ],
    },
    benchPress: {
      props: [{ t: "bench", x: 36, w: 100, y: 122 }, { t: "db" }],
      frames: [
        { n: [62, 114], h: [104, 116], hf: [64, 68], hb: [62, 68], ei: [1, 0], ff: [142, 150], fb: [138, 150], ki: [0, -1], label: "Press up over your chest" },
        { n: [62, 114], h: [104, 116], hf: [66, 100], hb: [64, 100], ei: [0, 1], ff: [142, 150], fb: [138, 150], ki: [0, -1], label: "Lower slowly to chest level" },
      ],
    },
    dumbbellRow: {
      props: [{ t: "bench", x: 108, w: 60, y: 118 }, { t: "db", only: "front" }],
      frames: [
        { n: [113, 92], h: [70, 94], hb: [120, 118], hf: [110, 136], ff: [84, 150], fb: [60, 150], label: "Flat back, arm hangs straight" },
        { n: [113, 92], h: [70, 94], hb: [120, 118], hf: [96, 104], efi: [-1, -1], ff: [84, 150], fb: [60, 150], label: "Pull elbow up to your hip" },
      ],
    },
    latPulldown: {
      props: [{ t: "seat", x: 100, y: 112 }, { t: "cable", from: [106, -14] }],
      frames: [
        { n: [96, 66], h: [100, 110], hf: [108, 20], hb: [106, 20], ei: [-1, 0], ff: [134, 150], fb: [130, 150], ki: [1, -1], label: "Arms straight, chest up" },
        { n: [94, 66], h: [100, 110], hf: [110, 62], hb: [108, 62], ei: [-1, 1], ff: [134, 150], fb: [130, 150], ki: [1, -1], label: "Pull the bar to your upper chest" },
      ],
    },
    overheadPress: {
      props: [{ t: "seat", x: 95, y: 114 }, { t: "db" }],
      frames: [
        { n: [95, 68], h: [95, 112], hf: [106, 64], hb: [104, 66], ei: [0, 1], ff: [130, 150], fb: [126, 150], ki: [1, -1], label: "Dumbbells at shoulder height" },
        { n: [95, 68], h: [95, 112], hf: [100, 24], hb: [98, 24], ei: [1, 0], ff: [130, 150], fb: [126, 150], ki: [1, -1], label: "Press straight overhead" },
      ],
    },
    bicepCurl: {
      props: [{ t: "db" }],
      frames: [
        { ...STAND, label: "Arms straight, palms forward" },
        { ...STAND, hf: [116, 56], ef: [100, 70], hb: [114, 58], eb: [99, 70], label: "Curl up, elbows stay still" },
      ],
    },
    tricepDip: {
      props: [{ t: "bench", x: 30, w: 50, y: 104 }],
      frames: [
        { n: [84, 62], h: [88, 104], hf: [72, 104], hb: [70, 104], ei: [-1, 0], ff: [150, 150], fb: [146, 150], ki: [0, -1], label: "Hands on bench, arms straight" },
        { n: [86, 86], h: [90, 128], hf: [72, 104], hb: [70, 104], ei: [-1, -1], ff: [150, 150], fb: [146, 150], ki: [0, -1], label: "Bend elbows back to 90°" },
      ],
    },
    farmerCarry: {
      props: [{ t: "db", big: true }],
      frames: [
        { ...STAND, ff: [116, 150], fb: [86, 150], label: "Tall posture, tight grip" },
        { ...STAND, ff: [86, 150], fb: [116, 150], label: "Short, steady steps" },
      ],
    },
    // ---------- Core ----------
    plank: {
      props: [{ t: "mat" }],
      dur: 1.6,
      frames: [
        { n: [138, 128], h: [96, 137], hf: [160, 150], hb: [156, 150], ef: [136, 150], eb: [132, 150], ff: [42, 150], fb: [40, 150], hold: 1.5, label: "Forearms under shoulders" },
        { n: [138, 127], h: [96, 136], hf: [160, 150], hb: [156, 150], ef: [136, 150], eb: [132, 150], ff: [42, 150], fb: [40, 150], hold: 1.5, label: "Hold a straight line, breathe" },
      ],
    },
    deadBug: {
      props: [{ t: "mat" }],
      frames: [
        { ...LIE, hf: [58, 100], hb: [56, 100], ff: [128, 116], fb: [126, 116], ki: [0, -1], label: "Arms up, knees over hips" },
        { ...LIE, hf: [58, 100], hb: [14, 140], ff: [160, 140], fb: [126, 116], ki: [0, -1], label: "Extend opposite arm & leg" },
      ],
    },
    bicycleCrunch: {
      props: [{ t: "mat" }],
      frames: [
        { n: [64, 128], h: [100, 144], hf: [56, 120], hb: [54, 122], ei: [1, -1], ff: [116, 120], fb: [160, 134], ki: [0, -1], label: "Shoulders up, one knee in" },
        { n: [64, 128], h: [100, 144], hf: [56, 120], hb: [54, 122], ei: [1, -1], ff: [160, 134], fb: [116, 120], ki: [0, -1], label: "Switch sides, like pedalling" },
      ],
    },
    crunch: {
      props: [{ t: "mat" }],
      frames: [
        { ...LIE, hf: [72, 136], hb: [70, 136], ei: [0, -1], ff: [132, 150], fb: [128, 150], ki: [0, -1], label: "Lie back, knees bent" },
        { n: [68, 124], h: [100, 144], hf: [82, 124], hb: [80, 124], ei: [0, -1], ff: [132, 150], fb: [128, 150], ki: [0, -1], label: "Curl shoulders up, breathe out" },
      ],
    },
    legRaise: {
      props: [{ t: "mat" }],
      frames: [
        { ...LIE, hf: [96, 148], hb: [94, 148], ff: [160, 146], fb: [158, 146], ki: [0, -1], label: "Legs long, back flat" },
        { ...LIE, hf: [96, 148], hb: [94, 148], ff: [104, 84], fb: [102, 84], ki: [-1, 0], label: "Raise legs to vertical" },
      ],
    },
    superman: {
      props: [{ t: "mat" }],
      frames: [
        { n: [64, 144], h: [108, 146], hf: [20, 146], hb: [18, 146], ff: [168, 148], fb: [166, 148], ki: [0, 1], label: "Lie face down, arms forward" },
        { n: [66, 134], h: [108, 146], hf: [24, 128], hb: [22, 128], ff: [166, 134], fb: [164, 134], ki: [0, 1], hold: 0.8, label: "Lift arms, chest & legs" },
      ],
    },
    // ---------- Cardio ----------
    jumpingJack: {
      front: true,
      dur: 0.55,
      frames: [
        { n: [100, 46], h: [100, 90], hf: [108, 92], hb: [92, 92], efi: [1, 0], ebi: [-1, 0], ff: [106, 150], fb: [94, 150], kfi: [1, 0], kbi: [-1, 0], hold: 0.1, label: "Feet together, arms down" },
        { n: [100, 40], h: [100, 84], hf: [134, 4], hb: [66, 4], efi: [1, 0], ebi: [-1, 0], ff: [128, 148], fb: [72, 148], kfi: [1, 0], kbi: [-1, 0], hold: 0.1, label: "Jump out, arms overhead" },
      ],
    },
    highKnees: {
      dur: 0.45,
      frames: [
        { n: [100, 46], h: [100, 90], hf: [118, 70], hb: [86, 90], ei: [0, 1], kf: [128, 90], ff: [128, 120], fb: [100, 150], hold: 0.1, label: "Drive one knee to hip height" },
        { n: [100, 46], h: [100, 90], hf: [86, 90], hb: [118, 70], ei: [0, 1], kb: [128, 90], fb: [128, 120], ff: [100, 150], hold: 0.1, label: "Switch fast, pump your arms" },
      ],
    },
    squatJump: {
      dur: 0.7,
      frames: [
        { n: [104, 82], h: [80, 118], hf: [70, 104], hb: [68, 104], ff: [102, 150], fb: [98, 150], label: "Squat, arms back" },
        { n: [100, 30], h: [100, 74], hf: [106, -6], hb: [104, -6], ff: [102, 134], fb: [98, 134], hold: 0.1, label: "Explode up, land softly" },
      ],
    },
    jumpRope: {
      props: [{ t: "rope" }],
      dur: 0.45,
      frames: [
        { ...STAND, hf: [114, 92], hb: [96, 92], ei: [0, 1], rope: [106, -30], hold: 0.05, label: "Rope overhead, wrists turn it" },
        { n: [100, 38], h: [100, 82], hf: [114, 84], hb: [96, 84], ei: [0, 1], ff: [102, 142], fb: [98, 142], rope: [106, 196], hold: 0.05, label: "Small hop as it passes" },
      ],
    },
    intervalRun: {
      dur: 0.5,
      frames: [
        { n: [106, 46], h: [100, 90], hf: [122, 66], efi: [0, 1], hb: [84, 84], ebi: [-1, 0], ff: [122, 120], kfi: [1, -1], fb: [70, 140], kbi: [0, 1], hold: 0.05, label: "Drive knee, opposite arm forward" },
        { n: [106, 46], h: [100, 90], hb: [122, 66], ebi: [0, 1], hf: [84, 84], efi: [-1, 0], fb: [122, 120], kbi: [1, -1], ff: [70, 140], kfi: [0, 1], hold: 0.05, label: "Push off the back foot" },
      ],
    },
    briskWalk: {
      dur: 0.7,
      frames: [
        { ...STAND, hf: [86, 88], hb: [116, 86], ff: [118, 150], fb: [84, 150], hold: 0.05, label: "Heel down, arms swing" },
        { ...STAND, hf: [116, 86], hb: [86, 88], ff: [84, 150], fb: [118, 150], hold: 0.05, label: "Tall posture, quick steps" },
      ],
    },
    cycling: {
      props: [{ t: "bike" }],
      dur: 0.4,
      frames: [
        { ...bike(0), hold: 0, label: "Push the pedal down" },
        { ...bike(90), hold: 0, label: "Pull back at the bottom" },
        { ...bike(180), hold: 0, label: "Lift the knee" },
        { ...bike(270), hold: 0, label: "Push over the top" },
      ],
    },
    mountainClimber: {
      dur: 0.45,
      frames: [
        { ...PLANK_TOP, ff: [114, 142], kfi: [0, 1], hold: 0.05, label: "Plank, drive one knee in" },
        { ...PLANK_TOP, fb: [114, 142], kbi: [0, 1], hold: 0.05, label: "Switch legs quickly" },
      ],
    },
    burpee: {
      dur: 0.7,
      frames: [
        { ...STAND, label: "Stand tall" },
        { n: [112, 100], h: [84, 124], hf: [126, 150], hb: [124, 150], ff: [102, 150], fb: [98, 150], label: "Squat, hands to the floor" },
        { ...PLANK_TOP, label: "Jump back to a plank" },
        { n: [100, 30], h: [100, 74], hf: [104, -6], hb: [100, -6], ff: [102, 134], fb: [98, 134], hold: 0.1, label: "Jump up, arms overhead" },
      ],
    },
    // ---------- Mobility ----------
    catCow: {
      props: [{ t: "mat" }],
      dur: 1.3,
      frames: [
        { ...TABLE, sp: -10, label: "Cow: belly down, look up" },
        { ...TABLE, sp: 14, hd: [140, 118], label: "Cat: round your back" },
      ],
    },
    cobra: {
      props: [{ t: "mat" }],
      dur: 1.3,
      frames: [
        { n: [70, 144], h: [112, 146], hf: [74, 148], hb: [72, 148], ei: [-1, -1], ff: [170, 148], fb: [168, 148], ki: [0, 1], label: "Face down, hands under shoulders" },
        { n: [74, 110], h: [112, 144], hf: [80, 149], hb: [78, 149], ei: [-1, -1], ff: [170, 148], fb: [168, 148], ki: [0, 1], sp: -6, hold: 1, label: "Press chest up, hips stay down" },
      ],
    },
    downwardDog: {
      props: [{ t: "mat" }],
      dur: 1.3,
      frames: [
        { ...TABLE, label: "Start on hands & knees" },
        { n: [128, 119], h: [92, 94], hf: [166, 148], hb: [164, 148], ff: [70, 150], fb: [68, 150], ki: [1, 0], hold: 1.2, label: "Lift hips up & back" },
      ],
    },
    worldsGreatest: {
      props: [{ t: "mat" }],
      dur: 1.2,
      frames: [
        { n: [130, 104], h: [94, 124], hf: [134, 150], hb: [132, 150], ff: [140, 150], fb: [48, 150], kbi: [0, 1], label: "Deep lunge, hand inside foot" },
        { n: [130, 104], h: [94, 124], hf: [128, 60], hb: [132, 150], ff: [140, 150], fb: [48, 150], kbi: [0, 1], hold: 0.8, label: "Rotate & reach to the ceiling" },
      ],
    },
    hipFlexor: {
      props: [{ t: "mat" }],
      dur: 1.3,
      frames: [
        { n: [100, 68], h: [100, 112], hf: [106, 96], hb: [104, 96], ei: [-1, 0], ff: [134, 150], kfi: [1, -1], kb: [88, 144], fb: [58, 150], label: "Kneel, tuck your pelvis" },
        { n: [108, 72], h: [110, 116], hf: [118, 98], hb: [106, 26], ei: [-1, 0], ff: [134, 150], kfi: [1, -1], kb: [88, 144], fb: [58, 150], hold: 1, label: "Shift hips forward, reach up" },
      ],
    },
    childPose: {
      props: [{ t: "mat" }],
      dur: 1.3,
      frames: [
        { ...TABLE, label: "Hands & knees" },
        { n: [120, 140], h: [80, 134], hf: [168, 148], hb: [166, 148], kf: [112, 150], kb: [108, 150], ff: [72, 150], fb: [70, 150], hd: [132, 144], hold: 1.2, label: "Sit back, arms long, relax" },
      ],
    },
    hamstringStretch: {
      props: [{ t: "mat" }, { t: "towel" }],
      dur: 1.3,
      frames: [
        { n: [48, 142], h: [92, 144], hf: [84, 110], hb: [82, 110], ei: [0, 1], ff: [106, 88], fb: [150, 148], label: "Lie back, towel around foot" },
        { n: [48, 142], h: [92, 144], hf: [78, 106], hb: [76, 106], ei: [0, 1], ff: [88, 84], fb: [150, 148], hold: 1, label: "Gently pull the straight leg in" },
      ],
    },
  };

  if (typeof module !== "undefined" && module.exports) module.exports = MOVES;
  else root.FITPLAN_MOVES = MOVES;
})(this);
