import Link from "next/link";
import { LegalDocument, LegalSection, LegalList } from "@/components/legal/LegalDocument";

// ─────────────────────────────────────────────────────────────────────────────
// NOTE FOR THE OWNER: bracketed values are placeholders — replace with your real
// business details. This template reflects how the app currently works (cash
// payment, loyalty points, reservations). Have a lawyer review before relying on it.
// ─────────────────────────────────────────────────────────────────────────────
const BUSINESS = {
  name: "Sushi GO",
  legalEntity: "[Registered business name / sole proprietor]",
  address: "[Street address], Namangan, Uzbekistan",
  email: "hello@sushigo.uz", // ← replace with your real contact email
};

export const metadata = {
  title: "Terms of Service | SushiGO",
  description:
    "The terms that govern your use of the SushiGO website — accounts, orders, reservations, and loyalty points.",
};

const LAST_UPDATED = "3 June 2026";

export default function TermsOfServicePage() {
  return (
    <LegalDocument title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <LegalSection heading="1. Agreement to these terms">
        <p>
          These Terms of Service (“Terms”) govern your use of the {BUSINESS.name} website and the
          ordering, reservation, and account features available on it. By using the site, you agree
          to these Terms. If you do not agree, please do not use the site.
        </p>
      </LegalSection>

      <LegalSection heading="2. Who can use the service">
        <p>
          You must be able to form a binding contract to place an order or make a reservation. If
          you use the service on behalf of someone else, you confirm you are authorised to do so.
        </p>
      </LegalSection>

      <LegalSection heading="3. Your account">
        <LegalList
          items={[
            "You agree to provide accurate, current information and to keep it up to date.",
            "You are responsible for activity under your account and for keeping your login credentials confidential.",
            "Tell us promptly if you suspect unauthorised use of your account.",
            "We may suspend or close accounts that violate these Terms or that we reasonably believe are involved in fraud or abuse.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="4. Menu, prices and orders">
        <LegalList
          items={[
            "Menu items, availability, and prices may change at any time. Prices are shown in Uzbek som (UZS).",
            "When you place an order, you make an offer to purchase. Your order is confirmed once we accept it; we may decline or cancel an order — for example if an item is unavailable or details cannot be verified.",
            "Order totals are calculated by us from current menu prices at the time of ordering.",
            "Payment is currently taken in cash on delivery or on pickup, unless we tell you otherwise.",
            "If you need to change or cancel an order, contact us as soon as possible; once preparation has started we may be unable to make changes.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="5. Reservations">
        <LegalList
          items={[
            "A reservation is confirmed for the date, time, and party size shown in your confirmation.",
            "Please arrive on time. We may release a table after a reasonable grace period for late arrivals or no-shows.",
            "You can cancel or reschedule an eligible reservation using the link in your confirmation email, subject to timing limits.",
            "Repeated no-shows may affect your ability to book in future.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="6. Loyalty points">
        <LegalList
          items={[
            "Loyalty points are earned on completed orders and have no cash value.",
            "Points are not transferable and cannot be exchanged for cash.",
            "We may adjust, expire, or revoke points obtained through error, fraud, or abuse, and we may change the loyalty programme at any time.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="7. Acceptable use">
        <p>You agree not to:</p>
        <LegalList
          items={[
            "Use the service for any unlawful or fraudulent purpose.",
            "Submit false orders or reservations, or someone else’s details without permission.",
            "Attempt to disrupt, overload, scrape, or gain unauthorised access to the site or its systems.",
            "Interfere with security features or rate limits.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="8. Intellectual property">
        <p>
          The site’s content — including text, branding, logos, and images — belongs to{" "}
          {BUSINESS.name} or its licensors and is protected by law. You may not copy or reuse it
          without our permission, except as needed for normal personal use of the service.
        </p>
      </LegalSection>

      <LegalSection heading="9. Food information and allergies">
        <p>
          We aim to describe our dishes accurately, but if you have a food allergy or dietary
          requirement, please tell us before ordering or in your reservation’s special requests, and
          contact us to confirm. We cannot guarantee that any dish is free from a specific allergen.
        </p>
      </LegalSection>

      <LegalSection heading="10. Disclaimers">
        <p>
          The service is provided “as is” and “as available”. We do our best to keep it accurate and
          running, but we do not guarantee it will always be uninterrupted or error-free.
        </p>
      </LegalSection>

      <LegalSection heading="11. Limitation of liability">
        <p>
          To the extent permitted by law, {BUSINESS.name} is not liable for indirect or
          consequential losses arising from your use of the site. Nothing in these Terms limits
          liability that cannot be limited under applicable law.
        </p>
      </LegalSection>

      <LegalSection heading="12. Changes to these terms">
        <p>
          We may update these Terms from time to time. The current version is always posted here
          with the “Last updated” date. Your continued use of the site after changes means you
          accept the updated Terms.
        </p>
      </LegalSection>

      <LegalSection heading="13. Governing law">
        <p>
          These Terms are governed by the laws of the Republic of Uzbekistan, and any disputes are
          subject to the jurisdiction of its competent courts.
        </p>
      </LegalSection>

      <LegalSection heading="14. Contact">
        <p>
          {BUSINESS.legalEntity}
          <br />
          {BUSINESS.address}
          <br />
          Email:{" "}
          <a href={`mailto:${BUSINESS.email}`} className="text-primary underline-reveal">
            {BUSINESS.email}
          </a>
        </p>
        <p>
          See also our{" "}
          <Link href="/privacy" className="text-primary underline-reveal">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
