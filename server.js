// Daily Fitness, Diet Planner & Exercise Guide: API server and static site.
require("dotenv").config({ quiet: true });
const path = require("path");
const express = require("express");
const cors = require("cors");
const { validate, calculateTargets, ACTIVITY, GOALS } = require("./lib/calculator");
const { buildMealPlan, DIET_TIPS } = require("./lib/meals");
const { buildWorkoutPlan } = require("./lib/workouts");

const app = express();
app.disable("x-powered-by");

// CORS: open by default; set CORS_ORIGIN (comma-separated) to allow only your own sites.
const origins = (process.env.CORS_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors(origins.length ? { origin: origins } : {}));
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1h" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));

// ---------- The plan ----------
app.post("/api/generate-plan", (req, res) => {
  const { value, errors } = validate(req.body);
  if (errors) return res.status(400).json({ error: "Please check the highlighted fields.", fields: errors });

  const metrics = calculateTargets(value);
  const notes = [
    "This plan is general guidance, not medical advice. If you are pregnant, breastfeeding, under 18, or have a health condition (diabetes, heart, kidney or eating disorder history), check with a doctor or dietitian first.",
  ];
  if (metrics.floorApplied) notes.push(`Your calculated target was below the safe minimum, so it was raised to ${metrics.calorieFloor.toLocaleString()} kcal. Going lower can cost muscle and nutrients; to lose faster, add activity instead.`);
  if (value.goal === "lose" && metrics.bmi.value < 18.5) notes.push("Your BMI is in the underweight range, so the plan keeps you at maintenance calories instead of a deficit.");
  if (value.goal === "gain" && metrics.bmi.value >= 30) notes.push("With a BMI of 30 or more, many people get better results by building muscle at maintenance calories. Consider the \"Maintain & tone\" goal.");

  res.json({
    profile: {
      ...value,
      goalLabel: GOALS[value.goal].label,
      activityLabel: ACTIVITY[value.activity].label,
    },
    metrics,
    mealPlan: { days: buildMealPlan(metrics.targetCalories, value.diet), tips: DIET_TIPS },
    workoutPlan: buildWorkoutPlan(value.goal, value.activity),
    notes,
    generatedAt: new Date().toISOString(),
  });
});

// ---------- Exercise photos from Unsplash ----------
// The browser asks for a keyword (e.g. "goblet squat dumbbell workout"); the server searches Unsplash with the
// secret key and returns the photo URL plus the photographer credit Unsplash requires. Results are cached.
const imageCache = new Map();
const IMAGE_TTL = 24 * 3600 * 1000;
const UTM = "utm_source=fitness_planner&utm_medium=referral";

app.get("/api/image", async (req, res) => {
  const query = String(req.query.query || "").trim().slice(0, 80);
  if (!query) return res.status(400).json({ error: "Add ?query=keywords." });
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return res.json({ url: null, reason: "no-key" }); // the page shows its built-in illustration

  const hit = imageCache.get(query);
  if (hit && Date.now() - hit.at < IMAGE_TTL) return res.json(hit.data);
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&content_filter=high`;
    const r = await fetch(url, { headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" }, signal: AbortSignal.timeout(6000) });
    if (!r.ok) return res.json({ url: null, reason: `unsplash-${r.status}` });
    const photo = (await r.json()).results?.[0];
    const data = photo
      ? {
          url: `${photo.urls.raw}&w=800&h=450&fit=crop&auto=format&q=70`,
          alt: photo.alt_description || query,
          credit: { name: photo.user.name, link: `${photo.user.links.html}?${UTM}` },
          unsplashLink: `https://unsplash.com/?${UTM}`,
        }
      : { url: null, reason: "no-results" };
    imageCache.set(query, { at: Date.now(), data });
    res.json(data);
  } catch (err) {
    res.json({ url: null, reason: "unreachable" });
  }
});

app.use("/api", (req, res) => res.status(404).json({ error: "Not found." }));
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON." });
  console.error(err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 10000;
  app.listen(port, () => console.log(`Fitness planner running on http://localhost:${port}`));
}
module.exports = app;
