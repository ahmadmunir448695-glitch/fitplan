// A small library of healthy meals (including Pakistani home-style dishes) and the 7-day planner.
// Each meal lists its base portion and macros; the planner scales portions to the person's calorie target.
// Calories are always computed from macros (4 kcal/g protein and carbs, 9 kcal/g fat) so numbers agree.

// item: [name, amount, unit]; unit "g" / "ml" scale smoothly, "piece" / "slice" / "tbsp" round to whole units.
const MEALS = {
  breakfast: [
    { name: "Overnight oats with Greek yogurt & berries", veg: true, p: 22, c: 58, f: 9,
      items: [["Rolled oats", 50, "g"], ["Greek yogurt (low-fat)", 150, "g"], ["Mixed berries", 80, "g"], ["Chia seeds", 10, "g"]] },
    { name: "Vegetable omelette with whole-wheat toast", veg: true, p: 25, c: 28, f: 16,
      items: [["Eggs", 3, "piece"], ["Spinach, onion & tomato", 100, "g"], ["Whole-wheat toast", 2, "slice"]] },
    { name: "Besan chilla with mint yogurt", veg: true, p: 19, c: 42, f: 9,
      items: [["Gram flour (besan)", 60, "g"], ["Onion, tomato & coriander", 60, "g"], ["Plain yogurt", 100, "g"]] },
    { name: "Peanut butter & banana toast", veg: true, p: 13, c: 60, f: 12,
      items: [["Whole-grain bread", 2, "slice"], ["Peanut butter", 1, "tbsp"], ["Banana", 1, "piece"]] },
    { name: "Anda bhurji with whole-wheat roti", veg: true, p: 17, c: 26, f: 13,
      items: [["Eggs", 2, "piece"], ["Onion, tomato & green chilli", 80, "g"], ["Whole-wheat roti", 1, "piece"]] },
    { name: "Protein banana-oat smoothie", veg: true, p: 36, c: 55, f: 8,
      items: [["Low-fat milk", 250, "ml"], ["Whey protein", 30, "g"], ["Banana", 1, "piece"], ["Rolled oats", 30, "g"]] },
    { name: "Cottage cheese & fruit bowl with walnuts", veg: true, p: 24, c: 30, f: 10,
      items: [["Cottage cheese", 180, "g"], ["Apple or pear, sliced", 150, "g"], ["Walnuts", 10, "g"]] },
  ],
  lunch: [
    { name: "Grilled chicken, brown rice & garden salad", veg: false, p: 50, c: 40, f: 9,
      items: [["Chicken breast, grilled", 150, "g"], ["Brown rice, cooked", 150, "g"], ["Garden salad", 150, "g"], ["Olive oil", 5, "g"]] },
    { name: "Daal chawal with cucumber raita", veg: true, p: 24, c: 72, f: 8,
      items: [["Lentil daal, cooked", 200, "g"], ["Basmati rice, cooked", 150, "g"], ["Cucumber raita", 100, "g"]] },
    { name: "Chicken karahi (light oil) with roti & salad", veg: false, p: 45, c: 32, f: 15,
      items: [["Chicken karahi", 180, "g"], ["Whole-wheat roti", 1, "piece"], ["Kachumber salad", 100, "g"]] },
    { name: "Chickpea & quinoa power bowl", veg: true, p: 22, c: 62, f: 14,
      items: [["Chickpeas, cooked", 150, "g"], ["Quinoa, cooked", 120, "g"], ["Roasted vegetables", 100, "g"], ["Feta cheese", 30, "g"]] },
    { name: "Tuna & salad whole-wheat wrap", veg: false, p: 34, c: 38, f: 9,
      items: [["Tuna in water, drained", 100, "g"], ["Whole-wheat tortilla", 1, "piece"], ["Lettuce, tomato & onion", 80, "g"], ["Yogurt dressing", 30, "g"]] },
    { name: "Paneer & vegetable stir-fry with roti", veg: true, p: 24, c: 30, f: 22,
      items: [["Paneer", 100, "g"], ["Mixed vegetables", 150, "g"], ["Whole-wheat roti", 1, "piece"]] },
    { name: "Chicken keema matar with roti", veg: false, p: 38, c: 34, f: 14,
      items: [["Chicken mince with peas", 180, "g"], ["Whole-wheat roti", 1, "piece"], ["Sliced cucumber", 80, "g"]] },
    { name: "Rajma (kidney beans) with brown rice", veg: true, p: 20, c: 70, f: 7,
      items: [["Rajma curry", 200, "g"], ["Brown rice, cooked", 150, "g"], ["Onion & lemon salad", 60, "g"]] },
  ],
  snack: [
    { name: "Greek yogurt with honey & almonds", veg: true, p: 18, c: 18, f: 9,
      items: [["Greek yogurt", 170, "g"], ["Honey", 10, "g"], ["Almonds", 15, "g"]] },
    { name: "Apple with peanut butter", veg: true, p: 5, c: 27, f: 8,
      items: [["Apple", 1, "piece"], ["Peanut butter", 1, "tbsp"]] },
    { name: "Roasted chana & a fruit", veg: true, p: 8, c: 24, f: 3,
      items: [["Roasted chickpeas (chana)", 40, "g"], ["Orange or guava", 1, "piece"]] },
    { name: "Boiled eggs & cucumber", veg: true, p: 13, c: 3, f: 10,
      items: [["Boiled eggs", 2, "piece"], ["Cucumber sticks", 100, "g"]] },
    { name: "Hummus with carrot sticks", veg: true, p: 6, c: 22, f: 9,
      items: [["Hummus", 60, "g"], ["Carrot sticks", 120, "g"]] },
    { name: "Protein shake with milk", veg: true, p: 30, c: 14, f: 5,
      items: [["Whey protein", 30, "g"], ["Low-fat milk", 250, "ml"]] },
  ],
  dinner: [
    { name: "Baked salmon, sweet potato & broccoli", veg: false, p: 36, c: 45, f: 18,
      items: [["Salmon fillet", 150, "g"], ["Sweet potato, baked", 200, "g"], ["Steamed broccoli", 100, "g"]] },
    { name: "Grilled chicken tikka with salad & raita", veg: false, p: 48, c: 14, f: 12,
      items: [["Chicken tikka, grilled", 170, "g"], ["Mixed salad", 150, "g"], ["Mint raita", 100, "g"]] },
    { name: "Mixed vegetable daal with roti & salad", veg: true, p: 20, c: 50, f: 8,
      items: [["Mixed vegetable daal", 250, "g"], ["Whole-wheat roti", 1, "piece"], ["Salad", 100, "g"]] },
    { name: "Chicken & vegetable stir-fry with rice noodles", veg: false, p: 38, c: 50, f: 10,
      items: [["Chicken strips", 140, "g"], ["Stir-fry vegetables", 150, "g"], ["Rice noodles, cooked", 150, "g"]] },
    { name: "Paneer tikka with quinoa & greens", veg: true, p: 28, c: 40, f: 16,
      items: [["Paneer tikka", 120, "g"], ["Quinoa, cooked", 150, "g"], ["Sautéed greens", 100, "g"]] },
    { name: "Light fish curry with brown rice", veg: false, p: 34, c: 45, f: 12,
      items: [["Fish curry (light oil)", 180, "g"], ["Brown rice, cooked", 150, "g"], ["Salad", 80, "g"]] },
    { name: "Egg & vegetable fried brown rice", veg: true, p: 20, c: 55, f: 13,
      items: [["Brown rice, cooked", 180, "g"], ["Eggs", 2, "piece"], ["Peas, carrots & spring onion", 120, "g"]] },
  ],
};

const SLOTS = [
  { key: "breakfast", label: "Breakfast", time: "7:30 – 9:00", share: 0.25 },
  { key: "lunch", label: "Lunch", time: "12:30 – 14:00", share: 0.35 },
  { key: "snack", label: "Snack", time: "16:00 – 17:00", share: 0.1 },
  { key: "dinner", label: "Dinner", time: "19:30 – 20:30", share: 0.3 },
];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const kcalOf = (m) => m.p * 4 + m.c * 4 + m.f * 9;
const COUNTED = new Set(["piece", "slice", "tbsp"]);

function scaleMeal(meal, targetKcal) {
  const base = kcalOf(meal);
  // Keep portions sensible: between half and 2.5× the base serving.
  const factor = Math.min(2.5, Math.max(0.5, targetKcal / base));
  const items = meal.items.map(([name, amount, unit]) => {
    const scaled = amount * factor;
    const value = COUNTED.has(unit) ? Math.max(1, Math.round(scaled)) : Math.max(5, Math.round(scaled / 5) * 5);
    return { name, amount: value, unit };
  });
  const protein = Math.round(meal.p * factor);
  const carbs = Math.round(meal.c * factor);
  const fats = Math.round(meal.f * factor);
  return { name: meal.name, vegetarian: meal.veg, items, kcal: protein * 4 + carbs * 4 + fats * 9, protein, carbs, fats };
}

// Seven days, a different combination each day. Vegetarian plans use only vegetarian meals.
function buildMealPlan(targetCalories, diet = "balanced") {
  const pool = (slot) => MEALS[slot].filter((m) => diet !== "vegetarian" || m.veg);
  return DAYS.map((day, d) => {
    const meals = SLOTS.map((slot, s) => {
      const options = pool(slot.key);
      const meal = options[(d + s * 2) % options.length]; // consecutive days never repeat a meal
      return { slot: slot.label, time: slot.time, ...scaleMeal(meal, targetCalories * slot.share) };
    });
    const totals = meals.reduce((t, m) => ({ kcal: t.kcal + m.kcal, protein: t.protein + m.protein, carbs: t.carbs + m.carbs, fats: t.fats + m.fats }), { kcal: 0, protein: 0, carbs: 0, fats: 0 });
    return { day, meals, totals };
  });
}

const DIET_TIPS = [
  "Fill half your plate with vegetables or salad at lunch and dinner.",
  "Cook with measured oil: 1 teaspoon is about 40 kcal, and karahi or daal can hide 3–4 of them.",
  "Swap sugary drinks and chai with sugar for water, lemon water or unsweetened tea.",
  "Prep protein (grilled chicken, boiled eggs, cooked daal) twice a week so healthy meals are quick.",
  "Portions scale to your target. Weigh foods for the first week to learn what a portion looks like.",
];

module.exports = { buildMealPlan, MEALS, SLOTS, DAYS, DIET_TIPS, kcalOf };
