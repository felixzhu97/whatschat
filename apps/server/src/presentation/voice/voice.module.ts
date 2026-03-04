import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';
import { VoiceService } from '@/application/services/voice.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [VoiceController],
  providers: [VoiceService],
  exports: [VoiceService],
})
export class VoiceModule {}
