import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({ meta: [{ title: "Privacy Policy — StudyDate" }] }),
});

function PrivacyPage() {
  const lastUpdated = "May 6, 2026";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)" }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-16 pb-24">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-mono tracking-widest uppercase px-4 py-1.5 rounded-full border mb-6"
            style={{ borderColor: "var(--hairline)", color: "var(--text-muted)" }}>
            Privacy
          </span>
          <h1 className="font-display font-extrabold text-4xl mb-3" style={{ color: "var(--text-primary)" }}>
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="p-5 rounded-2xl border mb-10" style={{ borderColor: "rgba(255,107,158,0.2)", background: "rgba(255,107,158,0.05)" }}>
          <p className="text-sm" style={{ color: "var(--text-primary)" }}>
            <strong>TL;DR:</strong> We collect only what we need to run StudyDate. We never sell your data. 
            We use Supabase (hosted in India/Singapore) for secure storage. You can delete your account and all data at any time.
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>1. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information:</p>
            
            <h3 className="font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>1.1 Information you provide</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account information:</strong> Name, email address, password (hashed)</li>
              <li><strong>Profile information:</strong> Age, gender, city, college, exam focus, career goals, bio, study preferences</li>
              <li><strong>Student verification:</strong> College email (.edu/.ac.in) for Campus badge verification</li>
              <li><strong>Profile photos:</strong> Images you upload for your profile</li>
              <li><strong>Messages:</strong> Chat messages sent to matched users</li>
              <li><strong>Payment information:</strong> Processed by Razorpay — we do NOT store your card details</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>1.2 Information collected automatically</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Usage data:</strong> Study hours, streak counts, room participation</li>
              <li><strong>Device information:</strong> Browser type, operating system, screen resolution</li>
              <li><strong>Log data:</strong> IP address, access times, pages viewed</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To create and manage your account</li>
              <li>To match you with compatible study partners based on your preferences</li>
              <li>To provide and improve the study room experience</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send important account notifications (verification, security alerts)</li>
              <li>To enforce our Terms of Service and handle reports</li>
              <li>To analyze usage patterns to improve the product (anonymized/aggregated)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>3. Data Sharing</h2>
            <p className="mb-3"><strong>We do NOT sell your personal data.</strong> We share information only in these limited cases:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Other users:</strong> Your profile information is visible to other StudyDate users as part of the matching experience</li>
              <li><strong>Service providers:</strong> Supabase (database), Razorpay (payments), Jitsi (video calls) — these partners process data on our behalf under strict agreements</li>
              <li><strong>Legal requirements:</strong> When required by law, court order, or government regulation</li>
              <li><strong>Safety:</strong> To protect the rights, safety, or property of StudyDate, our users, or the public</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>4. Data Storage & Security</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Data is stored on Supabase (PostgreSQL) with servers in the Asia-Pacific region</li>
              <li>All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
              <li>Passwords are hashed using bcrypt — we never store plaintext passwords</li>
              <li>Payment data is handled entirely by Razorpay (PCI DSS compliant) — we never see or store your card numbers</li>
              <li>Row-Level Security (RLS) ensures users can only access their own data</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>5. Your Rights (DPDPA 2023)</h2>
            <p className="mb-3">Under the Digital Personal Data Protection Act, 2023 (India), you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Access:</strong> Request a copy of all personal data we hold about you</li>
              <li><strong>Correction:</strong> Update or correct inaccurate personal data</li>
              <li><strong>Deletion:</strong> Request deletion of your account and all associated data</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Withdraw consent:</strong> Withdraw consent for data processing at any time</li>
              <li><strong>Grievance redressal:</strong> File a complaint with our Data Protection Officer</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{" "}
              <a href="mailto:privacy@studydate.in" className="font-medium" style={{ color: "var(--rose-accent)" }}>
                privacy@studydate.in
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>6. Cookies & Local Storage</h2>
            <p>
              We use browser localStorage to store your session token, preferences, and app state. 
              We do not use third-party tracking cookies. We may use privacy-friendly analytics 
              (such as Plausible or PostHog) to understand usage patterns — these do not track 
              individuals across websites.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>7. Data Retention</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Active accounts:</strong> Data is retained as long as your account is active</li>
              <li><strong>Deleted accounts:</strong> Personal data is permanently deleted within 30 days of account deletion</li>
              <li><strong>Messages:</strong> Deleted when either participant deletes their account</li>
              <li><strong>Payment records:</strong> Retained for 7 years as required by Indian tax regulations</li>
              <li><strong>Reports:</strong> Moderation records may be retained for safety even after account deletion</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>8. Children's Privacy</h2>
            <p>
              StudyDate is not intended for users under 18 years of age. We do not knowingly collect 
              personal information from children. If we learn that we have collected data from a user 
              under 18, we will delete that information immediately.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be communicated 
              via email or in-app notification. The updated policy will be posted on this page with a 
              new "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>10. Contact</h2>
            <p>
              For privacy-related inquiries or to exercise your data rights:<br />
              <strong>Data Protection Officer:</strong>{" "}
              <a href="mailto:privacy@studydate.in" className="font-medium" style={{ color: "var(--rose-accent)" }}>
                privacy@studydate.in
              </a><br />
              <strong>General support:</strong>{" "}
              <a href="mailto:support@studydate.in" className="font-medium" style={{ color: "var(--rose-accent)" }}>
                support@studydate.in
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
