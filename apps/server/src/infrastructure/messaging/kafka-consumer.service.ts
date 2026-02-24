import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Kafka, Consumer } from "kafkajs";
import { ConfigService } from "../config/config.service";
import { RedisService } from "../database/redis.service";
import logger from "@/shared/utils/logger";

const OFFLINE_KEY_PREFIX = "offline:";

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka | null = null;
  private consumer: Consumer | null = null;
  private readonly topic: string;
  private readonly enabled: boolean;

  constructor(private readonly redis: RedisService) {
    const config = ConfigService.loadConfig();
    this.topic = config.kafka.topicOfflineMessages;
    this.enabled = config.kafka.brokers.length > 0;
    if (this.enabled) {
      this.kafka = new Kafka({
        clientId: "whatschat-server",
        brokers: config.kafka.brokers,
      });
      this.consumer = this.kafka.consumer({ groupId: "offline-messages-consumer" });
    }
  }

  async onModuleInit() {
    if (!this.enabled || !this.consumer) return;
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: this.topic, fromBeginning: false });
      await this.consumer.run({
        eachMessage: async ({ message }) => {
          const userId = message.key?.toString();
          const value = message.value?.toString();
          if (!userId || !value) return;
          try {
            const key = `${OFFLINE_KEY_PREFIX}${userId}`;
            await this.redis.rpush(key, value);
          } catch (err) {
            logger.error(`Kafka consumer Redis rpush error: ${err}`);
          }
        },
      });
      logger.info("Kafka consumer subscribed to offline-messages");
    } catch (err) {
      logger.warn(`Kafka consumer connect failed: ${err}`);
    }
  }

  async onModuleDestroy() {
    if (this.consumer) {
      await this.consumer.disconnect();
      logger.info("Kafka consumer disconnected");
    }
  }
}
