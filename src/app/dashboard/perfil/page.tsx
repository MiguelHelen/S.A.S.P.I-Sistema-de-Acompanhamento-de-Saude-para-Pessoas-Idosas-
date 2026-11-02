"use client";

import { useState, useEffect, useRef } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import ImageCropModal from "@/components/ImageCropModal";
import {
  Mail,
  Phone,
  Save,
  UserRound,
  IdCard,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Camera,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://perfect-bravery-production-5ce7.up.railway.app";

export default function Perfil() {
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState("");
  
  // Estados para Corte e Enquadramento da Foto de Perfil
  const [fotoOriginal, setFotoOriginal] = useState("");
  const [modalCropAberto, setModalCropAberto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    id: "",
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    perfil: "",
    foto_url: "",
  });

  useEffect(() => {
    async function sincronizarPerfil() {
      const userRaw = localStorage.getItem("saspi_user");
      const token = localStorage.getItem("saspi_token");

      let sessaoLocal: Record<string, any> = {};
      if (userRaw) {
        try {
          const parsed = JSON.parse(userRaw);
          sessaoLocal = parsed.user || parsed.usuario || parsed;
        } catch {}
      }

      const currentEmail = sessaoLocal.email || "";
      const currentId = sessaoLocal.id || "";

      setFormData({
        id: currentId,
        nome: sessaoLocal.nome || sessaoLocal.name || "Usuário",
        email: currentEmail,
        telefone: sessaoLocal.telefone || "",
        cpf: sessaoLocal.cpf || "",
        perfil: (sessaoLocal.perfil || sessaoLocal.role || "MEDICO").toUpperCase(),
        foto_url: sessaoLocal.foto_url || "",
      });

      if (token && currentEmail) {
        try {
          const res = await fetch(
            `${API_URL}/usuario?email=${encodeURIComponent(currentEmail)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (res.ok) {
            const data = await res.json();
            const usuarioEncontrado = Array.isArray(data)
              ? data.find((u: any) => u.email?.toLowerCase() === currentEmail.toLowerCase())
              : data;

            if (usuarioEncontrado && usuarioEncontrado.nome) {
              setFormData((prev) => ({
                ...prev,
                id: usuarioEncontrado.id || currentId,
                nome: usuarioEncontrado.nome,
                telefone: usuarioEncontrado.telefone || "",
                cpf: usuarioEncontrado.cpf || "",
                foto_url: usuarioEncontrado.foto_url || prev.foto_url,
              }));
            }
          }
        } catch {}
      }

      setCarregando(false);
    }

    sincronizarPerfil();
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErro("Selecione um arquivo de imagem válido (PNG, JPG ou WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFotoOriginal(reader.result as string);
      setModalCropAberto(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleCropSalvo(blob: Blob) {
    setModalCropAberto(false);
    setErro("");

    const token = localStorage.getItem("saspi_token");
    const dataUpload = new FormData();
    dataUpload.append("file", blob, `perfil_${formData.id}.jpg`);

    try {
      const res = await fetch(`${API_URL}/storage/usuario/${formData.id}/foto-perfil`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: dataUpload,
      });

      const resData = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(resData?.message || "Erro ao realizar upload da imagem.");
      }

      const novaUrl = resData.url;
      setFormData((prev) => ({ ...prev, foto_url: novaUrl }));

      const userRaw = localStorage.getItem("saspi_user");
      if (userRaw) {
        const parsed = JSON.parse(userRaw);
        parsed.foto_url = novaUrl;
        if (parsed.user) parsed.user.foto_url = novaUrl;
        if (parsed.usuario) parsed.usuario.foto_url = novaUrl;
        localStorage.setItem("saspi_user", JSON.stringify(parsed));
        window.dispatchEvent(new Event("saspi_user_updated"));
      }

      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    } catch (err: any) {
      setErro(err.message || "Falha ao salvar a imagem no servidor.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setSalvo(false);

    const token = localStorage.getItem("saspi_token");
    const telefoneLimpo = formData.telefone.replace(/\D/g, "");
    const cpfLimpo = formData.cpf.replace(/\D/g, "");

    const payload = {
      nome: formData.nome.trim(),
      telefone: telefoneLimpo,
      cpf: cpfLimpo,
    };

    try {
      if (token && formData.id) {
        const res = await fetch(`${API_URL}/usuario/${formData.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Não foi possível atualizar os dados.");
        }
      }

      const userRaw = localStorage.getItem("saspi_user");
      let sessaoAtual: Record<string, any> = {};
      if (userRaw) {
        try {
          sessaoAtual = JSON.parse(userRaw);
        } catch {}
      }

      const usuarioAtualizado = {
        ...sessaoAtual,
        ...formData,
        nome: formData.nome.trim(),
        telefone: telefoneLimpo,
        cpf: cpfLimpo,
      };

      localStorage.setItem("saspi_user", JSON.stringify(usuarioAtualizado));
      window.dispatchEvent(new Event("saspi_user_updated"));

      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    } catch (err: any) {
      setErro(err.message || "Erro ao salvar alterações no perfil.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#F2F7FB]">
        <DashboardNavbar />
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="animate-spin text-[#1565C0]" size={36} />
        </div>
      </main>
    );
  }

  const avatarUrl =
    formData.foto_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      formData.nome || "Usuario"
    )}&background=1565C0&color=fff&size=128&bold=true`;

  return (
    <main className="min-h-screen bg-[#F2F7FB]">
      <DashboardNavbar />

      <ImageCropModal
        isOpen={modalCropAberto}
        imageSrc={fotoOriginal}
        onClose={() => setModalCropAberto(false)}
        onCropComplete={handleCropSalvo}
      />

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <span className="text-sm font-semibold uppercase tracking-wider text-[#26A69A]">
          Minha conta
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
          Perfil do Usuário
        </h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Dados sincronizados com a sua credencial de acesso no S.A.S.P.I.
        </p>

        {salvo && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">Informações salvas e sincronizadas com sucesso!</p>
          </div>
        )}

        {erro && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="shrink-0 text-red-600" />
            <p className="text-sm font-medium">{erro}</p>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="relative mx-auto h-24 w-24">
              <img
                src={avatarUrl}
                alt={formData.nome}
                className="h-24 w-24 rounded-full object-cover shadow-sm ring-4 ring-gray-100"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Alterar e enquadrar foto de perfil"
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#1565C0] text-white shadow-md transition hover:bg-[#0A2540]"
              >
                <Camera size={15} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <h2 className="mt-5 text-center text-xl font-semibold text-[#0A2540]">
              {formData.nome}
            </h2>
            <p className="mt-1 text-center text-sm font-medium text-[#26A69A]">
              {formData.perfil}
            </p>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Contato Registrado
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={17} className="shrink-0 text-[#1565C0]" />
                  <span className="truncate">{formData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={17} className="shrink-0 text-[#26A69A]" />
                  <span>{formData.telefone || "Não informado"}</span>
                </div>
              </div>
            </div>
          </aside>

          <form onSubmit={handleSave} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EF] text-[#26A69A]">
                <UserRound size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-[#0A2540]">Dados Pessoais</h2>
                <p className="mt-1 text-sm text-gray-500">Edite as informações cadastrais da sua credencial.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="nome" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Nome completo *
                </label>
                <input
                  id="nome"
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 py-3 px-4 text-sm outline-none focus:border-[#1565C0]"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="telefone" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Telefone
                </label>
                <input
                  id="telefone"
                  type="tel"
                  maxLength={11}
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value.replace(/\D/g, "") })}
                  className="w-full rounded-xl border border-gray-300 py-3 px-4 text-sm outline-none focus:border-[#1565C0]"
                />
              </div>

              <div>
                <label htmlFor="cpf" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  CPF
                </label>
                <input
                  id="cpf"
                  type="text"
                  maxLength={11}
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value.replace(/\D/g, "") })}
                  className="w-full rounded-xl border border-gray-300 py-3 px-4 text-sm outline-none focus:border-[#1565C0]"
                />
              </div>

              <div>
                <label htmlFor="perfil" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Perfil de Acesso
                </label>
                <input
                  id="perfil"
                  type="text"
                  disabled
                  value={formData.perfil}
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-500 outline-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
              <button
                type="submit"
                disabled={salvando}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-6 py-3 font-medium text-white shadow-sm hover:bg-[#0A2540] disabled:opacity-70"
              >
                {salvando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}