import { exhaustiveCheck } from 'ts-exhaustive-check';
import { JobStatus } from './types';

export default class User {
  success = 0;

  failed = 0;

  unverified = 0;

  error = 0;

  blockedUntil = 0;

  update(type: JobStatus) {
    switch (type) {
      case 'success':
        this.success += 1;
        break;
      case 'failed':
        this.failed += 1;
        break;
      case 'unverified':
        this.unverified += 1;
        break;
      case 'error':
        this.error += 1;
        break;
      default:
        exhaustiveCheck(type);
    }

    const now = new Date().valueOf();

    if (type !== 'success') {
      if (this.blockedUntil < now) this.blockedUntil = now;

      const total = this.success + this.failed + this.unverified + this.error;

      if (total <= 5) return;

      const errorRate = this.error / total;
      const unverifiedRate = errorRate + this.unverified / total;
      const failRate = unverifiedRate + this.failed / total;

      if (failRate > 0.5) {
        this.blockedUntil += this.failed * 10000;
      }

      if (unverifiedRate > 0.4) {
        this.blockedUntil += this.unverified * 60000;
      }

      if (errorRate > 0.3) {
        this.blockedUntil += this.error * 120000;
      }
    }
  }
}
