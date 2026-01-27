import { Module, Global } from '@nestjs/common';
import { ChimeService } from './chime.service';

@Global()
@Module({
  providers: [ChimeService],
  exports: [ChimeService],
})
export class ChimeModule {}
