import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DispositivoVestivelService {
  constructor(private prisma: PrismaService) {}

  create(data: {
    fabricante?: string;
    modelo?: string;
    identificador_dispositivo?: string;
    idoso_id: string;
  }) {
    return this.prisma.dispositivo_vestivel.create({ data });
  }

  findAll() {
    return this.prisma.dispositivo_vestivel.findMany();
  }

  findByIdoso(idosoId: string) {
    return this.prisma.dispositivo_vestivel.findMany({
      where: { idoso_id: idosoId },
    });
  }
}