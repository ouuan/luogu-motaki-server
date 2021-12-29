import { WebSocket } from 'ws';
import Board from './board';
import { WS_URL } from './constants';

export default function connectWs(board: Board) {
  const ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    ws.send({
      type: 'join_channel',
      channel: 'paintboard',
    });
  });

  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.type === 'paintboard_update') {
      const { x, y, col } = msg;
      board.paint({ x, y, col });
    }
  });
}
