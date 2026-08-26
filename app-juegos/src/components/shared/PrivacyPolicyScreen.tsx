import { useEffect } from "react";

// A real, stable, publicly-viewable page — required for the Google OAuth consent screen's
// "Privacy policy link" field (and generally, for a public app to have one). Rendered by App.tsx
// before the auth gate, based on window.location.pathname, same pattern already used there for
// PhoneJoinScreen's ?join= param — no client-side router exists in this app, and adding one just
// for two static legal pages isn't worth it. Content reflects this app's actual data practices as
// of when it was written; update it if what the app collects or who it's shared with changes.
export function PrivacyPolicyScreen() {
  useEffect(() => {
    document.title = "Privacy Policy - ClassCade";
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background: "linear-gradient(160deg,#0C1E3D 0%,#0369A1 45%,#0EA5E9 100%)", padding: "40px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "8px" }}>🕹️</div>
        <h1 style={{ color: "white", fontSize: "26px", fontWeight: "900", margin: 0 }}>Class<span style={{ color: "#FCD34D" }}>Cade</span> Privacy Policy</h1>
        <p style={{ color: "#BAE6FD", fontSize: "13px", marginTop: "8px" }}>Last updated August 2026</p>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 20px 60px", color: "#1F2937", fontSize: "15px", lineHeight: 1.7 }}>
        <p>
          ClassCade is a classroom game website built for English teachers. This page explains what
          information we collect, why, and how it's handled. If anything here is unclear, contact us
          at <a href="mailto:chrisdoucet18@gmail.com">chrisdoucet18@gmail.com</a>.
        </p>

        <h2 style={sectionHeading}>What we collect</h2>
        <p>When you create a ClassCade account (by email/password or by signing in with Google), we collect:</p>
        <ul style={list}>
          <li><strong>Account info</strong> — your email address, and, if you use Google Sign-In, the name and profile photo Google shares with us.</li>
          <li><strong>Profile info</strong> — your display name, chosen theme, and an avatar or school logo if you upload one.</li>
          <li><strong>Class and game data</strong> — class names, school name, class level, team names/colors/mascots, scores, saved in-progress games, and which topics you've selected.</li>
          <li><strong>Feedback</strong> — anything you submit through the in-app Feedback button or a game's flag button.</li>
          <li><strong>Billing status</strong> — if you subscribe to a paid plan, we store your subscription status and plan (active, plan type, renewal date). Your card details go directly to our payment processor, Stripe — we never see or store them.</li>
          <li><strong>Basic usage analytics</strong> — anonymized page-visit data (via Vercel Analytics) to understand how the app is used. This isn't tied to your personal profile.</li>
        </ul>

        <h2 style={sectionHeading}>What we don't collect</h2>
        <p>
          Students never create a ClassCade account or enter any personal information. When a class
          plays a game using the "Play on Phones" feature, a student's phone only ever sends which
          team they tapped to join — no name, email, or other personal data is ever collected from
          students.
        </p>

        <h2 style={sectionHeading}>Why we collect it</h2>
        <p>
          To run the core features of the app (your account, saved classes, and billing), to respond
          to feedback and improve the app, and to keep the site running reliably.
        </p>

        <h2 style={sectionHeading}>Who we share it with</h2>
        <p>We use a small number of service providers to run ClassCade, and only share what each one needs to do its job:</p>
        <ul style={list}>
          <li><strong>Supabase</strong> — hosts our database, authentication, and file storage.</li>
          <li><strong>Stripe</strong> — processes payments for paid subscriptions.</li>
          <li><strong>Google</strong> — provides the optional "Sign in with Google" login method.</li>
          <li><strong>Vercel</strong> — hosts the website and provides anonymized usage analytics.</li>
        </ul>
        <p>We never sell your data, and we never share it with anyone for advertising purposes.</p>

        <h2 style={sectionHeading}>How long we keep it, and deleting your data</h2>
        <p>
          We keep your account and class data for as long as your account is active. To delete your
          account and all associated data, email us at{" "}
          <a href="mailto:chrisdoucet18@gmail.com">chrisdoucet18@gmail.com</a> and we'll take care of it.
        </p>

        <h2 style={sectionHeading}>Children's privacy</h2>
        <p>
          ClassCade is built for teachers, not students — only a teacher creates and controls an
          account. As explained above, students interacting with a class game through the "Play on
          Phones" feature never create an account or submit personal information of any kind.
        </p>

        <h2 style={sectionHeading}>Cookies and local storage</h2>
        <p>
          We use your browser's local storage to keep you logged in and to remember preferences like
          your chosen theme. We don't use tracking cookies for advertising.
        </p>

        <h2 style={sectionHeading}>Changes to this policy</h2>
        <p>
          If we make meaningful changes to this policy, we'll update the date at the top of this page.
        </p>

        <h2 style={sectionHeading}>Contact</h2>
        <p>
          Questions about this policy or your data? Email <a href="mailto:chrisdoucet18@gmail.com">chrisdoucet18@gmail.com</a>.
        </p>

        <a href="/" style={{ display: "inline-block", marginTop: "20px", color: "#0369A1", fontWeight: "700", textDecoration: "none" }}>← Back to ClassCade</a>
      </div>
    </div>
  );
}

const sectionHeading: React.CSSProperties = { fontSize: "18px", fontWeight: "800", color: "#0C1E3D", marginTop: "28px", marginBottom: "8px" };
const list: React.CSSProperties = { paddingLeft: "22px", margin: "0 0 14px" };
