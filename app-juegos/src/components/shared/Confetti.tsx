
interface ConfettiProps {
  active: boolean;
}

export function Confetti({ active }: ConfettiProps) {
  const colors = ["#EF4444", "#3B82F6", "#22C55E", "#EAB308", "#8B5CF6", "#EC4899", "#F59E0B"];
  
  if (!active) return null;
  
  return (
    <div style={{position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden", zIndex: 9999}}>
      {Array.from({length: 40}).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top: `-20px`,
          width: "10px", 
          height: "10px",
          background: colors[i % colors.length],
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          animation: `confettiFall ${1.5 + Math.random() * 2}s ${Math.random() * 1}s linear forwards`,
          transform: `rotate(${Math.random() * 360}deg)`
        }}/>
      ))}
      <style>{`@keyframes confettiFall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}`}</style>
    </div>
  );
}