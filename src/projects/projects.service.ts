import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,
  ) {}

  create(createProjectDto: CreateProjectDto) {
    const project = this.projectRepository.create({
      name: createProjectDto.name,
      description: createProjectDto.description,
      status: createProjectDto.status,
      team: { id: createProjectDto.teamId },
    });
    return this.projectRepository.save(project);
  }

  findAll() {
    return this.projectRepository.find({ relations: ['team'] });
  }

  async findOne(id: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['team'],
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.findOne(id);
    if (updateProjectDto.teamId) {
      project.team = { id: updateProjectDto.teamId } as any;
    }
    Object.assign(project, {
      ...(updateProjectDto.name && { name: updateProjectDto.name }),
      ...(updateProjectDto.description !== undefined && { description: updateProjectDto.description }),
      ...(updateProjectDto.status && { status: updateProjectDto.status }),
    });
    return this.projectRepository.save(project);
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    return this.projectRepository.remove(project);
  }
}
