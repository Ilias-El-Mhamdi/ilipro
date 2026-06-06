import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

const VERSION = '1.0';

@Public()
@Controller('version')
export class VersionController {
  @Get()
  get() {
    return { version: VERSION };
  }
}
