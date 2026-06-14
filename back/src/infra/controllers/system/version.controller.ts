import { Controller, Get } from '@nestjs/common';
import { Public } from '../../decorators/public.decorator';
import { VersionRequest } from 'contracts/system/version/version.request';

const VERSION = '1.0';

@Public()
@Controller()
export class VersionController {
  @Get(VersionRequest.BASE_URL)
  get() {
    return { version: VERSION };
  }
}
