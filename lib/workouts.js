// Exercise library with step-by-step form guides, and the 7-day workout builder.
// Sets, reps, rest and tempo come from the goal; exercise choice and volume come from the level.

// category: strength | core | cardio | mobility. imageQuery: what the card's Unsplash photo searches for.
const EXERCISES = {
  // ---------- Lower body ----------
  gobletSquat: {
    name: "Goblet Squat", category: "strength", level: 1, muscles: ["Quadriceps", "Glutes", "Core"], equipment: "One dumbbell or kettlebell",
    imageQuery: "goblet squat dumbbell workout",
    steps: [
      "Hold one dumbbell vertically against your chest, both hands cupping the top end, elbows pointing down.",
      "Stand with feet slightly wider than hip-width, toes turned out 10–15°.",
      "Take a breath, brace your stomach, and sit your hips down and back between your heels.",
      "Lower until your hip crease is at or just below knee height, keeping your chest tall and heels flat.",
      "Drive through the whole foot to stand up, squeezing your glutes at the top.",
    ],
    cues: ["Knees travel in line with your toes", "Elbows brush the inside of your knees at the bottom", "Chest proud, like showing a logo on your shirt"],
    mistakes: ["Heels lifting off the floor", "Knees caving inward", "Rounding the lower back at the bottom"],
    easier: "Bodyweight box squat to a chair", harder: "Barbell back squat or pause 2 s at the bottom",
  },
  backSquat: {
    name: "Barbell Back Squat", category: "strength", level: 3, muscles: ["Quadriceps", "Glutes", "Adductors", "Lower back"], equipment: "Barbell & squat rack",
    imageQuery: "barbell back squat gym",
    steps: [
      "Set the bar in the rack at mid-chest height. Step under it and rest it on your upper back (not your neck).",
      "Grip the bar just outside your shoulders and pull your shoulder blades together to make a shelf.",
      "Stand up to unrack, take two small steps back, and set feet shoulder-width with toes slightly out.",
      "Brace hard (big breath into your belly), then bend hips and knees together to descend under control.",
      "Reach at least parallel, then drive up, keeping the bar over the middle of your foot.",
    ],
    cues: ["Spread the floor with your feet", "Bar path stays vertical over mid-foot", "Exhale only after you pass the hardest point"],
    mistakes: ["Good-morning squat (hips rise faster than chest)", "Bouncing out of the bottom", "Losing the brace halfway down"],
    easier: "Goblet squat", harder: "Pause squat, 2 s at the bottom",
  },
  romanianDeadlift: {
    name: "Romanian Deadlift", category: "strength", level: 2, muscles: ["Hamstrings", "Glutes", "Lower back"], equipment: "Dumbbells or barbell",
    imageQuery: "romanian deadlift barbell",
    steps: [
      "Stand tall holding the weights in front of your thighs, feet hip-width, knees softly bent.",
      "Push your hips straight back like closing a car door with your bum, letting the weights slide down your thighs.",
      "Keep your back flat and neck neutral. Stop when you feel a strong stretch in your hamstrings (usually just below the knee).",
      "Drive your hips forward to stand up, squeezing your glutes. Don't lean back at the top.",
    ],
    cues: ["Weights stay close to your legs the whole time", "Shins stay nearly vertical", "Think hinge, not squat"],
    mistakes: ["Rounding the back to reach lower", "Bending the knees too much", "Hyper-extending at the top"],
    easier: "Hip hinge with a broomstick along your spine", harder: "Single-leg Romanian deadlift",
  },
  walkingLunge: {
    name: "Walking Lunges", category: "strength", level: 1, muscles: ["Quadriceps", "Glutes", "Hamstrings"], equipment: "Bodyweight or dumbbells",
    imageQuery: "walking lunges workout",
    steps: [
      "Stand tall with dumbbells at your sides (or hands on hips).",
      "Take a long step forward and lower until both knees are bent about 90° and the back knee hovers above the floor.",
      "Keep your torso upright and front heel planted.",
      "Push through the front heel to bring the back leg forward into the next step. Alternate legs. One step = one rep.",
    ],
    cues: ["Front knee stays over the ankle, not caving in", "Long stride for glutes, shorter for quads", "Move slowly: control beats speed"],
    mistakes: ["Back knee slamming the floor", "Leaning far forward", "Steps too narrow (like a tightrope)"],
    easier: "Static split squat holding a wall", harder: "Rear-foot-elevated split squat",
  },
  gluteBridge: {
    name: "Glute Bridge", category: "strength", level: 1, muscles: ["Glutes", "Hamstrings"], equipment: "Mat (dumbbell optional)",
    imageQuery: "glute bridge exercise mat",
    steps: [
      "Lie on your back, knees bent, feet flat and hip-width, heels about a hand's length from your bum.",
      "Tuck your pelvis slightly so your lower back is gently pressed to the mat.",
      "Push through your heels and lift your hips until your body makes a straight line from knees to shoulders.",
      "Squeeze your glutes hard for 1–2 seconds, then lower slowly.",
    ],
    cues: ["Ribs down, don't arch your lower back", "Push the floor away through your heels", "Feel it in the glutes, not the hamstrings"],
    mistakes: ["Over-arching at the top", "Feet too far away (hamstrings cramp)", "Rushing the squeeze"],
    easier: "Smaller range, 2 s hold", harder: "Barbell hip thrust from a bench",
  },
  // ---------- Upper body ----------
  pushUp: {
    name: "Push-Up", category: "strength", level: 1, muscles: ["Chest", "Triceps", "Front shoulders", "Core"], equipment: "Bodyweight",
    imageQuery: "push up exercise",
    steps: [
      "Place your hands slightly wider than shoulder-width, fingers spread, directly under your shoulders.",
      "Step back into a plank: body straight from head to heels, glutes and stomach tight.",
      "Bend your elbows to lower your chest toward the floor, elbows at about 45° from your body.",
      "Stop when your chest is a fist's height from the floor, then press back up to straight arms.",
    ],
    cues: ["Body moves as one plank", "Screw your hands into the floor", "Elbows form an arrow, not a T"],
    mistakes: ["Hips sagging", "Elbows flared straight out", "Half reps: only moving the head"],
    easier: "Incline push-up with hands on a bench or wall", harder: "Feet-elevated or tempo push-ups (3 s down)",
  },
  benchPress: {
    name: "Dumbbell Bench Press", category: "strength", level: 2, muscles: ["Chest", "Triceps", "Front shoulders"], equipment: "Dumbbells & flat bench",
    imageQuery: "dumbbell bench press gym",
    steps: [
      "Sit on the bench with dumbbells on your thighs, then lie back and bring them to chest level.",
      "Plant your feet, squeeze your shoulder blades together and down, and keep a small natural arch.",
      "Press the dumbbells up over your chest until your arms are straight, without clanking them together.",
      "Lower slowly until the dumbbells are level with your chest and elbows are about 45° from your body.",
    ],
    cues: ["Shoulder blades stay pinned to the bench", "Wrists stacked over elbows", "Lower under control, press with power"],
    mistakes: ["Bouncing the weights off your chest", "Flaring elbows to 90°", "Lifting hips off the bench"],
    easier: "Push-up", harder: "Barbell bench press or incline dumbbell press",
  },
  dumbbellRow: {
    name: "One-Arm Dumbbell Row", category: "strength", level: 1, muscles: ["Upper back", "Lats", "Biceps", "Rear shoulders"], equipment: "Dumbbell & bench",
    imageQuery: "dumbbell row back workout",
    steps: [
      "Put your left knee and left hand on a bench, right foot on the floor, back flat and parallel to the floor.",
      "Hold the dumbbell in your right hand with the arm hanging straight.",
      "Pull the dumbbell toward your hip, leading with the elbow, until it's beside your ribs.",
      "Squeeze your shoulder blade back for a second, then lower all the way down. Finish all reps, then switch sides.",
    ],
    cues: ["Pull to your pocket, not your armpit", "Keep your shoulders square to the floor", "Stretch fully at the bottom"],
    mistakes: ["Twisting the torso to swing the weight", "Shrugging the shoulder to the ear", "Short range of motion"],
    easier: "Resistance-band row", harder: "Pause 2 s at the top of each rep",
  },
  latPulldown: {
    name: "Lat Pulldown", category: "strength", level: 2, muscles: ["Lats", "Upper back", "Biceps"], equipment: "Cable machine or resistance band",
    imageQuery: "lat pulldown machine gym",
    steps: [
      "Set the thigh pad so your legs are locked in. Grip the bar slightly wider than your shoulders.",
      "Lean back slightly (about 10–15°) with your chest lifted.",
      "Pull the bar down to your upper chest by driving your elbows down toward your back pockets.",
      "Let the bar rise slowly until your arms are straight and you feel a stretch in your lats.",
    ],
    cues: ["Shoulders down first, then pull", "Chest meets the bar", "Slow on the way up"],
    mistakes: ["Pulling behind the neck", "Leaning far back and using momentum", "Shrugging shoulders up"],
    easier: "Band pulldown kneeling", harder: "Pull-ups or chin-ups",
  },
  overheadPress: {
    name: "Seated Dumbbell Shoulder Press", category: "strength", level: 1, muscles: ["Shoulders", "Triceps", "Upper chest"], equipment: "Dumbbells & bench",
    imageQuery: "dumbbell shoulder press",
    steps: [
      "Sit on a bench with back support. Hold dumbbells at shoulder height, palms facing forward.",
      "Brace your stomach and keep your back against the pad.",
      "Press the dumbbells straight up until your arms are almost straight overhead.",
      "Lower slowly back to shoulder height (dumbbells level with your chin).",
    ],
    cues: ["Ribs stay down: don't arch", "Forearms vertical throughout", "Dumbbells finish over your ears"],
    mistakes: ["Arching the lower back", "Lowering only halfway", "Pressing forward instead of up"],
    easier: "Lighter dumbbells, one arm at a time", harder: "Standing barbell overhead press",
  },
  farmerCarry: {
    name: "Farmer's Carry", category: "strength", level: 1, muscles: ["Grip", "Traps", "Core", "Whole body"], equipment: "Two heavy dumbbells or kettlebells",
    imageQuery: "farmers walk kettlebell",
    steps: [
      "Deadlift two heavy dumbbells from the floor with a flat back and stand tall.",
      "Pull your shoulders back and down, brace your core.",
      "Walk with short, controlled steps for the set distance or time, looking straight ahead.",
      "Set the weights down with a flat back, just like you picked them up.",
    ],
    cues: ["Tall posture, like a string pulling your head up", "Crush the handles", "Don't let the weights swing"],
    mistakes: ["Leaning to one side", "Rounding shoulders forward", "Rushing with long steps"],
    easier: "Lighter weights, shorter distance", harder: "Single-arm (suitcase) carry",
  },
  // ---------- Core ----------
  plank: {
    name: "Forearm Plank", category: "core", level: 1, muscles: ["Deep core", "Shoulders", "Glutes"], equipment: "Mat",
    imageQuery: "plank exercise core",
    steps: [
      "Place your forearms on the mat, elbows directly under your shoulders.",
      "Step your feet back so your body is one straight line from head to heels.",
      "Squeeze your glutes, pull your belly button in and push the floor away with your forearms.",
      "Breathe steadily and hold for the set time. Stop the set when your hips start to sag.",
    ],
    cues: ["Ribs pulled toward hips", "Neck long: look at the floor", "Quality over time"],
    mistakes: ["Hips sagging or piking up", "Holding your breath", "Shoulders collapsing"],
    easier: "Plank from the knees", harder: "Plank with alternating arm reach",
  },
  deadBug: {
    name: "Dead Bug", category: "core", level: 1, muscles: ["Deep core", "Hip flexors"], equipment: "Mat",
    imageQuery: "core workout mat exercise",
    steps: [
      "Lie on your back, arms pointing at the ceiling, knees bent 90° above your hips.",
      "Press your lower back gently into the mat and keep it there the whole set.",
      "Slowly lower your right arm overhead and straighten your left leg toward the floor at the same time.",
      "Return to the start and repeat on the other side. Each side counts as one rep.",
    ],
    cues: ["Lower back glued to the floor", "Move slowly and breathe out as you extend", "Opposite arm, opposite leg"],
    mistakes: ["Back arching off the mat", "Moving too fast", "Holding your breath"],
    easier: "Move only the legs", harder: "Hold a light weight in your hands",
  },
  bicycleCrunch: {
    name: "Bicycle Crunch", category: "core", level: 2, muscles: ["Obliques", "Rectus abdominis"], equipment: "Mat",
    imageQuery: "abs workout crunch",
    steps: [
      "Lie on your back, hands lightly behind your head, knees bent 90° in the air.",
      "Curl your shoulders off the mat.",
      "Rotate to bring your right elbow toward your left knee as you straighten the right leg.",
      "Switch sides in a slow, pedalling motion. Each side is one rep.",
    ],
    cues: ["Rotate from the ribs, not the neck", "Straight leg stays low", "Slow and controlled"],
    mistakes: ["Pulling on your head", "Racing through reps", "Only moving elbows, not torso"],
    easier: "Dead bug", harder: "Pause 1 s on each twist",
  },
  // ---------- Cardio ----------
  briskWalk: {
    name: "Brisk / Incline Walk", category: "cardio", level: 1, muscles: ["Heart & lungs", "Legs"], equipment: "Outdoors or treadmill",
    imageQuery: "brisk walking outdoor fitness",
    steps: [
      "Start with 3 minutes at an easy pace to warm up.",
      "Speed up until you're breathing harder but can still speak in full sentences (about 5–6 out of 10 effort).",
      "On a treadmill, add a 3–8% incline to raise intensity without running.",
      "Swing your arms naturally and land heel-to-toe. Finish with 3 easy minutes.",
    ],
    cues: ["Talk test: you can chat, but not sing", "Tall posture, don't hold the rails", "Short, quick steps"],
    mistakes: ["Holding the treadmill handrails", "Going so hard you have to stop", "Skipping the cool-down"],
    easier: "Flat, slower walk in shorter bouts", harder: "Steeper incline or add a light backpack",
  },
  intervalRun: {
    name: "Running Intervals", category: "cardio", level: 2, muscles: ["Heart & lungs", "Legs"], equipment: "Outdoors or treadmill",
    imageQuery: "running cardio track",
    steps: [
      "Warm up with 5 minutes of brisk walking or easy jogging.",
      "Run fast (about 8 out of 10 effort) for the work interval.",
      "Walk or jog slowly for the recovery interval until your breathing settles.",
      "Repeat for the set number of rounds, then walk 5 minutes to cool down.",
    ],
    cues: ["Land under your hips with a slight forward lean", "Relaxed shoulders and hands", "Keep every fast interval the same pace"],
    mistakes: ["Starting the first round too fast", "Overstriding and heel-slamming", "Cutting recovery short"],
    easier: "Fast walk / slow walk intervals", harder: "Hill sprints",
  },
  jumpRope: {
    name: "Jump Rope", category: "cardio", level: 2, muscles: ["Calves", "Heart & lungs", "Shoulders"], equipment: "Skipping rope",
    imageQuery: "jump rope workout",
    steps: [
      "Hold the handles at hip height, elbows close to your sides.",
      "Turn the rope with your wrists, not your whole arms.",
      "Jump just high enough to clear the rope (2–3 cm), landing softly on the balls of your feet.",
      "Work for the set time, rest, and repeat.",
    ],
    cues: ["Small, quiet jumps", "Wrists do the work", "Look straight ahead"],
    mistakes: ["Jumping too high", "Landing flat-footed", "Big arm circles"],
    easier: "Jump without the rope (shadow skipping)", harder: "Double-unders or alternate-foot running step",
  },
  cycling: {
    name: "Steady Cycling", category: "cardio", level: 1, muscles: ["Heart & lungs", "Quadriceps", "Glutes"], equipment: "Bike or stationary bike",
    imageQuery: "cycling fitness bike",
    steps: [
      "Adjust the seat so your knee is slightly bent at the bottom of the pedal stroke.",
      "Pedal easily for 5 minutes to warm up.",
      "Raise the resistance or speed to a steady, comfortably hard effort (6 out of 10) for the main block.",
      "Ease off for the final 5 minutes.",
    ],
    cues: ["Smooth, round pedal strokes", "Relaxed upper body", "Steady breathing"],
    mistakes: ["Seat too low (knee pain)", "Rocking hips side to side", "Gripping the bars tightly"],
    easier: "Lower resistance, shorter time", harder: "Add 30 s hard / 90 s easy intervals",
  },
  mountainClimber: {
    name: "Mountain Climbers", category: "cardio", level: 2, muscles: ["Core", "Shoulders", "Hip flexors", "Heart & lungs"], equipment: "Bodyweight",
    imageQuery: "mountain climbers hiit workout",
    steps: [
      "Start in a high plank with hands under shoulders and body straight.",
      "Drive your right knee toward your chest, then return it as you drive the left knee in.",
      "Keep switching legs in a running rhythm while hips stay level.",
      "Work for the set time, keeping your shoulders over your hands.",
    ],
    cues: ["Hips stay low and level", "Push the floor away", "Quick feet, quiet landing"],
    mistakes: ["Hips bouncing high", "Shoulders drifting behind the hands", "Holding your breath"],
    easier: "Slow alternating knee drives", harder: "Cross-body climbers (knee to opposite elbow)",
  },
  burpee: {
    name: "Burpees", category: "cardio", level: 3, muscles: ["Whole body", "Heart & lungs"], equipment: "Bodyweight",
    imageQuery: "burpee hiit training",
    steps: [
      "Stand tall, then squat down and place your hands on the floor.",
      "Jump or step your feet back into a plank.",
      "Lower your chest to the floor (or do a push-up), then push back up.",
      "Jump or step your feet to your hands and explode up into a small jump, arms overhead.",
    ],
    cues: ["Land softly with bent knees", "Keep your core tight in the plank", "Find a steady rhythm"],
    mistakes: ["Sagging hips in the plank", "Landing with straight legs", "Sprinting the first reps and burning out"],
    easier: "Step back and forward, no jump", harder: "Add a tuck jump",
  },
  // ---------- Mobility / yoga ----------
  catCow: {
    name: "Cat–Cow", category: "mobility", level: 1, muscles: ["Spine", "Core"], equipment: "Mat",
    imageQuery: "yoga cat cow pose",
    steps: [
      "Start on hands and knees, wrists under shoulders and knees under hips.",
      "Breathe in: drop your belly, lift your chest and tailbone, look slightly up (cow).",
      "Breathe out: round your spine toward the ceiling, tuck your chin and tailbone (cat).",
      "Move slowly with your breath, one movement per breath.",
    ],
    cues: ["Move one vertebra at a time", "Let the breath lead", "Push the floor away in the cat"],
    mistakes: ["Rushing", "Only moving the neck", "Locking the elbows hard"],
    easier: "Smaller range", harder: "Add side bends (look at your hip)",
  },
  downwardDog: {
    name: "Downward-Facing Dog", category: "mobility", level: 1, muscles: ["Hamstrings", "Calves", "Shoulders", "Back"], equipment: "Mat",
    imageQuery: "yoga downward dog",
    steps: [
      "From hands and knees, tuck your toes and lift your hips up and back into an upside-down V.",
      "Spread your fingers and press evenly through your hands.",
      "Keep knees bent at first and focus on a long, straight spine; then slowly straighten your legs.",
      "Let your head hang between your arms and breathe deeply.",
    ],
    cues: ["Long spine before straight legs", "Hips reach up and back", "Pedal your feet to loosen calves"],
    mistakes: ["Rounding the back to force straight legs", "Shoulders up by the ears", "Weight all in the hands"],
    easier: "Bend knees a lot, hands on a chair", harder: "Lift one leg (three-legged dog)",
  },
  worldsGreatest: {
    name: "World's Greatest Stretch", category: "mobility", level: 1, muscles: ["Hip flexors", "Hamstrings", "Upper back"], equipment: "Mat",
    imageQuery: "stretching lunge mobility",
    steps: [
      "Step into a long lunge with your right foot forward, left knee on the floor or lifted.",
      "Place your left hand on the floor inside your right foot.",
      "Rotate your chest and reach your right arm to the ceiling, following your hand with your eyes.",
      "Return the hand down, then straighten the front leg to stretch the hamstring. Switch sides.",
    ],
    cues: ["Squeeze the back glute to open the hip", "Rotate from the upper back", "Breathe out into each position"],
    mistakes: ["Front knee caving in", "Holding your breath", "Rushing between positions"],
    easier: "Back knee down with a cushion", harder: "Hold each position for 3 breaths",
  },
  hipFlexor: {
    name: "Kneeling Hip Flexor Stretch", category: "mobility", level: 1, muscles: ["Hip flexors", "Quads"], equipment: "Mat or cushion",
    imageQuery: "hip flexor stretch yoga",
    steps: [
      "Kneel on your left knee with your right foot forward, both knees at 90°.",
      "Tuck your tailbone under and squeeze your left glute.",
      "Shift your hips forward slightly until you feel a stretch at the front of the left hip.",
      "Raise your left arm overhead for a deeper stretch. Hold, then switch sides.",
    ],
    cues: ["Tuck the pelvis first, then lean", "Tall torso", "Gentle stretch, never pain"],
    mistakes: ["Arching the lower back", "Leaning too far forward", "Bouncing"],
    easier: "Standing version, holding a wall", harder: "Pull the back foot toward your bum (couch stretch)",
  },
  childPose: {
    name: "Child's Pose", category: "mobility", level: 1, muscles: ["Lower back", "Hips", "Lats"], equipment: "Mat",
    imageQuery: "yoga child pose relaxation",
    steps: [
      "Kneel with big toes touching and knees apart.",
      "Sit your hips back toward your heels.",
      "Walk your hands forward and rest your forehead on the mat.",
      "Breathe slowly into your back and let your body relax.",
    ],
    cues: ["Long exhale", "Reach your fingertips forward", "Let your shoulders melt down"],
    mistakes: ["Tensing the shoulders", "Forcing hips to heels"],
    easier: "Pillow under your hips or chest", harder: "Walk hands to one side for a side stretch",
  },
  hamstringStretch: {
    name: "Supine Hamstring Stretch", category: "mobility", level: 1, muscles: ["Hamstrings", "Calves"], equipment: "Mat & towel or strap",
    imageQuery: "hamstring stretch mat",
    steps: [
      "Lie on your back and loop a towel around the ball of your right foot.",
      "Straighten the right leg toward the ceiling, keeping the left leg bent or flat.",
      "Gently pull until you feel a stretch behind the thigh. Keep your hips on the floor.",
      "Hold and breathe, then switch legs.",
    ],
    cues: ["Keep a tiny bend in the knee", "Relax your shoulders", "Stretch, don't strain"],
    mistakes: ["Lifting your hips", "Yanking the towel", "Locking the knee"],
    easier: "Keep the knee more bent", harder: "Flex the toes toward you",
  },
};

// ---------- Programming ----------
const LEVELS = { 1: "Beginner", 2: "Intermediate", 3: "Advanced" };
const levelFor = (activity) => ({ sedentary: 1, light: 1, moderate: 2, active: 3, athlete: 3 })[activity] ?? 1;

// Swap anything too advanced for the person's level to its easier sibling.
const DOWNGRADE = { backSquat: "gobletSquat", benchPress: "pushUp", latPulldown: "dumbbellRow", romanianDeadlift: "gluteBridge", burpee: "mountainClimber", mountainClimber: "briskWalk", intervalRun: "briskWalk", jumpRope: "cycling", bicycleCrunch: "deadBug" };
function pick(id, level) {
  let key = id;
  while (EXERCISES[key].level > level && DOWNGRADE[key]) key = DOWNGRADE[key];
  return key;
}

function strengthDose(goal, level, category) {
  const baseSets = { 1: 2, 2: 3, 3: 4 }[level] + (goal === "gain" ? 1 : 0);
  const sets = Math.min(baseSets, 5);
  if (category === "core") {
    return { sets: Math.max(2, sets - 1), reps: { 1: "20–30 s or 8 each side", 2: "30–45 s or 10 each side", 3: "45–60 s or 12 each side" }[level], rest: "30–45 s", tempo: "Slow & controlled", intensity: "Stop 2 reps (or 5 s) before your form breaks" };
  }
  const plan = {
    lose: { reps: "12–15", rest: "45–60 s", tempo: "2-0-2", tempoHint: "2 s down, no pause, 2 s up", rir: "2–3 reps in reserve" },
    maintain: { reps: "8–12", rest: "60–90 s", tempo: "2-1-2", tempoHint: "2 s down, 1 s pause at the bottom, 2 s up", rir: "2 reps in reserve" },
    gain: { reps: "6–10", rest: "90–150 s", tempo: "3-1-1", tempoHint: "3 s lowering, 1 s pause, 1 s up with power", rir: "1–2 reps in reserve" },
  }[goal];
  return { sets, reps: plan.reps, rest: plan.rest, tempo: plan.tempo, tempoHint: plan.tempoHint, intensity: `Pick a weight you could lift ${plan.rir} more times. Tempo ${plan.tempo}: ${plan.tempoHint}.` };
}

function cardioDose(id, goal, level, finisher) {
  const ex = EXERCISES[id];
  if (id === "intervalRun" || id === "jumpRope" || id === "mountainClimber" || id === "burpee") {
    const rounds = { 1: 6, 2: 8, 3: 10 }[level] + (goal === "lose" ? 2 : 0);
    const work = { 1: "20 s", 2: "30 s", 3: "40 s" }[level];
    return { sets: rounds, reps: `${work} hard`, rest: level === 3 ? "40 s easy" : "60–90 s easy", tempo: "Intervals", intensity: "8/10 effort on work intervals" };
  }
  // A steady block after lifting (or a second one the same day) is a short finisher, not a full session.
  const minutes = finisher ? (level === 1 ? 15 : 20) : { 1: 25, 2: 35, 3: 45 }[level] + (goal === "lose" ? 10 : 0);
  return { sets: 1, reps: `${minutes} min`, rest: "—", tempo: "Steady", intensity: ex.category === "cardio" ? "5–6/10 effort (you can still talk)" : "Easy" };
}

const mobilityDose = (level) => ({ sets: 2, reps: level === 1 ? "30 s each side" : "45 s each side", rest: "Flow between moves", tempo: "Slow breathing", intensity: "Gentle stretch, never pain" });

// Weekly templates per goal: [day title, focus, type, exercise ids].
const TEMPLATES = {
  lose: [
    ["Full-Body Strength A", "Burn calories while keeping your muscle", "strength", ["gobletSquat", "pushUp", "dumbbellRow", "gluteBridge", "plank"]],
    ["Cardio Intervals + Core", "Raise heart rate and burn fat", "cardio", ["intervalRun", "mountainClimber", "deadBug", "bicycleCrunch"]],
    ["Lower Body + Steady Cardio", "Legs and glutes, then easy cardio", "strength", ["walkingLunge", "romanianDeadlift", "gluteBridge", "briskWalk"]],
    ["Yoga & Mobility", "Active recovery: loosen hips, back and hamstrings", "mobility", ["catCow", "downwardDog", "worldsGreatest", "hipFlexor", "childPose"]],
    ["Upper Body Strength", "Chest, back and shoulders", "strength", ["benchPress", "latPulldown", "overheadPress", "dumbbellRow", "plank"]],
    ["Long Steady Cardio", "Build endurance at an easy pace (cycle, or walk if you prefer)", "cardio", ["cycling", "hamstringStretch", "childPose"]],
    ["Rest & Light Walk", "Recover: a relaxed 20–30 min walk and stretching", "rest", ["briskWalk", "childPose"]],
  ],
  maintain: [
    ["Upper Body Strength", "Chest, back and shoulders", "strength", ["benchPress", "dumbbellRow", "overheadPress", "latPulldown", "plank"]],
    ["Lower Body Strength", "Legs and glutes", "strength", ["gobletSquat", "romanianDeadlift", "walkingLunge", "gluteBridge", "deadBug"]],
    ["Cardio + Core", "Heart health and a strong midsection", "cardio", ["jumpRope", "cycling", "bicycleCrunch", "plank"]],
    ["Yoga & Mobility", "Active recovery and flexibility", "mobility", ["catCow", "downwardDog", "worldsGreatest", "hamstringStretch", "childPose"]],
    ["Full-Body Strength", "Big lifts and carries", "strength", ["backSquat", "pushUp", "dumbbellRow", "farmerCarry", "deadBug"]],
    ["Fun Cardio", "Something you enjoy: cycling, a sport or a hike", "cardio", ["cycling", "intervalRun"]],
    ["Rest Day", "Full rest. Walk, sleep well and eat your protein", "rest", ["childPose", "hipFlexor"]],
  ],
  gain: [
    ["Push: Chest, Shoulders & Triceps", "Heavy pressing for upper-body size", "strength", ["benchPress", "overheadPress", "pushUp", "plank"]],
    ["Pull: Back & Biceps", "Build a wide, thick back", "strength", ["latPulldown", "dumbbellRow", "farmerCarry", "deadBug"]],
    ["Legs: Quads, Glutes & Hamstrings", "Heavy lower-body work", "strength", ["backSquat", "romanianDeadlift", "walkingLunge", "gluteBridge"]],
    ["Mobility & Recovery", "Stay flexible so you can lift well", "mobility", ["catCow", "downwardDog", "worldsGreatest", "hipFlexor", "childPose"]],
    ["Upper Body Volume", "More sets for chest, back and shoulders", "strength", ["benchPress", "dumbbellRow", "overheadPress", "latPulldown"]],
    ["Lower Body + Light Cardio", "Legs again, then easy cardio for heart health", "strength", ["gobletSquat", "romanianDeadlift", "gluteBridge", "cycling"]],
    ["Rest Day", "Recover and grow: sleep 7–9 hours", "rest", ["childPose", "hamstringStretch"]],
  ],
};

const WARMUP = ["3 min brisk walk, marching or light cycling", "10 arm circles each way", "10 bodyweight squats", "10 hip hinges (hands on hips)", "5 World's Greatest Stretches each side"];
const COOLDOWN = ["3–5 min easy walk to bring your heart rate down", "Child's pose 45 s", "Hamstring and hip flexor stretches, 30 s each side", "Slow nose breathing for 1 minute"];

function doseFor(id, goal, level, dayType, finisher) {
  const ex = EXERCISES[id];
  if (dayType === "rest") return ex.category === "mobility" ? mobilityDose(1) : { sets: 1, reps: "20–30 min", rest: "—", tempo: "Relaxed", intensity: "Easy: 3–4/10" };
  if (ex.category === "mobility") return mobilityDose(level);
  if (ex.category === "cardio") return cardioDose(id, goal, level, finisher);
  return strengthDose(goal, level, ex.category);
}

function estimateMinutes(exercises) {
  let min = 10; // warm-up and cool-down
  for (const e of exercises) {
    const d = e.prescription;
    const timed = String(d.reps).match(/^(\d+) min$/);
    if (timed) min += Number(timed[1]);
    else if (e.category === "mobility") min += 3;
    else min += d.sets * (e.category === "cardio" ? 1.5 : 2.5);
  }
  return Math.round(min / 5) * 5;
}

function buildWorkoutPlan(goal, activity) {
  const level = levelFor(activity);
  const days = TEMPLATES[goal].map(([title, focus, type, ids], i) => {
    const seen = new Set();
    const exercises = [];
    let mainCardioDone = type !== "cardio"; // on strength days, cardio is always a finisher
    for (const raw of ids) {
      const id = pick(raw, level);
      if (seen.has(id)) continue;
      seen.add(id);
      const ex = EXERCISES[id];
      const prescription = doseFor(id, goal, level, type, ex.category === "cardio" && mainCardioDone);
      if (ex.category === "cardio") mainCardioDone = true;
      exercises.push({
        id, name: ex.name, category: ex.category, muscles: ex.muscles, equipment: ex.equipment, imageQuery: ex.imageQuery,
        prescription,
        steps: ex.steps, cues: ex.cues, mistakes: ex.mistakes, easier: ex.easier, harder: ex.harder,
      });
    }
    return {
      day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i],
      title, focus, type,
      durationMin: type === "rest" ? 30 : estimateMinutes(exercises),
      warmup: type === "rest" || type === "mobility" ? [] : WARMUP,
      exercises,
      cooldown: type === "rest" ? [] : COOLDOWN,
    };
  });
  return {
    level: LEVELS[level],
    goal,
    trainingDays: days.filter((d) => d.type !== "rest").length,
    days,
    guidelines: [
      "Progressive overload: when you hit the top of the rep range for every set, add a little weight (2–5%) or one rep next week.",
      "Leave 1–3 reps in the tank. Good form always beats a heavier weight.",
      "Sleep 7–9 hours and hit your protein target so your muscles recover.",
      "Sharp pain, dizziness or chest pain means stop and see a doctor. Mild muscle soreness for 1–2 days is normal.",
    ],
  };
}

module.exports = { buildWorkoutPlan, EXERCISES, TEMPLATES, levelFor, pick };
