"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import ImageCropModal from "@/components/ImageCropModal";
import {
  API_URL,
  getAuthHeaders,
  getTokenSessao,
  getUsuarioSessao,
  salvarUsuarioSessao,
} from "@/lib/clinica";
import {
  UserCircle2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Building2,
  ShieldCheck,
} from "lucide-react";

export default function PerfilPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [userId, setUserId] = useState("");
  const [perfil, setPerfil] = useState("");
  const [clinicaNome, setClinicaNome] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");

  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [cropModalAberto, setCropModalAberto] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const carregarPerfil = useCallback(async () => {
    const token = getTokenSessao();
    const sessao = getUsuarioSessao();

    if (!token) {
      router.push("/login");
      return;
    }

    if (sessao) {
      setErro("");
      if (sessao.id) setUserId(sessao.id);
      if (sessao.perfil) setPerfil(sessao.perfil);
      if (sessao.clinica_nome) setClinicaNome(sessao.clinica_nome);
      if (sessao.foto_url) setFotoUrl(sessao.foto_url);
      setFormData((prev) => ({
        nome: sessao.nome || prev.nome,
        email: sessao.email || prev.email,
        cpf: sessao.cpf || prev.cpf,
        telefone: sessao.telefone || prev.telefone,
      }));
    }

    try {
      let dadosApi: any = null;

      if (sessao?.id) {
        const res = await fetch(`${API_URL}/usuario/${sessao.id}`, {
          headers: getAuthHeaders(false, token),
        });
        if (res.ok) {
          const raw = await res.json();
          dadosApi = raw?.data || raw;
        }
      }

      if (!dadosApi) {
        const resLista = await fetch(`${API_URL}/usuario`, {
          headers: getAuthHeaders(false, token),
        });
        if (resLista.ok) {
          const rawLista = await resLista.json();
          const lista = Array.isArray(rawLista)
            ? rawLista
            : rawLista?.data || [];
          dadosApi = lista.find(
            (u: any) =>
              (sessao?.id && String(u.id) === String(sessao.id)) ||
              (sessao?.email &&
                String(u.email || "").toLowerCase() ===
                  sessao.email.toLowerCase())
          );
        }
      }

      if (dadosApi) {
        setErro("");
        setUserId(String(dadosApi.id || sessao?.id || ""));
        setPerfil(String(dadosApi.perfil || sessao?.perfil || ""));
        setClinicaNome(
          String(dadosApi.clinica?.nome || sessao?.clinica_nome || "")
        );
        if (dadosApi.foto_url) setFotoUrl(String(dadosApi.foto_url));

        const atualizado = {
          nome: String(dadosApi.nome || sessao?.nome || ""),
          email: String(dadosApi.email || sessao?.email || ""),
          cpf: String(dadosApi.cpf || sessao?.cpf || ""),
          telefone: String(dadosApi.telefone || sessao?.telefone || ""),
        };
        setFormData(atualizado);

        salvarUsuarioSessao({
          ...dadosApi,
          ...atualizado,
          clinica_nome: dadosApi.clinica?.nome || sessao?.clinica_nome || "",
        });
      } else if (!sessao?.id && !sessao?.email) {
        setErro("Sessão de usuário não encontrada. Faça login novamente.");
      }
    } catch {
      if (!sessao?.id && !sessao?.email) {
        setErro("Sessão de usuário não encontrada. Faça login novamente.");
      }
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    carregarPerfil();
    window.addEventListener("saspi_user_updated", carregarPerfil);
    return () => {
      window.removeEventListener("saspi_user_updated", carregarPerfil);
    };
  }, [carregarPerfil]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setMensagem("");

    if (!userId) {
      setErro("Usuário não identificado. Faça login novamente.");
      setSalvando(false);
      return;
    }

    const cpfDigitos = formData.cpf.replace(/\D/g, "");
    if (cpfDigitos && cpfDigitos.length !== 11) {
      setErro("O CPF deve conter 11 dígitos numéricos.");
      setSalvando(false);
      return;
    }

    try {
      const payload = {
        nome: formData.nome.trim(),
        cpf: cpfDigitos,
        telefone: formData.telefone.trim(),
      };

      const res = await fetch(`${API_URL}/usuario/${userId}`, {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        throw new Error(msg || "Não foi possível atualizar o perfil.");
      }

      salvarUsuarioSessao({
        nome: payload.nome,
        cpf: payload.cpf,
        telefone: payload.telefone,
      });

      setMensagem("Perfil atualizado com sucesso!");
      setTimeout(() => setMensagem(""), 4000);
    } catch (err: any) {
      setErro(err.message || "Falha ao salvar perfil.");
    } finally {
      setSalvando(false);
    }
  }

  function handleSelecionarArquivoFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const objectUrl = URL.createObjectURL(file);
    setCropImageSrc(objectUrl);
    setCropModalAberto(true);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function fecharModalCrop() {
    if (cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
    }
    setCropImageSrc("");
    setCropModalAberto(false);
  }

  async function handleCropConcluido(croppedBlob: Blob) {
    fecharModalCrop();
    if (!userId) return;

    setEnviandoFoto(true);
    setErro("");
    setMensagem("");

    try {
      const fd = new FormData();
      fd.append("file", croppedBlob, `perfil-${userId}.jpg`);

      const token = getTokenSessao();
      const res = await fetch(
        `${API_URL}/storage/usuario/${userId}/foto-perfil`,
        {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: fd,
        }
      );

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        throw new Error(msg || "Não foi possível enviar a foto de perfil.");
      }

      const novaUrl =
        data?.foto_url || data?.url || data?.data?.foto_url || "";
      if (novaUrl) {
        setFotoUrl(novaUrl);
        salvarUsuarioSessao({ foto_url: novaUrl });
      }

      setMensagem("Foto de perfil atualizada com sucesso!");
      setTimeout(() => setMensagem(""), 4000);
    } catch (err: any) {
      setErro(err.message || "Erro ao enviar foto de perfil.");
    } finally {
      setEnviandoFoto(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <ImageCropModal
        imageSrc={cropImageSrc}
        isOpen={cropModalAberto}
        onClose={fecharModalCrop}
        onCropComplete={handleCropConcluido}
      />

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
            Conta & Credenciais
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
            Meu Perfil
          </h1>
          <p className="mt-2 text-gray-600">
            Atualize seus dados pessoais e de contato exibidos na plataforma.
          </p>
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

        {carregando ? (
          <div className="mt-10 flex items-center justify-center py-12 text-gray-500">
            <Loader2 size={24} className="animate-spin text-[#1565C0]" />
            <span className="ml-2 text-sm">Carregando perfil...</span>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <section className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                {fotoUrl ? (
                  <img
                    src={fotoUrl}
                    alt={formData.nome}
                    className="h-16 w-16 rounded-full object-cover shadow-xs ring-2 ring-[#E8F1FB]"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F1FB] text-[#1565C0]">
                    <UserCircle2 size={34} />
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-bold text-[#0A2540]">
                    {formData.nome || "Usuário"}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F1FB] px-2.5 py-0.5 font-semibold text-[#1565C0]">
                      <ShieldCheck size={13} />
                      {perfil || "USUÁRIO"}
                    </span>
                    {clinicaNome && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-600">
                        <Building2 size={13} />
                        {clinicaNome}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSelecionarArquivoFoto}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={enviandoFoto || !userId}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-[#FAFCFE] px-4 py-2.5 text-xs font-semibold text-[#0A2540] transition hover:border-[#1565C0] hover:text-[#1565C0] disabled:opacity-60"
                >
                  {enviandoFoto ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Camera size={15} />
                  )}
                  {enviandoFoto ? "Enviando..." : "Alterar Foto"}
                </button>
              </div>
            </section>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    E-mail institucional
                  </label>
                  <input
                    type="email"
                    readOnly
                    value={formData.email}
                    className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    CPF
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={14}
                    value={formData.cpf}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cpf: e.target.value.replace(/\D/g, "").slice(0, 11),
                      })
                    }
                    placeholder="11 dígitos numéricos"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#0A2540]">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone: e.target.value })
                    }
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={salvando || !userId}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm transition hover:bg-[#0A2540] disabled:opacity-70"
                >
                  {salvando ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {salvando ? "Salvando..." : "Salvar Perfil"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}