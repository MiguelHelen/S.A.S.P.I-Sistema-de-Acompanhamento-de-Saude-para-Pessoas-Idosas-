import Link from "next/link";
import { Heart, HeartHandshake } from "lucide-react";

const links = [
  { href: "/", label: "Início" },
  { href: "/sobre", label: "Sobre" },
  { href: "/termos", label: "Termos" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/ajuda", label: "Ajuda" },
  { href: "/contato", label: "Contato" },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#0c2741] text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-9 sm:px-6 md:grid-cols-[1.1fr_1.4fr_1fr] md:items-center lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="S.A.S.P.I. — página inicial">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
            <HeartHandshake size={30} strokeWidth={1.7} />
          </span>
          <span className="leading-tight">
            <span className="block text-xl font-bold text-sky-300">S.A.S.P.I.</span>
            <span className="block max-w-52 text-[10px] leading-4 text-slate-300">Sistema de Acompanhamento de Saúde para Pessoas Idosas</span>
          </span>
        </Link>

        <nav aria-label="Navegação do rodapé" className="flex flex-wrap gap-x-4 gap-y-2 md:justify-center">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-xs text-slate-300 transition hover:text-white hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="rounded-xl border border-sky-300/15 bg-white/4 px-4 py-3 text-xs leading-5 text-slate-300">
          <p className="font-semibold text-white">S.A.S.P.I.</p>
          <p>Projeto acadêmico</p>
          <p>Desenvolvimento de Sistemas</p>
          <p>2026</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-300 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 S.A.S.P.I. — Sistema de Acompanhamento de Saúde para Pessoas Idosas</p>
          <p className="flex items-center gap-2 italic">Cuidar hoje é garantir o amanhã. <Heart size={15} className="text-sky-300" /></p>
        </div>
      </div>
    </footer>
  );
}
