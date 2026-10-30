import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('storage')
@UseGuards(AuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('usuario/:id/foto-perfil')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFotoPerfil(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') usuarioId: string,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado na requisição (campo "file").');
    }
    
    return this.storageService.uploadFotoPerfilUsuario(file, req.user.id, usuarioId);
  }
}