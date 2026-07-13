import { client } from './client';

export interface IngredientItem {
    id: string;
    name: string;
    unit: string;
    aisle: string;
}

interface IngredientDTO {
    id: string;
    name: string;
    unit: string;
    aisle: string;
}

function fromDTO(dto: IngredientDTO): IngredientItem {
    return { id: dto.id, name: dto.name, unit: dto.unit, aisle: dto.aisle };
}

export function listIngredients(): Promise<IngredientItem[]> {
    return client.get<IngredientDTO[]>('/api/ingredient').then((items) => items.map(fromDTO));
}

export function getIngredient(id: string): Promise<IngredientItem> {
    return client.get<IngredientDTO>(`/api/ingredient/${id}`).then(fromDTO);
}

export function createIngredient(data: { name: string; unit: string; aisle: string }): Promise<IngredientItem> {
    // trailing slash matters here — the router's POST is registered at path='/'
    return client.post<IngredientDTO>('/api/ingredient', data).then(fromDTO);
}

export function updateIngredient(
    id: string,
    data: { name?: string; aisle?: string }
): Promise<IngredientItem> {
    // backend uses PATCH for update, not PUT
    return client.patch<IngredientDTO>(`/api/ingredient/${id}`, data).then(fromDTO);
}

export function deleteIngredient(id: string): Promise<void> {
    return client.delete<void>(`/api/ingredient/${id}`);
}

export function listEmptyPantryIngredients(): Promise<IngredientItem[]> {
    return client.get<IngredientDTO[]>('/api/ingredient/empty_pantry').then((items) => items.map(fromDTO));
}

export function setIngredientPantryStatus(id: string, inPantry: boolean): Promise<void> {
    return client.patch<void>(`/api/ingredient/${id}/pantry`, { in_pantry: inPantry });
}