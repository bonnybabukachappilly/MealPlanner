import { client } from './client';
import type { InventoryItem, TrackType } from '../types';

// Shape returned by the backend (snake_case, matches the Pydantic schema)
interface PantryItemDTO {
  id: string;
  item_name: string;
  quantity: number | null;
  unit: string | null;
  low_stock_threshold: number | null;
  expiry_date: string | null;
  expiry_date_threshold: number | null;
  track_type: TrackType;
  low_flag: boolean;
}

function fromDTO(dto: PantryItemDTO): InventoryItem {
  return {
    id: dto.id,
    itemName: dto.item_name,
    quantity: dto.quantity ?? undefined,
    unit: dto.unit ?? undefined,
    lowStockThreshold: dto.low_stock_threshold ?? undefined,
    expiryDate: dto.expiry_date ?? undefined,
    expiryDateThreshold: dto.expiry_date_threshold ?? undefined,
    trackType: dto.track_type,
    lowFlag: dto.low_flag,
  };
}

// Builds the request body, only including fields relevant to trackType.
// low_flag is server-computed for quantity/expiry, so it's omitted unless untrack.
function toPayload(data: Partial<InventoryItem> & { itemName: string; trackType: TrackType }) {
  const payload: Record<string, unknown> = {
    item_name: data.itemName,
    track_type: data.trackType,
  };

  if (data.trackType === 'quantity') {
    payload.quantity = data.quantity;
    payload.unit = data.unit;
    payload.low_stock_threshold = data.lowStockThreshold;
  }

  if (data.trackType === 'expiry') {
    payload.expiry_date = data.expiryDate;
    payload.expiry_date_threshold = data.expiryDateThreshold;
  }

  if (data.trackType === 'untrack' && data.lowFlag !== undefined) {
    payload.low_flag = data.lowFlag;
  }

  return payload;
}

export function listPantryItems(): Promise<InventoryItem[]> {
  return client.get<PantryItemDTO[]>('/api/pantry').then((items) => items.map(fromDTO));
}

export function getPantryItem(id: string): Promise<InventoryItem> {
  return client.get<PantryItemDTO>(`/api/pantry/${id}`).then(fromDTO);
}

export function createPantryItem(
  data: Partial<InventoryItem> & { itemName: string; trackType: TrackType }
): Promise<InventoryItem> {
  return client.post<PantryItemDTO>('/api/pantry', toPayload(data)).then(fromDTO);
}

export function updatePantryItem(
  id: string,
  data: Partial<InventoryItem> & { itemName: string; trackType: TrackType }
): Promise<InventoryItem> {
  return client.put<PantryItemDTO>(`/api/pantry/${id}`, toPayload(data)).then(fromDTO);
}

export function deletePantryItem(id: string): Promise<void> {
  return client.delete<void>(`/api/pantry/${id}`);
}
