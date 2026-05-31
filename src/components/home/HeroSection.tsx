import Image from "next/image";
import Link from "next/link";
import { heroStats } from "@/data/mockData";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background bg-seigaiha">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 w-full grid md:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left: copy + stats */}
        <div className="space-y-8 relative">
          <div className="absolute -top-12 -left-12 text-[12rem] font-headline text-surface pointer-events-none select-none z-0 leading-none">
            新鮮
          </div>
          <div className="relative z-10">
            <p className="font-accent text-primary text-3xl mb-4 -rotate-2">
              Taste the tradition
            </p>
            <h1 className="font-headline text-[clamp(4rem,8vw,8rem)] leading-[0.85] tracking-tighter text-text-primary uppercase flex flex-col">
              <span>FRESH</span>
              <span className="text-primary text-[clamp(4.5rem,9vw,9rem)] ml-[-0.05em] drop-shadow-2xl">
                SUSHI
              </span>
              <span>EVERY DAY</span>
            </h1>
          </div>

          <p className="font-body font-light text-text-muted text-lg md:text-xl max-w-[45ch] leading-relaxed">
            Experience the finest Japanese cuisine in Namangan. Hand-crafted
            rolls, fresh sashimi, and authentic ramen served in a modern
            atmosphere.
          </p>

          <div className="flex items-center gap-6 pt-4 flex-wrap">
            <Link
              href="/menu"
              className="bg-primary text-white font-headline text-xl px-8 py-4 rounded tracking-tight btn-hover-lift"
            >
              ORDER NOW
            </Link>
            <Link
              href="/menu"
              className="text-text-primary font-headline text-lg tracking-tight underline-reveal hover:text-primary transition-colors flex items-center gap-2"
            >
              View Menu{" "}
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-surface-border mt-4">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <p className="font-headline text-3xl text-primary leading-none mb-1">
                  {stat.value}
                </p>
                <p className="font-body text-sm text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: image card */}
        <div className="relative w-full aspect-square md:aspect-[4/5] rounded-xl border border-surface-border bg-surface p-4 flex items-center justify-center shadow-2xl shadow-primary/5">
          <div className="relative w-full h-full rounded-lg overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
            <Image
              src="https://lh3.googleusercontent.com/aida/ADBb0uhNCPMtGm_Zp0mEthfIUvUs4wf1MQPDi_xdxZ4LaurxKfS85pQxW4sDGhlk7YW0Sh2Fazvh2IxtYa6_EXD55C8s3KYtKZdemskTj6GzF1VqA9-JpEA_Mg1uyELwfqkzfrSnW44oiDDU-G8xW56wQrVAgmHUqBUMgHWFnulsDqEhe9DgYg-0vk_ttNbhljsdHIdZThCMzSdwMw4U0o2spg913bim_aUyhMXXliYwvlRj67TJEeOozLWEjVI"
              alt="Premium Sushi Platter"
              fill
              className="object-cover img-hover-zoom"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />

            {/* Floating card */}
            <div className="absolute bottom-8 -left-8 md:-left-12 bg-background/90 backdrop-blur-md border border-surface-border rounded-lg p-4 shadow-2xl shadow-primary/20 z-20 flex items-center gap-4 w-72 transition-transform duration-500 hover:-translate-y-2">
              <div className="relative w-16 h-16 rounded bg-surface overflow-hidden flex-shrink-0">
                <Image
                  src="https://lh3.googleusercontent.com/aida/ADBb0uijkyg1Z6KWD_N5aIBQGMc6RMorexpNshiJVdLqo6J92AVUa9NTxDTeYJej7fR5uQixi9qBajPd5-4OJVmT1EtW7mW6VQEr9SqsvzHk8QCJ3tvC2WEPpuGf8sLvulaPqw-9i_WtOlqN3gH3ZugEdGu1PC-h3DcsZU7ewCl12Ch-cxvJhImynzIGPxE9f7Md89IRoDQPlTYjKMXaoPEadKGQSGMPJfWnVMAqRb2Y0pvckJyuBX9TkqVkVuFL"
                  alt="Dragon Roll"
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div>
                <p className="font-accent text-primary text-sm mb-0.5">
                  Today&apos;s Special
                </p>
                <p className="font-headline text-lg tracking-tight leading-none mb-1 text-text-primary">
                  Dragon Roll
                </p>
                <p className="font-body text-xs text-text-muted line-clamp-1">
                  Eel, cucumber, avocado top
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
