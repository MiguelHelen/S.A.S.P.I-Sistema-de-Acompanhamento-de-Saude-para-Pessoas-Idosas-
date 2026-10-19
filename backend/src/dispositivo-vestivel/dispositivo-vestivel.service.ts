import {
  Injectable,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PERFIS_QUE_PAREIAM = ['MEDICO', 'ENFERMEIRO', 'CUIDADOR'];

@Injectable()
export class DispositivoVestivelService {
  constructor(private prisma: PrismaService) {}

  private async obterUsuario(authId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { auth_id: authId },
    });
    if (!usuario) throw new ForbiddenException('Usuario invalido.');
    return usuario;
  }

  private async validarAcesso(
    idosoId: string,
    authId: string,
    operacao: 'leitura' | 'escrita',
  ) {
    const usuario = await this.obterUsuario(authId);

    if (usuario.perfil === 'ADMINISTRADOR') {
      if (operacao === 'escrita') {
        throw new ForbiddenException(
          'Administradores nao podem parear dispositivos.',
        );
      }
      const idoso = await this.prisma.idoso.findUnique({
        where: { id: idosoId },
        select: { clinica_id: true },
      });
      if (!idoso) throw new NotFoundException('Paciente nao encontrado.');
      if (idoso.clinica_id !== usuario.clinica_id) {
        throw new ForbiddenException('Paciente de outra clinica.');
      }
      return usuario;
    }

    const vinculo = await this.prisma.usuario_idoso.findFirst({
      where: { usuario_id: usuario.id, idoso_id: idosoId },
    });
    if (!vinculo) {
      throw new ForbiddenException(
        'Acesso negado: voce nao tem vinculo com este paciente.',
      );
    }

    if (operacao === 'escrita' && !PERFIS_QUE_PAREIAM.includes(usuario.perfil)) {
      throw new ForbiddenException(
        'Apenas medicos, enfermeiros e cuidadores podem parear dispositivos.',
      );
    }

    return usuario;
  }

  async create(
    data: {
      fabricante?: string;
      modelo?: string;
      identificador_dispositivo?: string;
      idoso_id: string;
    },
    authId: string,
  ) {
    await this.validarAcesso(data.idoso_id, authId, 'escrita');

    if (data.identificador_dispositivo) {
      const existente = await this.prisma.dispositivo_vestivel.findUnique({
        where: { identificador_dispositivo: data.identificador_dispositivo },
      });
      if (existente) {
        throw new ConflictException('Este dispositivo ja esta cadastrado.');
      }
    }

    return this.prisma.dispositivo_vestivel.create({ data });
  }

  async findAll(authId: string) {
    const usuario = await this.obterUsuario(authId);

    if (usuario.perfil === 'ADMINISTRADOR') {
      return this.prisma.dispositivo_vestivel.findMany({
        where: { idoso: { clinica_id: usuario.clinica_id } },
      });
    }

    const vinculos = await this.prisma.usuario_idoso.findMany({
      where: { usuario_id: usuario.id },
      select: { idoso_id: true },
    });

    return this.prisma.dispositivo_vestivel.findMany({
      where: { idoso_id: { in: vinculos.map((v) => v.idoso_id) } },
    });
  }

  async findByIdoso(idosoId: string, authId: string) {
    await this.validarAcesso(idosoId, authId, 'leitura');
    return this.prisma.dispositivo_vestivel.findMany({
      where: { idoso_id: idosoId },
    });
  }
}