// GitHub Pages build only: answers the app's /api calls in the browser using the same plan code as server.js,
// so the site works with no server. (No Unsplash key here, so cards show the animated demos.)
const { validate, calculateTargets, ACTIVITY, GOALS } = require("../lib/calculator");
const { buildMealPlan, DIET_TIPS } = require("../lib/meals");
const { buildWorkoutPlan } = require("../lib/workouts");

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function generate(body) {
  const { value, errors } = validate(body);
  if (errors) return json(400, { error: "Please check the highlighted fields.", fields: errors });
  const metrics = calculateTargets(value);
  const notes = ["This plan is general guidance, not medical advice. If you are pregnant, breastfeeding, under 18, or have a health condition (diabetes, heart, kidney or eating disorder history), check with a doctor or dietitian first."];
  if (metrics.floorApplied) notes.push(`Your calculated target was below the safe minimum, so it was raised to ${metrics.calorieFloor.toLocaleString()} kcal. Going lower can cost muscle and nutrients; to lose faster, add activity instead.`);
  if (value.goal === "lose" && metrics.bmi.value < 18.5) notes.push("Your BMI is in the underweight range, so the plan keeps you at maintenance calories instead of a deficit.");
  if (value.goal === "gain" && metrics.bmi.value >= 30) notes.push('With a BMI of 30 or more, many people get better results by building muscle at maintenance calories. Consider the "Maintain & tone" goal.');
  return json(200, {
    profile: { ...value, goalLabel: GOALS[value.goal].label, activityLabel: ACTIVITY[value.activity].label },
    metrics,
    mealPlan: { days: buildMealPlan(metrics.targetCalories, value.diet), tips: DIET_TIPS },
    workoutPlan: buildWorkoutPlan(value.goal, value.activity),
    notes,
    generatedAt: new Date().toISOString(),
  });
}

const realFetch = window.fetch.bind(window);
window.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.includes("/api/generate-plan")) {
    try {
      return generate(JSON.parse(opts.body || "{}"));
    } catch {
      return json(400, { error: "Invalid JSON." });
    }
  }
  if (u.includes("/api/image")) return json(200, { url: null, reason: "no-key" });
  return realFetch(url, opts);
};
