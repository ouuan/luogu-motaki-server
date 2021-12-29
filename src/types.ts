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
  col: number;
}

export interface Job extends Paint {
  status: 'success';
  uuid: string;
  timeLimit: number;
}

export type JobStatus = 'success' | 'failed' | 'unverified' | 'error';
