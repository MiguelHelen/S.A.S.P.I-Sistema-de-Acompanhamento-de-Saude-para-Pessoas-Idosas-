"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  ArrowLeft,
  UserCheck,
  HeartHandshake,
  ShieldCheck,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

interface UsuarioOpcao {
  id: string;
  nome: string;
  perfil: string;
}

interface IdosoOpcao {
  id: string;
  nome: string;
  idade: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

export default function NovoVinculo() {
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  const [usuarios, setUsuarios] = useState<UsuarioOpcao[]>([]);
  const [idosos, setIdosos] = useState<IdosoOpcao[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    usuario_id: "",
    idoso_id: "",
  });

  useEffect(() => {
    async function carregarDados() {
      const token = localStorage.getItem("saspi_token");
      const userRaw = localStorage.getItem("saspi_user");
      let clinicaId = "e63b19f5-d8e4-4973-bac6-12aba9a0545d";

      if (userRaw) {
        try {
          const parsed = JSON.parse(userRaw);
          const userData = parsed.user || parsed.usuario || parsed;
          const perfil = (userData.perfil || userData.role || "").toUpperCase();

          if (perfil !== "ADMINISTRADOR" && perfil !== "ADMIN") {
            setAutorizado(false);
            setCarregando(false);
            return;
          }

          setAutorizado(true);
          clinicaId = userData.clinica_id || userData.clinicaId || clinicaId;
        } catch {
          setAutorizado(false);
          setCarregando(false);
          return;
        }
      } else {
        setAutorizado(false);
        setCarregando(false);
        return;
      }

      try {
        const resIdosos = await fetch(
          `${API_URL}/idoso?clinica_id=${clinicaId}`,
          {
            headers: { ...(token && { Authorization: `Bearer ${token}` }) },
          }
        );
        if (resIdosos.ok) {
          const data = await resIdosos.json();
          if (Array.isArray(data) && data.length > 0) {
            setIdosos(
              data.map((i: any) => ({
                id: i.id,
                nome: i.nome,
                idade: i.idade || 75,
              }))
            );
            setFormData((prev) => ({ ...prev, idoso_id: data[0].id }));
          }
        }
      } catch {}

      try {
        const resUsers = await fetch(
          `${API_URL}/usuario?clinica_id=${clinicaId}`,
          {
            headers: { ...(token && { Authorization: `Bearer ${token}` }) },
          }
        );
        if (resUsers.ok) {
          const data = await resUsers.json();
          if (Array.isArray(data)) {
            const usuariosElegiveis = data.filter((u: any) => {
              const p = String(u.perfil || "").toUpperCase();
              return p !== "ADMINISTRADOR" && p !== "ADMIN";
            });

            setUsuarios(usuariosElegiveis);
            if (usuariosElegiveis.length > 0) {
              setFormData((prev) => ({
                ...prev,
                usuario_id: usuariosElegiveis[0].id,
              }));
            }
          }
        }
      } catch {} finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso(false);

    const token = localStorage.getItem("saspi_token");

    const usuarioSelecionado = usuarios.find(
      (u) => u.id === formData.usuario_id
    );
    const perfilUsuario = (
      usuarioSelecionado?.perfil || "CUIDADOR"
    ).toUpperCase();

    let tipoVinculoAutomatico = "CUIDADOR";
    if (perfilUsuario === "MEDICO" || perfilUsuario === "MÉDICO") {
      tipoVinculoAutomatico = "MEDICO_RESPONSAVEL";
    } else if (perfilUsuario === "ENFERMEIRO") {
      tipoVinculoAutomatico = "ENFERMEIRO";
    } else if (perfilUsuario === "FAMILIAR") {
      tipoVinculoAutomatico = "FAMILIAR";
    }

    const payload = {
      usuario_id: formData.usuario_id,
      idoso_id: formData.idoso_id,
      tipo_vinculo: tipoVinculoAutomatico,
    };

    try {
      // 1. Verifica preventivamente na rota existente se o vínculo já foi registrado
      const resCheck = await fetch(
        `${API_URL}/usuario-idoso/usuario/${formData.usuario_id}`,
        {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        }
      ).catch(() => null);

      if (resCheck?.ok) {
        const vinculosAtuais = await resCheck.json();
        if (Array.isArray(vinculosAtuais)) {
          const jaVinculado = vinculosAtuais.some(
            (v: any) =>
              (v.idoso_id || v.idosoId || v.idoso?.id) === formData.idoso_id
          );
          if (jaVinculado) {
            throw new Error(
              "Erro: Este usuário já está vinculado a este paciente!"
            );
          }
        }
      }

      // 2. Dispara a criação do vínculo
      const res = await fetch(`${API_URL}/usuario-idoso`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const errData = await res.json().catch(() => null);

      if (!res.ok) {
        const msgStr = String(errData?.message || "").toLowerCase();
        if (
          res.status === 409 ||
          res.status === 500 ||
          msgStr.includes("unique") ||
          msgStr.includes("p2002") ||
          msgStr.includes("internal server error")
        ) {
          throw new Error(
            "Erro: Este usuário já está vinculado a este paciente!"
          );
        }

        let msgExtracao = errData?.message;
        if (Array.isArray(msgExtracao)) msgExtracao = msgExtracao.join(", ");
        throw new Error(
          msgExtracao || "Ocorreu um erro ao atribuir o vínculo."
        );
      }

      setSucesso(true);
      setTimeout(() => setSucesso(false), 4000);
    } catch (err: any) {
      setErro(err.message || "Erro de conexão ao salvar o vínculo.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando || autorizado === null) {
    return (
      <main className="min-h-screen bg-[#F2F7FB]">
        <DashboardNavbar />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center text-gray-500">
          <Loader2 size={24} className="mx-auto animate-spin text-[#1565C0]" />
          <p className="mt-2 text-sm font-medium">
            Validando permissões de acesso...
          </p>
        </div>
      </main>
    );
  }

  if (autorizado === false) {
    return (
      <main className="min-h-screen bg-[#F2F7FB]">
        <DashboardNavbar />
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <ShieldAlert size={32} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[#0A2540]">
            Acesso Restrito
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Apenas Administradores têm permissão para atribuir vínculos entre
            profissionais e idosos na instituição.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#0A2540]"
            >
              <ArrowLeft size={16} />
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para o Dashboard
        </Link>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Gestão da Equipe & Pacientes
          </span>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Atribuir Idoso a Profissional
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            Vincule um idoso ao médico, enfermeiro, cuidador ou familiar
            autorizado.
          </p>
        </div>

        {erro && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="shrink-0 text-red-600" />
            <p className="text-sm font-medium">{erro}</p>
          </div>
        )}

        {sucesso && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">
              Vínculo registrado com sucesso na base de dados! Pronto para o
              próximo cadastro.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                <UserCheck size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A2540]">
                  Dados da Atribuição
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Selecione o profissional ou familiar e o paciente
                  correspondente.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="usuario_id"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Profissional da Saúde / Familiar *
                </label>
                <div className="relative">
                  <ShieldCheck
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    id="usuario_id"
                    required
                    value={formData.usuario_id}
                    onChange={(e) =>
                      setFormData({ ...formData, usuario_id: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  >
                    {usuarios.length === 0 ? (
                      <option value="">
                        Nenhum profissional elegível encontrado
                      </option>
                    ) : (
                      usuarios.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome} ({u.perfil})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="idoso_id"
                  className="mb-2 block text-sm font-medium text-[#0A2540]"
                >
                  Idoso / Paciente *
                </label>
                <div className="relative">
                  <HeartHandshake
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    id="idoso_id"
                    required
                    value={formData.idoso_id}
                    onChange={(e) =>
                      setFormData({ ...formData, idoso_id: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  >
                    {idosos.length === 0 ? (
                      <option value="">Nenhum idoso encontrado</option>
                    ) : (
                      idosos.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.nome} ({i.idade} anos)
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Voltar ao Dashboard
            </Link>

            <button
              type="submit"
              disabled={salvando || !formData.usuario_id || !formData.idoso_id}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0A2540] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
            >
              {salvando ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {salvando ? "Vinculando..." : "Salvar Vínculo"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}