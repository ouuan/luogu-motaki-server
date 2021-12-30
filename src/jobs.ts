import { randomUUID } from 'crypto';
import sleep from 'sleep-promise';
import Board from './board';
import {
  GET_BOARD_INTERVAL, HEIGHT, TIMELIMIT, WIDTH,
} from './constants';
import { Job, JobStatus, Paint } from './types';
import User from './user';

export default class Jobs {
  job = Array.from(Array(WIDTH), () => Array<Job|null>(HEIGHT).fill(null));

  ip = new WeakMap<Job, string>();

  painted = new WeakSet<Job>();

  paintedCallback = new WeakMap<Job, Function>();

  reported = new WeakSet<Job>();

  board: Board | null = null;

  constructor(public users: Map<string, User>) {}

  setBoard(board: Board) {
    this.board = board;
  }

  removeJob(x: number, y: number, uuid: string) {
    if (this.job[x][y]?.uuid === uuid) {
      this.job[x][y] = null;
    }
  }

  markPainted({ x, y, col }: Paint) {
    const job = this.job[x][y];
    if (job === null) return;
    if (col !== job.col) return;
    if (this.paintedCallback.has(job)) {
      const cb = this.paintedCallback.get(job);
      if (cb) cb();
    } else {
      this.painted.add(job);
    }
  }

  private async internalReport(
    ip: string,
    x: number,
    y: number,
    uuid: string,
    success: boolean,
  ): Promise<JobStatus> {
    const job = this.job[x]?.[y];

    if (job?.uuid !== uuid) return 'error';

    if (this.ip.get(job) !== ip) return 'error';

    if (this.reported.has(job)) return 'error';
    this.reported.add(job);

    if (!success) return 'failed';

    if (this.painted.has(job)) {
      return 'success';
    }

    const waitPainted = new Promise<'success'>((resolve) => {
      this.paintedCallback.set(job, () => {
        resolve('success');
      });
    });

    async function waitTimeout(): Promise<'unverified'> {
      await sleep(GET_BOARD_INTERVAL);
      return 'unverified';
    }

    return Promise.any([waitPainted, waitTimeout()]);
  }

  async report(
    ip: string,
    x: number,
    y: number,
    uuid: string,
    success: boolean,
  ): Promise<JobStatus> {
    const status = await this.internalReport(ip, x, y, uuid, success);

    this.removeJob(x, y, uuid);

    if (!this.users.has(ip)) this.users.set(ip, new User());
    this.users.get(ip)?.update(status);

    if (status !== 'success') {
      const { board } = this;
      if (board && board.board[x]?.[y] !== board.planCol[x]?.[y]) {
        if (board.avlNode[x][y] === null) board.insertAvl(x, y);
      }
    }

    return status;
  }

  createJob(x: number, y: number, col: number, ip: string): Job | null {
    if (this.job[x][y]) return null;

    const job = {
      x,
      y,
      col,
      status: 'success',
      uuid: randomUUID(),
      timeLimit: new Date().valueOf() + TIMELIMIT,
    } as const;

    this.job[x][y] = job;
    this.ip.set(job, ip);

    setTimeout(() => {
      if (this.job[x][y] === job) {
        if (!this.users.has(ip)) this.users.set(ip, new User());
        this.users.get(ip)?.update('error');
        this.removeJob(x, y, job.uuid);
      }
    }, TIMELIMIT);

    return job;
  }
}
