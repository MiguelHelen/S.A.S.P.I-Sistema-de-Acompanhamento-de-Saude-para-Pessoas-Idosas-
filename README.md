# S.A.S.P.I.

**Sistema de Acompanhamento de Saúde para Pessoas Idosas**

O S.A.S.P.I. é uma solução digital voltada ao acompanhamento e à organização de informações relacionadas à saúde de pessoas idosas.

A proposta do sistema é centralizar registros de saúde, medicamentos, consultas, histórico e outros dados importantes em um único ambiente, facilitando o acompanhamento da rotina da pessoa idosa.

## Estado atual do projeto

O projeto está atualmente na etapa de desenvolvimento do **frontend web**.

As principais telas do protótipo já foram desenvolvidas e, por enquanto, utilizam **dados demonstrativos** para representar o funcionamento do sistema.

A integração com backend, banco de dados e dispositivos vestíveis será realizada posteriormente.

## Funcionalidades desenvolvidas

Atualmente o frontend possui:

- Página inicial
- Login
- Cadastro
- Dashboard
- Minha Saúde
- Histórico de saúde
- Cadastro de novo registro de saúde
- Medicamentos
- Cadastro de novo medicamento
- Consultas
- Cadastro de nova consulta
- Perfil do usuário
- Navbar responsiva
- Navegação interna com indicação da página atual
- Layout responsivo para desktop, tablet e celular

## Tecnologias utilizadas

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React

## Executando o projeto

### 1. Instale as dependências

```bash
npm install
```

### 2. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

### 3. Acesse o projeto

[http://localhost:3000](http://localhost:3000)

## Rotas para testes

Com o servidor em execução, utilize os links abaixo para acessar diretamente cada tela.

| Página | Rota |
| --- | --- |
| Home | [Abrir](http://localhost:3000/) |
| Login | [Abrir](http://localhost:3000/login) |
| Cadastro | [Abrir](http://localhost:3000/cadastro) |
| Dashboard | [Abrir](http://localhost:3000/dashboard) |
| Minha Saúde | [Abrir](http://localhost:3000/dashboard/saude) |
| Medicamentos | [Abrir](http://localhost:3000/dashboard/medicamentos) |
| Novo medicamento | [Abrir](http://localhost:3000/dashboard/medicamentos/novo) |
| Consultas | [Abrir](http://localhost:3000/dashboard/consultas) |
| Nova consulta | [Abrir](http://localhost:3000/dashboard/consultas/nova) |
| Histórico | [Abrir](http://localhost:3000/dashboard/historico) |
| Novo registro | [Abrir](http://localhost:3000/dashboard/historico/novo) |
| Perfil | [Abrir](http://localhost:3000/dashboard/perfil) |

## Estrutura atual do frontend

```text
src/
├── app/
│   ├── cadastro/
│   ├── dashboard/
│   │   ├── consultas/
│   │   │   └── nova/
│   │   ├── historico/
│   │   │   └── novo/
│   │   ├── medicamentos/
│   │   │   └── novo/
│   │   ├── perfil/
│   │   └── saude/
│   ├── login/
│   └── page.tsx
│
└── components/
    ├── DashboardNavbar.tsx
    ├── InfoCard.tsx
    ├── MetricCard.tsx
    └── Navbar.tsx
```

## Dados demonstrativos

Neste momento, os dados exibidos nas telas são utilizados apenas para desenvolvimento e apresentação do protótipo.

Exemplos:

- frequência cardíaca;
- oxigenação;
- pressão arterial;
- medicamentos;
- consultas;
- horários;
- histórico de saúde.

Esses dados ainda não são obtidos de um banco de dados ou dispositivo real.

## Funcionalidades que ainda serão integradas

Entre as próximas etapas do projeto estão:

- autenticação real de usuários;
- integração com backend;
- integração com banco de dados;
- persistência dos registros;
- edição e exclusão de informações;
- cadastro e vínculo de pessoas idosas;
- filtros funcionais;
- gráficos alimentados por dados reais;
- lembretes e alertas;
- integração com dispositivos vestíveis.

## Próximas etapas do frontend

Antes da integração com o backend, ainda serão realizados:

- implementação de gráficos;
- revisão da responsividade;
- revisão das navegações internas;
- revisão de acessibilidade e consistência visual;
- execução do lint;
- teste de build;
- deploy da aplicação.

## Objetivo do S.A.S.P.I.

O objetivo do projeto é oferecer uma solução integrada que auxilie no acompanhamento da saúde de pessoas idosas, organizando informações importantes e facilitando o acesso por pessoas autorizadas envolvidas no acompanhamento.

---

Projeto desenvolvido como Trabalho de Conclusão de Curso em Desenvolvimento de Sistemas.