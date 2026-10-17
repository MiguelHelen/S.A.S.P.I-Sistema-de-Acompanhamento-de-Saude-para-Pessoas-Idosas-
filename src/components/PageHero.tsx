import type { LucideIcon } from "lucide-react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  sideText?: string;
  meta?: string;
};

export default function PageHero({ eyebrow, title, description, icon: Icon, sideText, meta }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-sky-100 bg-linear-to-r from-sky-50 via-white to-emerald-50">
      <div aria-hidden="true" className="pointer-events-none absolute -left-16 top-8 h-44 w-44 rounded-full bg-sky-100/60 blur-2xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-emerald-100/70 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-[1.2fr_.8fr] lg:px-8">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">{eyebrow}</p>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-[#0c2b4a] sm:text-4xl lg:text-[2.65rem]">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
          {meta && <p className="mt-4 text-xs text-slate-500">{meta}</p>}
        </div>
        <div className="flex items-center justify-center gap-5 sm:justify-end">
          <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-[2.5rem] bg-linear-to-br from-sky-100 via-white to-emerald-100 shadow-sm ring-1 ring-white sm:h-44 sm:w-44">
            <div aria-hidden="true" className="absolute inset-3 rounded-4xl border border-white/80" />
            <Icon className="relative h-16 w-16 text-sky-600 sm:h-20 sm:w-20" strokeWidth={1.45} />
            <span aria-hidden="true" className="absolute -right-1 top-3 h-5 w-5 rounded-full bg-emerald-300 ring-4 ring-white" />
          </div>
          <div className="hidden max-w-40 border-l-2 border-sky-300 pl-4 text-lg font-medium leading-7 text-sky-700 lg:block">
            {sideText ?? "Mais cuidado. Hoje, mais independência. Amanhã."}
            <span className="mt-3 block h-0.5 w-10 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
