import { v4 as uuidv4 } from "uuid";

export interface QueueJob {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  status: "pending" | "processing" | "completed" | "failed" | "dead_letter";
  lastError?: string;
}

export class InMemoryQueue {
  private pending: QueueJob[] = [];
  private completed: QueueJob[] = [];
  private deadLetter: QueueJob[] = [];

  enqueue(type: string, payload: Record<string, unknown>, maxAttempts = 3): QueueJob {
    const job: QueueJob = {
      id: uuidv4(),
      type,
      payload,
      attempts: 0,
      maxAttempts,
      status: "pending"
    };

    this.pending.push(job);
    return job;
  }

  async processNext(handler: (job: QueueJob) => Promise<void>): Promise<QueueJob | null> {
    const job = this.pending.shift();

    if (!job) {
      return null;
    }

    job.status = "processing";
    job.attempts += 1;

    try {
      await handler(job);
      job.status = "completed";
      this.completed.push(job);
    } catch (error) {
      job.lastError = error instanceof Error ? error.message : "Unknown error";

      if (job.attempts >= job.maxAttempts) {
        job.status = "dead_letter";
        this.deadLetter.push(job);
      } else {
        job.status = "pending";
        this.pending.push(job);
      }
    }

    return job;
  }

  getState(): { pending: QueueJob[]; completed: QueueJob[]; deadLetter: QueueJob[] } {
    return {
      pending: [...this.pending],
      completed: [...this.completed],
      deadLetter: [...this.deadLetter]
    };
  }
}

export const queue = new InMemoryQueue();
