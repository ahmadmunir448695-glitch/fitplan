// Run with `npm test`. Checks the calorie maths, the safety floors, and the API response shape.
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { calculateTargets, validate } = require("../lib/calculator");
const { buildMealPlan } = require("../lib/meals");
const { buildWorkoutPlan, EXERCISES, TEMPLATES } = require("../lib/workouts");
const app = require("../server");

const person = (over = {}) => ({ age: 30, heightCm: 175, weightKg: 75, gender: "male", goal: "maintain", activity: "moderate", ...over });

test("BMR and TDEE follow Mifflin-St Jeor", () => {
  const m = calculateTargets(person());
  assert.equal(m.bmr, Math.round(10 * 75 + 6.25 * 175 - 5 * 30 + 5)); // 1699
  assert.equal(m.tdee, Math.round(m.bmr * 1.55));
  assert.equal(m.targetCalories, Math.round(m.tdee / 10) * 10, "maintain = TDEE");
  const f = calculateTargets(person({ gender: "female" }));
  assert.equal(f.bmr, m.bmr - 166);
});

test("safe floors: never below 1,200 kcal (women) or 1,500 kcal (men)", () => {
  const small = { age: 70, heightCm: 150, weightKg: 45, goal: "lose", activity: "sedentary" };
  const w = calculateTargets({ ...small, gender: "female" });
  assert.equal(w.targetCalories, 1200);
  assert.equal(w.floorApplied, true);
  const m = calculateTargets({ ...small, gender: "male" });
  assert.equal(m.targetCalories, 1500);
  assert.equal(m.floorApplied, true);
  // Across a wide range of people, the floor always holds.
  for (const gender of ["female", "male"])
    for (const weightKg of [40, 60, 90, 140])
      for (const age of [18, 45, 80])
        for (const activity of ["sedentary", "athlete"]) {
          const t = calculateTargets({ age, heightCm: 160, weightKg, gender, goal: "lose", activity });
          assert.ok(t.targetCalories >= (gender === "female" ? 1200 : 1500), `${gender} ${weightKg}kg ${age}y`);
        }
});

test("goals change calories sensibly and macros add up", () => {
  const lose = calculateTargets(person({ goal: "lose" }));
  const gain = calculateTargets(person({ goal: "gain" }));
  assert.ok(lose.targetCalories < lose.tdee && lose.tdee - lose.targetCalories <= 510, "deficit at most ~500 kcal");
  assert.ok(gain.targetCalories > gain.tdee && gain.targetCalories - gain.tdee <= 360);
  assert.ok(lose.weeklyChangeKg < 0 && lose.weeklyChangeKg >= -0.5);
  for (const t of [lose, gain]) {
    const sum = t.protein.kcal + t.carbs.kcal + t.fats.kcal;
    assert.ok(Math.abs(sum - t.targetCalories) <= 12, `macros ${sum} vs ${t.targetCalories}`);
    assert.ok(t.protein.percent <= 36 && t.fats.percent <= 36);
  }
  const under = calculateTargets({ ...person({ goal: "lose" }), heightCm: 185, weightKg: 58 });
  assert.ok(Math.abs(under.adjustment) < 10, "no deficit for an underweight BMI (only rounding to 10 kcal)");
});

test("validation explains each bad field", () => {
  assert.deepEqual(Object.keys(validate({}).errors).sort(), ["activity", "age", "gender", "goal", "heightCm", "weightKg"]);
  assert.match(validate({ ...person(), age: 15 }).errors.age, /18 and 80/);
  assert.ok(validate({ ...person(), weight: "80", height: "180" }).value, "accepts height/weight aliases and numeric strings");
});

test("meal plan: 7 days, 4 meals, near the target, vegetarian respected", () => {
  const days = buildMealPlan(2000, "balanced");
  assert.equal(days.length, 7);
  for (const d of days) {
    assert.equal(d.meals.length, 4);
    assert.ok(Math.abs(d.totals.kcal - 2000) / 2000 < 0.12, `${d.day} ${d.totals.kcal}`);
  }
  assert.notEqual(days[0].meals[1].name, days[1].meals[1].name, "lunch changes day to day");
  const veg = buildMealPlan(1800, "vegetarian");
  assert.ok(veg.every((d) => d.meals.every((m) => m.vegetarian)));
});

test("workout: every exercise has a full guide; level picks suitable moves", () => {
  for (const [id, e] of Object.entries(EXERCISES)) {
    assert.ok(e.steps.length >= 4 && e.cues.length >= 2 && e.mistakes.length >= 2 && e.easier && e.harder && e.imageQuery, id);
  }
  for (const goal of Object.keys(TEMPLATES)) {
    const beginner = buildWorkoutPlan(goal, "sedentary");
    assert.equal(beginner.days.length, 7);
    assert.equal(beginner.level, "Beginner");
    const all = beginner.days.flatMap((d) => d.exercises);
    assert.ok(all.every((e) => EXERCISES[e.id].level === 1), `${goal}: beginners get beginner moves`);
    assert.ok(all.every((e) => e.prescription.sets >= 1 && e.prescription.reps && e.prescription.rest));
  }
  for (const goal of Object.keys(TEMPLATES))
    for (const activity of ["sedentary", "moderate", "athlete"])
      for (const d of buildWorkoutPlan(goal, activity).days) assert.ok(d.durationMin <= 75, `${goal}/${activity} ${d.title}: ${d.durationMin} min`);
  const adv = buildWorkoutPlan("gain", "athlete");
  assert.ok(adv.days.flatMap((d) => d.exercises).some((e) => e.id === "backSquat"));
  assert.equal(adv.days[0].exercises[0].prescription.reps, "6–10");
  assert.equal(buildWorkoutPlan("lose", "moderate").days[0].exercises[0].prescription.reps, "12–15");
});

// ---------- API ----------
let server, base;
before(async () => {
  delete process.env.UNSPLASH_ACCESS_KEY;
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

test("POST /api/generate-plan returns targets, 7-day meals and a workout", async () => {
  const res = await fetch(`${base}/api/generate-plan`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ height: 162, weight: 58, age: 26, gender: "female", goal: "lose", activityLevel: "light" }) });
  assert.equal(res.status, 200);
  const p = await res.json();
  assert.ok(p.metrics.targetCalories >= 1200);
  assert.deepEqual(Object.keys(p.metrics).filter((k) => ["protein", "carbs", "fats"].includes(k)), ["protein", "carbs", "fats"]);
  assert.equal(p.mealPlan.days.length, 7);
  assert.equal(p.workoutPlan.days.length, 7);
  assert.ok(p.workoutPlan.days[0].exercises[0].steps.length >= 4);
  assert.ok(p.notes[0].includes("not medical advice"));
});

test("bad input gets a 400 with field errors; images degrade without a key", async () => {
  const bad = await fetch(`${base}/api/generate-plan`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ age: 10 }) });
  assert.equal(bad.status, 400);
  assert.ok((await bad.json()).fields.age);
  const broken = await fetch(`${base}/api/generate-plan`, { method: "POST", headers: { "content-type": "application/json" }, body: "{oops" });
  assert.equal(broken.status, 400);
  const img = await (await fetch(`${base}/api/image?query=goblet%20squat`)).json();
  assert.deepEqual(img, { url: null, reason: "no-key" });
  const home = await fetch(`${base}/`);
  assert.equal(home.status, 200);
  assert.match(await home.text(), /Build your plan/);
});
