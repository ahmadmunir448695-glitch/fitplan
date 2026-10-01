// FitPlan front end: reads the form, calls POST /api/generate-plan, and renders the dashboard.
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const nf = new Intl.NumberFormat("en-US");

  const form = $("#plan-form");
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem("fitplan:" + k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem("fitplan:" + k, JSON.stringify(v)); } catch {} },
  };

  // ---------- Units ----------
  let units = store.get("units") || "metric";
  function setUnits(next) {
    const w = $("#weight");
    const prev = units;
    units = next;
    store.set("units", units);
    $$(".unit-btn").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.units === units)));
    $("#height-metric").classList.toggle("hidden", units !== "metric");
    $("#height-imperial").classList.toggle("hidden", units === "metric");
    $("#weight-unit").textContent = units === "metric" ? "(kg)" : "(lb)";
    w.placeholder = units === "metric" ? "72" : "160";
    if (prev === next) return;
    // Convert what's already typed so switching units never loses input.
    if (next === "imperial") {
      const cm = parseFloat($("#heightCm").value);
      if (cm) {
        const inches = cm / 2.54;
        $("#heightFt").value = Math.floor(inches / 12);
        $("#heightIn").value = Math.round(inches % 12);
      }
      if (parseFloat(w.value)) w.value = Math.round(parseFloat(w.value) * 2.20462);
    } else {
      const ft = parseFloat($("#heightFt").value) || 0, inch = parseFloat($("#heightIn").value) || 0;
      if (ft || inch) $("#heightCm").value = Math.round((ft * 12 + inch) * 2.54);
      if (parseFloat(w.value)) w.value = Math.round(parseFloat(w.value) / 2.20462);
    }
  }
  $$(".unit-btn").forEach((b) => b.addEventListener("click", () => setUnits(b.dataset.units)));
  setUnits(units);

  // Refill the form from last time.
  const saved = store.get("form");
  if (saved) {
    for (const [k, v] of Object.entries(saved)) {
      const radio = form.querySelector(`input[type=radio][name="${k}"][value="${v}"]`);
      if (radio) radio.checked = true;
      else if ($("#" + k)) $("#" + k).value = v;
    }
  }

  // ---------- Read & check the form ----------
  function readForm() {
    const val = (id) => $("#" + id).value.trim();
    const radio = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value || "";
    let heightCm, weightKg;
    if (units === "metric") {
      heightCm = parseFloat(val("heightCm"));
      weightKg = parseFloat(val("weight"));
    } else {
      const ft = parseFloat(val("heightFt")), inch = parseFloat(val("heightIn") || "0");
      heightCm = Number.isFinite(ft) ? Math.round((ft * 12 + inch) * 2.54 * 10) / 10 : NaN;
      weightKg = Math.round((parseFloat(val("weight")) / 2.20462) * 10) / 10;
    }
    return { heightCm, weightKg, age: parseInt(val("age"), 10), gender: radio("gender"), goal: radio("goal"), activity: val("activity"), diet: radio("diet") || "balanced" };
  }

  function check(d) {
    const errs = {};
    if (!(d.heightCm >= 120 && d.heightCm <= 230)) errs.heightCm = units === "metric" ? "Height must be 120–230 cm." : "Height must be between 3 ft 11 in and 7 ft 6 in.";
    if (!(d.weightKg >= 35 && d.weightKg <= 250)) errs.weightKg = units === "metric" ? "Weight must be 35–250 kg." : "Weight must be 77–550 lb.";
    if (!(d.age >= 18 && d.age <= 80)) errs.age = "Age must be 18–80. This planner is for adults.";
    if (!d.gender) errs.gender = "Choose your gender (it changes the calorie formula).";
    if (!d.goal) errs.goal = "Choose a goal.";
    if (!d.activity) errs.activity = "Choose your activity level.";
    return errs;
  }

  function showErrors(errs) {
    const fieldEl = { heightCm: units === "metric" ? ["#heightCm"] : ["#heightFt", "#heightIn"], weightKg: ["#weight"], age: ["#age"], activity: ["#activity"] };
    $$(".input").forEach((i) => i.classList.remove("invalid"));
    for (const k of Object.keys(errs)) (fieldEl[k] || []).forEach((s) => $(s).classList.add("invalid"));
    const msgs = Object.values(errs);
    const box = $("#form-error");
    box.textContent = msgs.join(" ");
    box.classList.toggle("hidden", !msgs.length);
    const first = Object.keys(errs)[0];
    if (first && fieldEl[first]) $(fieldEl[first][0]).focus();
  }
  form.addEventListener("input", (e) => e.target.classList?.remove("invalid"));

  // ---------- Submit ----------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = readForm();
    const errs = check(data);
    showErrors(errs);
    if (Object.keys(errs).length) return;
    store.set("form", {
      heightCm: $("#heightCm").value, heightFt: $("#heightFt").value, heightIn: $("#heightIn").value, weight: $("#weight").value,
      age: $("#age").value, activity: data.activity, gender: data.gender, goal: data.goal, diet: data.diet,
    });
    setBusy(true);
    try {
      const res = await fetch("/api/generate-plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        showErrors(body.fields || { form: body.error || "Something went wrong. Please try again." });
        $("#loading").classList.add("hidden");
        $("#empty").classList.remove("hidden");
        return;
      }
      render(body);
    } catch {
      showErrors({ form: "Couldn't reach the server. Check your connection and try again." });
      $("#loading").classList.add("hidden");
      $("#empty").classList.remove("hidden");
    } finally {
      setBusy(false);
    }
  });

  function setBusy(busy) {
    $("#submit-btn").disabled = busy;
    $("#submit-spin").classList.toggle("hidden", !busy);
    $("#submit-label").textContent = busy ? "Building your plan…" : "Generate my plan";
    if (busy) {
      $("#empty").classList.add("hidden");
      $("#dashboard").classList.add("hidden");
      $("#loading").classList.remove("hidden");
      if (window.innerWidth < 1024) $("#results").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // ---------- Dashboard ----------
  let plan = null;
  let tab = "diet";
  let dietDay = 0;
  let workoutDay = 0;

  function render(p) {
    plan = p;
    dietDay = workoutDay = (new Date().getDay() + 6) % 7; // open on today
    const m = p.metrics;
    const dash = $("#dashboard");
    dash.innerHTML = `
      ${summaryCard(p)}
      ${p.notes.length ? `<div class="reveal space-y-2">${p.notes.map((n, i) => `
        <div class="flex gap-3 rounded-xl border ${i === 0 ? "border-white/5 bg-ink-900/60 text-slate-400" : "border-amber-400/30 bg-amber-400/10 text-amber-100"} px-4 py-3 text-sm">
          <span aria-hidden="true">${i === 0 ? "ℹ️" : "⚠️"}</span><p>${esc(n)}</p></div>`).join("")}</div>` : ""}
      <div class="reveal card p-2" style="animation-delay:.15s">
        <div class="flex gap-1 rounded-xl bg-ink-950 p-1" role="tablist" aria-label="Plan sections">
          <button type="button" class="tab" role="tab" id="tab-diet" aria-controls="panel" data-tab="diet">🥗 Diet Plan</button>
          <button type="button" class="tab" role="tab" id="tab-workout" aria-controls="panel" data-tab="workout">🏋️ Workout Routines</button>
        </div>
        <div id="panel" role="tabpanel" class="p-3 sm:p-4"></div>
      </div>`;
    $$(".tab", dash).forEach((b) => b.addEventListener("click", () => ((tab = b.dataset.tab), renderPanel())));
    // Assigned (not added) so generating another plan doesn't stack up duplicate handlers.
    dash.onkeydown = (e) => {
      if (!e.target.matches(".tab") || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      tab = tab === "diet" ? "workout" : "diet";
      renderPanel();
      $(`#tab-${tab}`).focus();
    };
    $("#loading").classList.add("hidden");
    dash.classList.remove("hidden");
    renderPanel();
    // Animate the rings after they're on screen.
    requestAnimationFrame(() => requestAnimationFrame(() => $$(".ring-bar", dash).forEach((c) => (c.style.strokeDashoffset = c.dataset.offset))));
  }

  function summaryCard(p) {
    const m = p.metrics;
    const change = m.weeklyChangeKg;
    const changeText = Math.abs(change) < 0.05 ? "Keeps your weight steady" : `${change > 0 ? "+" : "−"}${Math.abs(change).toFixed(2)} kg per week (estimate)`;
    const ring = (key, label, macro, color) => {
      const r = 42, c = 2 * Math.PI * r;
      return `
        <div class="flex flex-col items-center rounded-2xl bg-ink-950/60 p-4">
          <div class="relative h-28 w-28">
            <svg viewBox="0 0 100 100" class="h-full w-full -rotate-90" role="img" aria-label="${label}: ${macro.grams} grams, ${macro.percent}% of calories">
              <circle cx="50" cy="50" r="${r}" fill="none" stroke-width="9" class="ring-track"/>
              <circle cx="50" cy="50" r="${r}" fill="none" stroke-width="9" stroke-linecap="round" stroke="${color}" class="ring-bar"
                stroke-dasharray="${c}" stroke-dashoffset="${c}" data-offset="${c * (1 - macro.percent / 100)}"/>
            </svg>
            <div class="absolute inset-0 grid place-items-center text-center">
              <div><div class="text-2xl font-extrabold text-white">${macro.grams}<span class="text-sm font-semibold text-slate-400">g</span></div>
              <div class="text-xs text-slate-400">${macro.percent}%</div></div>
            </div>
          </div>
          <div class="mt-3 flex items-center gap-2 text-sm font-semibold text-white"><span class="h-2.5 w-2.5 rounded-full" style="background:${color}"></span>${label}</div>
          <div class="text-xs text-slate-400">${nf.format(macro.kcal)} kcal</div>
        </div>`;
    };
    return `
      <div class="reveal card overflow-hidden">
        <div class="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-emerald-400">Your daily target · ${esc(p.profile.goalLabel)}</p>
            <div class="mt-2 flex items-end gap-2">
              <span class="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">${nf.format(m.targetCalories)}</span>
              <span class="mb-2 text-lg font-semibold text-slate-400">kcal/day</span>
            </div>
            <p class="mt-1 text-sm text-slate-300">${changeText}${m.floorApplied ? ` · <span class="text-amber-300">raised to the safe minimum</span>` : ""}</p>
            <dl class="mt-5 grid grid-cols-2 gap-3 text-sm">
              ${stat("Maintenance (TDEE)", nf.format(m.tdee) + " kcal")}
              ${stat("Resting burn (BMR)", nf.format(m.bmr) + " kcal")}
              ${stat("BMI", `${m.bmi.value} · ${esc(m.bmi.category)}`)}
              ${stat("Water · Fibre", `${m.waterL} L · ${m.fiberG} g`)}
            </dl>
          </div>
          <div>
            <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Macro breakdown</p>
            <div class="grid grid-cols-3 gap-3">
              ${ring("protein", "Protein", m.protein, "#60a5fa")}
              ${ring("carbs", "Carbs", m.carbs, "#fbbf24")}
              ${ring("fats", "Fats", m.fats, "#f472b6")}
            </div>
            <div class="mt-3 flex h-2.5 overflow-hidden rounded-full bg-white/5" role="img" aria-label="Calories split: protein ${m.protein.percent}%, carbs ${m.carbs.percent}%, fats ${m.fats.percent}%">
              <div style="width:${m.protein.percent}%;background:#60a5fa"></div>
              <div class="border-l-2 border-ink-900" style="width:${m.carbs.percent}%;background:#fbbf24"></div>
              <div class="border-l-2 border-ink-900" style="width:${m.fats.percent}%;background:#f472b6"></div>
            </div>
          </div>
        </div>
      </div>`;
  }
  const stat = (k, v) => `<div class="rounded-xl bg-ink-950/60 px-3 py-2.5"><dt class="text-xs text-slate-400">${k}</dt><dd class="mt-0.5 font-semibold text-white">${v}</dd></div>`;

  function renderPanel() {
    $$(".tab").forEach((b) => {
      b.setAttribute("aria-selected", String(b.dataset.tab === tab));
      b.tabIndex = b.dataset.tab === tab ? 0 : -1;
    });
    $("#panel").setAttribute("aria-labelledby", `tab-${tab}`);
    $("#panel").innerHTML = tab === "diet" ? dietPanel() : workoutPanel();
    $$("[data-day]", $("#panel")).forEach((b) =>
      b.addEventListener("click", () => {
        if (tab === "diet") dietDay = +b.dataset.day;
        else workoutDay = +b.dataset.day;
        renderPanel();
      }),
    );
    if (tab === "workout") loadImages();
  }

  const dayStrip = (days, current, sub) => `
    <div class="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Day">
      ${days.map((d, i) => `<button type="button" role="tab" class="day-pill" data-day="${i}" aria-selected="${i === current}">
        <div class="font-bold text-white">${d.day.slice(0, 3)}</div><div class="text-[11px] text-slate-400">${sub(d)}</div></button>`).join("")}
    </div>`;

  // ---------- Diet ----------
  const SLOT_ICON = { Breakfast: "🌅", Lunch: "🍛", Snack: "🍎", Dinner: "🌙" };
  function dietPanel() {
    const d = plan.mealPlan.days[dietDay];
    const target = plan.metrics.targetCalories;
    const pct = Math.round((d.totals.kcal / target) * 100);
    const unit = (it) => (it.unit === "g" || it.unit === "ml" ? `${it.amount} ${it.unit}` : `${it.amount} ${it.unit === "tbsp" ? "tbsp" : it.unit}${it.amount > 1 && it.unit !== "tbsp" ? "s" : ""}`);
    return `
      ${dayStrip(plan.mealPlan.days, dietDay, (x) => `${nf.format(x.totals.kcal)} kcal`)}
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink-950/60 px-4 py-3">
        <div><div class="text-sm font-bold text-white">${d.day}</div><div class="text-xs text-slate-400">${nf.format(d.totals.kcal)} of ${nf.format(target)} kcal · ${pct}% of target</div></div>
        <div class="flex flex-wrap gap-2 text-xs">
          <span class="chip"><span class="mr-1.5 h-2 w-2 rounded-full bg-protein"></span>Protein ${d.totals.protein} g</span>
          <span class="chip"><span class="mr-1.5 h-2 w-2 rounded-full bg-carbs"></span>Carbs ${d.totals.carbs} g</span>
          <span class="chip"><span class="mr-1.5 h-2 w-2 rounded-full bg-fats"></span>Fats ${d.totals.fats} g</span>
        </div>
      </div>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        ${d.meals.map((m) => `
          <article class="rounded-2xl border border-white/5 bg-ink-850 p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-emerald-400">${SLOT_ICON[m.slot] || ""} ${esc(m.slot)} <span class="font-normal normal-case tracking-normal text-slate-500">· ${esc(m.time)}</span></p>
                <h3 class="mt-1 font-bold leading-snug text-white">${esc(m.name)}</h3>
              </div>
              <div class="shrink-0 rounded-lg bg-ink-950 px-2.5 py-1 text-right"><div class="text-lg font-extrabold text-white">${m.kcal}</div><div class="-mt-1 text-[10px] uppercase text-slate-400">kcal</div></div>
            </div>
            <ul class="mt-3 space-y-1.5 text-sm">
              ${m.items.map((it) => `<li class="flex justify-between gap-3 border-b border-white/5 pb-1.5 last:border-0"><span class="text-slate-300">${esc(it.name)}</span><span class="shrink-0 font-semibold text-white">${esc(unit(it))}</span></li>`).join("")}
            </ul>
            ${macroBar(m)}
          </article>`).join("")}
      </div>
      <div class="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4">
        <h4 class="text-sm font-bold text-white">Tips for this plan</h4>
        <ul class="mt-2 grid gap-1.5 text-sm text-slate-300 sm:grid-cols-2">${plan.mealPlan.tips.map((t) => `<li class="flex gap-2"><span class="text-emerald-400">✓</span>${esc(t)}</li>`).join("")}</ul>
      </div>`;
  }
  function macroBar(m) {
    const kcal = { p: m.protein * 4, c: m.carbs * 4, f: m.fats * 9 };
    const total = kcal.p + kcal.c + kcal.f || 1;
    return `
      <div class="mt-3">
        <div class="flex h-2 overflow-hidden rounded-full bg-white/5">
          <div class="bg-protein" style="width:${(kcal.p / total) * 100}%"></div><div class="border-l-2 border-ink-850 bg-carbs" style="width:${(kcal.c / total) * 100}%"></div><div class="border-l-2 border-ink-850 bg-fats" style="width:${(kcal.f / total) * 100}%"></div>
        </div>
        <div class="mt-1.5 flex justify-between text-[11px] text-slate-400"><span>P ${m.protein} g</span><span>C ${m.carbs} g</span><span>F ${m.fats} g</span></div>
      </div>`;
  }

  // ---------- Workouts ----------
  const TYPE_ICON = { strength: "🏋️", cardio: "🏃", mobility: "🧘", rest: "😴" };
  const CAT = {
    strength: { label: "Strength", badge: "bg-sky-500/15 text-sky-300", from: "#1e3a8a", to: "#0f172a", icon: "M6 9v6M9 7v10M15 7v10M18 9v6M9 12h6", fallbackQuery: "weight lifting gym" },
    core: { label: "Core", badge: "bg-violet-500/15 text-violet-300", from: "#4c1d95", to: "#0f172a", icon: "M4 15h16M7 15l3-6h4l3 6M12 5v4", fallbackQuery: "core workout" },
    cardio: { label: "Cardio", badge: "bg-orange-500/15 text-orange-300", from: "#9a3412", to: "#0f172a", icon: "M13 4a1.5 1.5 0 1 0 0 .1M9 20l2-6 3 2v4M7 12l3-4 4 1 2 3 3 1", fallbackQuery: "running cardio" },
    mobility: { label: "Yoga & Mobility", badge: "bg-emerald-500/15 text-emerald-300", from: "#065f46", to: "#0f172a", icon: "M12 4a1.5 1.5 0 1 0 0 .1M12 7v6M6 10l6 3 6-3M8 20l4-7 4 7", fallbackQuery: "yoga stretching" },
  };
  const placeholder = (cat) => {
    const c = CAT[cat];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.from}"/><stop offset="1" stop-color="${c.to}"/></linearGradient></defs><rect width="400" height="225" fill="url(#g)"/><g transform="translate(152 64) scale(4)" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${c.icon}"/></g></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  };

  // ---------- Animated exercise demos ----------
  // A stick figure posed from public/moves.js. Elbows and knees are solved with two-bone IK, then SVG <animate>
  // morphs smoothly between the key poses. Reduced-motion users get the still pose pictures only.
  const MOVES = window.FITPLAN_MOVES || {};
  const SEG = { ua: 24, fa: 22, th: 30, sh: 30 };
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const r1 = (v) => Math.round(v * 10) / 10;

  function ik(a, b, l1, l2, hint) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const dist = Math.hypot(dx, dy) || 1;
    const d = Math.min(Math.max(dist, 1), l1 + l2 - 0.5);
    const ang = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
    const ux = dx / dist, uy = dy / dist, c = Math.cos(ang), s = Math.sin(ang);
    const p1 = [a[0] + l1 * (ux * c - uy * s), a[1] + l1 * (ux * s + uy * c)];
    const p2 = [a[0] + l1 * (ux * c + uy * s), a[1] + l1 * (-ux * s + uy * c)];
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const score = (p) => (p[0] - mx) * hint[0] + (p[1] - my) * hint[1];
    return score(p1) >= score(p2) ? p1 : p2;
  }

  function pose(f, mv) {
    const ei = f.ei || mv.ei || [-1, 0.3], ki = f.ki || mv.ki || [1, 0];
    const g = {
      n: f.n, h: f.h, hf: f.hf, hb: f.hb, ff: f.ff, fb: f.fb,
      ef: f.ef || ik(f.n, f.hf, SEG.ua, SEG.fa, f.efi || ei),
      eb: f.eb || ik(f.n, f.hb, SEG.ua, SEG.fa, f.ebi || ei),
      kf: f.kf || ik(f.h, f.ff, SEG.th, SEG.sh, f.kfi || ki),
      kb: f.kb || ik(f.h, f.fb, SEG.th, SEG.sh, f.kbi || ki),
    };
    const tx = f.n[0] - f.h[0], ty = f.n[1] - f.h[1], tl = Math.hypot(tx, ty) || 1;
    const ux = tx / tl, uy = ty / tl;
    g.head = f.hd || [f.n[0] + ux * 12, f.n[1] + uy * 12];
    const sp = f.sp || 0; // spine curve: control point pushed perpendicular to the torso
    g.tc = [(f.n[0] + f.h[0]) / 2 + uy * sp, (f.n[1] + f.h[1]) / 2 - ux * sp];
    g.rope = f.rope;
    return g;
  }
  const P = (p) => `${r1(p[0])} ${r1(p[1])}`;
  const limbs = (g, side) => (side === "b" ? `M${P(g.n)}L${P(g.eb)}L${P(g.hb)}M${P(g.h)}L${P(g.kb)}L${P(g.fb)}` : `M${P(g.n)}L${P(g.ef)}L${P(g.hf)}M${P(g.h)}L${P(g.kf)}L${P(g.ff)}`);
  const torso = (g) => `M${P(g.h)}Q${P(g.tc)} ${P(g.n)}`;

  function staticProps(mv) {
    return (mv.props || []).map((p) => {
      if (p.t === "mat") return `<rect x="8" y="150" width="184" height="4" rx="2" fill="rgba(52,211,153,.35)"/>`;
      if (p.t === "bench") return `<g fill="#475569"><rect x="${p.x}" y="${p.y}" width="${p.w}" height="7" rx="2"/><rect x="${p.x + 6}" y="${p.y + 7}" width="5" height="${150 - p.y - 7}"/><rect x="${p.x + p.w - 11}" y="${p.y + 7}" width="5" height="${150 - p.y - 7}"/></g>`;
      if (p.t === "seat") return `<g fill="#475569"><rect x="${p.x - 16}" y="${p.y}" width="32" height="7" rx="2"/><rect x="${p.x - 3}" y="${p.y + 7}" width="6" height="${150 - p.y - 7}"/></g>`;
      if (p.t === "bike") return `<g fill="none" stroke="#64748b" stroke-width="3" stroke-linecap="round"><circle cx="54" cy="132" r="18"/><circle cx="156" cy="132" r="18"/><path d="M54 132 L100 128 L88 100 M100 128 L142 92 L88 100 M142 92 L156 132 M136 78 L146 80 L142 92 M80 98 L96 98"/><circle cx="100" cy="128" r="3" fill="#64748b"/></g>`;
      return "";
    }).join("");
  }

  // Everything that moves, as SVG fragments; `anim(values)` adds the animation (or nothing for a still).
  function movingParts(mv, geoms, anim) {
    const g0 = geoms[0];
    const back = mv.front ? "#e2e8f0" : "#94a3b8";
    let out = `<path d="${limbs(g0, "b")}" fill="none" stroke="${back}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${anim("d", geoms.map((g) => limbs(g, "b")))}</path>`;
    out += `<path d="${torso(g0)}" fill="none" stroke="#f8fafc" stroke-width="9" stroke-linecap="round">${anim("d", geoms.map(torso))}</path>`;
    out += `<circle r="10" cx="${r1(g0.head[0])}" cy="${r1(g0.head[1])}" fill="#f8fafc">${anim("cx", geoms.map((g) => r1(g.head[0])))}${anim("cy", geoms.map((g) => r1(g.head[1])))}</circle>`;
    out += `<path d="${limbs(g0, "f")}" fill="none" stroke="#f8fafc" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${anim("d", geoms.map((g) => limbs(g, "f")))}</path>`;
    for (const p of mv.props || []) {
      if (p.t === "db" || p.t === "kb") {
        const hands = p.t === "kb" ? ["mid"] : p.only === "front" ? ["hf"] : ["hb", "hf"];
        for (const k of hands) {
          const at = (g) => (k === "mid" ? [(g.hf[0] + g.hb[0]) / 2, (g.hf[1] + g.hb[1]) / 2 + 4] : g[k]);
          const r = p.t === "kb" || p.big ? 8 : 6;
          out += `<circle r="${r}" cx="${r1(at(g0)[0])}" cy="${r1(at(g0)[1])}" fill="#1e293b" stroke="#34d399" stroke-width="3">${anim("cx", geoms.map((g) => r1(at(g)[0])))}${anim("cy", geoms.map((g) => r1(at(g)[1])))}</circle>`;
        }
      }
      if (p.t === "plate") {
        const at = (g) => [(g.hf[0] + g.hb[0]) / 2, (g.hf[1] + g.hb[1]) / 2];
        out += `<circle r="15" cx="${r1(at(g0)[0])}" cy="${r1(at(g0)[1])}" fill="none" stroke="#34d399" stroke-width="5">${anim("cx", geoms.map((g) => r1(at(g)[0])))}${anim("cy", geoms.map((g) => r1(at(g)[1])))}</circle>`;
      }
      if (p.t === "cable") {
        out += `<line x1="${p.from[0]}" y1="${p.from[1]}" x2="${r1(g0.hf[0])}" y2="${r1(g0.hf[1])}" stroke="#34d399" stroke-width="2">${anim("x2", geoms.map((g) => r1(g.hf[0])))}${anim("y2", geoms.map((g) => r1(g.hf[1])))}</line>`;
      }
      if (p.t === "towel") {
        const d = (g) => `M${P(g.hf)}L${P(g.ff)}`;
        out += `<path d="${d(g0)}" stroke="#34d399" stroke-width="3" stroke-linecap="round">${anim("d", geoms.map(d))}</path>`;
      }
      if (p.t === "rope") {
        const d = (g) => `M${P(g.hb)}Q${P(g.rope)} ${P(g.hf)}`;
        out += `<path d="${d(g0)}" fill="none" stroke="#fbbf24" stroke-width="2.5">${anim("d", geoms.map(d))}</path>`;
      }
    }
    return out;
  }

  const FLOOR = `<line x1="0" y1="151" x2="200" y2="151" stroke="rgba(255,255,255,.14)" stroke-width="2"/>`;

  function demoSVG(id) {
    const mv = MOVES[id];
    if (!mv) return "";
    const frames = mv.frames;
    // Timeline: hold on each pose, then glide to the next; loop back to the first.
    const seq = [], times = [];
    let t = 0;
    for (const f of frames) {
      seq.push(f); times.push(t); t += f.hold ?? 0.35;
      seq.push(f); times.push(t); t += 1;
    }
    seq.push(frames[0]); times.push(t);
    const geoms = seq.map((f) => pose(f, mv));
    const dur = r1(t * (mv.dur ?? 0.9));
    const keyTimes = times.map((x) => (x / t).toFixed(3)).join(";");
    const splines = Array(seq.length - 1).fill("0.45 0 0.55 1").join(";");
    const anim = reduceMotion ? () => "" : (attr, values) => `<animate attributeName="${attr}" dur="${dur}s" repeatCount="indefinite" calcMode="spline" keyTimes="${keyTimes}" keySplines="${splines}" values="${values.join(";")}"/>`;
    return `<svg viewBox="0 -16 200 176" class="h-full w-full" role="img" aria-label="Animated demonstration: ${esc(frames.map((f) => f.label).join(", then "))}">${FLOOR}${staticProps(mv)}${movingParts(mv, geoms, anim)}</svg>`;
  }

  function stepFrames(id) {
    const mv = MOVES[id];
    if (!mv) return "";
    return `<ol class="grid gap-2" style="grid-template-columns:repeat(${mv.frames.length},minmax(0,1fr))">${mv.frames
      .map((f, i) => `<li class="rounded-lg bg-ink-950/70 p-1.5 text-center">
        <svg viewBox="0 -16 200 176" class="mx-auto h-16 w-full" aria-hidden="true">${FLOOR}${staticProps(mv)}${movingParts(mv, [pose(f, mv)], () => "")}</svg>
        <p class="mt-1 text-[11px] leading-tight text-slate-300"><span class="font-bold text-emerald-400">${i + 1}.</span> ${esc(f.label)}</p></li>`)
      .join("")}</ol>`;
  }

  function weekOverview(w) {
    return `
      <div class="flex items-baseline justify-between gap-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-300">Your week</h3>
        <p class="text-xs text-slate-400">${w.level} · ${w.trainingDays} training days · tap a day</p>
      </div>
      <div class="scrollbar-none -mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1 2xl:grid 2xl:grid-cols-7 2xl:overflow-visible" role="tablist" aria-label="Workout day">
        ${w.days.map((d, i) => `
          <button type="button" role="tab" data-day="${i}" aria-selected="${i === workoutDay}" class="day-pill flex min-w-[132px] flex-col gap-1 2xl:min-w-0">
            <span class="flex items-center justify-between"><span class="font-bold text-white">${d.day.slice(0, 3)}</span><span aria-hidden="true">${TYPE_ICON[d.type]}</span></span>
            <span class="line-clamp-2 min-h-[2.5em] text-xs font-medium leading-tight text-slate-300">${esc(d.title)}</span>
            <span class="text-[11px] text-slate-400">${d.type === "rest" ? "Rest · light walk" : `${d.durationMin} min · ${d.exercises.length} moves`}</span>
          </button>`).join("")}
      </div>`;
  }

  function workoutPanel() {
    const w = plan.workoutPlan;
    const d = w.days[workoutDay];
    return `
      ${weekOverview(w)}
      <div class="mt-4 rounded-2xl bg-gradient-to-br from-ink-800 to-ink-950 p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-emerald-400">${d.day} · ${w.level} · ${w.trainingDays} training days/week</p>
            <h3 class="mt-1 text-2xl font-extrabold text-white">${TYPE_ICON[d.type]} ${esc(d.title)}</h3>
            <p class="mt-1 text-slate-300">${esc(d.focus)}</p>
          </div>
          <div class="rounded-xl bg-ink-950/70 px-4 py-2 text-center"><div class="text-2xl font-extrabold text-white">${d.durationMin}</div><div class="text-[11px] uppercase text-slate-400">minutes</div></div>
        </div>
        ${d.warmup.length ? `<details class="mt-4 rounded-xl bg-ink-950/60 px-4 py-3"><summary class="flex items-center justify-between text-sm font-semibold text-white">🔥 Warm-up (5–7 min)<span class="chev transition">▾</span></summary>
          <ol class="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-300">${d.warmup.map((x) => `<li>${esc(x)}</li>`).join("")}</ol></details>` : ""}
      </div>
      <div class="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        ${d.exercises.map((e, i) => exerciseCard(e, i)).join("")}
      </div>
      ${d.cooldown.length ? `<div class="mt-4 rounded-xl bg-ink-950/60 p-4"><h4 class="text-sm font-bold text-white">🧊 Cool-down</h4>
        <ul class="mt-2 grid gap-1 text-sm text-slate-300 sm:grid-cols-2">${d.cooldown.map((x) => `<li class="flex gap-2"><span class="text-emerald-400">•</span>${esc(x)}</li>`).join("")}</ul></div>` : ""}
      <div class="mt-4 rounded-xl border border-white/5 p-4">
        <h4 class="text-sm font-bold text-white">How to progress safely</h4>
        <ul class="mt-2 space-y-1.5 text-sm text-slate-300">${w.guidelines.map((g) => `<li class="flex gap-2"><span class="text-emerald-400">✓</span>${esc(g)}</li>`).join("")}</ul>
      </div>`;
  }

  function exerciseCard(e, i) {
    const c = CAT[e.category];
    const p = e.prescription;
    return `
      <article class="reveal flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-ink-850" style="animation-delay:${i * 0.05}s">
        <figure class="ex-figure relative aspect-video overflow-hidden" style="background:linear-gradient(135deg, ${c.from}, ${c.to})">
          <div class="ex-demo absolute inset-0 px-3 pt-6">${MOVES[e.id] ? demoSVG(e.id) : `<img class="h-full w-full object-cover" src="${placeholder(e.category)}" alt="" />`}</div>
          <img class="ex-img absolute inset-0 hidden h-full w-full object-cover" data-query="${esc(e.imageQuery)}" data-fallback="${esc(c.fallbackQuery)}" alt="${esc(e.name)}" />
          <span class="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur ${c.badge}">${c.label}</span>
          <span class="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-ink-950/80 text-xs font-bold text-white">${i + 1}</span>
          <div class="view-toggle absolute bottom-2 left-2 hidden gap-1 rounded-full bg-black/60 p-0.5 text-[11px] font-semibold" role="group" aria-label="Show">
            <button type="button" data-view="demo" aria-pressed="true" class="rounded-full px-2.5 py-0.5 text-white aria-pressed:bg-emerald-500 aria-pressed:text-ink-950">▶ Demo</button>
            <button type="button" data-view="photo" aria-pressed="false" class="rounded-full px-2.5 py-0.5 text-white aria-pressed:bg-emerald-500 aria-pressed:text-ink-950">📷 Photo</button>
          </div>
          <figcaption class="credit absolute bottom-2 right-2 hidden rounded bg-black/60 px-2 py-0.5 text-[10px] text-slate-200"></figcaption>
        </figure>
        <div class="flex flex-1 flex-col p-4">
          <h4 class="text-lg font-bold text-white">${esc(e.name)}</h4>
          ${MOVES[e.id] ? `<div class="mt-3"><p class="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Step by step</p>${stepFrames(e.id)}</div>` : ""}
          <div class="mt-1.5 flex flex-wrap gap-1.5">${e.muscles.map((m) => `<span class="chip">${esc(m)}</span>`).join("")}</div>
          <p class="mt-2 text-xs text-slate-400">Equipment: ${esc(e.equipment)}</p>
          <dl class="mt-3 grid grid-cols-4 gap-1.5 text-center">
            ${[["Sets", p.sets], ["Reps / time", p.reps], ["Rest", p.rest], ["Tempo", p.tempo]].map(([k, v]) => `<div class="rounded-lg bg-ink-950 px-1.5 py-2"${k === "Tempo" && p.tempoHint ? ` title="${esc(p.tempoHint)}"` : ""}><dt class="text-[10px] uppercase tracking-wide text-slate-500">${k}</dt><dd class="mt-0.5 text-xs font-bold leading-tight text-white">${esc(v)}</dd></div>`).join("")}
          </dl>
          <p class="mt-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">🎯 ${esc(p.intensity)}</p>
          <details class="group mt-3 rounded-xl bg-ink-950/60 px-3 py-2.5">
            <summary class="flex items-center justify-between text-sm font-semibold text-white">How to do it<span class="chev text-slate-400 transition">▾</span></summary>
            <ol class="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-slate-300">${e.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
            <h5 class="mt-3 text-xs font-bold uppercase tracking-wide text-emerald-400">Form cues</h5>
            <ul class="mt-1 space-y-1 text-sm text-slate-300">${e.cues.map((s) => `<li class="flex gap-2"><span class="text-emerald-400">✓</span>${esc(s)}</li>`).join("")}</ul>
            <h5 class="mt-3 text-xs font-bold uppercase tracking-wide text-rose-400">Avoid</h5>
            <ul class="mt-1 space-y-1 text-sm text-slate-300">${e.mistakes.map((s) => `<li class="flex gap-2"><span class="text-rose-400">✕</span>${esc(s)}</li>`).join("")}</ul>
            <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div class="rounded-lg bg-ink-850 p-2"><div class="font-bold text-sky-300">Easier</div><div class="text-slate-300">${esc(e.easier)}</div></div>
              <div class="rounded-lg bg-ink-850 p-2"><div class="font-bold text-orange-300">Harder</div><div class="text-slate-300">${esc(e.harder)}</div></div>
            </div>
          </details>
        </div>
      </article>`;
  }

  // Photos: ask the server (which holds the Unsplash key) once per keyword; keep the illustration if there's none.
  const imageCache = new Map();
  function fetchImage(query) {
    if (!imageCache.has(query)) imageCache.set(query, fetch(`/api/image?query=${encodeURIComponent(query)}`).then((r) => r.json()).catch(() => ({ url: null })));
    return imageCache.get(query);
  }
  function loadImages() {
    $$(".ex-img").forEach(async (img) => {
      let data = await fetchImage(img.dataset.query);
      if (!data.url && data.reason === "no-results") data = await fetchImage(img.dataset.fallback);
      if (!data.url || !img.isConnected) return;
      const pre = new Image();
      pre.onload = () => {
        img.src = data.url;
        img.alt = data.alt || img.alt;
        const fig = img.closest(".ex-figure");
        fig.querySelector(".credit").innerHTML = `Photo: <a class="underline" href="${esc(data.credit.link)}" target="_blank" rel="noopener">${esc(data.credit.name)}</a> / <a class="underline" href="${esc(data.unsplashLink)}" target="_blank" rel="noopener">Unsplash</a>`;
        fig.querySelector(".view-toggle").classList.replace("hidden", "flex"); // the animated demo stays the default view
      };
      pre.src = data.url;
    });
  }
  // Demo / Photo switch on each card.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest?.(".view-toggle button");
    if (!btn) return;
    const fig = btn.closest(".ex-figure");
    const photo = btn.dataset.view === "photo";
    fig.querySelectorAll(".view-toggle button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    fig.querySelector(".ex-img").classList.toggle("hidden", !photo);
    fig.querySelector(".ex-demo").classList.toggle("hidden", photo);
    fig.querySelector(".credit").classList.toggle("hidden", !photo);
  });
})();
