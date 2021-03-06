import Fastify from 'fastify';
import { readFile } from 'fs/promises';
import { Plan } from './types';
import newJob from './newJob';
import Board from './board';
import connectWs from './connectWs';
import getBoard from './getBoard';
import { GET_BOARD_INTERVAL } from './constants';
import Jobs from './jobs';
import User from './user';
import finishJob from './finishJob';
import progress from './progress';
import count from './count';

readFile('motaki-plan.json').then((buffer) => {
  const plan: Plan = JSON.parse(buffer.toString());

  const server = Fastify({
    logger: {
      file: 'server.log',
      serializers: {
        req(request) {
          return {
            method: request.method,
            path: request.routerPath,
            parameters: request.params,
            ip: request.ip,
          };
        },
      },
    },
    trustProxy: true,
  });

  const users = new Map<string, User>();

  const jobs = new Jobs(users);

  const board = new Board(plan, jobs);
  jobs.setBoard(board);

  getBoard(board, server.log);
  setInterval(() => getBoard(board, server.log), GET_BOARD_INTERVAL);

  connectWs(board, server.log);

  server.post('/job/new', (req) => newJob(board, req));
  server.post('/job/finish', (req, rep) => finishJob(jobs, req, rep));
  server.get('/plan', async (_, rep) => rep.header('Access-Control-Allow-Origin', '*').send(plan));
  server.get('/progress', (req) => progress(req, board));
  server.get('/count', (req) => count(req, board));

  server.listen(process.env.LUOGU_MOTAKI_SERVER_PORT || 15762, '0.0.0.0');
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to open motaki-plan.json');
  // eslint-disable-next-line no-console
  console.error(err);
});
