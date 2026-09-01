export default function Login() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2F7FB] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
  <h1 className="text-2xl font-bold text-[#0A2540]">
    Acesse sua conta
  </h1>

  <p className="mt-2 text-sm text-gray-600">
    Entre para acessar o S.A.S.P.I.
  </p>

  <form className="mt-8 space-y-5">
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
        placeholder="Digite sua senha"
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder:text-gray-500 outline-none transition focus:border-[#1565C0]"
      />
    </div>

    <button
      type="submit"
      className="w-full rounded-lg bg-[#1565C0] px-5 py-3 font-medium text-white transition hover:bg-[#0A2540]"
    >
      Entrar
    </button>
  </form>

  <p className="mt-6 text-center text-sm text-gray-600">
    Ainda não possui uma conta?{" "}
    <a href="/cadastro" className="font-medium text-[#1565C0]">
      Cadastre-se
    </a>
  </p>
</div>
    </main>
  );
}