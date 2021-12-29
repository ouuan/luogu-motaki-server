import { shuffle } from 'fast-shuffle';
import { queue as asyncQueue } from 'async';
import { FastifyRequest } from 'fastify';
import Board from './board';
import { Job } from './types';

async function createJob(
  { board, name, ip }: {
    board: Board,
    name: string,
    ip: string
  },
): Promise<Job | null> {
  const node = board.avl[name]?.max();
  if (!node) return null;

  board.avl[name].remove(node);
  const col = board.planCol[node.x][node.y];
  if (typeof col === 'number') {
    return board.jobs.createJob(node.x, node.y, col, ip);
  }
  return null;
}

const createJobQueue = asyncQueue(createJob);

export default async function newJob(board: Board, req: FastifyRequest) {
  const { ip, params } = req;

  const blockedUntil = board.jobs.users.get(ip)?.blockedUntil;
  if (blockedUntil && blockedUntil > new Date().valueOf()) {
    return {
      status: 'blocked',
      blockedUntil,
    };
  }

  const { paramNames } = params as any;
  const names = Array.isArray(paramNames) ? paramNames : shuffle(Object.keys(board.avl));

  for (const name of names) {
    if (typeof name === 'string') {
      if (board.avl[name] === undefined) {
        return {
          status: 'not-found',
          validNames: Object.keys(board.avl),
        };
      }
      // eslint-disable-next-line no-await-in-loop
      const job = await createJobQueue.pushAsync({ board, name, ip });
      if (job) {
        return job;
      }
    }
  }

  return { status: 'finished' };
}
