import { useEffect } from "react";
import { Icon } from "./Icon";
import { TEAM_COLORS } from "../../data/constants";
import { setMetaDescription } from "../../lib/pageMeta";

// A real, stable, publicly-viewable page — same pattern as PrivacyPolicyScreen/
// TermsOfServiceScreen (rendered by App.tsx before the auth gate, based on
// window.location.pathname). This one exists for a growth reason, not a legal one: "built by a
// teacher, for teachers" is the single strongest trust signal in this niche, and it needs a real
// page to land on rather than living only in a tagline. Deliberately more colorful/playful than
// Privacy/Terms — those are legal boilerplate, this is meant to feel like the app itself.
export function OurStoryScreen() {
  useEffect(() => {
    document.title = "Our Story - ClassCade";
    setMetaDescription("Why a teacher built ClassCade — the story behind the games, from classrooms in Korea to ESL classrooms everywhere.");
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background: "linear-gradient(160deg,#0C1E3D 0%,#0369A1 45%,#0EA5E9 100%)", padding: "48px 20px 44px", textAlign: "center" }}>
        <Icon name="joystick" size={48} color="#FCD34D" style={{ marginBottom: "10px", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.4))" }} />
        <h1 style={{ color: "white", fontSize: "clamp(26px,5vw,34px)", fontWeight: "900", margin: 0, letterSpacing: "-0.01em" }}>
          Class<span style={{ color: "#FCD34D" }}>Cade</span>
        </h1>
        <p style={{ color: "#BAE6FD", fontSize: "14.5px", marginTop: "10px", fontWeight: "700" }}>The story behind the games</p>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 20px 60px" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "36px 30px", boxShadow: "0 8px 30px rgba(12,30,61,0.08)", color: "#1F2937", fontSize: "16.5px", lineHeight: 1.75 }}>

          <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#0C1E3D", margin: "0 0 18px" }}>Hi, I'm Teacher Chris.</h2>

          <p>
            I picked up that name teaching English in Korea, where the classes I saw work best
            weren't the ones drilling grammar off a worksheet — they were the ones that turned into
            a game. Teams, points, a bit of competitive energy in the room, and suddenly a class
            that could've felt like homework felt like play instead.
          </p>

          <p>
            When I came back to teaching adults, I kept chasing that same feeling. Adults aren't
            kids, but the instinct held up: people learn better when they're laughing, not
            memorizing. I wanted my classes to feel less like "here are ten rules to remember" and
            more like "watch — you already know this, you just haven't noticed the pattern yet."
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "28px 0" }}>
            {TEAM_COLORS.slice(0, 6).map(c => (
              <span key={c.name} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c.bg, display: "inline-block" }} />
            ))}
          </div>

          <p>
            Over around seven years of teaching — kids of just about every age, and mostly adults
            for a long stretch now — I built and rebuilt the games that became ClassCade, class by
            class, correction by correction. The one rule I never let go of: it had to work the
            same way no matter the grammar point, the topic, or who was in the room. A present
            perfect lesson and a past simple lesson shouldn't need two different tools.
          </p>

          <div style={{ background: "linear-gradient(135deg,#FEF3C7,#FDE68A)", borderRadius: "16px", padding: "22px 24px", margin: "26px 0", display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <Icon name="party" size={24} color="#92400E" style={{ flexShrink: 0, marginTop: "2px" }} />
            <p style={{ margin: 0, color: "#78350F", fontWeight: "600" }}>
              I know it works because of the students, not because of me. The real test has always
              been simple: after a round, do they ask what the website is called? They do — over
              and over, class after class. That's genuinely how ClassCade got built — hours and
              hours of real use, watching what actually landed and throwing out what didn't.
            </p>
          </div>

          <p>
            ClassCade is that game, opened up for any English teacher to use — any level, any class
            size, any topic. I hope it makes your classroom a little louder and a little more fun,
            the same way it did mine.
          </p>

          <p style={{ fontWeight: "800", color: "#0C1E3D", marginTop: "24px" }}>— Teacher Chris</p>
        </div>

        <div style={{ textAlign: "center", marginTop: "28px" }}>
          <a href="/" style={{ display: "inline-block", color: "#0369A1", fontWeight: "700", textDecoration: "none", fontSize: "15px" }}>← Back to ClassCade</a>
        </div>
      </div>
    </div>
  );
}
