import amqplib from "amqplib";

let connection = null;
let channel = null;

const getRabbitMqUrl = () =>
  process.env.CLOUDAMQP_URL || process.env.RABBITMQ_URL || "amqp://localhost";

export async function connect() {
  try {
    connection = await amqplib.connect(getRabbitMqUrl(), { heartbeat: 30 });
    channel = await connection.createChannel();

    await channel.assertQueue("email_queue", { durable: true });

    console.log("RabbitMQ connected");

    connection.on("close", () => {
      console.warn("RabbitMQ connection closed - retrying in 5s");
      setTimeout(connect, 5000);
    });

    connection.on("error", (err) => {
      console.error("RabbitMQ error: ", err.message);
    });

    return channel;
  } catch (err) {
    console.error("RabbitMQ connection error: ", err);
    console.log("Retrying RabbitMQ in 5 seconds...");
    setTimeout(connect, 5000);
  }
}

export function getChannel() {
  if (!channel) throw new Error("RabbitMQ channel not initialized");
  return channel;
}
