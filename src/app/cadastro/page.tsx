export default function Cadastro() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2F7FB] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#0A2540]">
          Crie sua conta
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Cadastre-se para acessar o S.A.S.P.I.
        </p>

        <form className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="nome"
              className="mb-2 block text-sm font-medium text-[#0A2540]"
            >
              Nome completo
            </label>

            <input
              id="nome"
              type="text"
              placeholder="Digite seu nome"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder:text-gray-500 outline-none transition focus:border-[#1565C0]"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#0A2540]"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder:text-gray-500 outline-none transition focus:border-[#1565C0]"
            />
          </div>

          <div>
            <label
              htmlFor="senha"
              className="mb-2 block text-sm font-medium text-[#0A2540]"
            >
              Senha
            </label>

            <input
              id="senha"
              type="password"
              placeholder="Crie uma senha"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder:text-gray-500 outline-none transition focus:border-[#1565C0]"
            />
          </div>

          <div>
            <label
              htmlFor="confirmarSenha"
              className="mb-2 block text-sm font-medium text-[#0A2540]"
            >
              Confirmar senha
            </label>

            <input
              id="confirmarSenha"
              type="password"
              placeholder="Digite a senha novamente"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder:text-gray-500 outline-none transition focus:border-[#1565C0]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#1565C0] px-5 py-3 font-medium text-white transition hover:bg-[#0A2540]"
          >
            Criar conta
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Já possui uma conta?{" "}
          <a href="/login" className="font-medium text-[#1565C0]">
            Entrar
          </a>
        </p>
      </div>
    </main>
  );
}