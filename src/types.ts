export interface Task {
  x: number;
  y: number;
  data: string;
}

export interface Plan {
  [name: string]: Task;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface Paint extends Coordinate {
  color: number;
}

export interface Job extends Paint {
  status: 'success';
  uuid: string;
  timeLimit: number;
}

export type JobStatus = 'success' | 'failed' | 'unverified' | 'error';

export interface Progress {
  finished: number;
  total: number;
}

export interface TotalProgress {
  time: string;
  total: Progress;
  tasks: {
    [name: string]: Progress;
  }
}

export interface Count {
  self: number;
  others: number;
}

export interface TotalCount {
  time: string;
  total: Count;
  tasks: {
    [name: string]: Count;
  }
}
