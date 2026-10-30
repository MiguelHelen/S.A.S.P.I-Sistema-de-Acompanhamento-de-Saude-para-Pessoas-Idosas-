import {
  Injectable,
  BadRequestException,
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

    // Apenas o próprio usuário pode mudar sua foto, a menos que seja ADMIN
    if (usuarioLogado.id !== usuarioIdDestino && usuarioLogado.perfil !== 'ADMINISTRADOR') {
      throw new BadRequestException('Você só pode alterar sua própria foto de perfil.');
    }

    const extensao = file.originalname.split('.').pop()?.toLowerCase();
    const mimeTypesPermitidos = ['image/jpeg', 'image/png', 'image/webp'];

    if (!mimeTypesPermitidos.includes(file.mimetype)) {
      throw new BadRequestException(
        'Formato de arquivo inválido. Apenas JPG, PNG e WEBP são permitidos.',
      );
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new BadRequestException('A imagem excede o tamanho máximo de 5MB.');
    }

    // Gerar nome único para o arquivo (IdDoUsuario + timestamp)
    const fileName = `${usuarioIdDestino}-${Date.now()}.${extensao}`;

    // Upload para o Supabase
    const { data, error } = await this.supabase.client.storage
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

    // Pegar URL pública
    const { data: urlData } = this.supabase.client.storage
      .from('fotos-perfil')
      .getPublicUrl(fileName);

    // Atualizar no banco de dados (Prisma)
    await this.prisma.usuario.update({
      where: { id: usuarioIdDestino },
      data: { foto_url: urlData.publicUrl },
    });

    return {
      message: 'Foto de perfil atualizada com sucesso',
      url: urlData.publicUrl,
    };
  }
}