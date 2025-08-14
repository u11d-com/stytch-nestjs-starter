import { SetMetadata } from '@nestjs/common';

export const IS_MASTER_KEY_REQUIRED = 'masterKeyRequired';

/**
 * Decorator to mark a route as requiring a master key.
 * If this decorator is used, the request must include a valid master key.
 */
export const MasterKeyRequired = () =>
  SetMetadata(IS_MASTER_KEY_REQUIRED, true);
