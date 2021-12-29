import axios from 'axios';
import Board from './board';
import { HEIGHT, PAINTBOARD_URL, WIDTH } from './constants';

export default async function getBoard(board: Board) {
  const res = await axios.get(`${PAINTBOARD_URL}/board`);
  if (res.status === 200) {
    const lines = (res.data as string).split('\n');
    const newBoard = Array.from(Array(HEIGHT), () => Array(WIDTH));
    for (let x = 0; x < WIDTH; x += 1) {
      for (let y = 0; y < HEIGHT; y += 1) {
        newBoard[x][y] = parseInt(lines[x][y], 32);
      }
    }
    board.set(newBoard);
  }
}
