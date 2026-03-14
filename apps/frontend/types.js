
export enum CRStatus {
  PENDING = 'Pending',
  REVIEWING = 'Reviewing',
  PROPOSED = 'Proposed',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  COMPLETED = 'Completed'
}

export enum KanbanColumn {
  BACKLOG = 'Backlog',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done'
}

export interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  startDate: string;
  manager: string;
}

export interface DocumentRecord {
  id: string;
  projectName: string;
  title: 'PRD' | 'CR';
  version: string;
  startDate: string;
}

export interface ChangeRequest {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  status: CRStatus;
  budget?: number;
  timeline?: string;
  createdAt: string;
}

export interface KanbanTask {
  id: string;
  crId: string;
  title: string;
  column: KanbanColumn;
  priority: 'Low' | 'Medium' | 'High';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isNew: boolean;
}
