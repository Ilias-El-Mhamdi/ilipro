import { Controller, Get } from '@nestjs/common';

const VERSION = '1.0';

@Controller('version')
export class VersionController {
  @Get()
  get() {
    return { version: VERSION };
  }
}
