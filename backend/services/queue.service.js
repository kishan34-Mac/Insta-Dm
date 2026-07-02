import { processWebhookEvent } from "./campaignEngine.service.js";

/**
 * In-Memory Event Queue Manager for Async Background Processing
 */
class EventQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.concurrency = 5;
    this.activeJobs = 0;
  }

  /**
   * Add a new webhook event job to the processing queue.
   * @param {Object} eventData 
   */
  enqueue(eventData) {
    this.queue.push({
      id: eventData.eventId || Math.random().toString(36).substring(7),
      data: eventData,
      enqueuedAt: new Date(),
    });

    console.log(`📥 [EventQueue] Enqueued event '${eventData.eventId}'. Total queue length: ${this.queue.length}`);
    this.processNext();
  }

  /**
   * Asynchronously process jobs from the queue.
   */
  async processNext() {
    if (this.activeJobs >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    this.activeJobs++;

    // Process job asynchronously without blocking
    setImmediate(async () => {
      try {
        console.log(`⚡ [EventQueue] Processing job '${job.id}'...`);
        await processWebhookEvent(job.data);
      } catch (error) {
        console.error(`❌ [EventQueue] Error processing job '${job.id}':`, error.message || error);
      } finally {
        this.activeJobs--;
        this.processNext();
      }
    });

    // Spawn another loop if concurrency allows
    if (this.activeJobs < this.concurrency && this.queue.length > 0) {
      this.processNext();
    }
  }

  /**
   * Returns current status of queue
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      activeJobs: this.activeJobs,
      concurrency: this.concurrency,
    };
  }
}

export const eventQueue = new EventQueue();
export default eventQueue;
