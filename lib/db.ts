import Dexie, { Table } from 'dexie';

export interface LocalTask {
  id?: string;
  remoteId?: string; // ID asignado por Supabase
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  estimatedPomodoros: number;
  completedPomodoros: number;
  pomodoroDurationMin: number;
  breakDurationMin: number;
  pointsPerPomodoro: number;
  isSyncing: boolean; // Flag para sync offline
  updatedAt: string;
}

export interface OfflineQueueItem {
  id?: number;
  action: 'COMPLETE_POMODORO' | 'CREATE_TASK' | 'REDEEM_REWARD';
  payload: any;
  createdAt: string;
}

export class ADHDAppDatabase extends Dexie {
  tasks!: Table<LocalTask>;
  offlineQueue!: Table<OfflineQueueItem>;

  constructor() {
    super('ADHDAppDatabase');
    this.version(1).stores({
      tasks: '++id, remoteId, status, isSyncing',
      offlineQueue: '++id, action, createdAt'
    });
  }
}

export const db = new ADHDAppDatabase();