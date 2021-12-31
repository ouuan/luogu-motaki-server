import { JobStatus } from './types';

export default class User {
  success = 0;

  failed = 0;

  unverified = 0;

  error = 0;

  blockedUntil = 0;

  lastProgress = 0;

  update(type: JobStatus) {
    this[type] += 1;

    if (type !== 'success') {
      const now = new Date().valueOf();

      if (this.blockedUntil < now) this.blockedUntil = now;

      const total = this.success + this.failed + this.unverified + this.error;

      if (total <= 100) return;

      const errorRate = this.error / total;
      const unverifiedRate = errorRate + this.unverified / total;
      const failRate = unverifiedRate + this.failed / total;

      if (failRate > 0.5) {
        this.blockedUntil += 10000;
      }

      if (unverifiedRate > 0.4) {
        this.blockedUntil += 30000;
      }

      if (errorRate > 0.3) {
        this.blockedUntil += 60000;
      }

      this.blockedUntil = Math.min(now + 100000, this.blockedUntil);
    }
  }
}
