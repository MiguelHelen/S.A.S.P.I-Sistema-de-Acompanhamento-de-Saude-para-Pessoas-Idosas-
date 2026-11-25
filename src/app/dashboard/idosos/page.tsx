"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import AvatarCropModal from "@/components/AvatarCropModal";
import {
  calcularIdadeReal,
  formatarCpf,
  formatarDataBr,
  formatarSexo,
} from "@/components/PatientSelector";
import {
  API_URL,
  getAuthHeaders,
  getIdosoAtivoSessao,
  getTokenSessao,
  getUsuarioSessao,
  isAdminPerfil,
  validarEObterClinicaId,
} from "@/lib/clinica";
import {
  Users,
  Plus,
  Loader2,
  Trash2,
  Camera,
  KeyRound,
  Search,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Phone,
  MapPin,
  Calendar,
  Smartphone,
  Mail,
  FileText,
  UserCheck,
  Pencil,
  X,
  Save,
} from "lucide-react";

interface IdosoItem {
  id: string;
  nome: string;
  idade: number;
  cpf?: string;
  data_nascimento?: string;
  sexo?: string;
  telefone?: string;
  endereco?: string;
  foto_url?: string | null;
  clinica_id?: string;
  created_at?: string;
  usuario_id?: string | null;
  app_ativo: boolean;
  app_email?: string;
}

function extrairDataInputIso(dataStr?: string): string {
  if (!dataStr) return "";
  const match = String(dataStr).match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  const d = new Date(dataStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function IdososPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [idosos, setIdosos] = useState<IdosoItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [enviandoFotoId, setEnviandoFotoId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  // Modal de edição
  const [idosoEditando, setIdosoEditando] = useState<IdosoItem | null>(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEdicao, setErroEdicao] = useState("");
  const [formEdicao, setFormEdicao] = useState({
    nome: "",
    data_nascimento: "",
    sexo: "",
    cpf: "",
    telefone: "",
    endereco: "",
  });

  // Modal de confirmação de exclusão
  const [idosoParaExcluir, setIdosoParaExcluir] = useState<IdosoItem | null>(
    null
  );

  const [cropIdosoId, setCropIdosoId] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const idosoSelecionadoFotoRef = useRef<string | null>(null);

  const carregarIdosos = useCallback(async () => {
    setCarregando(true);
    setErro("");

    const sessao = getUsuarioSessao();
    if (!sessao || !isAdminPerfil(sessao.perfil)) {
      setAutorizado(false);
      setCarregando(false);
      return;
    }

    setAutorizado(true);

    try {
      const clinicaId = validarEObterClinicaId(sessao);
      const headers = getAuthHeaders(false);

      const [resIdosos, resUsuarios] = await Promise.all([
        fetch(`${API_URL}/idoso?clinica_id=${clinicaId}`, { headers }),
        fetch(`${API_URL}/usuario?clinica_id=${clinicaId}`, { headers }).catch(
          () => null
        ),
      ]);

      if (!resIdosos.ok) {
        const errData = await resIdosos.json().catch(() => null);
        throw new Error(
          errData?.message ||
            "Não foi possível carregar os pacientes da clínica."
        );
      }

      const rawIdosos = await resIdosos.json();
      const lista = Array.isArray(rawIdosos)
        ? rawIdosos
        : rawIdosos?.data || [];

      const mapaUsuariosIdoso = new Map<string, { email: string }>();
      const mapaUsuariosPorIdosoId = new Map<string, { email: string }>();

      if (resUsuarios?.ok) {
        const rawUsers = await resUsuarios.json();
        const listaUsers = Array.isArray(rawUsers)
          ? rawUsers
          : rawUsers?.data || [];
        listaUsers.forEach((u: any) => {
          const perfilU = String(u.perfil || "").toUpperCase();
          if (perfilU === "IDOSO") {
            if (u.id) {
              mapaUsuariosIdoso.set(String(u.id), {
                email: String(u.email || ""),
              });
            }
            if (u.idoso_id) {
              mapaUsuariosPorIdosoId.set(String(u.idoso_id), {
                email: String(u.email || ""),
              });
            }
          }
        });
      }

      let cacheLocalApp: Record<string, { email?: string; ativo?: boolean }> =
        {};
      if (typeof window !== "undefined") {
        try {
          const rawCache = localStorage.getItem(`saspi_idoso_app_${clinicaId}`);
          if (rawCache) cacheLocalApp = JSON.parse(rawCache);
        } catch {}
      }

      const filtrados: IdosoItem[] = lista
        .filter((i: any) => !i.clinica_id || i.clinica_id === clinicaId)
        .map((i: any) => {
          const idStr = String(i.id);
          const idadeReal = calcularIdadeReal(i.data_nascimento);
          const usuarioId = i.usuario_id ? String(i.usuario_id) : null;
          const usuarioEmbutido = i.usuario || null;
          const usuarioMapeado =
            (usuarioId ? mapaUsuariosIdoso.get(usuarioId) : undefined) ||
            mapaUsuariosPorIdosoId.get(idStr);
          const registroLocal = cacheLocalApp[idStr];

          const emailApp =
            usuarioEmbutido?.email ||
            usuarioMapeado?.email ||
            registroLocal?.email ||
            "";
          const appAtivo = Boolean(
            usuarioId ||
              usuarioEmbutido?.id ||
              usuarioMapeado ||
              emailApp ||
              registroLocal?.ativo
          );

          return {
            id: idStr,
            nome: String(i.nome || ""),
            idade: idadeReal > 0 ? idadeReal : Number(i.idade || 0),
            cpf: i.cpf ? String(i.cpf) : undefined,
            data_nascimento: i.data_nascimento || undefined,
            sexo: i.sexo ? String(i.sexo) : undefined,
            telefone: i.telefone || i.telefone_emergencia || undefined,
            endereco: i.endereco || undefined,
            foto_url: i.foto_url || null,
            clinica_id: i.clinica_id || clinicaId,
            created_at: i.created_at || undefined,
            usuario_id: usuarioId,
            app_ativo: appAtivo,
            app_email: emailApp || undefined,
          };
        });

      setIdosos(filtrados);
    } catch (err: any) {
      setErro(err.message || "Falha ao buscar lista de pacientes.");
      setIdosos([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarIdosos();
  }, [carregarIdosos]);

  function abrirModalEdicao(idoso: IdosoItem) {
    setErroEdicao("");
    setIdosoEditando(idoso);
    setFormEdicao({
      nome: idoso.nome || "",
      data_nascimento: extrairDataInputIso(idoso.data_nascimento),
      sexo: idoso.sexo || "",
      cpf: (idoso.cpf || "").replace(/\D/g, ""),
      telefone: idoso.telefone || "",
      endereco: idoso.endereco || "",
    });
  }

  async function handleSalvarEdicao(e: React.FormEvent) {
    e.preventDefault();
    if (!idosoEditando) return;

    setErroEdicao("");
    const nomeLimpo = formEdicao.nome.trim();
    if (!nomeLimpo) {
      setErroEdicao("O nome completo do paciente é obrigatório.");
      return;
    }

    const cpfDigitos = formEdicao.cpf.replace(/\D/g, "");
    if (cpfDigitos && cpfDigitos.length !== 11) {
      setErroEdicao("O CPF deve conter 11 dígitos numéricos.");
      return;
    }

    setSalvandoEdicao(true);

    try {
      const idadeCalculada = formEdicao.data_nascimento
        ? calcularIdadeReal(formEdicao.data_nascimento)
        : idosoEditando.idade;

      const payload: Record<string, any> = {
        nome: nomeLimpo,
        ...(formEdicao.data_nascimento
          ? { data_nascimento: formEdicao.data_nascimento }
          : {}),
        ...(idadeCalculada > 0 ? { idade: idadeCalculada } : {}),
        ...(formEdicao.sexo ? { sexo: formEdicao.sexo } : {}),
        ...(cpfDigitos ? { cpf: cpfDigitos } : {}),
        telefone: formEdicao.telefone.trim(),
        endereco: formEdicao.endereco.trim(),
      };

      const res = await fetch(`${API_URL}/idoso/${idosoEditando.id}`, {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        throw new Error(msg || "Não foi possível atualizar os dados do paciente.");
      }

      const atualizado: IdosoItem = {
        ...idosoEditando,
        nome: nomeLimpo,
        data_nascimento:
          formEdicao.data_nascimento || idosoEditando.data_nascimento,
        idade: idadeCalculada > 0 ? idadeCalculada : idosoEditando.idade,
        sexo: formEdicao.sexo || idosoEditando.sexo,
        cpf: cpfDigitos || idosoEditando.cpf,
        telefone: formEdicao.telefone.trim() || undefined,
        endereco: formEdicao.endereco.trim() || undefined,
      };

      setIdosos((prev) =>
        prev.map((item) =>
          item.id === idosoEditando.id ? atualizado : item
        )
      );

      const ativo = getIdosoAtivoSessao<any>();
      if (ativo?.id === idosoEditando.id) {
        localStorage.setItem(
          "saspi_active_elderly",
          JSON.stringify({ ...ativo, ...atualizado })
        );
      }

      window.dispatchEvent(new Event("saspi_elderly_updated"));
      setIdosoEditando(null);
      setMensagem(`Dados de "${nomeLimpo}" atualizados com sucesso!`);
      setTimeout(() => setMensagem(""), 4000);
    } catch (err: any) {
      setErroEdicao(err.message || "Falha ao salvar alterações.");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  function iniciarUploadFoto(idosoId: string) {
    idosoSelecionadoFotoRef.current = idosoId;
    fileInputRef.current?.click();
  }

  function handleArquivoSelecionado(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const idosoId = idosoSelecionadoFotoRef.current;
    if (!file || !idosoId) return;

    const objectUrl = URL.createObjectURL(file);
    setCropIdosoId(idosoId);
    setCropImageSrc(objectUrl);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function fecharModalCrop() {
    if (cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
    }
    setCropImageSrc(null);
    setCropIdosoId(null);
  }

  async function handleCropSalvo(croppedBlob: Blob) {
    const idosoId = cropIdosoId;
    fecharModalCrop();
    if (!idosoId) return;

    setEnviandoFotoId(idosoId);
    setErro("");
    setMensagem("");

    try {
      const formData = new FormData();
      formData.append("file", croppedBlob, `idoso-${idosoId}.jpg`);

      const token = getTokenSessao();
      const res = await fetch(`${API_URL}/storage/idoso/${idosoId}/foto`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        throw new Error(
          msg ||
            "Não foi possível enviar a foto para o armazenamento. Nenhum dado inválido foi salvo."
        );
      }

      const novaFotoUrl =
        data?.foto_url || data?.url || data?.data?.foto_url || "";

      if (!novaFotoUrl) {
        throw new Error(
          "O servidor não retornou a URL pública da foto enviada."
        );
      }

      setIdosos((prev) =>
        prev.map((item) =>
          item.id === idosoId ? { ...item, foto_url: novaFotoUrl } : item
        )
      );

      window.dispatchEvent(new Event("saspi_elderly_updated"));
      setMensagem("Foto do paciente atualizada com sucesso!");
      setTimeout(() => setMensagem(""), 4000);
    } catch (err: any) {
      setErro(err.message || "Erro ao enviar foto do paciente.");
    } finally {
      setEnviandoFotoId(null);
    }
  }

  async function confirmarExclusao() {
    const idoso = idosoParaExcluir;
    if (!idoso) return;

    setExcluindoId(idoso.id);
    setErro("");
    setMensagem("");

    try {
      const res = await fetch(`${API_URL}/idoso/${idoso.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(false),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.message || "Não foi possível remover o paciente."
        );
      }

      setIdosos((prev) => prev.filter((item) => item.id !== idoso.id));
      const ativo = getIdosoAtivoSessao<any>();
      if (ativo?.id === idoso.id) {
        localStorage.removeItem("saspi_active_elderly");
      }
      window.dispatchEvent(new Event("saspi_elderly_updated"));
      setIdosoParaExcluir(null);
      setMensagem(`Paciente "${idoso.nome}" removido com sucesso.`);
      setTimeout(() => setMensagem(""), 4000);
    } catch (err: any) {
      setErro(err.message || "Erro ao excluir paciente.");
      setIdosoParaExcluir(null);
    } finally {
      setExcluindoId(null);
    }
  }

  const idososFiltrados = idosos.filter((i) => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return true;
    const cpfLimpo = (i.cpf || "").replace(/\D/g, "");
    const termoDigitos = termo.replace(/\D/g, "");
    return (
      i.nome.toLowerCase().includes(termo) ||
      (i.endereco && i.endereco.toLowerCase().includes(termo)) ||
      (i.app_email && i.app_email.toLowerCase().includes(termo)) ||
      (i.telefone && i.telefone.toLowerCase().includes(termo)) ||
      (termoDigitos.length >= 3 && cpfLimpo.includes(termoDigitos))
    );
  });

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
            Apenas Administradores podem gerenciar o cadastro de pacientes da
            clínica.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleArquivoSelecionado}
        className="hidden"
      />

      {cropImageSrc && (
        <AvatarCropModal
          imageSrc={cropImageSrc}
          onClose={fecharModalCrop}
          onCropComplete={handleCropSalvo}
        />
      )}

      {/* Modal de Edição do Paciente */}
      {idosoEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#26A69A]">
                  Atualização Cadastral
                </span>
                <h2 className="mt-1 text-xl font-bold text-[#0A2540]">
                  Editar Paciente
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIdosoEditando(null)}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {erroEdicao && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-red-50 p-3.5 text-sm text-red-700">
                <AlertCircle size={18} className="shrink-0 text-red-600" />
                <span>{erroEdicao}</span>
              </div>
            )}

            <form onSubmit={handleSalvarEdicao} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0A2540]">
                  Nome completo *
                </label>
                <input
                  type="text"
                  required
                  value={formEdicao.nome}
                  onChange={(e) =>
                    setFormEdicao({ ...formEdicao, nome: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0A2540]">
                    Data de nascimento
                  </label>
                  <input
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    value={formEdicao.data_nascimento}
                    onChange={(e) =>
                      setFormEdicao({
                        ...formEdicao,
                        data_nascimento: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0A2540]">
                    Sexo
                  </label>
                  <select
                    value={formEdicao.sexo}
                    onChange={(e) =>
                      setFormEdicao({ ...formEdicao, sexo: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  >
                    <option value="">Não informado</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMININO">Feminino</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0A2540]">
                    CPF
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={14}
                    value={formEdicao.cpf}
                    onChange={(e) =>
                      setFormEdicao({
                        ...formEdicao,
                        cpf: e.target.value.replace(/\D/g, "").slice(0, 11),
                      })
                    }
                    placeholder="11 dígitos"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0A2540]">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formEdicao.telefone}
                    onChange={(e) =>
                      setFormEdicao({ ...formEdicao, telefone: e.target.value })
                    }
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0A2540]">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formEdicao.endereco}
                  onChange={(e) =>
                    setFormEdicao({ ...formEdicao, endereco: e.target.value })
                  }
                  placeholder="Rua, número, bairro, cidade"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIdosoEditando(null)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoEdicao}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0A2540] disabled:opacity-60"
                >
                  {salvandoEdicao ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {salvandoEdicao ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {idosoParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 size={24} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#0A2540]">
              Remover Paciente?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Tem certeza que deseja remover{" "}
              <strong className="text-[#0A2540]">
                {idosoParaExcluir.nome}
              </strong>{" "}
              e seus vínculos desta clínica? Esta ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={excluindoId === idosoParaExcluir.id}
                onClick={() => setIdosoParaExcluir(null)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={excluindoId === idosoParaExcluir.id}
                onClick={confirmarExclusao}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {excluindoId === idosoParaExcluir.id && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
              Pacientes & Prontuário
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
              Pacientes Idosos
            </h1>
            <p className="mt-2 text-gray-600">
              Visualize e edite os dados dos pacientes, atualize fotos e
              gerencie o acesso ao aplicativo móvel.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/idosos/acesso-app"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#BFD8F2] bg-[#E8F1FB] px-4 py-3 text-sm font-semibold text-[#1565C0] transition hover:bg-[#d7e7f9]"
            >
              <KeyRound size={17} />
              Acesso App do Idoso
            </Link>
            <Link
              href="/dashboard/idosos/novo"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565C0] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#0A2540]"
            >
              <Plus size={18} />
              Novo Paciente
            </Link>
          </div>
        </div>

        {mensagem && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">{mensagem}</p>
          </div>
        )}

        {erro && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="shrink-0 text-red-600" />
            <p className="text-sm font-medium">{erro}</p>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome, CPF, telefone, endereço ou e-mail..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#1565C0]"
              />
            </div>

            <span className="text-xs font-medium text-gray-500">
              {idososFiltrados.length}{" "}
              {idososFiltrados.length === 1
                ? "paciente cadastrado"
                : "pacientes cadastrados"}
            </span>
          </div>

          <div className="mt-6">
            {carregando ? (
              <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                <Loader2 size={24} className="animate-spin text-[#1565C0]" />
                <span className="ml-2">Carregando pacientes...</span>
              </div>
            ) : idososFiltrados.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
                <Users size={34} className="mx-auto text-gray-300" />
                <p className="mt-3 font-semibold text-[#0A2540]">
                  Nenhum paciente encontrado
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Cadastre o primeiro idoso da clínica para iniciar o
                  acompanhamento.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {idososFiltrados.map((idoso) => {
                  const iniciais = idoso.nome
                    .split(" ")
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase();

                  const dataNascFmt = formatarDataBr(idoso.data_nascimento);
                  const cpfFmt = formatarCpf(idoso.cpf);
                  const sexoFmt = formatarSexo(idoso.sexo);

                  return (
                    <div
                      key={idoso.id}
                      className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-[#FAFCFE] p-5 transition hover:border-[#BFD8F2] hover:bg-white"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            {idoso.foto_url ? (
                              <img
                                src={idoso.foto_url}
                                alt={idoso.nome}
                                className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-xs"
                              />
                            ) : (
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E8F1FB] text-base font-bold text-[#1565C0]">
                                {iniciais || "ID"}
                              </div>
                            )}

                            <div>
                              <h2 className="font-bold text-[#0A2540]">
                                {idoso.nome}
                              </h2>
                              <p className="mt-0.5 text-xs font-medium text-[#1565C0]">
                                {idoso.idade > 0
                                  ? `${idoso.idade} anos`
                                  : "Idade não informada"}
                                {sexoFmt ? ` • ${sexoFmt}` : ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => abrirModalEdicao(idoso)}
                              title="Editar dados do paciente"
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:border-[#1565C0] hover:text-[#1565C0]"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              disabled={enviandoFotoId === idoso.id}
                              onClick={() => iniciarUploadFoto(idoso.id)}
                              title="Atualizar foto do paciente"
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:border-[#1565C0] hover:text-[#1565C0] disabled:opacity-50"
                            >
                              {enviandoFotoId === idoso.id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Camera size={15} />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="mt-3.5">
                          {idoso.app_ativo ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                              <Smartphone size={12} />
                              App Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200">
                              <Smartphone size={12} />
                              Sem Acesso App
                            </span>
                          )}
                        </div>

                        <div className="mt-4 space-y-2 text-xs text-gray-600">
                          {idoso.app_email && (
                            <p className="flex items-center gap-2">
                              <Mail
                                size={14}
                                className="shrink-0 text-emerald-600"
                              />
                              <span className="truncate font-medium text-gray-700">
                                {idoso.app_email}
                              </span>
                            </p>
                          )}

                          {dataNascFmt && (
                            <p className="flex items-center gap-2">
                              <Calendar
                                size={14}
                                className="shrink-0 text-gray-400"
                              />
                              <span>Nascimento: {dataNascFmt}</span>
                            </p>
                          )}

                          {sexoFmt && (
                            <p className="flex items-center gap-2">
                              <UserCheck
                                size={14}
                                className="shrink-0 text-gray-400"
                              />
                              <span>Sexo: {sexoFmt}</span>
                            </p>
                          )}

                          {cpfFmt && (
                            <p className="flex items-center gap-2">
                              <FileText
                                size={14}
                                className="shrink-0 text-gray-400"
                              />
                              <span>CPF: {cpfFmt}</span>
                            </p>
                          )}

                          {idoso.telefone && (
                            <p className="flex items-center gap-2">
                              <Phone
                                size={14}
                                className="shrink-0 text-[#26A69A]"
                              />
                              <span>Telefone: {idoso.telefone}</span>
                            </p>
                          )}

                          {idoso.endereco && (
                            <p className="flex items-start gap-2">
                              <MapPin
                                size={14}
                                className="mt-0.5 shrink-0 text-[#1565C0]"
                              />
                              <span className="wrap-break-word">
                                Endereço: {idoso.endereco}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4">
                        <Link
                          href={`/dashboard/idosos/acesso-app?idoso_id=${idoso.id}`}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            idoso.app_ativo
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-[#E8F1FB] text-[#1565C0] hover:bg-[#d6e6f9]"
                          }`}
                        >
                          <KeyRound size={13} />
                          {idoso.app_ativo ? "Gerenciar App" : "Configurar App"}
                        </Link>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => abrirModalEdicao(idoso)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-[#1565C0] hover:text-[#1565C0]"
                          >
                            <Pencil size={12} />
                            Editar
                          </button>

                          <button
                            type="button"
                            disabled={excluindoId === idoso.id}
                            onClick={() => setIdosoParaExcluir(idoso)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            <Trash2 size={12} />
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}