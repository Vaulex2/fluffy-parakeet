import Image from "next/image";
import { aboutFeatures } from "@/data/mockData";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="py-32 bg-light-bg text-light-text relative overflow-hidden"
    >
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-bl-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left: image */}
        <div className="relative">
          <div className="absolute -inset-4 bg-background/5 -rotate-3 rounded-2xl" />
          <div className="relative aspect-square md:aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
            <Image
              src="https://lh3.googleusercontent.com/aida/ADBb0ugFojU5pVfQvMIAVrvE_ZXBnFDTCvHKlR7WM5A-pGIIyv477_14_L22WRFZPbM6oFowWLmXBctTjZk4iWEany6qhrWWV1r__Sq7iNkhZqON1gKEzWysmB1KNjmBNtTaMX7H9J5sS68EF7kaIJ64J4Mk1UEJcxrCb8vFQ4JpZ0lYxkU3do1FvPXAZcwjDJ0mQ65LYc6bjCTBB6C3IiZZyHZhnw-z8DwO-08uJmoA1aTAvAKhGN_OJ-Jvq3Y"
              alt="Sushi Chef at Work"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {/* Badge */}
          <div className="absolute -bottom-8 -right-8 bg-background p-6 rounded-full border-4 border-light-bg shadow-2xl flex flex-col items-center justify-center w-32 h-32 rotate-12">
            <span className="font-accent text-primary text-xl leading-none mb-1">
              Since
            </span>
            <span className="font-headline text-white text-3xl leading-none tracking-tight">
              2019
            </span>
          </div>
        </div>

        {/* Right: content */}
        <div className="space-y-8 lg:pl-12">
          <h2 className="font-headline text-[clamp(3.5rem,6vw,5.5rem)] leading-[0.9] tracking-tighter uppercase text-light-text">
            BORN FROM A
            <br />
            <span className="text-primary">LOVE OF JAPAN</span>
          </h2>
          <p className="font-body text-lg text-light-text/80 leading-relaxed max-w-xl">
            At Sushi GO, we believe that authentic sushi is an art form. Our
            master chefs bring decades of experience from the finest kitchens,
            ensuring every slice, roll, and bowl tells a story of tradition and
            quality right here in Namangan.
          </p>

          <div className="grid grid-cols-2 gap-8 pt-8">
            {aboutFeatures.map((feature) => (
              <div key={feature.title}>
                <div className="w-12 h-12 rounded bg-background/5 flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined text-2xl">
                    {feature.icon}
                  </span>
                </div>
                <h4 className="font-headline text-xl mb-2 text-light-text">
                  {feature.title}
                </h4>
                <p className="font-body text-sm text-light-text/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
