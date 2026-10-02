import type { PaginatedResponseMetadata } from "./paginated-response-metadata";

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  metadata: PaginatedResponseMetadata;
}
