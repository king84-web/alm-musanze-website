import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const HostUrl = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return `${req.protocol}://${req.get('host')}`;
  },
);
