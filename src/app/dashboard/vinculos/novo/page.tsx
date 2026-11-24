"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import { calcularIdadeReal } from "@/components/PatientSelector";
import {
  API_URL,
  getAuthHeaders,
  getUsuarioSessao,
  isAdminPerfil,
  normalizarPerfil,
  validarEObterClinicaId,
} from "@/lib/clinica";
import {
  ArrowLeft,
  Link2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

interface UsuarioOpcao {
  id: string;
  nome: string;
  email: string;
  perfil: string;
}

interface IdosoOpcao {
  id: string;
  nome: string;
  idade: number;
}

export default function NovoVinculoPage() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  const [usuarios, setUsuarios] = useState<UsuarioOpcao[]>([]);
  const [idosos, setIdosos] = useState<IdosoOpcao[]>([]);

  const [formData, setFormData] = useState({
    usuario_id: "",
    idoso_id: "",
    papel: "FAMILIAR",
    parentesco: "",
  });

  useEffect(() => {
    async function carregarDados() {
      const sessao = getUsuarioSessao();
      if (!sessao || !isAdminPerfil(sessao.perfil)) {
        setAutorizado(false);
        setCarregandoOpcoes(false);
        return;
      }

      setAutorizado(true);

      try {
        const clinicaId = validarEObterClinicaId(sessao);
        const headers = getAuthHeaders(false);

        const [resUsers, resIdosos] = await Promise.all([
          fetch(`${API_URL}/usuario?clinica_id=${clinicaId}`, { headers }),
          fetch(`${API_URL}/idoso?clinica_id=${clinicaId}`, { headers }),
        ]);

        if (resUsers.ok) {
          const rawU = await resUsers.json();
          const listaU = Array.isArray(rawU) ? rawU : rawU?.data || [];
          const opcoesU: UsuarioOpcao[] = listaU
            .filter((u: any) => !u.clinica_id || u.clinica_id === clinicaId)
            .map((u: any) => ({
              id: String(u.id),
              nome: String(u.nome || ""),
              email: String(u.email || ""),
              perfil: normalizarPerfil(u.perfil || u.role),
            }))
            .filter(
              (u: UsuarioOpcao) =>
                u.perfil !== "IDOSO" && u.perfil !== "ADMINISTRADOR"
            );
          setUsuarios(opcoesU);
        }

        if (resIdosos.ok) {
          const rawI = await resIdosos.json();
          const listaI = Array.isArray(rawI) ? rawI : rawI?.data || [];
          const opcoesI: IdosoOpcao[] = listaI
            .filter((i: any) => !i.clinica_id || i.clinica_id === clinicaId)
            .map((i: any) => {
              const idadeReal = calcularIdadeReal(i.data_nascimento);
              return {
                id: String(i.id),
                nome: String(i.nome || ""),
                idade: idadeReal > 0 ? idadeReal : Number(i.idade || 0),
              };
            });
          setIdosos(opcoesI);
        }
      } catch (err: any) {
        setErro(err.message || "Falha ao carregar usuários e pacientes.");
      } finally {
        setCarregandoOpcoes(false);
      }
    }

    carregarDados();
  }, []);

  function handleUsuarioChange(usuarioId: string) {
    const selecionado = usuarios.find((u) => u.id === usuarioId);
    const papelSugerido =
      selecionado?.perfil === "FAMILIAR" ? "FAMILIAR" : "RESPONSAVEL_CLINICO";

    setFormData((prev) => ({
      ...prev,
      usuario_id: usuarioId,
      papel: papelSugerido,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso(false);

    if (!formData.usuario_id || !formData.idoso_id) {
      setErro("Selecione o usuário e o paciente para criar o vínculo.");
      setSalvando(false);
      return;
    }

    try {
      const payload = {
        usuario_id: formData.usuario_id,
        idoso_id: formData.idoso_id,
        papel: formData.papel,
        parentesco: formData.parentesco.trim() || undefined,
      };

      const res = await fetch(`${API_URL}/usuario-idoso`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        throw new Error(msg || "Não foi possível criar o vínculo.");
      }

      setSucesso(true);
      setTimeout(() => {
        router.push("/dashboard/vinculos");
      }, 1200);
    } catch (err: any) {
      setErro(err.message || "Erro ao salvar vínculo.");
    } finally {
      setSalvando(false);
    }
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
            Apenas Administradores podem criar vínculos de acompanhamento.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard/vinculos"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1565C0]"
        >
          <ArrowLeft size={17} />
          Voltar para vínculos
        </Link>

        <div className="mt-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Rede de Cuidados
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Novo Vínculo
          </h1>
          <p className="mt-2 text-gray-600">
            Conecte um membro da equipe clínica ou familiar a um paciente
            cadastrado na clínica.
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
              Vínculo criado com sucesso! Redirecionando...
            </p>
          </div>
        )}

        {carregandoOpcoes ? (
          <div className="mt-10 flex items-center justify-center py-12 text-gray-500">
            <Loader2 size={24} className="animate-spin text-[#1565C0]" />
            <span className="ml-2 text-sm">
              Carregando profissionais, familiares e pacientes...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FB] text-[#1565C0]">
                  <Link2 size={22} />
                </div>
                <div>
                  <h2 className="font-semibold text-[#0A2540]">
                    Configuração do Vínculo
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    Profissional ou Familiar *
                  </label>
                  <select
                    required
                    value={formData.usuario_id}
                    onChange={(e) => handleUsuarioChange(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  >
                    <option value="">Selecione um usuário...</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome} ({u.perfil}) — {u.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    Paciente (Idoso) *
                  </label>
                  <select
                    required
                    value={formData.idoso_id}
                    onChange={(e) =>
                      setFormData({ ...formData, idoso_id: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  >
                    <option value="">Selecione um paciente...</option>
                    {idosos.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nome}
                        {i.idade > 0 ? ` (${i.idade} anos)` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    Papel no Acompanhamento *
                  </label>
                  <select
                    value={formData.papel}
                    onChange={(e) =>
                      setFormData({ ...formData, papel: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  >
                    <option value="RESPONSAVEL_CLINICO">
                      Responsável Clínico
                    </option>
                    <option value="CUIDADOR">Cuidador</option>
                    <option value="FAMILIAR">Familiar</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    Parentesco / Observação (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.parentesco}
                    onChange={(e) =>
                      setFormData({ ...formData, parentesco: e.target.value })
                    }
                    placeholder="Ex.: Filho(a), Cônjuge, Geriatra titular"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/dashboard/vinculos"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={salvando}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm hover:bg-[#0A2540] disabled:opacity-70"
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
        )}
      </div>
    </main>
  );
}