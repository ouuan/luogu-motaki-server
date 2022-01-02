import { FastifyRequest } from 'fastify';
import Board from './board';
import { COUNT_INTERVAL, HEIGHT, WIDTH } from './constants';
import { TotalCount } from './types';
import User from './user';

export default async function count(req: FastifyRequest, board: Board): Promise<string|TotalCount> {
  const { ip } = req;
  const { users } = board.jobs;
  if (!users.has(ip)) users.set(ip, new User());
  const user = users.get(ip);
  if (user) {
    const now = new Date().valueOf();
    if (now - user.lastProgress < COUNT_INTERVAL) {
      return 'You are querying the count too frequently!';
    }
    user.lastProgress = now;
  }

  const result: TotalCount = {
    time: new Date().toISOString(),
    total: {
      self: 0,
      others: 0,
    },
    tasks: {},
  };

  const taskNames = Object.keys(board.avl);
  taskNames.forEach((name) => {
    result.tasks[name] = {
      self: 0,
      others: 0,
    };
  });

  for (let x = 0; x < WIDTH; x += 1) {
    for (let y = 0; y < HEIGHT; y += 1) {
      const name = board.taskName[x][y];
      if (name) {
        const self = board.jobs.selfPaintCnt[x][y];
        const others = board.paintCnt[x][y] - self;
        result.tasks[name].self += self;
        result.total.self += self;
        result.tasks[name].others += others;
        result.total.others += others;
      }
    }
  }

  return result;
}
