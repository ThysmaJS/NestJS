export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DRAFT = 'draft',
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
}
