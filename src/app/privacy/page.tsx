import Link from "next/link";
import { LegalDocument, LegalSection, LegalList } from "@/components/legal/LegalDocument";
import CookiePreferencesLink from "@/components/cookies/CookiePreferencesLink";

// ─────────────────────────────────────────────────────────────────────────────
// NOTE FOR THE OWNER: the bracketed values below are placeholders — replace them
// with your real legal/business details. This is a solid starting template that
// reflects what the app actually does, but have a lawyer review it before relying
// on it, especially if you serve customers in the EU/UK.
// ─────────────────────────────────────────────────────────────────────────────
const BUSINESS = {
  name: "Sushi GO",
  legalEntity: "[Registered business name / sole proprietor]",
  address: "[Street address], Namangan, Uzbekistan",
  email: "privacy@sushigo.uz", // ← replace with your real contact email
  phone: "+998 [your number]",
};

export const metadata = {
  title: "Privacy Policy | SushiGO",
  description:
    "How SushiGO collects, uses, and protects your personal data — accounts, reservations, orders, and cookies.",
};

const LAST_UPDATED = "3 June 2026";

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <LegalSection heading="1. Who we are">
        <p>
          {BUSINESS.name} ({BUSINESS.legalEntity}) operates this website and our restaurant
          in Namangan, Uzbekistan. This policy explains what personal data we collect when you
          use our site to browse the menu, place an order, book a table, or create an account —
          and how we use and protect it. We are the data controller for that information.
        </p>
        <p>
          If you have any questions, contact us at{" "}
          <a href={`mailto:${BUSINESS.email}`} className="text-primary underline-reveal">
            {BUSINESS.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="2. Information we collect">
        <p>We only collect what we need to provide our service:</p>
        <LegalList
          items={[
            <>
              <strong className="text-text-primary">Account data</strong> — your name, email
              address, phone number, preferred language, and (optionally) a profile photo. If you
              sign in with Google, we receive your basic Google profile (name, email, avatar). Your
              password is handled by our authentication provider and stored only as a secure hash —
              we never see it.
            </>,
            <>
              <strong className="text-text-primary">Reservation data</strong> — the name, phone
              number, and email you provide for a booking, plus the date, time, party size, table,
              and any special requests.
            </>,
            <>
              <strong className="text-text-primary">Order data</strong> — the name, phone number,
              and email for the order, your delivery address (for delivery orders), the items
              ordered, and any notes.
            </>,
            <>
              <strong className="text-text-primary">Loyalty data</strong> — loyalty points earned
              from completed orders.
            </>,
            <>
              <strong className="text-text-primary">Technical data</strong> — cookies and similar
              identifiers needed to keep you signed in and to protect the site against abuse (see
              section 6).
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection heading="3. How we use your information">
        <LegalList
          items={[
            "To create and manage your account and keep you signed in.",
            "To process and fulfil your orders and table reservations.",
            "To send you transactional emails — order and reservation confirmations and reminders.",
            "To operate our loyalty programme.",
            "To secure the service: rate-limiting sign-in, sign-up, reservation, and similar actions to prevent fraud and abuse.",
            "To comply with our legal obligations and resolve disputes.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="4. Legal bases for processing">
        <p>
          Where data-protection law requires a legal basis, we rely on: performance of a contract
          (to fulfil your orders and bookings), our legitimate interests (to secure and improve the
          service), your consent (for any non-essential cookies), and compliance with legal
          obligations.
        </p>
      </LegalSection>

      <LegalSection heading="5. Who we share it with">
        <p>
          We do not sell your personal data. We share it only with the service providers that help
          us run the platform, who process it on our behalf under contract:
        </p>
        <LegalList
          items={[
            <>
              <strong className="text-text-primary">Supabase</strong> — database, authentication,
              and file storage.
            </>,
            <>
              <strong className="text-text-primary">Resend</strong> — sending transactional emails.
            </>,
            <>
              <strong className="text-text-primary">Upstash</strong> — rate-limiting to protect the
              site.
            </>,
            <>
              <strong className="text-text-primary">Vercel</strong> — website hosting.
            </>,
            <>
              <strong className="text-text-primary">Google</strong> — only if you choose to sign in
              with Google.
            </>,
          ]}
        />
        <p>
          Some of these providers are based outside Uzbekistan, so your data may be processed
          abroad. We also disclose data where required by law.
        </p>
      </LegalSection>

      <LegalSection heading="6. Cookies">
        <p>
          We use cookies and similar technologies. Today we set only{" "}
          <strong className="text-text-primary">strictly-necessary</strong> cookies; we do not
          currently run analytics or marketing cookies. You can review and change your choice at any
          time via{" "}
          <CookiePreferencesLink className="text-primary underline-reveal" />.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border text-text-primary">
                <th className="py-2 pr-4 font-semibold">Cookie</th>
                <th className="py-2 pr-4 font-semibold">Purpose</th>
                <th className="py-2 font-semibold">Retention</th>
              </tr>
            </thead>
            <tbody className="text-text-muted">
              <tr className="border-b border-surface-border/60">
                <td className="py-2 pr-4 align-top font-mono text-xs">sb-*</td>
                <td className="py-2 pr-4 align-top">
                  Authentication session — keeps you securely signed in.
                </td>
                <td className="py-2 align-top">Session / refresh</td>
              </tr>
              <tr className="border-b border-surface-border/60">
                <td className="py-2 pr-4 align-top font-mono text-xs">sgo-role</td>
                <td className="py-2 pr-4 align-top">Remembers your role for navigation only.</td>
                <td className="py-2 align-top">24 hours</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 align-top font-mono text-xs">sgo-cookie-consent</td>
                <td className="py-2 pr-4 align-top">Stores your cookie preferences.</td>
                <td className="py-2 align-top">12 months</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection heading="7. How long we keep it">
        <p>
          We keep your account data for as long as your account is active. Order and reservation
          records are retained as needed to provide the service and to meet legal, accounting, and
          tax requirements. When data is no longer needed, we delete or anonymise it.
        </p>
      </LegalSection>

      <LegalSection heading="8. How we protect it">
        <p>
          Access to your data is restricted by database row-level security, so customers can only
          see their own orders, reservations, and profile. Data is encrypted in transit (HTTPS),
          passwords are stored only as secure hashes, administrative actions are role-restricted and
          logged, and sensitive endpoints are rate-limited.
        </p>
      </LegalSection>

      <LegalSection heading="9. Your rights">
        <p>You can ask us to:</p>
        <LegalList
          items={[
            "Access the personal data we hold about you.",
            "Correct inaccurate or incomplete data (you can edit most of it in your profile).",
            "Delete your account and associated personal data.",
            "Withdraw consent for non-essential cookies at any time.",
          ]}
        />
        <p>
          To exercise any of these, email{" "}
          <a href={`mailto:${BUSINESS.email}`} className="text-primary underline-reveal">
            {BUSINESS.email}
          </a>
          . We will respond within a reasonable time.
        </p>
      </LegalSection>

      <LegalSection heading="10. Children">
        <p>
          Our service is not directed to children under 16, and we do not knowingly collect their
          personal data. If you believe a child has provided us data, contact us and we will delete
          it.
        </p>
      </LegalSection>

      <LegalSection heading="11. Changes to this policy">
        <p>
          We may update this policy from time to time. We will post the new version here and update
          the “Last updated” date above. Significant changes may be communicated by email or an
          on-site notice.
        </p>
      </LegalSection>

      <LegalSection heading="12. Contact us">
        <p>
          {BUSINESS.legalEntity}
          <br />
          {BUSINESS.address}
          <br />
          Email:{" "}
          <a href={`mailto:${BUSINESS.email}`} className="text-primary underline-reveal">
            {BUSINESS.email}
          </a>
          <br />
          Phone: {BUSINESS.phone}
        </p>
        <p>
          See also our{" "}
          <Link href="/terms" className="text-primary underline-reveal">
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
