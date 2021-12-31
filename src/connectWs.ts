import { FastifyLoggerInstance } from 'fastify';
import { WebSocket } from 'ws';
import Board from './board';
import { WS_TIMEOUT, WS_URL } from './constants';

export default function connectWs(board: Board, logger: FastifyLoggerInstance) {
  const ws = new WebSocket(process.env.LUOGU_MOTAKI_WS_URL || WS_URL);
  const waitForStarted = setTimeout(() => ws.terminate(), WS_TIMEOUT);

  ws.on('open', () => {
    clearTimeout(waitForStarted);
    ws.send(JSON.stringify({
      type: 'join_channel',
      channel: 'paintboard',
    }));
  });

  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.type === 'paintboard_update') {
      const { x, y, col } = msg;
      board.paint({ x, y, col });
    }
  });

  ws.on('close', () => {
    clearTimeout(waitForStarted);
    logger.error(`WebSocket connection closed. Reconnecting in ${WS_TIMEOUT / 1000} seconds...`);
    setTimeout(() => connectWs(board, logger), WS_TIMEOUT);
  });

  ws.on('error', (err) => logger.error(`WebSocket Error: ${err}`));
}
