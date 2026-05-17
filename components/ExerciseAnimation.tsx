'use client';
import React from 'react';

export type AnimationType =
  | 'squat' | 'floorPress' | 'overheadPress' | 'lunge' | 'plank'
  | 'row' | 'hinge' | 'curl' | 'shrug' | 'legRaise' | 'deadlift'
  | 'twist' | 'lateralRaise' | 'pushup' | 'walk' | 'climber' | 'tricepsExt';

export const EXERCISE_ANIMATION: Record<string, AnimationType> = {
  'Barbell Squat': 'squat',
  'Goblet Squat': 'squat',
  'Bulgarian Split Squat': 'lunge',
  'Lunges': 'lunge',
  'Floor Press': 'floorPress',
  'Shoulder Press': 'overheadPress',
  'Push Press': 'overheadPress',
  'Plank': 'plank',
  'Bent Over Row': 'row',
  'Barbell Row': 'row',
  'Rear Delt Fly': 'row',
  'Romanian Deadlift': 'hinge',
  'Deadlift': 'deadlift',
  'Bicep Curl': 'curl',
  'Hammer Curl': 'curl',
  'Shrugs': 'shrug',
  'Leg Raises': 'legRaise',
  'Russian Twist': 'twist',
  'Lateral Raise': 'lateralRaise',
  'Triceps Extension': 'tricepsExt',
  'Pushup Finisher': 'pushup',
  'Farmer Walk': 'walk',
  'Mountain Climbers': 'climber',
  'Burpees Finisher': 'squat',
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DUR = '2.8s';
const KT = '0;0.5;1';
const EASE = '0.45 0 0.45 1;0.45 0 0.45 1';

// Realistic stroke widths — makes figures look like actual humans, not stick figures
const SW = {
  torso: 30,   // front view trunk
  torsoS: 24,  // side view trunk
  thigh: 18,
  calf: 13,
  foot: 8,
  uArm: 13,
  fArm: 10,
  neck: 9,
  hint: 3,     // subtle shoulder/hip indicator
} as const;

function smil(attr: string, from: number, to: number, dur = DUR) {
  return (
    <animate key={attr} attributeName={attr}
      values={`${from};${to};${from}`} dur={dur}
      repeatCount="indefinite" calcMode="spline"
      keySplines={EASE} keyTimes={KT} />
  );
}

// ─── PRIMITIVE HELPERS ────────────────────────────────────────────────────────

function L({ x1, y1, x2, y2, tx1=x1, ty1=y1, tx2=x2, ty2=y2, sw=7, op=1, dur=DUR }: {
  x1:number; y1:number; x2:number; y2:number;
  tx1?:number; ty1?:number; tx2?:number; ty2?:number;
  sw?:number; op?:number; dur?:string;
}) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" opacity={op}>
      {x1!==tx1 && smil('x1',x1,tx1,dur)}
      {y1!==ty1 && smil('y1',y1,ty1,dur)}
      {x2!==tx2 && smil('x2',x2,tx2,dur)}
      {y2!==ty2 && smil('y2',y2,ty2,dur)}
    </line>
  );
}

function H({ cx, cy, tcx=cx, tcy=cy, r=17 }: {
  cx:number; cy:number; tcx?:number; tcy?:number; r?:number;
}) {
  return (
    <circle cx={cx} cy={cy} r={r} fill="currentColor">
      {cx!==tcx && smil('cx',cx,tcx)}
      {cy!==tcy && smil('cy',cy,tcy)}
    </circle>
  );
}

function J({ cx, cy, tcx=cx, tcy=cy, r=6 }: {
  cx:number; cy:number; tcx?:number; tcy?:number; r?:number;
}) {
  return (
    <circle cx={cx} cy={cy} r={r} fill="currentColor" opacity={0.55}>
      {cx!==tcx && smil('cx',cx,tcx)}
      {cy!==tcy && smil('cy',cy,tcy)}
    </circle>
  );
}

// ─── EQUIPMENT ────────────────────────────────────────────────────────────────

// Horizontal barbell with round weight plates — front/overhead view
function Barbell({ cx, cy, tcy=cy, barW=154, plateR=19 }: {
  cx:number; cy:number; tcy?:number; barW?:number; plateR?:number;
}) {
  const lx = cx - barW/2, rx = cx + barW/2;
  const dy = tcy - cy;
  return (
    <g>
      {cy!==tcy && (
        <animateTransform attributeName="transform" type="translate"
          values={`0,0;0,${dy};0,0`} dur={DUR} repeatCount="indefinite"
          calcMode="spline" keySplines={EASE} keyTimes={KT} />
      )}
      <line x1={lx} y1={cy} x2={rx} y2={cy} stroke="#c0c0c0" strokeWidth={5} strokeLinecap="round" />
      {/* Left plate — two rings for 3-D look */}
      <ellipse cx={lx+5} cy={cy} rx={7} ry={plateR} fill="#505050" />
      <ellipse cx={lx+3} cy={cy} rx={5} ry={plateR-4} fill="#a0a0a0" />
      <ellipse cx={lx+3} cy={cy} rx={1.5} ry={4} fill="#222" />
      <line x1={lx+14} y1={cy-7} x2={lx+14} y2={cy+7} stroke="#aaa" strokeWidth={5} strokeLinecap="round" />
      {/* Right plate */}
      <ellipse cx={rx-5} cy={cy} rx={7} ry={plateR} fill="#505050" />
      <ellipse cx={rx-3} cy={cy} rx={5} ry={plateR-4} fill="#a0a0a0" />
      <ellipse cx={rx-3} cy={cy} rx={1.5} ry={4} fill="#222" />
      <line x1={rx-14} y1={cy-7} x2={rx-14} y2={cy+7} stroke="#aaa" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
}

// Side-view barbell: near plate + bar extending to the right toward the figure
function BarSide({ x, cy, tcy=cy, plateR=20 }: {
  x:number; cy:number; tcy?:number; plateR?:number;
}) {
  const dy = tcy - cy;
  return (
    <g>
      {cy!==tcy && (
        <animateTransform attributeName="transform" type="translate"
          values={`0,0;0,${dy};0,0`} dur={DUR} repeatCount="indefinite"
          calcMode="spline" keySplines={EASE} keyTimes={KT} />
      )}
      <line x1={x-46} y1={cy} x2={x+12} y2={cy} stroke="#c0c0c0" strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={x-43} cy={cy} rx={8} ry={plateR} fill="#505050" />
      <ellipse cx={x-39} cy={cy} rx={5.5} ry={plateR-5} fill="#a0a0a0" />
      <ellipse cx={x-39} cy={cy} rx={1.5} ry={4} fill="#222" />
      <line x1={x-31} y1={cy-7} x2={x-31} y2={cy+7} stroke="#aaa" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
}

// Horizontal dumbbell
function DB({ cx, cy, tcx=cx, tcy=cy, hR=11 }: {
  cx:number; cy:number; tcx?:number; tcy?:number; hR?:number;
}) {
  const dx=tcx-cx, dy=tcy-cy;
  return (
    <g>
      {(cx!==tcx||cy!==tcy) && (
        <animateTransform attributeName="transform" type="translate"
          values={`0,0;${dx},${dy};0,0`} dur={DUR} repeatCount="indefinite"
          calcMode="spline" keySplines={EASE} keyTimes={KT} />
      )}
      <line x1={cx-13} y1={cy} x2={cx+13} y2={cy} stroke="#c0c0c0" strokeWidth={4.5} strokeLinecap="round" />
      <ellipse cx={cx-19} cy={cy} rx={7} ry={hR} fill="#505050" />
      <ellipse cx={cx-18} cy={cy} rx={5} ry={hR-3} fill="#a0a0a0" />
      <ellipse cx={cx+19} cy={cy} rx={7} ry={hR} fill="#505050" />
      <ellipse cx={cx+18} cy={cy} rx={5} ry={hR-3} fill="#a0a0a0" />
    </g>
  );
}

// Vertical dumbbell (overhead triceps, handle runs up/down)
function DBVert({ cx, cy, tcy=cy, hR=10 }: {
  cx:number; cy:number; tcy?:number; hR?:number;
}) {
  const dy = tcy-cy;
  return (
    <g>
      {cy!==tcy && (
        <animateTransform attributeName="transform" type="translate"
          values={`0,0;0,${dy};0,0`} dur={DUR} repeatCount="indefinite"
          calcMode="spline" keySplines={EASE} keyTimes={KT} />
      )}
      <line x1={cx} y1={cy-13} x2={cx} y2={cy+13} stroke="#c0c0c0" strokeWidth={4.5} strokeLinecap="round" />
      <ellipse cx={cx} cy={cy-19} rx={hR} ry={7} fill="#505050" />
      <ellipse cx={cx} cy={cy-18} rx={hR-3} ry={5} fill="#a0a0a0" />
      <ellipse cx={cx} cy={cy+19} rx={hR} ry={7} fill="#505050" />
      <ellipse cx={cx} cy={cy+18} rx={hR-3} ry={5} fill="#a0a0a0" />
    </g>
  );
}

// ─── UI HELPERS ───────────────────────────────────────────────────────────────

function Floor({ y=272, x1=8, x2=212 }: { y?:number; x1?:number; x2?:number }) {
  return <line x1={x1} y1={y} x2={x2} y2={y} stroke="#383838" strokeWidth={2.5} />;
}

function MG({ cx, cy, rx, ry, accent }: { cx:number; cy:number; rx:number; ry:number; accent:string }) {
  return (
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={accent} opacity={0.07}>
      <animate attributeName="opacity" values="0.04;0.16;0.04" dur="1.8s"
        repeatCount="indefinite" calcMode="spline"
        keySplines="0.5 0 0.5 1;0.5 0 0.5 1" keyTimes="0;0.5;1" />
    </ellipse>
  );
}

function PL({ a, b, accent, y=284 }: { a:string; b:string; accent:string; y?:number }) {
  return (
    <>
      <text x="110" y={y} textAnchor="middle" fontSize="11" fontWeight="bold" fill={accent} letterSpacing="0.5">
        <animate attributeName="opacity" values="1;1;0;0;1" dur={DUR}
          keyTimes="0;0.38;0.48;0.9;1" repeatCount="indefinite" />
        {a}
      </text>
      <text x="110" y={y} textAnchor="middle" fontSize="11" fontWeight="bold" fill="white" opacity="0" letterSpacing="0.5">
        <animate attributeName="opacity" values="0;0;1;1;0" dur={DUR}
          keyTimes="0;0.38;0.48;0.9;1" repeatCount="indefinite" />
        {b}
      </text>
    </>
  );
}

function AU({ cx, y, accent }: { cx:number; y:number; accent:string }) {
  return (
    <g>
      <line x1={cx} y1={y+14} x2={cx} y2={y+34} stroke={accent} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
      <polygon points={`${cx-7},${y+13} ${cx+7},${y+13} ${cx},${y}`} fill={accent}>
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.3s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.5 0 0.5 1;0.5 0 0.5 1" keyTimes="0;0.5;1" />
      </polygon>
    </g>
  );
}

function AD({ cx, y, accent }: { cx:number; y:number; accent:string }) {
  return (
    <g>
      <line x1={cx} y1={y-22} x2={cx} y2={y} stroke={accent} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
      <polygon points={`${cx-7},${y} ${cx+7},${y} ${cx},${y+12}`} fill={accent}>
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.3s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.5 0 0.5 1;0.5 0 0.5 1" keyTimes="0;0.5;1" />
      </polygon>
    </g>
  );
}

// Standard static front-view legs (reused by many standing exercises)
function StatLegs() {
  return (
    <>
      <L x1={80} y1={162} x2={70} y2={218} sw={SW.thigh} />
      <J cx={70} cy={218} r={8} />
      <L x1={70} y1={218} x2={66} y2={267} sw={SW.calf} />
      <L x1={140} y1={162} x2={150} y2={218} sw={SW.thigh} />
      <J cx={150} cy={218} r={8} />
      <L x1={150} y1={218} x2={154} y2={267} sw={SW.calf} />
      <line x1="48" y1="273" x2="82" y2="273" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round" />
      <line x1="138" y1="273" x2="172" y2="273" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round" />
    </>
  );
}

// ─── EXERCISE ANIMATIONS ──────────────────────────────────────────────────────

function SquatAnim({ accent }: { accent:string }) {
  return (
    <svg viewBox="0 0 220 290" className="w-full h-full">
      <MG cx={110} cy={218} rx={92} ry={56} accent={accent} />
      {/* Barbell on back descends ~46px with squat */}
      <Barbell cx={110} cy={68} tcy={114} barW={150} plateR={18} />
      <H cx={110} cy={26} tcy={72} />
      <L x1={110} y1={43} x2={110} y2={55} ty1={89} ty2={101} sw={SW.neck} />
      {/* Thick torso */}
      <L x1={110} y1={55} x2={110} y2={132} ty1={101} ty2={198} sw={SW.torso} />
      <L x1={76} y1={60} x2={144} y2={60} ty1={106} ty2={106} sw={SW.hint} op={0.25} />
      {/* Arms grip bar */}
      <J cx={76} cy={60} tcx={76} tcy={106} />
      <L x1={76} y1={60} x2={58} y2={100} ty1={106} ty2={146} sw={SW.uArm} />
      <J cx={58} cy={100} tcx={58} tcy={146} r={5} />
      <L x1={58} y1={100} x2={54} y2={68} ty1={146} ty2={114} sw={SW.fArm} />
      <J cx={144} cy={60} tcx={144} tcy={106} />
      <L x1={144} y1={60} x2={162} y2={100} ty1={106} ty2={146} sw={SW.uArm} />
      <J cx={162} cy={100} tcx={162} tcy={146} r={5} />
      <L x1={162} y1={100} x2={166} y2={68} ty1={146} ty2={114} sw={SW.fArm} />
      {/* Hip hint */}
      <L x1={88} y1={132} x2={132} y2={132} ty1={198} ty2={198} sw={SW.hint} op={0.22} />
      {/* Thighs flare out in squat */}
      <L x1={88} y1={132} x2={70} y2={210} tx2={44} ty1={198} ty2={216} sw={SW.thigh} />
      <J cx={70} cy={210} tcx={44} tcy={216} r={8} />
      <L x1={70} y1={210} x2={66} y2={267} tx1={44} ty1={216} sw={SW.calf} />
      <line x1="48" y1="273" x2="80" y2="273" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round" />
      <L x1={132} y1={132} x2={150} y2={210} tx2={176} ty1={198} ty2={216} sw={SW.thigh} />
      <J cx={150} cy={210} tcx={176} tcy={216} r={8} />
      <L x1={150} y1={210} x2={154} y2={267} tx1={176} ty1={216} sw={SW.calf} />
      <line x1="140" y1="273" x2="172" y2="273" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round" />
      <Floor y={277} />
      <AD cx={20} y={140} accent={accent} />
      <AD cx={200} y={140} accent={accent} />
      <text x="110" y="250" textAnchor="middle" fontSize="9" fill={accent} opacity="0">
        <animate attributeName="opacity" values="0;0;0.75;0.75;0" dur={DUR}
          keyTimes="0;0.35;0.45;0.85;1" repeatCount="indefinite" />
        ← KNEES TRACK TOES →
      </text>
      <PL a="↓  SQUAT DOWN" b="↑  DRIVE UP" accent={accent} />
    </svg>
  );
}

function DeadliftAnim({ accent }: { accent:string }) {
  return (
    <svg viewBox="0 0 220 290" className="w-full h-full">
      <MG cx={100} cy={175} rx={72} ry={80} accent={accent} />
      {/* Bar travels from floor to hip */}
      <BarSide x={132} cy={262} tcy={196} plateR={20} />
      {/* Head: bent → upright */}
      <H cx={72} cy={74} tcx={104} tcy={24} />
      <L x1={78} y1={88} x2={84} y2={104} tx1={104} ty1={40} tx2={104} ty2={56} sw={SW.neck} />
      {/* Torso: ~horizontal → vertical */}
      <L x1={84} y1={104} x2={148} y2={128} tx1={104} ty1={56} tx2={104} ty2={150} sw={SW.torsoS} />
      <J cx={84} cy={104} tcx={104} tcy={56} r={7} />
      <J cx={148} cy={128} tcx={104} tcy={150} r={7} />
      {/* Near arm grips bar */}
      <L x1={96} y1={116} x2={102} y2={148} tx1={100} ty1={78} tx2={92} ty2={116} sw={SW.uArm} />
      <J cx={102} cy={148} tcx={92} tcy={116} r={5} />
      <L x1={102} y1={148} x2={108} y2={262} tx1={92} ty1={116} tx2={88} ty2={196} sw={SW.fArm} />
      {/* Far arm */}
      <L x1={100} y1={116} x2={108} y2={148} tx1={106} ty1={78} tx2={98} ty2={116} sw={SW.uArm-2} op={0.4} />
      <L x1={108} y1={148} x2={114} y2={262} tx1={98} ty1={116} tx2={94} ty2={196} sw={SW.fArm-1} op={0.4} />
      {/* Near leg */}
      <L x1={148} y1={128} x2={132} y2={194} tx1={104} ty1={150} tx2={88} ty2={214} sw={SW.thigh} />
      <J cx={132} cy={194} tcx={88} tcy={214} r={8} />
      <L x1={132} y1={194} x2={128} y2={262} tx1={88} ty1={214} tx2={86} ty2={268} sw={SW.calf} />
      {/* Far leg */}
      <L x1={152} y1={130} x2={160} y2={194} tx1={108} ty1={152} tx2={112} ty2={214} sw={SW.thigh-2} op={0.4} />
      <L x1={160} y1={194} x2={158} y2={262} tx1={112} ty1={214} tx2={110} ty2={268} sw={SW.calf-1} op={0.4} />
      <line x1="110" y1="270" x2="146" y2="270" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round" />
      <line x1="142" y1="270" x2="168" y2="270" stroke="currentColor" strokeWidth={SW.foot-1} strokeLinecap="round" opacity={0.4} />
      <Floor y={274} />
      <AU cx={185} y={80} accent={accent} />
      <PL a="↓  HINGE — GRIP THE BAR" b="↑  DRIVE HIPS FORWARD" accent={accent} />
    </svg>
  );
}

function OverheadPressAnim({ accent }: { accent:string }) {
  return (
    <svg viewBox="0 0 220 290" className="w-full h-full">
      <MG cx={110} cy={68} rx={90} ry={70} accent={accent} />
      {/* Bar: starts at shoulder (y=132) → pressed fully overhead (y=8) */}
      <Barbell cx={110} cy={132} tcy={8} barW={154} plateR={18} />
      {/* Head sits at cy=50 — gives clear space above for overhead bar */}
      <H cx={110} cy={50} />
      <L x1={110} y1={67} x2={110} y2={80} sw={SW.neck} />
      <L x1={110} y1={80} x2={110} y2={162} sw={SW.torso} />
      <L x1={72} y1={84} x2={148} y2={84} sw={SW.hint} op={0.22} />
      {/* Left arm: elbows flared at chin → arms straight overhead */}
      <J cx={72} cy={84} r={6} />
      <L x1={72} y1={84} x2={44} y2={108} tx2={60} ty2={48} sw={SW.uArm} />
      <J cx={44} cy={108} tcx={60} tcy={48} r={5} />
      <L x1={44} y1={108} x2={38} y2={132} tx1={60} ty1={48} tx2={52} ty2={8} sw={SW.fArm} />
      {/* Right arm */}
      <J cx={148} cy={84} r={6} />
      <L x1={148} y1={84} x2={176} y2={108} tx2={160} ty2={48} sw={SW.uArm} />
      <J cx={176} cy={108} tcx={160} tcy={48} r={5} />
      <L x1={176} y1={108} x2={182} y2={132} tx1={160} ty1={48} tx2={168} ty2={8} sw={SW.fArm} />
      <L x1={80} y1={162} x2={140} y2={162} sw={SW.hint} op={0.22} />
      <StatLegs />
      <Floor y={277} />
      <AU cx={20} y={52} accent={accent} />
      <AU cx={200} y={52} accent={accent} />
      <PL a="↓  LOWER TO SHOULDER" b="↑  PRESS OVERHEAD" accent={accent} />
    </svg>
  );
}

function FloorPressAnim({ accent }: { accent:string }) {
  return (
    <svg viewBox="0 0 290 200" className="w-full h-full">
      <MG cx={115} cy={82} rx={74} ry={40} accent={accent} />
      <line x1="10" y1="148" x2="280" y2="148" stroke="#383838" strokeWidth={2.5} />
      {/* Head + thick body lying horizontal */}
      <circle cx="28" cy="114" r="17" fill="currentColor" />
      <line x1="44" y1="116" x2="50" y2="124" stroke="currentColor" strokeWidth={SW.neck} strokeLinecap="round" />
      <line x1="50" y1="124" x2="188" y2="124" stroke="currentColor" strokeWidth={SW.torsoS} strokeLinecap="round" />
      {/* Bent knees (near) */}
      <line x1="178" y1="124" x2="196" y2="100" stroke="currentColor" strokeWidth={SW.thigh} strokeLinecap="round" />
      <J cx={196} cy={100} r={8} />
      <line x1="196" y1="100" x2="196" y2="147" stroke="currentColor" strokeWidth={SW.calf} strokeLinecap="round" />
      {/* Far leg */}
      <line x1="184" y1="124" x2="206" y2="102" stroke="currentColor" strokeWidth={SW.thigh-2} strokeLinecap="round" opacity={0.35} />
      <line x1="206" y1="102" x2="206" y2="147" stroke="currentColor" strokeWidth={SW.calf-1} strokeLinecap="round" opacity={0.35} />
      <line x1="183" y1="147" x2="202" y2="147" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round" />
      <line x1="197" y1="147" x2="216" y2="147" stroke="currentColor" strokeWidth={SW.foot-1} strokeLinecap="round" opacity={0.35} />
      {/* Near arm presses bar up */}
      <J cx={82} cy={124} r={6} />
      <line x1="82" y1="124" x2="82" y2="107" stroke="currentColor" strokeWidth={SW.uArm} strokeLinecap="round" />
      <J cx={82} cy={107} r={5} />
      <L x1={82} y1={107} x2={82} y2={90} ty2={46} sw={SW.fArm} />
      {/* Far arm */}
      <J cx={98} cy={124} r={6} />
      <line x1="98" y1="124" x2="98" y2="107" stroke="currentColor" strokeWidth={SW.uArm-2} strokeLinecap="round" opacity={0.35} />
      <J cx={98} cy={107} r={4} />
      <L x1={98} y1={107} x2={98} y2={90} ty2={46} sw={SW.fArm-2} op={0.35} />
      {/* Barbell rises with arms */}
      <Barbell cx={90} cy={90} tcy={46} barW={96} plateR={16} />
      <AU cx={148} y={34} accent={accent} />
      <text x="148" y="185" textAnchor="middle" fontSize="11" fontWeight="bold" fill={accent} letterSpacing="0.5">
        <animate attributeName="opacity" values="1;1;0;0;1" dur={DUR}
          keyTimes="0;0.38;0.48;0.9;1" repeatCount="indefinite" />
        ↓  LOWER TO CHEST
      </text>
      <text x="148" y="185" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white" opacity="0" letterSpacing="0.5">
        <animate attributeName="opacity" values="0;0;1;1;0" dur={DUR}
          keyTimes="0;0.38;0.48;0.9;1" repeatCount="indefinite" />
        ↑  PRESS UP FULLY
      </text>
    </svg>
  );
}

function CurlAnim({ accent }: { accent:string }) {
  return (
    <svg viewBox="0 0 220 290" className="w-full h-full">
      <MG cx={74} cy={112} rx={36} ry={50} accent={accent} />
      <MG cx={146} cy={112} rx={36} ry={50} accent={accent} />
      <H cx={110} cy={26} />
      <L x1={110} y1={43} x2={110} y2={57} sw={SW.neck} />
      <L x1={110} y1={57} x2={110} y2={162} sw={SW.torso} />
      <L x1={76} y1={64} x2={144} y2={64} sw={SW.hint} op={0.22} />
      <L x1={80} y1={162} x2={140} y2={162} sw={SW.hint} op={0.22} />
      <StatLegs />
      <Floor y={277} />
      {/* Left arm — upper fixed, forearm curls */}
      <J cx={76} cy={68} r={6} />
      <line x1="76" y1="68" x2="56" y2="128" stroke="currentColor" strokeWidth={SW.uArm} strokeLinecap="round" />
      <J cx={56} cy={128} r={8} />
      <L x1={56} y1={128} x2={38} y2={170} tx2={26} ty2={88} sw={SW.fArm} />
      <DB cx={28} cy={173} tcx={16} tcy={88} hR={10} />
      {/* Right arm */}
      <J cx={144} cy={68} r={6} />
      <line x1="144" y1="68" x2="164" y2="128" stroke="currentColor" strokeWidth={SW.uArm} strokeLinecap="round" />
      <J cx={164} cy={128} r={8} />
      <L x1={164} y1={128} x2={182} y2={170} tx2={194} ty2={88} sw={SW.fArm} />
      <DB cx={192} cy={173} tcx={204} tcy={88} hR={10} />
      <text x="110" y="144" textAnchor="middle" fontSize="9" fill={accent} opacity="0.45">elbows stay pinned</text>
      <PL a="↓  LOWER SLOWLY (3 sec)" b="↑  CURL UP" accent={accent} />
    </svg>
  );
}

function RowAnim({ accent }: { accent:string }) {
  return (
    <svg viewBox="0 0 220 290" className="w-full h-full">
      <MG cx={120} cy={110} rx={70} ry={56} accent={accent} />
      <H cx={50} cy={60} />
      {/* Torso ~45° */}
      <L x1={62} y1={74} x2={150} y2={126} sw={SW.torsoS} />
      <J cx={62} cy={74} r={7} />
      <J cx={150} cy={126} r={7} />
      {/* Near leg */}
      <L x1={150} y1={126} x2={132} y2={198} sw={SW.thigh} />
      <J cx={132} cy={198} r={8} />
      <L x1={132} y1={198} x2={126} y2={268} sw={SW.calf} />
      {/* Far leg */}
      <L x1={153} y1={128} x2={168} y2={198} sw={SW.thigh-2} op={0.38} />
      <L x1={168} y1={198} x2={172} y2={268} sw={SW.calf-1} op={0.38} />
      <line x1="108" y1="274" x2="142" y2="274" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round" />
      <line x1="154" y1="274" x2="186" y2="274" stroke="currentColor" strokeWidth={SW.foot-1} strokeLinecap="round" opacity={0.38} />
      <Floor y={278} x1={90} x2={200} />
      {/* Near arm pulls */}
      <L x1={62} y1={74} x2={52} y2={116} tx2={66} ty2={98} sw={SW.uArm} />
      <J cx={52} cy={116} tcx={66} tcy={98} r={5} />
      <L x1={52} y1={116} x2={40} y2={163} tx1={66} ty1={98} tx2={70} ty2={126} sw={SW.fArm} />
      <BarSide x={72} cy={165} tcy={128} plateR={14} />
      {/* Far arm */}
      <L x1={68} y1={78} x2={58} y2={118} sw={SW.uArm-2} op={0.35} />
      <L x1={58} y1={118} x2={56} y2={163} sw={SW.fArm-1} op={0.35} />
      {/* Pull arrow */}
      <g>
        <polygon points="170,113 170,101 185,107" fill={accent}>
          <animate attributeName="opacity" values="0.85;0.2;0.85" dur={DUR}
            repeatCount="indefinite" calcMode="spline" keySplines={EASE} keyTimes={KT} />
        </polygon>
        <line x1="146" y1="107" x2="170" y2="107" stroke={accent} strokeWidth={2.5} strokeLinecap="round">
          <animate attributeName="opacity" values="0.85;0.2;0.85" dur={DUR}
            repeatCount="indefinite" calcMode="spline" keySplines={EASE} keyTimes={KT} />
        </line>
      </g>
      <text x="107" y="84" textAnchor="middle" fontSize="9" fill="white" opacity="0.28">BACK FLAT</text>
      <PL a="↙  ARM DOWN — START" b="PULL ELBOW BACK →" accent={accent} />
    </svg>
  );
}

function HingeAnim({ accent }: { accent:string }) {
  return (
    <svg viewBox="0 0 220 290" className="w-full h-full">
      <MG cx={112} cy={196} rx={66} ry={62} accent={accent} />
      <H cx={102} cy={24} tcx={48} tcy={70} />
      <L x1={102} y1={41} x2={102} y2={53} tx1={55} ty1={87} tx2={60} ty2={98} sw={SW.neck} />
      <L x1={102} y1={53} x2={102} y2={142} tx1={60} ty1={98} tx2={122} ty2={143} sw={SW.torsoS} />
      <J cx={102} cy={53} tcx={60} tcy={98} r={7} />
      <J cx={102} cy={142} tcx={122} tcy={143} r={7} />
      {/* Arm hangs, grips bar that tracks down thigh */}
      <L x1={102} y1={80} x2={98} y2={110} tx1={76} ty1={104} tx2={84} ty2={146} sw={SW.uArm} />
      <J cx={98} cy={110} tcx={84} tcy={146} r={5} />
      <L x1={98} y1={110} x2={96} y2={144} tx1={84} ty1={146} tx2={88} ty2={195} sw={SW.fArm} />
      <BarSide x={112} cy={146} tcy={197} plateR={15} />
      {/* Near leg */}
      <L x1={102} y1={142} x2={94} y2={210} tx1={122} ty1={143} tx2={114} ty2={212} sw={SW.thigh} />
      <J cx={94} cy={210} tcx={114} tcy={212} r={8} />
      <L x1={94} y1={210} x2={92} y2={268} tx1={114} ty1={212} tx2={112} ty2={268} sw={SW.calf} />
      <L x1={106} y1={144} x2={112} y2={210} tx1={126} ty1={145} tx2={122} ty2={212} sw={SW.thigh-2} op={0.38} />
      <L x1={112} y1={210} x2={114} y2={268} tx1={122} ty1={212} tx2={120} ty2={268} sw={SW.calf-1} op={0.38} />
      <line x1="74" y1="274" x2="108" y2="274" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round" />
      <line x1="104" y1="274" x2="128" y2="274" stroke="currentColor" strokeWidth={SW.foot-1} strokeLinecap="round" opacity={0.38} />
      <Floor y={278} />
      <AD cx={170} y={108} accent={accent} />
      <text x="162" y="102" textAnchor="middle" fontSize="9" fill={accent} opacity="0.8">HIPS BACK</text>
      <PL a="↓  PUSH HIPS BACK" b="↑  DRIVE HIPS FORWARD" accent={accent} />
    </svg>
  );
}

function LungeAnim({ accent }: { accent:string }) {
  return (
    <svg viewBox="0 0 220 290" className="w-full h-full">
      <MG cx={90} cy={196} rx={72} ry={68} accent={accent} />
      <H cx={88} cy={25} tcy={35} />
      <L x1={88} y1={42} x2={88} y2={140} ty1={52} ty2={152} sw={SW.torsoS} />
      {/* Dumbbells at sides */}
      <L x1={82} y1={66} x2={66} y2={128} ty1={76} ty2={140} sw={SW.uArm} />
      <J cx={66} cy={128} tcx={66} tcy={140} r={5} />
      <DB cx={57} cy={130} tcy={142} hR={10} />
      <L x1={94} y1={66} x2={110} y2={128} ty1={76} ty2={140} sw={SW.uArm} op={0.38} />
      <J cx={110} cy={128} tcx={110} tcy={140} r={5} />
      <DB cx={118} cy={130} tcy={142} hR={10} />
      {/* Front leg */}
      <J cx={84} cy={140} tcx={84} tcy={152} r={7} />
      <L x1={84} y1={140} x2={72} y2={202} tx2={60} ty1={152} ty2={218} sw={SW.thigh} />
      <J cx={72} cy={202} tcx={60} tcy={218} r={8} />
      <L x1={72} y1={202} x2={68} y2={268} tx1={60} ty1={218} sw={SW.calf} />
      <line x1="50" y1="274" x2="84" y2="274" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round" />
      {/* Back leg */}
      <J cx={92} cy={140} tcx={92} tcy={152} r={7} />
      <L x1={92} y1={140} x2={148} y2={190} tx2={148} ty1={152} ty2={215} sw={SW.thigh} />
      <J cx={148} cy={190} tcx={148} tcy={215} r={8} />
      <L x1={148} y1={190} x2={152} y2={268} tx1={148} ty1={215} sw={SW.calf} />
      <line x1="136" y1="274" x2="170" y2="274" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round" />
      <Floor y={278} />
      <AD cx={196} y={152} accent={accent} />
      <text x="152" y="262" textAnchor="middle" fontSize="9" fill={accent} opacity="0">
        <animate attributeName="opacity" values="0;0;0.8;0.8;0" dur={DUR}
          keyTimes="0;0.35;0.45;0.85;1" repeatCount="indefinite" />
        knee near floor
      </text>
      <PL a="↓  LOWER BACK KNEE" b="↑  PUSH BACK UP" accent={accent} />
    </svg>
  );
}

function PlankAnim({ accent }: { accent:string }) {
  return (
    <svg viewBox="0 0 290 200" className="w-full h-full">
      <MG cx={148} cy={108} rx={122} ry={32} accent={accent} />
      <line x1="10" y1="148" x2="280" y2="148" stroke="#383838" strokeWidth={2.5} />
      <circle cx="30" cy="92" r="17" fill="currentColor">
        <animate attributeName="cy" values="92;89;92" dur="3.5s"
          repeatCount="indefinite" calcMode="spline"
          keySplines="0.5 0 0.5 1;0.5 0 0.5 1" keyTimes="0;0.5;1" />
      </circle>
      <line x1="46" y1="96" x2="52" y2="104" stroke="currentColor" strokeWidth={SW.neck} strokeLinecap="round" />
      {/* Thick horizontal body */}
      <line x1="52" y1="106" x2="218" y2="122" stroke="currentColor" strokeWidth={SW.torsoS} strokeLinecap="round">
        <animate attributeName="y1" values="106;103;106" dur="3.5s"
          repeatCount="indefinite" calcMode="spline"
          keySplines="0.5 0 0.5 1;0.5 0 0.5 1" keyTimes="0;0.5;1" />
        <animate attributeName="y2" values="122;119;122" dur="3.5s"
          repeatCount="indefinite" calcMode="spline"
          keySplines="0.5 0 0.5 1;0.5 0 0.5 1" keyTimes="0;0.5;1" />
      </line>
      <line x1="68" y1="104" x2="60" y2="147" stroke="currentColor" strokeWidth={SW.uArm} strokeLinecap="round" />
      <J cx={60} cy={147} r={6} />
      <line x1="118" y1="112" x2="110" y2="147" stroke="currentColor" strokeWidth={SW.uArm-2} strokeLinecap="round" opacity={0.38} />
      <J cx={110} cy={147} r={5} />
      <line x1="44" y1="147" x2="128" y2="147" stroke="currentColor" strokeWidth={5} strokeLinecap="round" opacity={0.22} />
      {/* Legs */}
      <line x1="218" y1="122" x2="263" y2="147" stroke="currentColor" strokeWidth={SW.thigh-2} strokeLinecap="round" />
      <line x1="248" y1="147" x2="275" y2="147" stroke="currentColor" strokeWidth={SW.calf} strokeLinecap="round" />
      {/* Reference line — straight body */}
      <line x1="30" y1="93" x2="263" y2="140" stroke={accent} strokeWidth={1.5} strokeDasharray="8,5" opacity={0.22} />
      <text x="162" y="86" textAnchor="middle" fontSize="10" fontWeight="bold" fill={accent} opacity="0.65">NO SAG</text>
      <line x1="162" y1="90" x2="162" y2="108" stroke={accent} strokeWidth={1.5} strokeDasharray="3,3" opacity={0.42} />
      <circle cx="82" cy="107" r="3.5" fill={accent} opacity="0.5">
        <animate attributeName="r" values="3.5;5.5;3.5" dur="3.5s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.5 0 0.5 1;0.5 0 0.5 1" keyTimes="0;0.5;1" />
      </circle>
      <text x="145" y="185" textAnchor="middle" fontSize="11" fontWeight="bold"
        fill={accent} letterSpacing="0.5">HOLD · BREATHE · BODY STRAIGHT</text>
    </svg>
  );
}

function ShrugAnim({ accent }: { accent:string }) {
  return (
    <svg viewBox="0 0 220 290" className="w-full h-full">
      <MG cx={110} cy={68} rx={80} ry={40} accent={accent} />
      <H cx={110} cy={26} tcy={20} />
      <L x1={110} y1={43} x2={110} y2={62} ty1={37} ty2={56} sw={SW.neck} />
      {/* Shoulder line rises */}
      <L x1={64} y1={68} x2={156} y2={68} ty1={58} ty2={58} sw={SW.hint} op={0.32} />
      <L x1={110} y1={68} x2={110} y2={162} ty1={58} ty2={162} sw={SW.torso} />
      <L x1={80} y1={162} x2={140} y2={162} sw={SW.hint} op={0.22} />
      <StatLegs />
      <Floor y={277} />
      {/* Left arm + dumbbell — rises with shoulder */}
      <J cx={64} cy={68} tcx={64} tcy={58} r={6} />
      <L x1={64} y1={68} x2={52} y2={128} ty1={58} ty2={118} sw={SW.uArm} />
      <J cx={52} cy={128} tcx={52} tcy={118} r={5} />
      <L x1={52} y1={128} x2={46} y2={162} ty1={118} ty2={152} sw={SW.fArm} />
      <DB cx={37} cy={163} tcy={153} hR={10} />
      {/* Right arm */}
      <J cx={156} cy={68} tcx={156} tcy={58} r={6} />
      <L x1={156} y1={68} x2={168} y2={128} ty1={58} ty2={118} sw={SW.uArm} />
      <J cx={168} cy={128} tcx={168} tcy={118} r={5} />
      <L x1={168} y1={128} x2={174} y2={162} ty1={118} ty2={152} sw={SW.fArm} />
      <DB cx={183} cy={163} tcy={153} hR={10} />
      <AU cx={32} y={54} accent={accent} />
      <AU cx={188} y={54} accent={accent} />
      <text x="110" y="50" textAnchor="middle" fontSize="9" fill={accent} opacity="0">
        <animate attributeName="opacity" values="0;0;0.75;0.75;0" dur={DUR}
          keyTimes="0;0.35;0.45;0.85;1" repeatCount="indefinite" />
        SHOULDERS TO EARS
      </text>
      <PL a="↓  NEUTRAL SHOULDERS" b="↑  SHRUG TO EARS" accent={accent} />
    </svg>
  );
}

function LegRaiseAnim({ accent }: { accent:string }) {
  return (
    <svg viewBox="0 0 290 200" className="w-full h-full">
      <MG cx={155} cy={100} rx={90} ry={38} accent={accent} />
      <line x1="10" y1="148" x2="280" y2="148" stroke="#383838" strokeWidth={2.5} />
      <circle cx="28" cy="116" r="17" fill="currentColor" />
      <line x1="44" y1="118" x2="50" y2="126" stroke="currentColor" strokeWidth={SW.neck} strokeLinecap="round" />
      <line x1="50" y1="126" x2="164" y2="126" stroke="currentColor" strokeWidth={SW.torsoS} strokeLinecap="round" />
      <line x1="65" y1="126" x2="56" y2="147" stroke="currentColor" strokeWidth={SW.uArm-2} strokeLinecap="round" opacity={0.38} />
      <line x1="95" y1="126" x2="86" y2="147" stroke="currentColor" strokeWidth={SW.uArm-2} strokeLinecap="round" opacity={0.38} />
      <J cx={164} cy={126} r={8} />
      {/* Legs raise from floor to 90° */}
      <L x1={164} y1={126} x2={218} y2={147} tx2={168} ty2={62} sw={SW.thigh} />
      <J cx={218} cy={147} tcx={168} tcy={62} r={8} />
      <L x1={218} y1={147} x2={260} y2={147} tx1={168} ty1={62} tx2={186} ty2={62} sw={SW.calf} />
      <L x1={166} y1={126} x2={220} y2={147} tx2={172} ty2={66} sw={SW.thigh-2} op={0.38} />
      <L x1={220} y1={147} x2={263} y2={147} tx1={172} ty1={66} tx2={190} ty2={66} sw={SW.calf-1} op={0.38} />
      {/* Feet */}
      <line x1="253" y1="147" x2="274" y2="140" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round">
        <animate attributeName="x1" values="253;178;253" dur={DUR} repeatCount="indefinite"
          calcMode="spline" keySplines={EASE} keyTimes={KT} />
        <animate attributeName="x2" values="274;196;274" dur={DUR} repeatCount="indefinite"
          calcMode="spline" keySplines={EASE} keyTimes={KT} />
        <animate attributeName="y1" values="147;60;147" dur={DUR} repeatCount="indefinite"
          calcMode="spline" keySplines={EASE} keyTimes={KT} />
        <animate attributeName="y2" values="140;52;140" dur={DUR} repeatCount="indefinite"
          calcMode="spline" keySplines={EASE} keyTimes={KT} />
      </line>
      <AU cx={238} y={48} accent={accent} />
      <text x="145" y="185" textAnchor="middle" fontSize="11" fontWeight="bold" fill={accent} letterSpacing="0.5">
        <animate attributeName="opacity" values="1;1;0;0;1" dur={DUR}
          keyTimes="0;0.38;0.48;0.9;1" repeatCount="indefinite" />
        LOWER SLOWLY · BACK STAYS FLAT
      </text>
      <text x="145" y="185" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white" opacity="0" letterSpacing="0.5">
        <animate attributeName="opacity" values="0;0;1;1;0" dur={DUR}
          keyTimes="0;0.38;0.48;0.9;1" repeatCount="indefinite" />
        ↑  RAISE LEGS TO 90°
      </text>
    </svg>
  );
}

function TwistAnim({ accent }: { accent:string }) {
  return (
    <svg viewBox="0 0 220 290" className="w-full h-full">
      <MG cx={110} cy={158} rx={72} ry={46} accent={accent} />
      <line x1="55" y1="238" x2="165" y2="238" stroke="#383838" strokeWidth={3} strokeLinecap="round" />
      {/* Seated legs */}
      <L x1={122} y1={188} x2={88} y2={228} sw={SW.thigh} />
      <J cx={88} cy={228} r={8} />
      <line x1="70" y1="238" x2="102" y2="238" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round" />
      <L x1={130} y1={188} x2={164} y2={228} sw={SW.thigh} op={0.38} />
      <J cx={164} cy={228} r={8} />
      <line x1="152" y1="238" x2="180" y2="238" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round" opacity={0.38} />
      {/* Leaning torso */}
      <L x1={110} y1={108} x2={126} y2={188} tx1={92} ty1={108} tx2={106} ty2={188} sw={SW.torsoS} />
      <J cx={126} cy={188} r={7} />
      <H cx={110} cy={90} tcx={96} tcy={90} />
      {/* Arms swing side to side */}
      <L x1={110} y1={140} x2={82} y2={158} tx1={92} ty1={140} tx2={64} ty2={150} sw={SW.uArm} />
      <J cx={82} cy={158} tcx={64} tcy={150} r={5} />
      <L x1={82} y1={158} x2={60} y2={174} tx1={64} ty1={150} tx2={42} ty2={164} sw={SW.fArm} />
      {/* Weight plate travels with hands */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values="0,0;-20,-10;0,0" dur={DUR} repeatCount="indefinite"
          calcMode="spline" keySplines={EASE} keyTimes={KT} />
        <ellipse cx="52" cy="172" rx="6" ry="22" fill="#505050" />
        <ellipse cx="50" cy="172" rx="4.5" ry="17" fill="#a0a0a0" />
        <ellipse cx="50" cy="172" rx="1.5" ry="5" fill="#222" />
      </g>
      <text x="110" y="78" textAnchor="middle" fontSize="18" fill={accent} opacity="0.65">
        <animate attributeName="x" values="110;88;110" dur={DUR}
          repeatCount="indefinite" calcMode="spline" keySplines={EASE} keyTimes={KT} />
        ↺
      </text>
      <text x="110" y="258" textAnchor="middle" fontSize="9" fill={accent} opacity="0.45">LEAN BACK SLIGHTLY</text>
      <PL a="→  ROTATE RIGHT" b="←  ROTATE LEFT" accent={accent} />
    </svg>
  );
}

function LateralRaiseAnim({ accent }: { accent:string }) {
  return (
    <svg viewBox="0 0 220 290" className="w-full h-full">
      <MG cx={110} cy={90} rx={104} ry={52} accent={accent} />
      <H cx={110} cy={26} />
      <L x1={110} y1={43} x2={110} y2={57} sw={SW.neck} />
      <L x1={110} y1={57} x2={110} y2={162} sw={SW.torso} />
      <L x1={76} y1={64} x2={144} y2={64} sw={SW.hint} op={0.22} />
      <L x1={80} y1={162} x2={140} y2={162} sw={SW.hint} op={0.22} />
      <StatLegs />
      <Floor y={277} />
      {/* Left arm raises laterally */}
      <J cx={76} cy={68} r={6} />
      <L x1={76} y1={68} x2={50} y2={116} tx2={26} ty2={80} sw={SW.uArm} />
      <J cx={50} cy={116} tcx={26} tcy={80} r={5} />
      <L x1={50} y1={116} x2={38} y2={146} tx1={26} ty1={80} tx2={16} ty2={86} sw={SW.fArm} />
      <DB cx={27} cy={148} tcx={5} tcy={90} hR={10} />
      {/* Right arm */}
      <J cx={144} cy={68} r={6} />
      <L x1={144} y1={68} x2={170} y2={116} tx2={194} ty2={80} sw={SW.uArm} />
      <J cx={170} cy={116} tcx={194} tcy={80} r={5} />
      <L x1={170} y1={116} x2={182} y2={146} tx1={194} ty1={80} tx2={204} ty2={86} sw={SW.fArm} />
      <DB cx={193} cy={148} tcx={215} tcy={90} hR={10} />
      <text x="110" y="90" textAnchor="middle" fontSize="9" fill={accent} opacity="0">
        <animate attributeName="opacity" values="0;0;0.75;0.75;0" dur={DUR}
          keyTimes="0;0.35;0.45;0.85;1" repeatCount="indefinite" />
        STOP AT SHOULDER HEIGHT
      </text>
      <PL a="↓  LOWER SLOWLY" b="↑  RAISE TO SHOULDER" accent={accent} />
    </svg>
  );
}

function TricepsExtAnim({ accent }: { accent:string }) {
  return (
    <svg viewBox="0 0 220 290" className="w-full h-full">
      <MG cx={96} cy={80} rx={56} ry={58} accent={accent} />
      <H cx={90} cy={26} />
      <L x1={90} y1={43} x2={90} y2={55} sw={SW.neck} />
      <L x1={90} y1={55} x2={90} y2={155} sw={SW.torsoS} />
      <L x1={68} y1={155} x2={112} y2={155} sw={SW.hint} op={0.22} />
      <L x1={68} y1={155} x2={60} y2={215} sw={SW.thigh} />
      <J cx={60} cy={215} r={8} />
      <L x1={60} y1={215} x2={58} y2={268} sw={SW.calf} />
      <L x1={112} y1={155} x2={118} y2={215} sw={SW.thigh} op={0.38} />
      <J cx={118} cy={215} r={8} />
      <L x1={118} y1={215} x2={120} y2={268} sw={SW.calf} op={0.38} />
      <line x1="40" y1="274" x2="74" y2="274" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round" />
      <line x1="106" y1="274" x2="136" y2="274" stroke="currentColor" strokeWidth={SW.foot-1} strokeLinecap="round" opacity={0.38} />
      <Floor y={278} />
      {/* Upper arm fixed, pointing up */}
      <J cx={88} cy={62} r={6} />
      <line x1="88" y1="62" x2="86" y2="26" stroke="currentColor" strokeWidth={SW.uArm} strokeLinecap="round" />
      <J cx={86} cy={26} r={8} />
      {/* Forearm swings from bent (behind head) to extended */}
      <L x1={86} y1={26} x2={100} y2={62} tx2={84} ty2={-4} sw={SW.fArm} />
      <DBVert cx={100} cy={54} tcy={-10} hR={10} />
      <text x="62" y="22" fontSize="9" fill={accent} opacity="0.65" textAnchor="middle">elbow UP</text>
      <line x1="66" y1="24" x2="80" y2="26" stroke={accent} strokeWidth={1.5} opacity={0.5} />
      <AU cx={128} y={12} accent={accent} />
      <PL a="↓  LOWER BEHIND HEAD" b="↑  EXTEND ARM UP" accent={accent} />
    </svg>
  );
}

function PushupAnim({ accent }: { accent:string }) {
  return (
    <svg viewBox="0 0 290 200" className="w-full h-full">
      <MG cx={130} cy={90} rx={92} ry={40} accent={accent} />
      <line x1="10" y1="155" x2="280" y2="155" stroke="#383838" strokeWidth={2.5} />
      <circle cx="28" cy="86" r="17" fill="currentColor">
        <animate attributeName="cy" values="86;74;86" dur={DUR}
          repeatCount="indefinite" calcMode="spline" keySplines={EASE} keyTimes={KT} />
      </circle>
      {/* Body rises as arms extend */}
      <L x1={45} y1={96} x2={192} y2={120} ty1={80} ty2={108} sw={SW.torsoS} />
      {/* Near arm — hand fixed, shoulder rises */}
      <J cx={72} cy={154} r={6} />
      <L x1={72} y1={98} x2={72} y2={154} ty1={84} sw={SW.uArm} />
      <J cx={72} cy={98} tcx={72} tcy={84} r={5} />
      {/* Far arm */}
      <J cx={120} cy={154} r={6} />
      <L x1={120} y1={108} x2={120} y2={154} ty1={96} sw={SW.uArm-2} op={0.38} />
      <J cx={120} cy={108} tcx={120} tcy={96} r={5} />
      <line x1="58" y1="154" x2="88" y2="154" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round" />
      <line x1="106" y1="154" x2="136" y2="154" stroke="currentColor" strokeWidth={SW.foot-1} strokeLinecap="round" opacity={0.38} />
      {/* Body straight legs */}
      <L x1={192} y1={120} x2={252} y2={150} ty1={108} ty2={142} sw={SW.thigh-2} />
      <line x1="242" y1="152" x2="268" y2="152" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round">
        <animate attributeName="y1" values="152;142;152" dur={DUR}
          repeatCount="indefinite" calcMode="spline" keySplines={EASE} keyTimes={KT} />
        <animate attributeName="y2" values="152;142;152" dur={DUR}
          repeatCount="indefinite" calcMode="spline" keySplines={EASE} keyTimes={KT} />
      </line>
      <AU cx={155} y={58} accent={accent} />
      <text x="155" y="70" textAnchor="middle" fontSize="9" fill={accent} opacity="0.5">BODY STRAIGHT</text>
      <text x="145" y="185" textAnchor="middle" fontSize="11" fontWeight="bold" fill={accent} letterSpacing="0.5">
        <animate attributeName="opacity" values="1;1;0;0;1" dur={DUR}
          keyTimes="0;0.38;0.48;0.9;1" repeatCount="indefinite" />
        ↓  LOWER CHEST TO FLOOR
      </text>
      <text x="145" y="185" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white" opacity="0" letterSpacing="0.5">
        <animate attributeName="opacity" values="0;0;1;1;0" dur={DUR}
          keyTimes="0;0.38;0.48;0.9;1" repeatCount="indefinite" />
        ↑  PRESS UP
      </text>
    </svg>
  );
}

function WalkAnim({ accent }: { accent:string }) {
  return (
    <svg viewBox="0 0 220 290" className="w-full h-full">
      <MG cx={110} cy={130} rx={82} ry={82} accent={accent} />
      <H cx={110} cy={26} tcy={28} />
      <L x1={110} y1={43} x2={110} y2={57} ty1={45} ty2={59} sw={SW.neck} />
      <L x1={110} y1={57} x2={110} y2={158} ty1={59} ty2={160} sw={SW.torso} />
      <L x1={80} y1={158} x2={140} y2={158} ty1={160} ty2={160} sw={SW.hint} op={0.22} />
      {/* Arms swing opposite to legs */}
      <J cx={78} cy={68} r={6} />
      <L x1={78} y1={68} x2={58} y2={116} tx2={68} ty2={108} sw={SW.uArm} />
      <J cx={58} cy={116} tcx={68} tcy={108} r={5} />
      <L x1={58} y1={116} x2={48} y2={148} tx1={68} ty1={108} tx2={74} ty2={144} sw={SW.fArm} />
      <J cx={142} cy={68} r={6} />
      <L x1={142} y1={68} x2={162} y2={116} tx2={152} ty2={108} sw={SW.uArm} op={0.5} />
      <J cx={162} cy={116} tcx={152} tcy={108} r={5} />
      <L x1={162} y1={116} x2={172} y2={148} tx1={152} ty1={108} tx2={146} ty2={144} sw={SW.fArm} op={0.5} />
      {/* Heavy dumbbells */}
      <DB cx={37} cy={150} tcx={66} tcy={145} hR={12} />
      <DB cx={183} cy={150} tcx={154} tcy={145} hR={12} />
      {/* Walking legs — opposite phases */}
      <L x1={80} y1={158} x2={64} y2={218} tx2={96} sw={SW.thigh} />
      <J cx={64} cy={218} tcx={96} tcy={218} r={8} />
      <L x1={64} y1={218} x2={56} y2={272} tx1={96} ty1={218} tx2={90} sw={SW.calf} />
      <L x1={140} y1={158} x2={158} y2={218} tx2={126} sw={SW.thigh} op={0.5} />
      <J cx={158} cy={218} tcx={126} tcy={218} r={8} />
      <L x1={158} y1={218} x2={162} y2={272} tx1={126} ty1={218} tx2={130} sw={SW.calf} op={0.5} />
      <line x1="38" y1="278" x2="72" y2="278" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round" />
      <line x1="148" y1="278" x2="182" y2="278" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round" opacity={0.5} />
      <Floor y={282} />
      <text x="110" y="284" textAnchor="middle" fontSize="11" fontWeight="bold"
        fill={accent} letterSpacing="0.5">WALK TALL · GRIP TIGHT · CHEST UP</text>
    </svg>
  );
}

function ClimberAnim({ accent }: { accent:string }) {
  return (
    <svg viewBox="0 0 290 200" className="w-full h-full">
      <MG cx={145} cy={108} rx={122} ry={38} accent={accent} />
      <line x1="10" y1="165" x2="280" y2="165" stroke="#383838" strokeWidth={2.5} />
      <circle cx="30" cy="88" r="16" fill="currentColor" />
      <line x1="45" y1="92" x2="50" y2="100" stroke="currentColor" strokeWidth={SW.neck} strokeLinecap="round" />
      <line x1="50" y1="100" x2="215" y2="120" stroke="currentColor" strokeWidth={SW.torsoS} strokeLinecap="round" />
      <J cx={68} cy={100} r={6} />
      <line x1="68" y1="100" x2="62" y2="163" stroke="currentColor" strokeWidth={SW.uArm} strokeLinecap="round" />
      <J cx={62} cy={163} r={6} />
      <line x1="112" y1="108" x2="106" y2="163" stroke="currentColor" strokeWidth={SW.uArm-2} strokeLinecap="round" opacity={0.38} />
      <J cx={106} cy={163} r={5} />
      <line x1="44" y1="163" x2="124" y2="163" stroke="currentColor" strokeWidth={SW.foot} strokeLinecap="round" opacity={0.22} />
      {/* Left knee drives forward */}
      <L x1={215} y1={120} x2={185} y2={140} tx2={152} ty2={118} sw={SW.thigh} />
      <J cx={185} cy={140} tcx={152} tcy={118} r={8} />
      <L x1={185} y1={140} x2={190} y2={163} tx1={152} ty1={118} tx2={158} ty2={158} sw={SW.calf} />
      {/* Right leg — opposite phase */}
      <L x1={218} y1={122} x2={158} y2={142} tx2={192} ty2={150} sw={SW.thigh} op={0.5} />
      <J cx={158} cy={142} tcx={192} tcy={150} r={8} />
      <L x1={158} y1={142} x2={154} y2={163} tx1={192} ty1={150} tx2={194} ty2={163} sw={SW.calf} op={0.5} />
      <AU cx={170} y={100} accent={accent} />
      <text x="170" y="98" textAnchor="middle" fontSize="9" fill={accent} opacity="0.65">KNEE → CHEST</text>
      <text x="145" y="188" textAnchor="middle" fontSize="11" fontWeight="bold"
        fill={accent} letterSpacing="0.5">ALTERNATE FAST · HIPS LOW</text>
    </svg>
  );
}

// ─── REGISTRY + EXPORT ────────────────────────────────────────────────────────

const REGISTRY: Record<AnimationType, (props: { accent: string }) => React.JSX.Element> = {
  squat: SquatAnim,
  floorPress: FloorPressAnim,
  overheadPress: OverheadPressAnim,
  lunge: LungeAnim,
  plank: PlankAnim,
  row: RowAnim,
  hinge: HingeAnim,
  curl: CurlAnim,
  shrug: ShrugAnim,
  legRaise: LegRaiseAnim,
  deadlift: DeadliftAnim,
  twist: TwistAnim,
  lateralRaise: LateralRaiseAnim,
  tricepsExt: TricepsExtAnim,
  pushup: PushupAnim,
  walk: WalkAnim,
  climber: ClimberAnim,
};

const LYING_TYPES: AnimationType[] = ['floorPress', 'plank', 'legRaise', 'pushup', 'climber'];

interface ExerciseAnimationProps {
  type: AnimationType;
  accentColor?: string;
}

export default function ExerciseAnimation({ type, accentColor = '#4ade80' }: ExerciseAnimationProps) {
  const Component = REGISTRY[type];
  const isLying = LYING_TYPES.includes(type);
  return (
    <div
      className={`w-full rounded-2xl flex items-center justify-center overflow-hidden ${isLying ? 'aspect-[3/2]' : 'aspect-[3/4]'}`}
      style={{ background: `${accentColor}0d`, color: accentColor }}
    >
      <Component accent={accentColor} />
    </div>
  );
}
