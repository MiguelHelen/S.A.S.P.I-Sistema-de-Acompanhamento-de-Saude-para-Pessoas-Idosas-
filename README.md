# S.A.S.P.I.

**Sistema de Acompanhamento de Saúde para Pessoas Idosas**

O S.A.S.P.I. é uma solução digital voltada ao acompanhamento e à organização de informações relacionadas à saúde de pessoas idosas.

A proposta do sistema é centralizar registros de saúde, medicamentos, consultas, histórico e outros dados importantes em um único ambiente, facilitando o acompanhamento da rotina da pessoa idosa.

## Estado atual do projeto

O projeto está na etapa de desenvolvimento dos frontends web e mobile.

As principais telas do sistema já estão sendo desenvolvidas e, por enquanto, utilizam dados demonstrativos para representar o funcionamento da aplicação.

A integração com backend, banco de dados e dispositivos vestíveis será realizada posteriormente.

## Funcionalidades desenvolvidas

Atualmente, o projeto contempla telas e funcionalidades como:

- Página inicial;
- Login;
- Cadastro;
- Dashboard;
- Minha Saúde;
- Histórico de saúde;
- Cadastro de registros de saúde;
- Medicamentos;
- Cadastro de medicamentos;
- Consultas e exames;
- Cadastro de consultas;
- Perfil do usuário;
- Acessibilidade;
- Navegação entre telas;
- Layout responsivo para o frontend web;
- Telas de acompanhamento para o aplicativo mobile.

## Tecnologias utilizadas

### Frontend Web

- Next.js;
- React;
- TypeScript;
- Tailwind CSS;
- Lucide React.

### Aplicativo Mobile

- Kotlin;
- Jetpack Compose;
- Android SDK;
- Gradle.

## Executando o projeto Web

### 1. Instale as dependências

Abra o terminal na pasta do projeto web e execute:

```bash
npm install
```

### 2. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

### 3. Acesse o projeto

Abra o navegador e acesse:

[http://localhost:3001](http://localhost:3001)

## Executando o aplicativo Android pelo VS Code

Para executar o aplicativo mobile, é necessário ter instalado:

- Visual Studio Code;
- JDK compatível com a versão do projeto;
- Android SDK;
- Gradle Wrapper, disponibilizado pelo projeto;
- Um emulador Android configurado ou um celular Android com a depuração USB ativada.

### 1. Abra o projeto

Abra a pasta principal do projeto Android no VS Code.

### 2. Verifique a conexão do dispositivo

Caso utilize um celular, conecte-o ao computador por USB e verifique se a depuração USB está ativada.

No terminal do VS Code, execute:

```bash
adb devices
```

O dispositivo deverá aparecer na lista.

Caso utilize um emulador, inicie-o antes de executar os próximos comandos.

### 3. Compile o aplicativo

No terminal, na pasta onde está localizado o arquivo `gradlew`, execute:

**Windows:**

```powershell
.\gradlew assembleDebug
```

Esse comando verifica a compilação do aplicativo e gera o arquivo APK.

### 4. Instale e execute o aplicativo

Com o celular ou emulador conectado, execute:

```powershell
.\gradlew installDebug
```

O Gradle instalará o aplicativo no dispositivo selecionado.

### 5. Localização do APK

Após a compilação, o arquivo APK estará disponível em:

```text
app/build/outputs/apk/debug/app-debug.apk
```

Esse arquivo pode ser utilizado para instalar a versão de desenvolvimento em um dispositivo Android compatível.

## Rotas para testes do frontend web

Com o servidor em execução, utilize os links abaixo para acessar diretamente cada tela.

| Página | Rota |
| --- | --- |
| Home | [Abrir](http://localhost:3001/) |
| Login | [Abrir](http://localhost:3001/login) |
| Cadastro | [Abrir](http://localhost:3001/cadastro) |
| Dashboard | [Abrir](http://localhost:3001/dashboard) |
| Minha Saúde | [Abrir](http://localhost:3001/dashboard/saude) |
| Medicamentos | [Abrir](http://localhost:3001/dashboard/medicamentos) |
| Novo medicamento | [Abrir](http://localhost:3001/dashboard/medicamentos/novo) |
| Consultas | [Abrir](http://localhost:3001/dashboard/consultas) |
| Nova consulta | [Abrir](http://localhost:3001/dashboard/consultas/nova) |
| Histórico | [Abrir](http://localhost:3001/dashboard/historico) |
| Novo registro | [Abrir](http://localhost:3001/dashboard/historico/novo) |
| Perfil | [Abrir](http://localhost:3001/dashboard/perfil) |

## Estrutura atual do frontend web

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

- Frequência cardíaca;
- Oxigenação;
- Pressão arterial;
- Medicamentos;
- Consultas;
- Horários;
- Histórico de saúde.

Esses dados ainda não são obtidos de um banco de dados ou dispositivo real.

## Funcionalidades que ainda serão integradas

Entre as próximas etapas do projeto estão:

- Autenticação real de usuários;
- Integração com backend;
- Integração com banco de dados;
- Persistência dos registros;
- Edição e exclusão de informações;
- Cadastro e vínculo de pessoas idosas;
- Filtros funcionais;
- Gráficos alimentados por dados reais;
- Lembretes e alertas;
- Integração com dispositivos vestíveis.

## Próximas etapas

- Finalização das telas do aplicativo mobile;
- Implementação de gráficos;
- Revisão da responsividade;
- Revisão das navegações internas;
- Revisão de acessibilidade e consistência visual;
- Execução do lint;
- Testes de compilação e funcionamento;
- Integração entre frontend, backend e banco de dados;
- Deploy da aplicação web.

## Objetivo do S.A.S.P.I.

O objetivo do projeto é oferecer uma solução integrada que auxilie no acompanhamento da saúde de pessoas idosas, organizando informações importantes e facilitando o acesso por pessoas autorizadas envolvidas no acompanhamento.

---

Projeto desenvolvido como Trabalho de Conclusão de Curso em Desenvolvimento de Sistemas.
