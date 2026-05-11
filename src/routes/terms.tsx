import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({ meta: [{ title: "Terms of Service — StudyDate" }] }),
});

function TermsPage() {
  const lastUpdated = "May 6, 2026";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)" }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-16 pb-24">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-mono tracking-widest uppercase px-4 py-1.5 rounded-full border mb-6"
            style={{ borderColor: "var(--hairline)", color: "var(--text-muted)" }}>
            Legal
          </span>
          <h1 className="font-display font-extrabold text-4xl mb-3" style={{ color: "var(--text-primary)" }}>
            Terms of Service
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>1. Acceptance of Terms</h2>
            <p>
              By accessing or using StudyDate ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Service. StudyDate is operated by StudyDate Technologies 
              ("we", "us", or "our").
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>2. Eligibility</h2>
            <p>You must be at least 18 years old to use StudyDate. By creating an account, you represent and warrant that:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You are at least 18 years of age</li>
              <li>You have the legal capacity to enter into a binding agreement</li>
              <li>You are not prohibited from using the Service under any applicable law</li>
              <li>You will comply with these Terms and all applicable local, state, national, and international laws</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>3. Account Registration</h2>
            <p>
              You may register using your email address or Google account. You are responsible for maintaining 
              the confidentiality of your account credentials and for all activities that occur under your account. 
              You agree to provide accurate, current, and complete information during registration.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>4. User Conduct</h2>
            <p>You agree NOT to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use the Service for any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>Harass, abuse, threaten, or intimidate other users</li>
              <li>Upload or share sexually explicit, violent, or offensive content</li>
              <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation</li>
              <li>Use automated means (bots, scrapers) to access the Service</li>
              <li>Share personal contact information in chats before meeting shared study goals</li>
              <li>Use the platform for commercial solicitation or spam</li>
              <li>Upload AI-generated, misleading, or fraudulent profile photos</li>
            </ul>
            <p className="mt-3">
              Violation of these rules may result in temporary or permanent suspension of your account.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>5. Subscriptions & Payments</h2>
            <p>
              StudyDate offers free and paid subscription tiers. Paid subscriptions ("Pro", "Campus", "Weekly Pass") 
              are processed through Razorpay. By purchasing a subscription:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You authorize us to charge your chosen payment method for the subscription fee</li>
              <li><strong>Monthly (Pro):</strong> ₹199/month, auto-renews unless cancelled</li>
              <li><strong>Annual (Campus):</strong> ₹1,188/year (₹99/month equivalent), for verified students</li>
              <li><strong>Weekly Pass:</strong> ₹59 one-time, does NOT auto-renew</li>
              <li>You may cancel your subscription at any time from your profile settings</li>
              <li>No refunds are provided for partial billing periods</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>6. Free Trial</h2>
            <p>
              New users receive a 7-day free trial with Pro features ("Reverse Trial"). After the trial period, 
              your account will automatically revert to the Free tier unless you subscribe to a paid plan. 
              No payment information is required for the trial.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>7. Intellectual Property</h2>
            <p>
              All content, features, and functionality of StudyDate (including but not limited to text, graphics, 
              logos, icons, and software) are owned by StudyDate Technologies and are protected by copyright, 
              trademark, and other intellectual property laws. You retain ownership of content you upload 
              (photos, bio text) but grant us a non-exclusive license to display it within the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>8. Reporting & Moderation</h2>
            <p>
              We take safety seriously. You can report any user or content that violates these Terms using the 
              in-app report button. Reports are reviewed within 24 hours. We reserve the right to suspend or 
              terminate accounts that violate our community guidelines without prior notice.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>9. Limitation of Liability</h2>
            <p>
              StudyDate is provided "as is" without warranties of any kind. We are not liable for any indirect, 
              incidental, special, consequential, or punitive damages arising from your use of the Service. 
              Our total liability shall not exceed the amount you paid us in the 12 months prior to any claim.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>10. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes by posting 
              the updated Terms on this page and updating the "Last updated" date. Your continued use of the 
              Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. 
              Any disputes arising under these Terms shall be subject to the exclusive jurisdiction 
              of the courts in Mumbai, Maharashtra, India.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-3" style={{ color: "var(--text-primary)" }}>12. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:<br />
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
