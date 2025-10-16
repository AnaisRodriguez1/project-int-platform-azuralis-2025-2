import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareTeamMember } from '../entities/care-team-member.entity';

@Injectable()
export class CareTeamService {
  constructor(
    @InjectRepository(CareTeamMember)
    private careTeamRepo: Repository<CareTeamMember>,
  ) {}

  async addMember(data: Partial<CareTeamMember>) {
    const member = this.careTeamRepo.create(data);
    return this.careTeamRepo.save(member);
  }

  async findAll() {
    return this.careTeamRepo.find({ relations: ['patient'] });
  }

  async findByPatient(patientId: string) {
    return this.careTeamRepo.find({
      where: { patient: { id: patientId } },
      relations: ['patient'],
    });
  }

  async update(id: string, data: Partial<CareTeamMember>) {
    const member = await this.careTeamRepo.findOne({ where: { id } });
    if (!member) return { message: 'Miembro no encontrado' };

    Object.assign(member, data);
    return this.careTeamRepo.save(member);
  }

  async remove(id: string) {
    const member = await this.careTeamRepo.findOne({ where: { id } });
    if (!member) return { message: 'Miembro no encontrado' };

    await this.careTeamRepo.remove(member);
    return { message: 'Miembro eliminado correctamente' };
  }
}
