"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Início" },
  { href: "/sobre", label: "Sobre" },
  { href: "/termos", label: "Termos" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/ajuda", label: "Ajuda" },
  { href: "/contato", label: "Contato" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-sky-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="S.A.S.P.I. — página inicial"
          className="group flex shrink-0 items-center"
        >
          <Image
            src="/logo.png"
            alt="S.A.S.P.I. — Sistema de Acompanhamento de Saúde para Pessoas Idosas"
            width={180}
            height={48}
            priority
            className="h-12 w-auto transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>

        <nav
          aria-label="Navegação principal"
          className="order-3 w-full overflow-x-auto md:order-2 md:w-auto md:flex-1"
        >
          <ul className="flex min-w-max items-center justify-center gap-1 sm:gap-2 md:justify-end">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href === "/ajuda" && pathname === "/faq");

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sky-50 hover:text-sky-700 ${
                      active
                        ? "font-semibold text-sky-700"
                        : "text-slate-600"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-sky-600" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Link
          href="/login"
          className="order-2 inline-flex items-center justify-center rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-normal text-white shadow-sm transition hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 md:order-3"
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}