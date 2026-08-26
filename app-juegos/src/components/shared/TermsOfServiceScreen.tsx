import { useEffect } from "react";

// Companion to PrivacyPolicyScreen.tsx — same routing pattern, same reasoning. See that file's
// comment for why this is a plain component keyed off the URL path rather than a router.
export function TermsOfServiceScreen() {
  useEffect(() => {
    document.title = "Terms of Service - ClassCade";
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background: "linear-gradient(160deg,#0C1E3D 0%,#0369A1 45%,#0EA5E9 100%)", padding: "40px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "8px" }}>🕹️</div>
        <h1 style={{ color: "white", fontSize: "26px", fontWeight: "900", margin: 0 }}>Class<span style={{ color: "#FCD34D" }}>Cade</span> Terms of Service</h1>
        <p style={{ color: "#BAE6FD", fontSize: "13px", marginTop: "8px" }}>Last updated August 2026</p>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 20px 60px", color: "#1F2937", fontSize: "15px", lineHeight: 1.7 }}>
        <p>
          These terms cover your use of ClassCade, a classroom game website for English teachers. By
          creating an account, you agree to them. Questions? Email{" "}
          <a href="mailto:chrisdoucet18@gmail.com">chrisdoucet18@gmail.com</a>.
        </p>

        <h2 style={sectionHeading}>Using ClassCade</h2>
        <p>
          ClassCade is for teachers to run classroom activities. You're responsible for keeping your
          account credentials secure, and for what happens under your account. You agree to use
          ClassCade only for its intended purpose — running classroom games and lessons — and not to
          try to disrupt the service, access other teachers' accounts or data, or abuse the free tier
          (for example, scripting mass account creation or submitting excessive automated data).
        </p>

        <h2 style={sectionHeading}>Accounts</h2>
        <p>
          You need an account (email/password or Google Sign-In) to use ClassCade. You must provide
          accurate information and are responsible for all activity under your account. Students
          never need their own account — they join a class game through a phone link a teacher
          shares, without signing up for anything.
        </p>

        <h2 style={sectionHeading}>Plans and billing</h2>
        <p>
          ClassCade currently offers every account the full set of features at no cost, while the
          product is new. We may introduce paid plans in the future for expanded limits; if we do,
          any billing will be handled through Stripe, and we'll always be clear about what you're
          being charged before you're charged. You can cancel a paid subscription at any time from
          your account's Billing page.
        </p>

        <h2 style={sectionHeading}>Your content</h2>
        <p>
          Class names, team names, and anything else you create in the app remain yours. By using
          ClassCade, you give us permission to store and display that content back to you as part of
          running the service. The games, lessons, topics, and other built-in content in ClassCade
          belong to ClassCade and aren't licensed for you to reuse outside the app.
        </p>

        <h2 style={sectionHeading}>Availability</h2>
        <p>
          We do our best to keep ClassCade reliable, but we don't guarantee it will always be
          available or error-free — it's built and maintained by a small team. We may update,
          change, or occasionally interrupt the service, including for maintenance.
        </p>

        <h2 style={sectionHeading}>Ending your account</h2>
        <p>
          You can stop using ClassCade anytime and request deletion of your account by emailing{" "}
          <a href="mailto:chrisdoucet18@gmail.com">chrisdoucet18@gmail.com</a>. We may suspend or
          terminate accounts that violate these terms, such as abusing the service or attempting to
          access data that isn't yours.
        </p>

        <h2 style={sectionHeading}>Limitation of liability</h2>
        <p>
          ClassCade is provided "as is." To the extent permitted by law, we aren't liable for
          indirect or incidental damages arising from your use of the service.
        </p>

        <h2 style={sectionHeading}>Changes to these terms</h2>
        <p>
          If we make meaningful changes to these terms, we'll update the date at the top of this page.
        </p>

        <a href="/" style={{ display: "inline-block", marginTop: "20px", color: "#0369A1", fontWeight: "700", textDecoration: "none" }}>← Back to ClassCade</a>
      </div>
    </div>
  );
}

const sectionHeading: React.CSSProperties = { fontSize: "18px", fontWeight: "800", color: "#0C1E3D", marginTop: "28px", marginBottom: "8px" };
