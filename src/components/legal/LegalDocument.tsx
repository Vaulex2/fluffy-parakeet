import { Suspense, type ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import NavbarSkeleton from "@/components/layout/NavbarSkeleton";
import Footer from "@/components/layout/Footer";

/** Shared shell for static legal pages (Terms, Privacy). English-only, matching the site. */
export function LegalDocument({
  eyebrow = "Legal",
  title,
  lastUpdated,
  children,
}: {
  eyebrow?: string;
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar />
      </Suspense>
      <main className="pt-[72px] bg-background bg-seigaiha relative overflow-hidden min-h-screen">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <p className="font-accent text-primary text-2xl mb-2">{eyebrow}</p>
          <h1 className="font-headline text-4xl md:text-6xl text-text-primary tracking-tight leading-[0.95] mb-4">
            {title}
          </h1>
          <p className="font-body text-text-muted text-sm mb-14">Last updated: {lastUpdated}</p>
          <div className="space-y-12">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/** A numbered/titled section within a legal document. */
export function LegalSection({
  id,
  heading,
  children,
}: {
  id?: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-headline text-2xl md:text-3xl text-text-primary tracking-tight mb-4">
        {heading}
      </h2>
      <div className="space-y-4 font-body text-text-muted leading-relaxed">{children}</div>
    </section>
  );
}

/** Bulleted list styled for legal body copy. */
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-6 marker:text-primary">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
