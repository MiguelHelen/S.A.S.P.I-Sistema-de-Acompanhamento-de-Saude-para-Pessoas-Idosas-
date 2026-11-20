import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StorageService {
  constructor(
    private supabase: SupabaseService,
    private prisma: PrismaService,
  ) {}

  private validarArquivoImagem(file: Express.Multer.File) {
    const mimeTypesPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!mimeTypesPermitidos.includes(file.mimetype)) {
      throw new BadRequestException(
        'Formato de arquivo inválido. Apenas JPG, PNG e WEBP são permitidos.',
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('A imagem excede o tamanho máximo de 5MB.');
    }
  }

  async uploadFotoPerfilUsuario(
    file: Express.Multer.File,
    authId: string,
    usuarioIdDestino: string,
  ) {
    const usuarioLogado = await this.prisma.usuario.findUnique({
      where: { auth_id: authId },
    });

    if (!usuarioLogado) {
      throw new BadRequestException('Usuário logado não encontrado.');
    }

    if (usuarioLogado.id !== usuarioIdDestino && usuarioLogado.perfil !== 'ADMINISTRADOR') {
      throw new BadRequestException('Você só pode alterar sua própria foto de perfil.');
    }

    this.validarArquivoImagem(file);

    const extensao = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${usuarioIdDestino}-${Date.now()}.${extensao}`;

    const { error } = await this.supabase.client.storage
      .from('fotos-perfil')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Falha ao enviar arquivo para o Supabase: ${error.message}`,
      );
    }

    const { data: urlData } = this.supabase.client.storage
      .from('fotos-perfil')
      .getPublicUrl(fileName);

    await this.prisma.usuario.update({
      where: { id: usuarioIdDestino },
      data: { foto_url: urlData.publicUrl },
    });

    return {
      message: 'Foto de perfil atualizada com sucesso',
      url: urlData.publicUrl,
    };
  }

  async uploadFotoIdoso(
    file: Express.Multer.File,
    authId: string,
    idosoId: string,
  ) {
    const usuarioLogado = await this.prisma.usuario.findUnique({
      where: { auth_id: authId },
    });

    if (!usuarioLogado || usuarioLogado.perfil !== 'ADMINISTRADOR') {
      throw new ForbiddenException(
        'Apenas Administradores podem alterar a foto cadastral do paciente.',
      );
    }

    const idoso = await this.prisma.idoso.findUnique({ where: { id: idosoId } });
    if (!idoso) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    this.validarArquivoImagem(file);

    const extensao = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `idoso-${idosoId}-${Date.now()}.${extensao}`;

    const { error } = await this.supabase.client.storage
      .from('fotos-perfil')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Falha ao enviar arquivo para o Supabase: ${error.message}`,
      );
    }

    const { data: urlData } = this.supabase.client.storage
      .from('fotos-perfil')
      .getPublicUrl(fileName);

    await this.prisma.idoso.update({
      where: { id: idosoId },
      data: { foto_url: urlData.publicUrl },
    });

    return {
      message: 'Foto do paciente atualizada com sucesso',
      url: urlData.publicUrl,
    };
  }
}