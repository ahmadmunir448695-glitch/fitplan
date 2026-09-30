// Calorie and macro targets.
// BMR uses the Mifflin-St Jeor equation; TDEE multiplies it by an activity factor.
// Targets never go below a safe floor: 1,200 kcal for women and 1,500 kcal for men.

const ACTIVITY = {
  sedentary: { factor: 1.2, label: "Sedentary (desk job, little exercise)" },
  light: { factor: 1.375, label: "Lightly active (exercise 1–3 days/week)" },
  moderate: { factor: 1.55, label: "Moderately active (exercise 3–5 days/week)" },
  active: { factor: 1.725, label: "Very active (hard exercise 6–7 days/week)" },
  athlete: { factor: 1.9, label: "Athlete (physical job or training twice a day)" },
};

const GOALS = {
  lose: { label: "Lose fat" },
  maintain: { label: "Maintain & tone" },
  gain: { label: "Build muscle" },
};

const CALORIE_FLOOR = { female: 1200, male: 1500 };
const LIMITS = {
  age: [18, 80],
  heightCm: [120, 230],
  weightKg: [35, 250],
};

const round = (n, step = 1) => Math.round(n / step) * step;

// Checks the form. Returns { value } with clean numbers, or { errors } keyed by field.
function validate(body) {
  const b = body || {};
  const errors = {};
  const num = (v) => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN);
  const value = {
    age: num(b.age),
    heightCm: num(b.heightCm ?? b.height),
    weightKg: num(b.weightKg ?? b.weight),
    gender: String(b.gender || "").toLowerCase(),
    goal: String(b.goal || "").toLowerCase(),
    activity: String(b.activity ?? b.activityLevel ?? "").toLowerCase(),
    diet: String(b.diet || "balanced").toLowerCase(),
  };
  for (const [key, [min, max]] of Object.entries(LIMITS)) {
    const v = value[key];
    if (!Number.isFinite(v)) errors[key] = "Enter a number.";
    else if (v < min || v > max) errors[key] = `Enter a value between ${min} and ${max}.`;
  }
  if (Number.isFinite(value.age)) value.age = Math.round(value.age);
  if (!["female", "male"].includes(value.gender)) errors.gender = "Choose female or male.";
  if (!GOALS[value.goal]) errors.goal = "Choose a goal.";
  if (!ACTIVITY[value.activity]) errors.activity = "Choose an activity level.";
  if (!["balanced", "vegetarian"].includes(value.diet)) errors.diet = "Choose balanced or vegetarian.";
  return Object.keys(errors).length ? { errors } : { value };
}

function bmiOf(weightKg, heightCm) {
  const bmi = weightKg / (heightCm / 100) ** 2;
  const category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy weight" : bmi < 30 ? "Overweight" : "Obese";
  return { value: Math.round(bmi * 10) / 10, category };
}

function calculateTargets({ age, heightCm, weightKg, gender, goal, activity }) {
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (gender === "male" ? 5 : -161);
  const tdee = bmr * ACTIVITY[activity].factor;
  const bmi = bmiOf(weightKg, heightCm);

  // Goal adjustment: a moderate deficit or surplus, sized to the person.
  let adjustment = 0;
  if (goal === "lose") adjustment = -Math.min(500, tdee * 0.2); // about 0.25–0.5 kg per week
  if (goal === "gain") adjustment = Math.min(350, tdee * 0.12); // lean gain, limits fat gain
  // Someone underweight shouldn't be in a deficit.
  if (goal === "lose" && bmi.value < 18.5) adjustment = 0;

  const floor = CALORIE_FLOOR[gender];
  const raw = tdee + adjustment;
  const floorApplied = raw < floor;
  const calories = round(Math.max(raw, floor), 10);

  // Protein by body weight, using a lean-mass estimate for higher BMIs so targets stay realistic.
  const refWeight = bmi.value > 30 ? 25 * (heightCm / 100) ** 2 : weightKg;
  const proteinPerKg = { lose: 2.0, maintain: 1.6, gain: 1.8 }[goal];
  let proteinG = refWeight * proteinPerKg;
  proteinG = Math.min(proteinG, (calories * 0.35) / 4); // at most 35% of calories
  // Fat: 25–30% of calories, and never under 0.6 g per kg (hormone health).
  let fatG = Math.max((calories * (goal === "gain" ? 0.25 : 0.28)) / 9, weightKg * 0.6);
  fatG = Math.min(fatG, (calories * 0.35) / 9);
  const carbsG = Math.max(0, (calories - proteinG * 4 - fatG * 9) / 4);

  const macro = (grams, perGram) => {
    const g = Math.round(grams);
    return { grams: g, kcal: g * perGram, percent: Math.round(((g * perGram) / calories) * 100) };
  };
  const actualDelta = calories - tdee;
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: calories,
    adjustment: Math.round(actualDelta),
    floorApplied,
    calorieFloor: floor,
    // 7,700 kcal is roughly 1 kg of body fat.
    weeklyChangeKg: Math.round(((actualDelta * 7) / 7700) * 100) / 100,
    bmi,
    protein: macro(proteinG, 4),
    carbs: macro(carbsG, 4),
    fats: macro(fatG, 9),
    fiberG: Math.round((calories / 1000) * 14),
    waterL: Math.round(weightKg * 0.035 * 10) / 10,
  };
}

module.exports = { validate, calculateTargets, bmiOf, ACTIVITY, GOALS, CALORIE_FLOOR, LIMITS };
