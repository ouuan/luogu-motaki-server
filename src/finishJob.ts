import { FastifyRequest, FastifyReply } from 'fastify';
import Jobs from './jobs';

export default async function finishJob(jobs: Jobs, req: FastifyRequest, rep: FastifyReply) {
  const { ip, body } = req;
  const {
    x, y, uuid, success,
  } = body as any;

  if (typeof x === 'number' && typeof y === 'number' && typeof uuid === 'string' && typeof success === 'boolean') {
    const status = await jobs.report(ip, x, y, uuid, success);
    const blockedUntil = jobs.users.get(ip)?.blockedUntil;
    return { status, blockedUntil };
  }
  rep.code(400);
  return 'Invalid Request';
}
