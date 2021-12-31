import { queue as asyncQueue } from 'async';
import AVLTree from 'avl';
import { HEIGHT, PAINT_LOG_QUEUE_LENGTH, WIDTH } from './constants';
import Jobs from './jobs';
import { Coordinate, Paint, Plan } from './types';

interface Node extends Coordinate {
  cnt: number;
  random: number;
}

export default class Board {
  board = Array.from(Array(WIDTH), () => Array<number>(HEIGHT));

  paintCnt = Array.from(Array(WIDTH), () => Array<number>(HEIGHT).fill(0));

  paintLogQueue = Array.from(Array(PAINT_LOG_QUEUE_LENGTH), () => ({ x: -1, y: -1 } as Coordinate));

  paintLogIndex = 0;

  paintQueue = asyncQueue(async (p: Paint) => { this.doPaint(p); });

  avl: { [name: string]: AVLTree<Node, null> } = {};

  avlNode = Array.from(Array(WIDTH), () => Array<Node|null>(HEIGHT).fill(null));

  taskName = Array.from(Array(WIDTH), () => Array<string|null>(HEIGHT).fill(null));

  planCol = Array.from(Array(WIDTH), () => Array<number|null>(HEIGHT).fill(null));

  insertAvl(x: number, y: number) {
    const name = this.taskName[x][y];
    if (!name) return;
    const node = {
      x,
      y,
      random: Math.random(),
      cnt: this.paintCnt[x][y],
    };
    this.avlNode[x][y] = node;
    this.avl[name].insert(node);
  }

  constructor(plan: Plan, public jobs: Jobs) {
    Object.entries(plan).forEach(([name, task]) => {
      this.avl[name] = new AVLTree<Node, null>((lhs, rhs) => {
        if (lhs.cnt !== rhs.cnt) return lhs.cnt - rhs.cnt;
        if (lhs.random !== rhs.random) return lhs.random - rhs.random;
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
        }
      }
    });
  }

  private updateCnt(x: number, y: number, newCnt: number) {
    this.paintCnt[x][y] = newCnt;
    const name = this.taskName[x][y];
    if (name) {
      const node = this.avlNode[x][y];
      if (node) {
        this.avl[name].remove(node);
        this.avlNode[x][y] = null;
        this.insertAvl(x, y);
      }
    }
  }

  private doPaint({ x, y, color }: Paint) {
    this.board[x][y] = color;

    const { x: oldX, y: oldY } = this.paintLogQueue[this.paintLogIndex];
    if (oldX !== -1) {
      this.updateCnt(oldX, oldY, this.paintCnt[oldX][oldY] - 1);
    }
    this.updateCnt(x, y, this.paintCnt[x][y] + 1);
    this.paintLogQueue[this.paintLogIndex] = { x, y };
    this.paintLogIndex = (this.paintLogIndex + 1) % PAINT_LOG_QUEUE_LENGTH;

    if (this.planCol[x][y] === color) {
      this.jobs.markPainted({ x, y, color });
    } else if (this.avlNode[x][y] === null && this.jobs.job[x][y] === null) {
      this.insertAvl(x, y);
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
          this.paint({ x, y, color: board[x][y] });
        }
      }
    }
  }
}
