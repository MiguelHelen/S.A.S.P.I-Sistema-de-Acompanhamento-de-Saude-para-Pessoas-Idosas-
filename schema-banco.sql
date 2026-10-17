-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.clinica (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome character varying NOT NULL,
  cnpj character varying,
  telefone character varying,
  email character varying,
  endereco text,
  data_cadastro timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT clinica_pkey PRIMARY KEY (id)
);
CREATE TABLE public.usuario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE,
  nome character varying NOT NULL,
  cpf character varying UNIQUE,
  email character varying NOT NULL UNIQUE,
  telefone character varying,
  perfil USER-DEFINED NOT NULL,
  clinica_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT usuario_pkey PRIMARY KEY (id),
  CONSTRAINT usuario_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id),
  CONSTRAINT usuario_clinica_id_fkey FOREIGN KEY (clinica_id) REFERENCES public.clinica(id)
);
CREATE TABLE public.idoso (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome character varying NOT NULL,
  cpf character varying UNIQUE,
  data_nascimento date NOT NULL,
  sexo character varying,
  telefone character varying,
  endereco text,
  clinica_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT idoso_pkey PRIMARY KEY (id),
  CONSTRAINT idoso_clinica_id_fkey FOREIGN KEY (clinica_id) REFERENCES public.clinica(id)
);
CREATE TABLE public.usuario_idoso (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  idoso_id uuid NOT NULL,
  tipo_vinculo USER-DEFINED NOT NULL,
  data_vinculo timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT usuario_idoso_pkey PRIMARY KEY (id),
  CONSTRAINT usuario_idoso_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id),
  CONSTRAINT usuario_idoso_idoso_id_fkey FOREIGN KEY (idoso_id) REFERENCES public.idoso(id)
);
CREATE TABLE public.indicador_saude (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome character varying NOT NULL UNIQUE,
  unidade_padrao character varying,
  descricao text,
  CONSTRAINT indicador_saude_pkey PRIMARY KEY (id)
);
CREATE TABLE public.dispositivo_vestivel (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fabricante character varying NOT NULL DEFAULT 'Xiaomi'::character varying,
  modelo character varying,
  identificador_dispositivo character varying UNIQUE,
  status character varying NOT NULL DEFAULT 'ATIVO'::character varying,
  idoso_id uuid NOT NULL,
  data_vinculacao timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT dispositivo_vestivel_pkey PRIMARY KEY (id),
  CONSTRAINT dispositivo_vestivel_idoso_id_fkey FOREIGN KEY (idoso_id) REFERENCES public.idoso(id)
);
CREATE TABLE public.registro_saude (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  idoso_id uuid NOT NULL,
  indicador_id uuid NOT NULL,
  valor_numerico numeric,
  valor_categorico character varying,
  data_hora timestamp with time zone NOT NULL DEFAULT now(),
  origem USER-DEFINED NOT NULL,
  usuario_id uuid,
  dispositivo_id uuid,
  CONSTRAINT registro_saude_pkey PRIMARY KEY (id),
  CONSTRAINT registro_saude_idoso_id_fkey FOREIGN KEY (idoso_id) REFERENCES public.idoso(id),
  CONSTRAINT registro_saude_indicador_id_fkey FOREIGN KEY (indicador_id) REFERENCES public.indicador_saude(id),
  CONSTRAINT registro_saude_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id),
  CONSTRAINT registro_saude_dispositivo_id_fkey FOREIGN KEY (dispositivo_id) REFERENCES public.dispositivo_vestivel(id)
);
CREATE TABLE public.medicamento (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome character varying NOT NULL,
  descricao text,
  CONSTRAINT medicamento_pkey PRIMARY KEY (id)
);
CREATE TABLE public.prescricao (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  idoso_id uuid NOT NULL,
  medicamento_id uuid NOT NULL,
  usuario_id uuid NOT NULL,
  dosagem character varying,
  frequencia character varying,
  data_inicio date NOT NULL DEFAULT CURRENT_DATE,
  data_fim date,
  status USER-DEFINED NOT NULL DEFAULT 'ATIVA'::status_prescricao,
  CONSTRAINT prescricao_pkey PRIMARY KEY (id),
  CONSTRAINT prescricao_idoso_id_fkey FOREIGN KEY (idoso_id) REFERENCES public.idoso(id),
  CONSTRAINT prescricao_medicamento_id_fkey FOREIGN KEY (medicamento_id) REFERENCES public.medicamento(id),
  CONSTRAINT prescricao_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id)
);