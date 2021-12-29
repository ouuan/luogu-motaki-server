import { queue as asyncQueue } from 'async';
import AVLTree from 'avl';
import { HEIGHT, PAINT_LOG_QUEUE_LENGTH, WIDTH } from './constants';
import Jobs from './jobs';
import { Coordinate, Paint, Plan } from './types';

interface Node extends Coordinate {
  cnt: number;
}

export default class Board {
  board = Array.from(Array(WIDTH), () => Array<number>(HEIGHT));

  paintCnt = Array.from(Array(WIDTH), () => Array<number>(HEIGHT).fill(0));

  paintLogQueue = Array.from(Array(PAINT_LOG_QUEUE_LENGTH), () => ({ x: -1, y: -1 } as Coordinate));

  paintLogIndex = 0;

  paintQueue = asyncQueue(async (p: Paint) => { this.doPaint(p); });

  avl: { [name: string]: AVLTree<Node, null> } = {};

  taskName = Array.from(Array(WIDTH), () => Array<string|null>(HEIGHT).fill(null));

  planCol = Array.from(Array(WIDTH), () => Array<number|null>(HEIGHT).fill(null));

  constructor(plan: Plan, public jobs: Jobs) {
    Object.entries(plan).forEach(([name, task]) => {
      this.avl[name] = new AVLTree<Node, null>((lhs, rhs) => {
        if (lhs.cnt !== rhs.cnt) return lhs.cnt - rhs.cnt;
        if (lhs.x !== rhs.x) return lhs.x - rhs.x;
        return lhs.y - rhs.y;
      });
      const lines = task.data.split('\n');
      for (let dx = 0; dx < lines.length; dx += 1) {
        for (let dy = 0; dy < lines[dx].length; dy += 1) {
          const x = task.x + dx;
          const y = task.y + dy;
          if (this.taskName[x][y] !== null) {
            throw Error(`Error: Task [${this.taskName[x][y]}] and [${name}] have overlap!`);
          }
          this.taskName[x][y] = name;
          this.planCol[x][y] = parseInt(lines[dx][dy], 32);
          this.avl[name].insert({ x, y, cnt: 0 });
        }
      }
    });
  }

  private updateCnt(x: number, y: number, newCnt: number) {
    const name = this.taskName[x][y];
    if (name) {
      if (this.avl[name].remove({ x, y, cnt: this.paintCnt[x][y] })) {
        this.avl[name].insert({ x, y, cnt: newCnt });
      }
    }
    this.paintCnt[x][y] = newCnt;
  }

  private doPaint({ x, y, col }: Paint) {
    this.board[x][y] = col;

    const { x: oldX, y: oldY } = this.paintLogQueue[this.paintLogIndex];
    if (oldX !== -1) {
      this.updateCnt(oldX, oldY, this.paintCnt[oldX][oldY] - 1);
    }
    this.updateCnt(x, y, this.paintCnt[x][y] + 1);
    this.paintLogQueue[this.paintLogIndex] = { x, y };
    this.paintLogIndex = (this.paintLogIndex + 1) % PAINT_LOG_QUEUE_LENGTH;

    if (this.planCol[x][y] === col) {
      this.jobs.markPainted({ x, y, col });
    } else {
      const name = this.taskName[x][y];
      const node: Node = { x, y, cnt: this.paintCnt[x][y] };
      if (name && !this.avl[name].contains(node) && this.jobs.job[x][y] === null) {
        this.avl[name].insert(node);
      }
    }
  }

  paint(p: Paint) {
    this.paintQueue.push(p);
  }

  set(board: number[][]) {
    this.paintQueue.remove(() => true);
    for (let x = 0; x < WIDTH; x += 1) {
      for (let y = 0; y < HEIGHT; y += 1) {
        if (this.board[x][y] !== board[x][y]) {
          this.paint({ x, y, col: board[x][y] });
        }
      }
    }
  }
}
