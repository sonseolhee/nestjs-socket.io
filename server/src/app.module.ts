import { Module } from '@nestjs/common';
import { ChatModule } from './event/chat.module';

@Module({
  imports: [ChatModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
