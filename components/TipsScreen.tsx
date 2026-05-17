export default function TipsScreen() {
  const sections = [
    {
      tag: { label: 'Nutrition', color: 'bg-[#14532d] text-[#4ade80]' },
      title: 'Daily Eating Rules',
      items: [
        { label: 'High protein every meal', sub: 'Aim for 1.6–2g per kg bodyweight daily. For you: eggs + plant protein shake + paneer + dal every day gets you there.' },
        { label: 'Slight calorie deficit', sub: 'Eat roughly 300–500 calories less than you burn. Don\'t starve yourself.' },
        { label: '2–3 litres of water daily', sub: 'Spread it through the day. Dehydration kills performance.' },
        { label: 'Vegetables with every meal', sub: 'They fill you up without adding many calories.' },
        { label: 'Avoid liquid calories', sub: 'Soft drinks, juices, alcohol — they add up fast and don\'t fill you.' },
      ],
    },
    {
      tag: { label: 'Best Protein Sources', color: 'bg-[#713f12] text-[#facc15]' },
      title: 'What to Eat (Eggetarian)',
      items: [
        { label: 'Eggs — your foundation', sub: '6g complete protein per egg. Whole eggs for muscle building — the yolk has leucine which triggers muscle protein synthesis. 4–6 eggs a day is totally fine.' },
        { label: 'Plant protein shake', sub: 'Pea + rice protein blend is the best combo — together they form a complete amino acid profile similar to whey. Take 1–2 scoops daily, especially post-workout.' },
        { label: 'Paneer', sub: '18–20g protein per 100g. Slow-digesting casein — great before bed. Keep it in your daily meals.' },
        { label: 'Greek yogurt / Curd', sub: '10–12g protein per 100g. Protein + probiotics. Great as a snack or with meals.' },
        { label: 'Dal / Lentils', sub: '~9g protein per 100g cooked. Cheap, filling, and high in fibre. Pair with rice or roti for complete protein.' },
        { label: 'Rajma / Chickpeas / Black beans', sub: '~7–9g protein per 100g cooked. Add to salads, curries, or have as a main. Also high in fibre — keeps you full.' },
        { label: 'Tofu', sub: '~8–10g protein per 100g. Great paneer substitute — absorbs any marinade. Stir-fry or grill it.' },
        { label: 'Milk / Soy milk', sub: 'Cow milk = 3.4g/100ml + calcium. Soy milk = closest plant alternative at ~3g/100ml. Drink 500ml daily.' },
        { label: 'Quinoa', sub: 'The only plant food that is a complete protein by itself. ~4g protein per 100g cooked. Use as rice replacement.' },
        { label: 'Peanut butter', sub: '~25g protein per 100g. Easy calories + protein. 2 tbsp on whole grain bread is a solid snack.' },
      ],
    },
    {
      tag: { label: 'Plant Protein Tips', color: 'bg-[#14532d] text-[#4ade80]' },
      title: 'Getting Enough Protein as an Eggetarian',
      items: [
        { label: 'Target: 1.6–2g protein per kg bodyweight', sub: 'Example: 70kg → aim for 112–140g protein per day. This sounds like a lot — that\'s why eggs and plant protein shakes are essential.' },
        { label: 'Plant protein completeness', sub: 'Most plant proteins are "incomplete" — they miss some essential amino acids. Fix this by combining sources: rice + dal, pea protein + rice protein, eggs + any plant protein.' },
        { label: 'Pea protein vs whey', sub: 'Pea protein is ~80–85% as effective as whey for muscle building when leucine intake is adequate. Add 1g leucine powder to your shake if you want to close the gap.' },
        { label: 'Eat protein at every meal', sub: 'Don\'t eat 100g protein in one meal. Spread it across 4–5 meals: breakfast, lunch, snack, post-workout, dinner. Your body can only synthesize so much at once.' },
        { label: 'Egg timing tip', sub: 'Have 2–3 whole eggs with breakfast. They are satiating and give you a solid protein + fat start. Scrambled, boiled, omelette — all the same nutritionally.' },
        { label: 'Post-workout shake', sub: 'Have your plant protein shake within 60 minutes after training. Mix with water or milk. Add a banana for fast carbs to replenish glycogen.' },
      ],
    },
    {
      tag: { label: 'Recovery', color: 'bg-[#7f1d1d] text-[#f87171]' },
      title: 'Sleep & Rest',
      items: [
        { label: '7–8 hours sleep every night', sub: 'Muscle is built while you sleep, not while you train. Sleep is the workout.' },
        { label: 'Sunday = full rest day', sub: 'No gym, no HIIT. Walk if you want to. Your body needs it.' },
        { label: 'Walk 15–30 min daily', sub: 'Even on rest days. Low intensity movement helps recovery.' },
        { label: 'Don\'t skip rest days', sub: 'More is not better. Overtraining kills results and increases injury risk.' },
      ],
    },
    {
      tag: { label: 'Beginner Guide', color: 'bg-[#1e3a5f] text-[#60a5fa]' },
      title: 'What to Expect Each Phase',
      items: [
        { label: 'Phase 1 (Weeks 1–4)', sub: 'Building habits and learning movements. Strength gains will feel rapid. This is normal — your nervous system is adapting.' },
        { label: 'Phase 2 (Weeks 5–8)', sub: 'Visible muscle starts to show. Cardio gets easier. You\'ll start noticing your body changing in the mirror.' },
        { label: 'Phase 3 (Weeks 9–12)', sub: 'Definition and shape. Leaner waist, stronger arms, better chest. The hard work from Phases 1–2 shows itself here.' },
      ],
    },
    {
      tag: { label: 'HIIT Guide', color: 'bg-[#14532d] text-[#4ade80]' },
      title: 'How HIIT Works (Thursdays)',
      items: [
        { label: '20 seconds WORK', sub: 'Maximum effort — sprint, jump squat, or burpee. Give everything.' },
        { label: '40 seconds REST', sub: 'Walk slowly or stand. This IS the rest between rounds. Recover enough to go again.' },
        { label: 'Repeat for all rounds', sub: 'Phase 1: 8 rounds. Phase 2: 10 rounds. Phase 3: 12 rounds.' },
        { label: 'Use the in-app HIIT timer', sub: 'Tap "Start HIIT Timer" on the Thursday workout — it will manage the intervals for you automatically.' },
        { label: 'Total time', sub: '~8 min (Phase 1) to ~14 min (Phase 3) including warmup and cooldown walk.' },
      ],
    },
    {
      tag: { label: 'Sets vs Rounds', color: 'bg-[#581c87] text-[#c084fc]' },
      title: 'Beginner Terminology Explained',
      items: [
        { label: 'Reps', sub: 'How many times you do the movement. 10 reps = lift 10 times.' },
        { label: 'Sets', sub: 'How many groups of reps. 4 sets × 10 reps = 40 total lifts, with rest in between.' },
        { label: 'Rest between sets', sub: 'Break AFTER each set before doing the next one. The rest timer starts automatically when you tap a set.' },
        { label: 'Rounds (HIIT only)', sub: 'One work + rest cycle. 8 rounds = 8 × (20 sec work + 40 sec rest).' },
        { label: 'Rest between rounds', sub: 'The 40 seconds IS the rest between rounds — it is built into the HIIT protocol.' },
        { label: 'Progressive overload', sub: 'Adding weight or reps over time. This is the main driver of getting stronger and leaner.' },
      ],
    },
  ];

  return (
    <div className="px-4 py-4 space-y-4">
      {sections.map((section, i) => (
        <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest ${section.tag.color}`}>
            {section.tag.label}
          </span>
          <h3 className="text-white font-bold text-[15px] mt-2 mb-3">{section.title}</h3>
          <div className="space-y-3">
            {section.items.map((item, j) => (
              <div key={j} className="flex gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#888] mt-2" />
                <div>
                  <p className="text-white text-sm font-semibold">{item.label}</p>
                  <p className="text-[#888] text-[12px] leading-relaxed mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
