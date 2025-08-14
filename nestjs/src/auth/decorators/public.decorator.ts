import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a route as public.
 * If this decorator is used, then neither session token nor API keys is validated.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
