// A pair of the app's own team mascots (data/constants.ts MASCOT_OPTIONS) used as decoration on
// Learn pages, rather than inventing new art — makes these screens read as ClassCade's own rather
// than a generic grammar-site layout. "header" overlaps a card's top-right border (the card needs
// position:relative); "cta" sits centered above a call-to-action, cheering it on.
export function MascotDuo({ variant, mascots }: { variant: "header" | "cta"; mascots: [string, string] }) {
  if (variant === "header") {
    return (
      <div style={{ position: "absolute", top: "-16px", right: "24px", display: "flex", alignItems: "flex-end", pointerEvents: "none" }}>
        <span style={{ fontSize: "26px", transform: "rotate(-8deg)", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.18))" }}>{mascots[0]}</span>
        <span style={{ fontSize: "32px", marginLeft: "-8px", transform: "rotate(6deg)", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.18))" }}>{mascots[1]}</span>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", marginBottom: "2px" }}>
      <span style={{ fontSize: "30px", transform: "rotate(-8deg)", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.15))" }}>{mascots[0]}</span>
      <span style={{ fontSize: "36px", marginLeft: "-6px", transform: "rotate(6deg)", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.15))" }}>{mascots[1]}</span>
    </div>
  );
}
