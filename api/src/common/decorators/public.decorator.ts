import { Reflector } from '@nestjs/core';

export const Public = Reflector.createDecorator<true>({
  transform: () => true,
});
