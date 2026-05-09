import { getChannel } from "../config/rabbitmq.js";
import { emailQueueSize } from '../config/metrics.js';

export const EMAIL_TYPE = {
  VERIFICATION: "VERIFICATION",
  PASSWORD_RESET: "PASSWORD_RESET",
  WELCOME: "WELCOME",
};

export async function queueEmail(type, payload) {
  try {
    const channel = getChannel();
    const message = JSON.stringify({ type, payload, timestamp: Date.now() });

    channel.sendToQueue("email_queue", Buffer.from(message), {
      persistent: true,
    });

    emailQueueSize.inc();
    console.log(`📧 Email queued: ${type} -> ${payload.email}`);
  } catch (err) {
    console.error("Failed to queue email:", err.message);
    throw err; // Re-throw to let caller handle
  }
}
