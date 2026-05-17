export default function TipsScreen() {
  const sections = [
    {
      tag: { label: 'Nutrition', color: 'bg-[#14532d] text-[#4ade80]' },
      title: 'Daily Eating Rules',
      items: [
        { label: 'High protein every meal', sub: 'Aim for 1.5–2g of protein per kg of your bodyweight per day' },
        { label: 'Slight calorie deficit', sub: 'Eat roughly 300–500 calories less than you burn. Don\'t starve yourself.' },
        { label: '2–3 litres of water daily', sub: 'Spread it through the day. Dehydration kills performance.' },
        { label: 'Vegetables with every meal', sub: 'They fill you up without adding many calories.' },
        { label: 'Avoid liquid calories', sub: 'Soft drinks, juices, alcohol — they add up fast and don\'t fill you.' },
      ],
    },
    {
      tag: { label: 'Best Protein Sources', color: 'bg-[#713f12] text-[#facc15]' },
      title: 'What to Eat',
      items: [
        { label: 'Eggs', sub: 'Cheapest and most complete protein. 6g protein per egg.' },
        { label: 'Chicken breast', sub: 'Lean, high protein, easy to cook. 25g protein per 100g.' },
        { label: 'Paneer', sub: 'Great for vegetarians. 18–20g protein per 100g.' },
        { label: 'Fish (tuna, salmon)', sub: 'Protein + healthy fats. Tuna is especially cheap and easy.' },
        { label: 'Greek yogurt', sub: 'Protein + probiotics for digestion. Good as a snack.' },
        { label: 'Dal / Lentils', sub: 'Plant protein. Easy, cheap, filling. Pair with rice for complete protein.' },
        { label: 'Tofu', sub: 'Good plant-based option. Absorbs flavour well when cooked right.' },
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
