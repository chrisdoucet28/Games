import { useState, useRef, useEffect } from "react";
import type { GameProps, QuestionData } from "../../types";
import { QuestionCard } from "../shared/QuestionCard";
import { teamsGridCols } from "../../data/constants";

const TOTAL = 60;

type ZoneDef = { id: string; label: string; short: string; emoji: string; color: string; end: number };
const ZONES: ZoneDef[] = [
  { id: "correct grammar mistakes", label: "Error Correction", short: "Error Fix", emoji: "🔍", color: "#60A5FA", end: 15 },
  { id: "choose correct grammar", label: "Multiple Choice", short: "Multi Choice", emoji: "🔤", color: "#4ADE80", end: 30 },
  { id: "finish the sentence", label: "Fill the Blank", short: "Fill Blank", emoji: "✏️", color: "#F97316", end: 45 },
  { id: "speaking task", label: "Speaking", short: "Speaking", emoji: "🗣️", color: "#F7C948", end: 60 },
];
function getZone(pos: number): ZoneDef {
  return ZONES.find(z => pos <= z.end) || ZONES[ZONES.length - 1];
}

const CARS = ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🛻"];
const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const RANK_POINTS = [100, 65, 40, 20, 10];

type SpaceId = "normal" | "boost" | "mud" | "shortcut" | "trap" | "teleport" | "coin" | "shield" | "lucky" | "question";
const SPACE_DEFS: { id: SpaceId; icon: string; color: string; weight: number }[] = [
  { id: "normal", icon: "", color: "#4ADE80", weight: 38 },
  { id: "boost", icon: "⚡", color: "#F7C948", weight: 10 },
  { id: "mud", icon: "🟫", color: "#92400E", weight: 8 },
  { id: "shortcut", icon: "🚀", color: "#7C3AED", weight: 6 },
  { id: "trap", icon: "💥", color: "#EF4444", weight: 8 },
  { id: "teleport", icon: "🌀", color: "#06B6D4", weight: 5 },
  { id: "coin", icon: "🪙", color: "#FBBF24", weight: 9 },
  { id: "shield", icon: "🛡️", color: "#3B82F6", weight: 6 },
  { id: "lucky", icon: "🍀", color: "#EC4899", weight: 6 },
  { id: "question", icon: "❓", color: "#F97316", weight: 4 },
];

const POWERUPS = [
  { id: "rocket", label: "Rocket", icon: "🚀", desc: "+6 spaces on your next roll", cost: 15 },
  { id: "swap", label: "Swap", icon: "🔄", desc: "Switch places with a random team", cost: 20 },
  { id: "shield", label: "Shield", icon: "🛡️", desc: "Blocks the next trap / mud / teleport", cost: 10 },
  { id: "double", label: "Double Roll", icon: "🎲", desc: "Roll twice next turn (powers through mud)", cost: 20 },
  { id: "banana", label: "Banana Trap", icon: "🍌", desc: "Place a trap on a random space", cost: 10 },
] as const;

type TrackSpace = { type: SpaceId | "start" | "finish"; color: string; icon?: string; banana?: boolean };
type RaceTeamState = { pos: number; coins: number; shields: number; skip: boolean; powerups: string[]; car: string };
type EffectInfo = { msg: string; color: string; icon: string };
type FxRing = { idx: number; color: string; icon: string; key: number };
type Phase = "intro" | "task" | "rolling" | "effect" | "gameover";
type RankRow = { id: string | number; name: string; pos: number; points: number };

function buildTrack(): TrackSpace[] {
  const pool: SpaceId[] = [];
  SPACE_DEFS.forEach(s => { for (let w = 0; w < s.weight; w++) pool.push(s.id); });
  const track: TrackSpace[] = [];
  for (let i = 0; i <= TOTAL; i++) {
    if (i === 0) track.push({ type: "start", color: "#4ADE80" });
    else if (i === TOTAL) track.push({ type: "finish", color: "#F7C948" });
    else {
      const id = pool[Math.floor(Math.random() * pool.length)];
      const def = SPACE_DEFS.find(s => s.id === id)!;
      track.push({ type: id, color: def.color, icon: def.icon, banana: false });
    }
  }
  return track;
}

function computeTrackPositions(): { x: number; y: number }[] {
  const T = 55, B = 420, L = 50, R = 750;
  const perim = 2 * (R - L) + 2 * (B - T);
  const step = perim / (TOTAL + 1);
  const pos: { x: number; y: number }[] = [];
  for (let i = 0; i <= TOTAL; i++) {
    const d = i * step;
    const tl = R - L, rl = B - T, bl = R - L;
    let x: number, y: number;
    if (d <= tl) { x = L + d; y = T; }
    else if (d <= tl + rl) { x = R; y = T + (d - tl); }
    else if (d <= tl + rl + bl) { x = R - (d - tl - rl); y = B; }
    else { x = L; y = B - (d - tl - rl - bl); }
    pos.push({ x: Math.round(x), y: Math.round(y) });
  }
  return pos;
}
const TPOS = computeTrackPositions();
const TRACK_PATH_D = TPOS.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ") + " Z";

function luckyOutcome(team: RaceTeamState, landedIdx: number, teamName: string): { finalIdx: number; msg: string; patch: Partial<RaceTeamState> } {
  const roll = Math.floor(Math.random() * 5);
  if (roll === 0) return { finalIdx: landedIdx, msg: `🍀 Lucky! ${teamName} finds 20 bonus coins!`, patch: { coins: team.coins + 20 } };
  if (roll === 1) return { finalIdx: Math.min(landedIdx + 4, TOTAL), msg: `🍀 Lucky! ${teamName} leaps forward 4 spaces!`, patch: {} };
  if (roll === 2) return { finalIdx: landedIdx, msg: `🍀 Lucky! ${teamName} earns a free Shield!`, patch: { shields: team.shields + 1 } };
  if (roll === 3) return { finalIdx: landedIdx, msg: `🍀 Lucky! ${teamName} gets 15 bonus coins!`, patch: { coins: team.coins + 15 } };
  const pu = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
  if (pu.id === "shield") return { finalIdx: landedIdx, msg: `🍀 Lucky! ${teamName} earns a free Shield!`, patch: { shields: team.shields + 1 } };
  return { finalIdx: landedIdx, msg: `🍀 Lucky! ${teamName} earns a random powerup: ${pu.icon} ${pu.label}!`, patch: { powerups: [...team.powerups, pu.id] } };
}

const STYLE_TAG = (
  <style>{`
    @keyframes fxRingExpand{0%{r:4;opacity:1;stroke-width:4}70%{opacity:.55}100%{r:34;opacity:0;stroke-width:1}}
    @keyframes fxBurstIcon{0%{opacity:0;transform:scale(.3) translateY(6px)}18%{opacity:1;transform:scale(1.3) translateY(-4px)}80%{opacity:1;transform:scale(1.05) translateY(-10px)}100%{opacity:0;transform:scale(.9) translateY(-22px)}}
    @keyframes dSpin{0%{transform:rotate(0) scale(1)}25%{transform:rotate(50deg) scale(1.15)}60%{transform:rotate(-25deg) scale(.9)}100%{transform:rotate(0) scale(1)}}
    @keyframes rtToast{0%{opacity:0;transform:translate(-50%,10px)}15%{opacity:1;transform:translate(-50%,0)}85%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-6px)}}
    @keyframes rtConfetti{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(160px) rotate(360deg);opacity:0}}
    @keyframes rtSpeedLine{0%{transform:translateX(-130%);opacity:0}12%{opacity:.5}88%{opacity:.5}100%{transform:translateX(230%);opacity:0}}
    @keyframes rtLightPulse{0%,100%{opacity:.4}50%{opacity:1}}
    .rt-btn:hover:not(:disabled){transform:translateY(-2px) scale(1.02);filter:brightness(1.08)}
    .rt-btn:active:not(:disabled){transform:translateY(0) scale(0.97)}
    .rt-btn:disabled{opacity:.4;cursor:not-allowed}
    .rt-chip:hover{filter:brightness(1.2)}
  `}</style>
);

const SPEED_LINES = Array.from({ length: 7 }, (_, i) => ({ top: 8 + i * 12, dur: 1.6 + (i % 3) * 0.4, delay: i * 0.3, width: 70 + (i % 4) * 40 }));
function SpeedLines() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {SPEED_LINES.map((l, i) => (
        <div key={i} style={{ position: "absolute", top: `${l.top}%`, left: 0, width: `${l.width}px`, height: "3px", borderRadius: "2px", background: "linear-gradient(90deg,transparent,#EF444470,transparent)", animation: `rtSpeedLine ${l.dur}s linear infinite ${l.delay}s` }} />
      ))}
    </div>
  );
}

function CheckeredStrip() {
  const squares = Array.from({ length: 20 });
  return (
    <div style={{ display: "flex", width: "100%", maxWidth: "560px", margin: "0 auto", borderRadius: "4px", overflow: "hidden", height: "10px" }}>
      {squares.map((_, i) => (
        <div key={i} style={{ flex: 1, background: i % 2 === 0 ? "#F1F5F9" : "#0B0F17" }} />
      ))}
    </div>
  );
}

// What "Save & Exit" snapshots and "Resume" restores — every team's position/coins/shields/
// powerups, plus the track layout itself (space types and any placed banana traps line up with
// positions, so they travel together). Doesn't include which phase/roll was mid-flight; resuming
// always drops back into "task" for a fresh question, same pattern as the other resumable games.
type RaceSnapshot = {
  raceTeams: Record<string | number, RaceTeamState>;
  track?: TrackSpace[];
};

function validateRaceSnapshot(raw: unknown, teamIds: (string | number)[]): RaceSnapshot | undefined {
  const s = raw as Partial<RaceSnapshot> | null | undefined;
  if (!s || typeof s.raceTeams !== "object" || s.raceTeams === null) return undefined;
  if (!teamIds.every(id => s.raceTeams![id] && typeof s.raceTeams![id].pos === "number")) return undefined;
  return { raceTeams: s.raceTeams, track: Array.isArray(s.track) && s.track.length === TOTAL + 1 ? s.track : undefined };
}

export function RaceTrackGame({ questions, teams, onUpdateScore, onEnd, forceFinalRef, serializeStateRef, initialGameState }: GameProps) {
  const resumed = useRef(validateRaceSnapshot(initialGameState, teams.map(t => t.id))).current;
  // A resumed race skips the intro and drops straight into a fresh task for the group.
  const [phase, setPhase] = useState<Phase>(() => resumed ? "task" : "intro");
  const [track, setTrack] = useState<TrackSpace[]>(() => resumed?.track ?? buildTrack());
  const [raceTeams, setRaceTeams] = useState<Record<string | number, RaceTeamState>>(() =>
    resumed?.raceTeams ?? Object.fromEntries(teams.map((t, i) => [t.id, { pos: 0, coins: 0, shields: 0, skip: false, powerups: [], car: t.mascot ?? CARS[i % CARS.length] }]))
  );
  const [winnerId, setWinnerId] = useState<string | number | null>(null);
  const [showAns, setShowAns] = useState(false);
  const [diceFace, setDiceFace] = useState("🎲");
  const [rolling, setRolling] = useState(false);
  const [lastEffect, setLastEffect] = useState<EffectInfo | null>(null);
  const [fxRing, setFxRing] = useState<FxRing | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [shopTeamId, setShopTeamId] = useState<string | number>(teams[0]?.id);
  const [finalRanking, setFinalRanking] = useState<RankRow[]>([]);
  const fxIdRef = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The roll → glide → effect sequence spans several chained setTimeouts (~2-3s). The shop and
  // powerup chips stay clickable throughout, so reads inside those callbacks must go through refs
  // (always current) rather than the closed-over state from when the chain started — otherwise a
  // powerup bought/used mid-animation can get silently overwritten once the chain's own write lands.
  const raceTeamsRef = useRef(raceTeams);
  const trackRef = useRef(track);
  useEffect(() => { raceTeamsRef.current = raceTeams; trackRef.current = track; });

  const qByType = useRef<Record<string, QuestionData[]> | null>(null);
  if (!qByType.current) {
    const map: Record<string, QuestionData[]> = {};
    ZONES.forEach(z => { if (!map[z.id]) map[z.id] = []; });
    questions.forEach(q => {
      const t = q.type || "unknown";
      if (map[t] !== undefined) map[t].push(q);
      if (t === "speaking task" || (q as any).task) {
        map["speaking task"].push({ ...q, type: "speaking task", question: (q as any).task || q.question, answer: "Open — teacher judges" });
      }
    });
    Object.keys(map).forEach(t => {
      if (map[t].length === 0) map[t] = questions.map(q => ({ ...q, type: t }));
      map[t] = [...map[t]].sort(() => Math.random() - 0.5);
    });
    qByType.current = map;
  }
  const [typeIdx, setTypeIdx] = useState<Record<string, number>>(() => Object.fromEntries(ZONES.map(z => [z.id, 0])));
  const bumpType = (type: string) => setTypeIdx(prev => ({ ...prev, [type]: (prev[type] ?? 0) + 1 }));

  const leadPos = Math.max(1, ...teams.map(t => raceTeams[t.id]?.pos ?? 0));
  const currentZone = getZone(leadPos);
  const pool = qByType.current?.[currentZone.id] ?? [];
  const currentQ = pool.length ? pool[(typeIdx[currentZone.id] ?? 0) % pool.length] : null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600);
  };

  const bumpFx = (idx: number, color: string, icon: string) => {
    const key = fxIdRef.current++;
    setFxRing({ idx, color, icon, key });
    setTimeout(() => setFxRing(prev => (prev?.key === key ? null : prev)), 900);
  };

  const teamName = (id: string | number) => teams.find(t => t.id === id)?.name ?? "Team";

  const rollOnce = (onDone: (val: number) => void) => {
    setPhase("rolling");
    setRolling(true);
    let ticks = 0;
    const totalTicks = 12;
    const tick = () => {
      setDiceFace(DICE_FACES[Math.floor(Math.random() * 6)]);
      ticks++;
      if (ticks < totalTicks) { setTimeout(tick, 55 + ticks * 15); }
      else {
        const val = Math.floor(Math.random() * 6) + 1;
        setDiceFace(DICE_FACES[val - 1]);
        setRolling(false);
        onDone(val);
      }
    };
    setTimeout(tick, 80);
  };

  const landTeam = (teamId: string | number, total: number) => {
    const cur = raceTeamsRef.current[teamId];
    const target = Math.min(cur.pos + total, TOTAL);
    // A banana trap stops forward movement as soon as it's crossed — not just when a roll lands
    // exactly on it — otherwise the odds of landing on that one exact tile make it nearly useless.
    let landed = target;
    for (let i = cur.pos + 1; i <= target; i++) {
      if (trackRef.current[i]?.banana) { landed = i; break; }
    }
    setRaceTeams(prev => ({ ...prev, [teamId]: { ...prev[teamId], pos: landed } }));
    setTimeout(() => {
      bumpFx(landed, "#F7C948", "");
      if (landed >= TOTAL) { setTimeout(() => triggerWin(teamId), 500); return; }
      setTimeout(() => resolveLanding(teamId, landed), 500);
    }, 650);
  };

  const resolveLanding = (teamId: string | number, landedIdx: number) => {
    const team = raceTeamsRef.current[teamId];
    const space = trackRef.current[landedIdx];
    const name = teamName(teamId);

    const finish = (finalIdx: number, msg: string, color: string, icon: string, patch: Partial<RaceTeamState>) => {
      setRaceTeams(prev => ({ ...prev, [teamId]: { ...prev[teamId], ...patch, pos: finalIdx } }));
      const moved = finalIdx !== landedIdx;
      if (moved) setTimeout(() => bumpFx(finalIdx, color, icon), 350);
      setTimeout(() => {
        if (finalIdx >= TOTAL) { triggerWin(teamId); return; }
        setLastEffect({ msg, color, icon });
        setPhase("effect");
      }, moved ? 700 : 250);
    };

    if (space.banana) {
      setTrack(prev => prev.map((s, i) => (i === landedIdx ? { ...s, banana: false } : s)));
      if (team.shields > 0) {
        finish(landedIdx, `🛡️ ${name}'s shield blocked the banana trap!`, "#3B82F6", "🛡️", { shields: team.shields - 1 });
      } else {
        finish(Math.max(0, landedIdx - 3), `🍌 Banana trap! ${name} slides back 3 spaces!`, "#FFE066", "🍌", {});
      }
      return;
    }

    switch (space.type) {
      case "normal":
        finish(landedIdx, `✅ Normal space — no effect. Keep racing!`, "#4ADE80", "✅", {});
        return;
      case "boost":
        finish(Math.min(landedIdx + 3, TOTAL), `⚡ Boost! ${name} zooms forward 3 extra spaces!`, "#F7C948", "⚡", {});
        return;
      case "mud":
        if (team.shields > 0) finish(landedIdx, `🛡️ Shield blocks the mud! ${name} stays clean.`, "#3B82F6", "🛡️", { shields: team.shields - 1 });
        else finish(landedIdx, `🟫 Mud! ${name} is stuck — skip their next turn!`, "#92400E", "🟫", { skip: true });
        return;
      case "shortcut":
        finish(Math.min(landedIdx + 5, TOTAL), `🚀 Shortcut! ${name} races ahead 5 spaces!`, "#7C3AED", "🚀", {});
        return;
      case "trap":
        if (team.shields > 0) finish(landedIdx, `🛡️ Shield blocks the trap! ${name} is safe.`, "#3B82F6", "🛡️", { shields: team.shields - 1 });
        else finish(Math.max(0, landedIdx - 3), `💥 Trap! ${name} is sent back 3 spaces!`, "#EF4444", "💥", {});
        return;
      case "teleport": {
        if (team.shields > 0) { finish(landedIdx, `🛡️ Shield blocks the teleport! ${name} stays put.`, "#3B82F6", "🛡️", { shields: team.shields - 1 }); return; }
        const tp = Math.floor(Math.random() * (TOTAL - 1)) + 1;
        finish(tp, `🌀 Teleport! ${name} warps to space ${tp}!`, "#06B6D4", "🌀", {});
        return;
      }
      case "coin":
        finish(landedIdx, `🪙 Coin! ${name} collects 10 bonus coins!`, "#FBBF24", "🪙", { coins: team.coins + 10 });
        return;
      case "shield":
        finish(landedIdx, `🛡️ ${name} picks up a Shield! Negatives bounce off next time.`, "#3B82F6", "🛡️", { shields: team.shields + 1 });
        return;
      case "lucky": {
        const luck = luckyOutcome(team, landedIdx, name);
        finish(luck.finalIdx, luck.msg, "#EC4899", "🍀", luck.patch);
        return;
      }
      case "question": {
        const pu = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
        if (pu.id === "shield") { finish(landedIdx, `❓ Bonus question! ${name} answered and earned: 🛡️ Shield!`, "#F97316", "❓", { shields: team.shields + 1 }); return; }
        finish(landedIdx, `❓ Bonus question! ${name} answered and earned: ${pu.icon} ${pu.label}!`, "#F97316", "❓", { powerups: [...team.powerups, pu.id] });
        return;
      }
      default:
        finish(landedIdx, `Space ${landedIdx} — no effect.`, "#4ADE80", "✅", {});
    }
  };

  const rollForMovement = (teamId: string | number, useDouble: boolean) => {
    const name = teamName(teamId);
    if (useDouble) {
      setRaceTeams(prev => { const powerups = [...prev[teamId].powerups]; powerups.splice(powerups.indexOf("double"), 1); return { ...prev, [teamId]: { ...prev[teamId], powerups } }; });
      showToast(`🎲🎲 ${name} uses Double Roll!`);
    }
    rollOnce(v1 => {
      if (!useDouble) { finishRoll(teamId, v1); return; }
      setTimeout(() => rollOnce(v2 => finishRoll(teamId, v1 + v2)), 450);
    });
  };

  const finishRoll = (teamId: string | number, total: number) => {
    const team = raceTeamsRef.current[teamId];
    const name = teamName(teamId);
    let bonus = 0;
    const powerups = [...team.powerups];
    if (powerups.includes("rocket")) { powerups.splice(powerups.indexOf("rocket"), 1); bonus += 6; showToast(`🚀 Rocket! ${name} blasts forward 6 extra spaces!`); }
    setRaceTeams(prev => ({ ...prev, [teamId]: { ...prev[teamId], powerups } }));
    landTeam(teamId, total + bonus);
  };

  const rollDice = (teamId: string | number) => {
    const team = raceTeamsRef.current[teamId];
    const name = teamName(teamId);
    setWinnerId(teamId);

    if (team.skip) {
      const dblIdx = team.powerups.indexOf("double");
      if (dblIdx !== -1) {
        const powerups = [...team.powerups]; powerups.splice(dblIdx, 1);
        setRaceTeams(prev => ({ ...prev, [teamId]: { ...prev[teamId], skip: false, powerups } }));
        showToast(`🎲 ${name}'s Double Roll powers them out of the mud!`);
        setTimeout(() => rollForMovement(teamId, false), 500);
        return;
      }
      setRaceTeams(prev => ({ ...prev, [teamId]: { ...prev[teamId], skip: false } }));
      rollOnce(() => {
        setLastEffect({ msg: `💤 ${name} is stuck in the mud and loses their turn!`, color: "#92400E", icon: "💤" });
        setPhase("effect");
      });
      return;
    }
    rollForMovement(teamId, team.powerups.includes("double"));
  };

  const chooseWinner = (teamId: string | number) => {
    setWinnerId(teamId);
    setPhase("rolling");
    setShowAns(false);
    bumpType(currentZone.id);
    setTimeout(() => rollDice(teamId), 350);
  };

  const skipTask = () => { bumpType(currentZone.id); setShowAns(false); };
  const newTask = () => { bumpType(currentZone.id); setShowAns(false); };

  const activatePowerup = (teamId: string | number, idx: number) => {
    const team = raceTeams[teamId];
    const pid = team.powerups[idx];
    if (!pid) return;
    const name = teamName(teamId);
    const pu = POWERUPS.find(p => p.id === pid)!;
    if (pid === "swap") {
      const others = teams.filter(t => t.id !== teamId);
      if (!others.length) return;
      const tgt = others[Math.floor(Math.random() * others.length)];
      setRaceTeams(prev => {
        const a = prev[teamId], b = prev[tgt.id];
        const powerups = [...a.powerups]; powerups.splice(idx, 1);
        return { ...prev, [teamId]: { ...a, pos: b.pos, powerups }, [tgt.id]: { ...b, pos: a.pos } };
      });
      showToast(`🔄 ${name} swaps places with ${tgt.name}!`);
    } else if (pid === "banana") {
      const spaceIdx = Math.max(1, Math.min(TOTAL - 1, team.pos));
      setTrack(prev => prev.map((s, i) => (i === spaceIdx ? { ...s, banana: true } : s)));
      setRaceTeams(prev => { const powerups = [...prev[teamId].powerups]; powerups.splice(idx, 1); return { ...prev, [teamId]: { ...prev[teamId], powerups } }; });
      showToast(`🍌 ${name} drops a banana trap right where they're standing!`);
    } else {
      showToast(`${pu.icon} ${name}'s ${pu.label} is armed and ready.`);
    }
  };

  const buyPowerup = (teamId: string | number, pid: string) => {
    const team = raceTeams[teamId];
    const pu = POWERUPS.find(p => p.id === pid)!;
    if (team.coins < pu.cost) return;
    if (pid === "shield") {
      setRaceTeams(prev => ({ ...prev, [teamId]: { ...prev[teamId], coins: prev[teamId].coins - pu.cost, shields: prev[teamId].shields + 1 } }));
      showToast(`🛡️ ${teamName(teamId)} bought a Shield — active now!`);
      return;
    }
    setRaceTeams(prev => ({ ...prev, [teamId]: { ...prev[teamId], coins: prev[teamId].coins - pu.cost, powerups: [...prev[teamId].powerups, pid] } }));
    showToast(`${pu.icon} ${teamName(teamId)} bought ${pu.label}!`);
  };

  const triggerWin = (teamId: string | number) => {
    const finalPos: Record<string | number, number> = {};
    teams.forEach(t => { finalPos[t.id] = t.id === teamId ? TOTAL : (raceTeamsRef.current[t.id]?.pos ?? 0); });
    const distinctPosDesc = [...new Set(teams.map(t => finalPos[t.id]))].sort((a, b) => b - a);
    const ranking = [...teams].sort((a, b) => finalPos[b.id] - finalPos[a.id]);
    const rows: RankRow[] = ranking.map(t => {
      const rank = distinctPosDesc.indexOf(finalPos[t.id]);
      const pts = RANK_POINTS[rank] ?? 5;
      onUpdateScore(t.id, pts);
      return { id: t.id, name: t.name, pos: finalPos[t.id], points: pts };
    });
    setRaceTeams(prev => ({ ...prev, [teamId]: { ...prev[teamId], pos: TOTAL } }));
    setFinalRanking(rows);
    setPhase("gameover");
  };

  // Ranks every team by wherever they currently stand on the track — no one gets bumped to the
  // finish line, unlike triggerWin (which is only reached once someone genuinely crosses it).
  const forceFinish = () => {
    const finalPos: Record<string | number, number> = {};
    teams.forEach(t => { finalPos[t.id] = raceTeamsRef.current[t.id]?.pos ?? 0; });
    const distinctPosDesc = [...new Set(teams.map(t => finalPos[t.id]))].sort((a, b) => b - a);
    const ranking = [...teams].sort((a, b) => finalPos[b.id] - finalPos[a.id]);
    const rows: RankRow[] = ranking.map(t => {
      const rank = distinctPosDesc.indexOf(finalPos[t.id]);
      const pts = RANK_POINTS[rank] ?? 5;
      onUpdateScore(t.id, pts);
      return { id: t.id, name: t.name, pos: finalPos[t.id], points: pts };
    });
    setFinalRanking(rows);
    setPhase("gameover");
  };

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "gameover" ? null : () => { forceFinish(); return true; };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceFinalRef, phase]);

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): RaceSnapshot => ({ raceTeams, track });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, raceTeams, track]);

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(ellipse at 40% 40%,#0E2040 0%,#060E1C 100%)",
  };

  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center", position: "relative" }}>
      {STYLE_TAG}
      <SpeedLines />
      <div style={{ position: "relative", zIndex: 1 }}>
        <CheckeredStrip />
        <div style={{ background: "linear-gradient(160deg,#1E293B,#0B0F17)", border: "2px solid #EF4444", borderRadius: "18px", padding: "28px 24px", margin: "10px auto", color: "#E2E8F0", maxWidth: "560px", boxShadow: "0 0 44px rgba(239,68,68,0.35)" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🏁</div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#F87171", letterSpacing: "0.5px" }}>RACE TRACK</div>
          <div style={{ fontSize: "15px", lineHeight: 1.7 }}>
            Every team sees the same task at once — <strong style={{ color: "#93C5FD" }}>tap whichever team answers it first and correctly</strong>, and they roll the dice and race around the track!<br />
            The task type gets harder as the leading team advances: <strong style={{ color: "#93C5FD" }}>🔍 Error Fix → 🔤 Multiple Choice → ✏️ Fill Blank → 🗣️ Speaking</strong> — so everyone faces the same challenge as the frontrunner.<br />
            Land on special spaces for boosts, traps, coins and shields. Spend coins in the <strong style={{ color: "#93C5FD" }}>🛒 Shop</strong> on powerups. First to the finish line wins!
          </div>
        </div>
        <CheckeredStrip />
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap", margin: "18px 0 16px", maxWidth: "560px", marginLeft: "auto", marginRight: "auto" }}>
          {SPACE_DEFS.filter(s => s.id !== "normal").map(s => (
            <div key={s.id} style={{ background: s.color, color: "#150F00", borderRadius: "8px", padding: "5px 12px", fontSize: "12px", fontWeight: "800" }}>
              {s.icon} {s.id}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "14px" }}>
          <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#EF4444", animation: "rtLightPulse 1.4s ease-in-out infinite" }} />
          <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#FBBF24", animation: "rtLightPulse 1.4s ease-in-out infinite 0.25s" }} />
          <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#4ADE80", animation: "rtLightPulse 1.4s ease-in-out infinite 0.5s" }} />
        </div>
        <button onClick={() => setPhase("task")} className="rt-btn" style={{ background: "linear-gradient(135deg,#B91C1C,#EF4444)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(239,68,68,0.5)", transition: "transform 0.15s ease" }}>🚦 Start Race!</button>
      </div>
    </div>
  );

  if (phase === "gameover") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      {STYLE_TAG}
      <div style={{ fontSize: "48px", marginBottom: "6px" }}>🏆</div>
      <div style={{ fontWeight: "900", fontSize: "26px", color: "#F7C948", marginBottom: "4px", textShadow: "0 0 24px rgba(247,201,72,0.6)" }}>{finalRanking[0]?.name} wins the race!</div>
      <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", margin: "20px auto", maxWidth: "700px" }}>
        {finalRanking.map((r, i) => {
          const t = teams.find(tm => tm.id === r.id)!;
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏁";
          return (
            <div key={r.id} style={{ background: `linear-gradient(160deg, ${t.color.dark}55, #0A0A18)`, border: `2px solid ${t.color.bg}`, borderRadius: "14px", padding: "12px" }}>
              <div style={{ fontSize: "22px" }}>{medal}</div>
              <div style={{ fontWeight: "800", color: "#F3F4F6", fontSize: "14px", marginTop: "4px" }}>{t.mascot ?? t.color.emoji} {r.name}</div>
              <div style={{ color: "#9CA3AF", fontSize: "12px", marginTop: "2px" }}>Space {r.pos}/{TOTAL}</div>
              <div style={{ color: "#F7C948", fontWeight: "800", fontSize: "13px", marginTop: "4px" }}>+{r.points} pts</div>
            </div>
          );
        })}
      </div>
      <button onClick={onEnd} className="rt-btn" style={{ background: "#F7C948", color: "#150F00", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}>🏁 End Game</button>
    </div>
  );

  const winnerTeam = winnerId !== null ? teams.find(t => t.id === winnerId) : null;

  return (
    <div style={arenaStyle}>
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
          <div style={{ background: currentZone.color, color: "#0B0F17", borderRadius: "10px", padding: "6px 14px", fontWeight: "800", fontSize: "13px" }}>
            {currentZone.emoji} {currentZone.label}
          </div>
          <button onClick={() => setShopOpen(v => !v)} className="rt-btn" style={{ background: "#172438", color: "#F7C948", border: "1px solid #F7C948", borderRadius: "8px", padding: "6px 14px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}>🛒 Shop</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "8px", marginBottom: "12px" }}>
          {teams.map(t => {
            const rt = raceTeams[t.id];
            const pct = Math.round((rt.pos / TOTAL) * 100);
            const isActive = phase !== "task" && winnerId === t.id;
            return (
              <div key={t.id} style={{
                background: `linear-gradient(160deg, ${t.color.dark}44, #0A0A18)`, border: `2px solid ${t.color.bg}`, borderRadius: "12px", padding: "8px 10px",
                boxShadow: isActive ? `0 0 16px ${t.color.bg}88` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                  <span style={{ fontWeight: "800", fontSize: "12px", color: "#F3F4F6" }}>{rt.car} {t.name}</span>
                  <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: "700" }}>{pct}%</span>
                </div>
                <div style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: "700", marginTop: "2px" }}>Space {rt.pos}/{TOTAL} · 🪙{rt.coins}</div>
                <div style={{ display: "flex", gap: "3px", marginTop: "4px", flexWrap: "wrap" }}>
                  {rt.shields > 0 && <span style={{ fontSize: "10px", fontWeight: "800", padding: "1px 6px", borderRadius: "10px", background: "#1E3A5F", color: "#60A5FA" }}>🛡️×{rt.shields}</span>}
                  {rt.skip && <span style={{ fontSize: "10px", fontWeight: "800", padding: "1px 6px", borderRadius: "10px", background: "#4B2E0E", color: "#F87171" }}>💤 skip</span>}
                  {rt.powerups.map((pid, i) => {
                    const pu = POWERUPS.find(p => p.id === pid);
                    if (!pu) return null;
                    return (
                      <span key={i} onClick={() => activatePowerup(t.id, i)} className="rt-chip" style={{ fontSize: "10px", fontWeight: "800", padding: "1px 6px", borderRadius: "10px", background: "#3B2A5C", color: "#C084FC", cursor: "pointer" }} title={pu.desc}>
                        {pu.icon}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: "relative", background: "#060F1C", borderRadius: "14px", overflow: "hidden", marginBottom: "12px" }}>
          <svg viewBox="0 0 800 480" style={{ width: "100%", height: "auto", display: "block" }}>
            <defs>
              <radialGradient id="rtbg" cx="50%" cy="50%" r="65%">
                <stop offset="0%" stopColor="#0E1F38" />
                <stop offset="100%" stopColor="#050C17" />
              </radialGradient>
            </defs>
            <rect x={0} y={0} width={800} height={480} fill="url(#rtbg)" />
            <path d={TRACK_PATH_D} fill="none" stroke="#0F1F35" strokeWidth={32} strokeLinejoin="round" />
            {ZONES.map((zone, zi) => {
              const zoneStart = zi === 0 ? 0 : ZONES[zi - 1].end;
              const pts = TPOS.slice(zoneStart, zone.end + 1);
              if (pts.length < 2) return null;
              const segD = pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
              return <path key={zone.id} d={segD} fill="none" stroke={zone.color} strokeWidth={20} strokeLinejoin="round" strokeLinecap="round" opacity={0.22} />;
            })}
            <path d={TRACK_PATH_D} fill="none" stroke="#F7C94840" strokeWidth={1.5} strokeDasharray="8 12" strokeLinejoin="round" />
            {[15, 30, 45].map((boundary, bi) => {
              const nextZone = ZONES[bi + 1];
              const pos = TPOS[boundary];
              const rawLx = pos.x + (pos.x < 400 ? -46 : 46);
              const rawLy = pos.y + (pos.y < 240 ? -20 : 20);
              // Clamp so the 64x20 label rect always stays inside the 800x480 viewBox —
              // the raw offset alone can push labels near the right/bottom edges (like the
              // Fill Blank boundary) past the canvas, clipping them off.
              const lx = Math.min(Math.max(rawLx, 34), 766);
              const ly = Math.min(Math.max(rawLy, 12), 468);
              return (
                <g key={boundary}>
                  <circle cx={pos.x} cy={pos.y} r={14} fill="#0D1E36" stroke={nextZone.color} strokeWidth={2.5} />
                  <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill={nextZone.color} fontWeight="bold">▶</text>
                  <rect x={lx - 32} y={ly - 10} width={64} height={20} rx={6} fill="#0D1E36" stroke={nextZone.color} strokeWidth={1.5} opacity={0.9} />
                  <text x={lx} y={ly + 1} textAnchor="middle" dominantBaseline="middle" fontSize={7.5} fontWeight="bold" fill={nextZone.color}>{nextZone.emoji} {nextZone.short}</text>
                </g>
              );
            })}
            {TPOS.map((pos, i) => {
              const sp = track[i];
              const isSE = i === 0 || i === TOTAL;
              const r = isSE ? 13 : 9;
              const col = sp.banana ? "#FFE066" : sp.color;
              const icon = sp.banana ? "🍌" : (sp.icon || "");
              return (
                <g key={i}>
                  <circle cx={pos.x} cy={pos.y} r={r} fill={col} stroke="#fff" strokeWidth={isSE ? 2 : 1.2} opacity={0.92} />
                  {icon && !isSE && <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fontSize={7.5}>{icon}</text>}
                  {i === 0 && <text x={pos.x} y={pos.y - 18} textAnchor="middle" fill="#4ADE80" fontSize={8} fontWeight="bold">🚦 START</text>}
                  {i === TOTAL && <text x={pos.x} y={pos.y - 18} textAnchor="middle" fill="#F7C948" fontSize={8} fontWeight="bold">🏁 FINISH</text>}
                </g>
              );
            })}
            {teams.map((t, ti) => {
              const rt = raceTeams[t.id];
              const pos = TPOS[rt.pos];
              const same = teams.filter((_, j) => j < ti && raceTeams[teams[j].id].pos === rt.pos).length;
              const ox = (same % 2) * 16 - 8;
              const oy = Math.floor(same / 2) * -14;
              return (
                <g key={t.id} style={{ transition: "transform 0.65s cubic-bezier(0.34,1.2,0.4,1)" }} transform={`translate(${pos.x + ox},${pos.y + oy - 16})`}>
                  <circle r={12} fill={t.color.bg} opacity={0.25} />
                  <circle r={10} fill={t.color.bg} stroke="#fff" strokeWidth={1.5} />
                  <text y={3.5} textAnchor="middle" fontSize={10} dominantBaseline="middle">{rt.car}</text>
                </g>
              );
            })}
            {fxRing && (
              <g key={fxRing.key}>
                <circle cx={TPOS[fxRing.idx].x} cy={TPOS[fxRing.idx].y} r={4} fill="none" stroke={fxRing.color} style={{ animation: "fxRingExpand 0.9s ease-out forwards" }} />
                {fxRing.icon && <text x={TPOS[fxRing.idx].x} y={TPOS[fxRing.idx].y - 14} fill={fxRing.color} textAnchor="middle" fontSize={18} style={{ animation: "fxBurstIcon 1.2s ease-out forwards" }}>{fxRing.icon}</text>}
              </g>
            )}
          </svg>

          {shopOpen && (
            <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "260px", maxWidth: "88%", background: "rgba(8,16,30,0.97)", borderLeft: "1px solid #1E3352", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "12px 14px", borderBottom: "1px solid #1E3352" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: "900", color: "#F7C948", fontSize: "15px" }}>🛒 Powerup Shop</div>
                  <button onClick={() => setShopOpen(false)} style={{ background: "none", border: "none", color: "#5A7399", fontSize: "16px", cursor: "pointer" }}>✕</button>
                </div>
                <select value={shopTeamId} onChange={e => setShopTeamId(teams.find(t => String(t.id) === e.target.value)?.id ?? shopTeamId)} style={{ width: "100%", marginTop: "8px", background: "#172438", border: "1px solid #1E3352", borderRadius: "8px", color: "#DDE8FF", padding: "6px 8px", fontWeight: "700", fontSize: "13px" }}>
                  {teams.map(t => <option key={t.id} value={String(t.id)}>{raceTeams[t.id].car} {t.name}</option>)}
                </select>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#FBBF24", marginTop: "6px" }}>🪙 {raceTeams[shopTeamId]?.coins ?? 0} coins</div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {POWERUPS.map(pu => {
                  const canAfford = (raceTeams[shopTeamId]?.coins ?? 0) >= pu.cost;
                  return (
                    <div key={pu.id} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#172438", border: "1px solid #1E3352", borderRadius: "10px", padding: "8px" }}>
                      <div style={{ fontSize: "20px" }}>{pu.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: "800", fontSize: "12px", color: "#DDE8FF" }}>{pu.label}</div>
                        <div style={{ fontSize: "10px", color: "#5A7399", fontWeight: "600" }}>{pu.desc}</div>
                        <div style={{ fontSize: "10px", fontWeight: "800", color: "#FBBF24" }}>🪙 {pu.cost}</div>
                      </div>
                      <button disabled={!canAfford} onClick={() => buyPowerup(shopTeamId, pu.id)} className="rt-btn" style={{ background: canAfford ? "#F7C948" : "#1E3352", color: canAfford ? "#150F00" : "#5A7399", border: "none", borderRadius: "8px", padding: "6px 10px", fontWeight: "800", fontSize: "11px", cursor: canAfford ? "pointer" : "not-allowed" }}>Buy</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {toastMsg && (
          <div style={{ position: "absolute", bottom: "14px", left: "50%", transform: "translateX(-50%)", background: "#172438", border: "2px solid #F7C948", borderRadius: "10px", padding: "8px 18px", color: "#F7C948", fontWeight: "800", fontSize: "13px", zIndex: 10, animation: "rtToast 2.6s ease-in-out forwards", whiteSpace: "nowrap" }}>
            {toastMsg}
          </div>
        )}

        {phase === "task" && (
          <>
            <QuestionCard question={currentQ} showAnswer={showAns} onReveal={() => setShowAns(true)} />
            {(showAns || currentQ?.type === "speaking task") && (
              <div style={{ marginTop: "14px" }}>
                <p style={{ textAlign: "center", fontWeight: "700", color: "#DDE8FF", marginBottom: "10px", fontSize: "14px" }}>Which team got it right?</p>
                <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "8px", marginBottom: "10px" }}>
                  {teams.map(t => (
                    <button key={t.id} onClick={() => chooseWinner(t.id)} className="rt-btn" style={{ background: t.color.bg, color: "white", border: "none", borderRadius: "10px", padding: "10px 8px", fontWeight: "800", fontSize: "14px", cursor: "pointer", transition: "transform 0.15s ease" }}>✅ {t.name}</button>
                  ))}
                </div>
                <div style={{ textAlign: "center" }}>
                  <button onClick={skipTask} className="rt-btn" style={{ background: "#374151", color: "#DDE8FF", border: "none", borderRadius: "10px", padding: "8px 20px", fontWeight: "700", fontSize: "13px", cursor: "pointer", transition: "transform 0.15s ease" }}>⏭️ No one got it</button>
                </div>
              </div>
            )}
            {!showAns && currentQ?.type !== "speaking task" && (
              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <button onClick={newTask} className="rt-btn" style={{ background: "#172438", color: "#DDE8FF", border: "1px solid #1E3352", borderRadius: "10px", padding: "8px 18px", fontWeight: "700", fontSize: "13px", cursor: "pointer", transition: "transform 0.15s ease" }}>🔀 New Task</button>
              </div>
            )}
          </>
        )}

        {phase === "rolling" && winnerTeam && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontFamily: "inherit", fontWeight: "900", fontSize: "18px", color: winnerTeam.color.bg, marginBottom: "8px" }}>Rolling for {winnerTeam.name}…</div>
            <div style={{ width: "70px", height: "70px", background: "white", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto", boxShadow: "0 4px 18px rgba(0,0,0,0.5)", animation: rolling ? "dSpin 0.5s ease infinite" : "none" }}>
              {diceFace}
            </div>
          </div>
        )}

        {phase === "effect" && lastEffect && (
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#172438", border: `1.5px solid ${lastEffect.color}`, borderRadius: "14px", padding: "16px", marginBottom: "14px" }}>
              <div style={{ fontSize: "40px", flexShrink: 0 }}>{lastEffect.icon}</div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#DDE8FF", textAlign: "left" }}>{lastEffect.msg}</div>
            </div>
            <button onClick={() => setPhase("task")} className="rt-btn" style={{ background: "#F7C948", color: "#150F00", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}>Next Task →</button>
          </div>
        )}
      </div>
    </div>
  );
}
