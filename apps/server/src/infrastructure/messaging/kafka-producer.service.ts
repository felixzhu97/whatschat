import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Kafka, Producer } from "kafkajs";
import { ConfigService } from "../config/config.service";
import logger from "@/shared/utils/logger";

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private readonly topic: string;

  constructor() {
    const config = ConfigService.loadConfig();
    this.topic = config.kafka.topicOfflineMessages;
    this.kafka = new Kafka({
      clientId: "whatschat-server",
      brokers: config.kafka.brokers,
    });
    this.producer = this.kafka.producer();
  }

  private connected = false;

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.connected = true;
      logger.info("Kafka producer connected");
    } catch (err) {
      logger.warn(`Kafka producer connect failed: ${err}`);
    }
  }

  async onModuleDestroy() {
    if (this.connected) {
      await this.producer.disconnect();
      logger.info("Kafka producer disconnected");
    }
  }

  async sendOfflineMessage(recipientUserId: string, payload: string): Promise<void> {
    if (!this.connected) return;
    await this.producer.send({
      topic: this.topic,
      messages: [
        {
          key: recipientUserId,
          value: payload,
        },
      ],
    });
  }
}
