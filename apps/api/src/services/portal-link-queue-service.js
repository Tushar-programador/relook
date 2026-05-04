import { logger } from "../config/logger.js";
import { sendPortalLinkEmail } from "./mail-service.js";

const PORTAL_LINK_QUEUE_NAME = "portal-link-emails";
const CHUNK_SIZE = 20;
const CONCURRENCY = 2;

let workerStarted = false;
let processing = false;
let nextJobId = 1;
const pendingJobs = [];

async function processJob(job) {
  const { recipients, subject, body, portalUrl, includePromotion } = job;

  for (let index = 0; index < recipients.length; index += CHUNK_SIZE) {
    const chunk = recipients.slice(index, index + CHUNK_SIZE);
    await Promise.all(
      chunk.map((recipient) =>
        sendPortalLinkEmail({
          to: recipient,
          subject,
          body,
          portalUrl,
          includePromotion
        })
      )
    );
  }

  return { sent: recipients.length };
}

async function processQueue() {
  if (!workerStarted || processing) {
    return;
  }

  processing = true;

  try {
    while (pendingJobs.length) {
      const jobs = pendingJobs.splice(0, CONCURRENCY);
      await Promise.all(
        jobs.map(async ({ id, payload }) => {
          try {
            const result = await processJob(payload);
            logger.info("Portal-link email job completed", {
              jobId: id,
              sent: result.sent
            });
          } catch (error) {
            logger.error("Portal-link email job failed", {
              jobId: id,
              error: error.message
            });
          }
        })
      );
    }
  } finally {
    processing = false;

    if (pendingJobs.length) {
      queueMicrotask(processQueue);
    }
  }
}

export async function enqueuePortalLinkEmailJob(payload) {
  const jobId = String(nextJobId++);
  pendingJobs.push({ id: jobId, payload });
  queueMicrotask(processQueue);
  return { jobId };
}

export async function startPortalLinkEmailWorker() {
  if (workerStarted) {
    return;
  }

  workerStarted = true;
  queueMicrotask(processQueue);
  logger.info("Portal-link email worker started", {
    queue: PORTAL_LINK_QUEUE_NAME,
    mode: "in-memory"
  });
}
