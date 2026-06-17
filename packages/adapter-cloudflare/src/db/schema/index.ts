// Feature packages co-locate their Drizzle tables in their own src/entities/ dirs
// and re-export them here so createDb gets a unified schema object.
// Example once auth is implemented:
//   export * from '../../../auth/src/entities/schema.ts'

export const _placeholder = {} as const;
