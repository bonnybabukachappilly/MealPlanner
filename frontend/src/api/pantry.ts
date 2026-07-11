import { client } from './client';
import type { PantryEntry, TrackType } from '../types';

interface IngredientDTO {
  id: string;
  name: string;
  aisle: string;
}

// Shape returned by the backend (snake_case, nested ingredient object)
interface PantryItemDTO {
  id: string;
  ingredient: IngredientDTO;
  quantity: number | null;
  unit: string | null;
  quantity_threshold: number | null;
  expiry_date: string | null;
  expiry_date_threshold: number | null;
  track_type: TrackType;
  low_flag: boolean;
}

function fromDTO(dto: PantryItemDTO): PantryEntry {
  return {
    id: dto.id,
    ingredientId: dto.ingredient.id,
    ingredientName: dto.ingredient.name,
    aisle: dto.ingredient.aisle,
    quantity: dto.quantity ?? undefined,
    unit: dto.unit ?? undefined,
    quantityThreshold: dto.quantity_threshold ?? undefined,
    expiryDate: dto.expiry_date ?? undefined,
    expiryDateThreshold: dto.expiry_date_threshold ?? undefined,
    trackType: dto.track_type,
    lowFlag: dto.low_flag,
  };
}

// What the form gives us. ingredientId is required for create; the backend
// ignores it on update (PantryUpdateRequest excludes ingredient_id), so we
// strip it there rather than pretend it does something.
export interface PantryFormData {
  ingredientId: string;
  trackType: TrackType;
  quantity?: number;
  unit?: string;
  quantityThreshold?: number;
  expiryDate?: string;
  expiryDateThreshold?: number;
  lowFlag?: boolean;
}

function toCreatePayload(data: PantryFormData): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    ingredient_id: data.ingredientId,
    track_type: data.trackType,
  };

  if (data.trackType === 'quantity') {
    payload.quantity = data.quantity;
    payload.unit = data.unit;
    payload.quantity_threshold = data.quantityThreshold;
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

function toUpdatePayload(data: PantryFormData): Record<string, unknown> {
  const payload = toCreatePayload(data);
  delete payload.ingredient_id; // backend ignores/excludes this on PATCH
  return payload;
}

export function listPantryItems(): Promise<PantryEntry[]> {
  return client.get<PantryItemDTO[]>('/api/pantry').then((items) => items.map(fromDTO));
}

export function getPantryItem(id: string): Promise<PantryEntry> {
  return client.get<PantryItemDTO>(`/api/pantry/${id}`).then(fromDTO);
}

export function createPantryItem(data: PantryFormData): Promise<PantryEntry> {
  return client.post<PantryItemDTO>('/api/pantry', toCreatePayload(data)).then(fromDTO);
}

export function updatePantryItem(id: string, data: PantryFormData): Promise<PantryEntry> {
  // backend route is PATCH, not PUT — client.put() here would 405
  return client.patch<PantryItemDTO>(`/api/pantry/${id}`, toUpdatePayload(data)).then(fromDTO);
}

export function deletePantryItem(id: string): Promise<void> {
  return client.delete<void>(`/api/pantry/${id}`);
}