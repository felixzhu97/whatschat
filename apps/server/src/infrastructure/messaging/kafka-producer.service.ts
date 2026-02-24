import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Kafka, Producer } from "kafkajs";
import { ConfigService } from "../config/config.service";
import logger from "@/shared/utils/logger";

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka | null = null;
  private producer: Producer | null = null;
  private readonly topic: string;
  private readonly enabled: boolean;

  constructor() {
    const config = ConfigService.loadConfig();
    this.topic = config.kafka.topicOfflineMessages;
    this.enabled = config.kafka.brokers.length > 0;
    if (this.enabled) {
      this.kafka = new Kafka({
        clientId: "whatschat-server",
        brokers: config.kafka.brokers,
      });
      this.producer = this.kafka.producer();
    }
  }

  private connected = false;

  async onModuleInit() {
    if (!this.enabled || !this.producer) {
      logger.info("Kafka disabled (no brokers); offline message queue will no-op");
      return;
    }
    try {
      await this.producer.connect();
      this.connected = true;
      logger.info("Kafka producer connected");
    } catch (err) {
      logger.warn(`Kafka producer connect failed: ${err}`);
    }
  }

  async onModuleDestroy() {
    if (this.connected && this.producer) {
      await this.producer.disconnect();
      logger.info("Kafka producer disconnected");
    }
  }

  async sendOfflineMessage(recipientUserId: string, payload: string): Promise<void> {
    if (!this.connected || !this.producer) return;
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
