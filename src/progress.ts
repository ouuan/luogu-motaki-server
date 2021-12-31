import { FastifyRequest } from 'fastify';
import Board from './board';
import { HEIGHT, PROGRESS_INTERVAL, WIDTH } from './constants';
import { TotalProgress } from './types';
import User from './user';

export default async function progress(req: FastifyRequest, board: Board) {
  const { ip } = req;
  const { users } = board.jobs;
  if (!users.has(ip)) users.set(ip, new User());
  const user = users.get(ip);
  if (user) {
    const now = new Date().valueOf();
    if (now - user.lastProgress < PROGRESS_INTERVAL) {
      return 'You are querying the progress too frequently!';
    }
    user.lastProgress = now;
  }

  const result: TotalProgress = {
    time: new Date().toISOString(),
    total: {
      finished: 0,
      total: 0,
    },
    tasks: {},
  };

  const taskNames = Object.keys(board.avl);
  taskNames.forEach((name) => {
    result.tasks[name] = {
      finished: 0,
      total: 0,
    };
  });

  for (let x = 0; x < WIDTH; x += 1) {
    for (let y = 0; y < HEIGHT; y += 1) {
      const name = board.taskName[x][y];
      if (name) {
        result.tasks[name].total += 1;
        result.total.total += 1;
        if (board.board[x][y] === board.planCol[x][y]) {
          result.tasks[name].finished += 1;
          result.total.finished += 1;
        }
      }
    }
  }

  return result;
}
