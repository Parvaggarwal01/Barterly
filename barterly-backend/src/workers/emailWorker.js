import amqplib from "amqplib";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "../utils/email.utils.js";
import { EMAIL_TYPE } from "../services/emailQueue.service.js";
import { emailQueueSize } from "../config/metrics.js";

const QUEUE = "email_queue";
const MAX_RETRIES = 3;
const getRabbitMqUrl = () =>
  process.env.CLOUDAMQP_URL || process.env.RABBITMQ_URL || "amqp://localhost";

const handlers = {
  [EMAIL_TYPE.VERIFICATION]: async (payload) => {
    await sendVerificationEmail(payload.email, payload.name, payload.otp);
  },

  [EMAIL_TYPE.PASSWORD_RESET]: async (payload) => {
    await sendPasswordResetEmail(payload.email, payload.name, payload.otp);
  },

  [EMAIL_TYPE.WELCOME]: async (payload) => {
    await sendWelcomeEmail(payload.email, payload.name);
  },
};

export const startEmailWorker = async () => {
  try {
    const connection = await amqplib.connect(getRabbitMqUrl(), {
      heartbeat: 30,
    });

    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE, { durable: true });

    channel.prefetch(1);

    console.log("Email Worker started - waiting for messages...");

    channel.consume(QUEUE, async (msg) => {
      if (!msg) return;

      let parsed;
      try {
        parsed = JSON.parse(msg.content.toString());
      } catch (parseErr) {
        console.error("Invalid message format - discarding:", parseErr.message);
        channel.ack(msg);
        return;
      }

      const { type, payload } = parsed;
      const handler = handlers[type];

      if (!handler) {
        console.warn(`Unknown email type: ${type} - discarding`);
        channel.ack(msg);
        return;
      }

      // Get retry count from message headers
      const retryCount =
        (msg.properties.headers && msg.properties.headers["x-retry-count"]) ||
        0;

      try {
        await handler(payload);
        emailQueueSize.dec();
        console.log(`✅ Email sent: ${type} -> ${payload.email}`);
        channel.ack(msg);
      } catch (err) {
        console.error(
          `❌ Failed to send ${type} to ${payload.email}:`,
          err.message,
        );

        // Check if we've exceeded max retries
        if (retryCount >= MAX_RETRIES) {
          console.error(
            `Max retries (${MAX_RETRIES}) exceeded for ${type} to ${payload.email} - discarding message`,
          );
          channel.ack(msg); // Acknowledge to remove from queue
        } else {
          console.log(
            `Retry ${retryCount + 1}/${MAX_RETRIES} for ${type} to ${payload.email}`,
          );
          // Requeue with incremented retry count
          channel.nack(msg, false, false); // Don't requeue immediately

          // Send to queue again with updated retry count
          setTimeout(
            () => {
              channel.sendToQueue(QUEUE, msg.content, {
                persistent: true,
                headers: {
                  "x-retry-count": retryCount + 1,
                },
              });
            },
            2000 * (retryCount + 1),
          ); // Exponential backoff
        }
      }
    });

    connection.on("close", () => {
      console.warn("RabbitMQ connection closed - retrying in 5s");
      setTimeout(startEmailWorker, 5000);
    });

    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err.message);
    });
  } catch (err) {
    console.error("Email worker failed to start:", err?.message || err);
    if (err?.stack) {
      console.error(err.stack);
    }
    console.log("Retrying worker in 5 seconds...");
    setTimeout(startEmailWorker, 5000);
  }
};
