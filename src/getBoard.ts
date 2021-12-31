import axios from 'axios';
import Board from './board';
import { HEIGHT, PAINTBOARD_URL, WIDTH } from './constants';

export default async function getBoard(board: Board) {
  const res = await axios.get(`${process.env.LUOGU_MOTAKI_PAINTBOARD_URL || PAINTBOARD_URL}/board`);
  if (res.status === 200) {
    const lines = res.data.toString().split('\n');
    const newBoard = Array.from(Array(WIDTH), () => Array(HEIGHT));
    for (let x = 0; x < WIDTH; x += 1) {
      for (let y = 0; y < HEIGHT; y += 1) {
        newBoard[x][y] = parseInt(lines[x][y], 32);
      }
    }
    board.set(newBoard);
  }
}
