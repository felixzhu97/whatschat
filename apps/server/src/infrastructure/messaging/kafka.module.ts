import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { KafkaProducerService } from "./kafka-producer.service";
import { KafkaConsumerService } from "./kafka-consumer.service";

@Module({
  imports: [DatabaseModule],
  providers: [KafkaProducerService, KafkaConsumerService],
  exports: [KafkaProducerService],
})
export class KafkaModule {}
