# FitPlan: Daily Fitness, Diet Planner & Exercise Guide

A full-stack web app that turns a few details (height, weight, age, gender, goal and activity level) into:

- **Safe daily calorie and macro targets**: protein, carbs and fats, shown as progress rings.
- **A 7-day meal plan**: 4 meals a day, with portions scaled to your calories. It includes Pakistani home-style dishes and has a vegetarian option.
- **A weekly workout routine**: every exercise card shows sets, reps, rest, tempo and effort, plus step-by-step instructions, form cues, common mistakes, and easier/harder versions.

It has a dark, responsive design built with Tailwind CSS, and runs on Node.js and Express.

## How the numbers work

| Step | Method |
|---|---|
| Resting burn (BMR) | Mifflin-St Jeor: `10×kg + 6.25×cm − 5×age + 5` (men) or `− 161` (women) |
| Daily burn (TDEE) | BMR × activity factor (1.2 sedentary … 1.9 athlete) |
| Lose fat | Deficit of 20% of TDEE, at most 500 kcal/day (about 0.25–0.5 kg a week). No deficit if the BMI is under 18.5 |
| Build muscle | Surplus of 12% of TDEE, at most 350 kcal/day |
| **Safety floor** | **Never below 1,200 kcal (women) or 1,500 kcal (men).** The app tells you when the floor applies |
| Protein | 2.0 / 1.6 / 1.8 g per kg for lose / maintain / gain. Uses a lean-weight estimate when BMI is over 30, and is capped at 35% of calories |
| Fats | 25–28% of calories, never under 0.6 g per kg |
| Carbs | The remaining calories |

Workout level comes from activity: sedentary or light is **Beginner**, moderate is **Intermediate**, and active or athlete is **Advanced**. Beginners automatically get easier versions of advanced moves, for example goblet squats instead of barbell squats.

## Run it

```bash
npm install
npm start          # http://localhost:10000
npm test           # 8 tests: formulas, safety floors, plans, API
```

## Exercise photos (Unsplash)

Each workout card asks the server for a photo by keyword, for example `/api/image?query=goblet squat dumbbell workout`. There are three kinds of card: strength, cardio/running and yoga/stretching. The server searches Unsplash with your key, caches the result for 24 hours, and returns the photo along with the photographer credit that Unsplash requires.

1. Create a free app at https://unsplash.com/developers and copy its **Access Key**.
2. `cp .env.example .env` and set `UNSPLASH_ACCESS_KEY=...`.

Without a key, the cards show built-in illustrations instead, so the app still works. The key stays on the server and is never sent to the browser.

> Why not put `source.unsplash.com/?keyword` URLs directly in the page? Unsplash shut that service down in 2024, so those images no longer load. Its official API needs a key, and a key must not be put in public HTML.

## Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | Default `10000` |
| `UNSPLASH_ACCESS_KEY` | Optional, for real exercise photos |
| `CORS_ORIGIN` | Optional, a comma-separated list of sites allowed to call the API (default: any) |

## Deploy (Render, Railway, etc.)

- **Build command:** `npm install`
- **Start command:** `npm start`
- Add `UNSPLASH_ACCESS_KEY` as an environment variable if you want photos.

## Changing the design

Styles are compiled from `src/styles.css` into `public/styles.css`, which is committed so `npm start` works straight away. After you change Tailwind classes in `public/`, run:

```bash
npm run build:css
```

## API

`POST /api/generate-plan`

```json
{ "heightCm": 170, "weightKg": 72, "age": 28, "gender": "female", "goal": "lose", "activity": "moderate", "diet": "balanced" }
```

- **Values:** `goal` is `lose`, `maintain` or `gain`. `activity` is `sedentary`, `light`, `moderate`, `active` or `athlete`. `diet` is `balanced` or `vegetarian`.
- **Response:** `{ profile, metrics, mealPlan: { days[7], tips }, workoutPlan: { level, days[7], guidelines }, notes }`.
- **Invalid input:** returns `400` with `{ error, fields }`.

## Disclaimer

The app gives general guidance for healthy adults, not medical advice. People who are pregnant, under 18, or have a medical condition should check with a doctor or dietitian first.
