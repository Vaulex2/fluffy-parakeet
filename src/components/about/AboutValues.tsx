import Reveal from "@/components/ui/Reveal";
import { aboutFeatures } from "@/data/mockData";

export default function AboutValues() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-surface-border">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
        {aboutFeatures.map((feature, i) => (
          <Reveal key={feature.title} delay={i * 0.08}>
            <div className="group h-full rounded-xl p-4 -m-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1">
              <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center mb-4 text-primary transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:bg-primary/20">
                <span className="material-symbols-outlined text-2xl">
                  {feature.icon}
                </span>
              </div>
              <h4 className="font-headline text-xl mb-2 text-text-primary tracking-tight">
                {feature.title}
              </h4>
              <p className="font-body text-sm text-text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
