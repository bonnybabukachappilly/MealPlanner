export type ComponentCategory = 'Protein' | 'Grain' | 'Veg' | 'Sauce' | 'Dairy' | 'Other';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun' | 'Staging';

export type MealType =
  | 'Breakfast'
  | 'Morning Snack'
  | 'Lunch'
  | 'Evening Snack'
  | 'Dinner'
  | 'Extras';

export type StorageLocation = 'fridge' | 'freezer';

export type TrackType = 'quantity' | 'expiry' | 'untrack';

export type ExpenseCategory = 'groceries' | 'eating_out' | 'other';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  aisle: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string; // free text e.g. Dinner, Drinks, Dessert
  servings: number;
  prepTime: string;
  instructions: string;
  tags: string[];
  rating: number; // 1-5
  photo?: string;
  sourceUrls: string[];
  createdAt: string;
  ingredients: Ingredient[];
}

export interface MealComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  servings: number;
  prepTime: string;
  instructions: string;
  tags: string[];
  rating: number;
  photo?: string;
  sourceUrls: string[];
  createdAt: string;
  ingredients: Ingredient[];
}

export interface CustomDish {
  id: string;
  name: string;
  photo?: string;
  notes: string;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  quantity?: number;
  unit?: string;
  lowStockThreshold?: number;
  expiryDate?: string;
  expiryDateThreshold?: number;
  trackType: TrackType;
  lowFlag: boolean;
}

export interface MealPlanEntry {
  id: string;
  weekStart: string; // ISO Monday
  dayOfWeek: DayOfWeek;
  mealType: MealType | 'Staging';
  recipeId?: string;
  customName?: string;
  isBowl: boolean;
  componentIds?: string[]; // for bowl entries
  cooked: boolean;
  cookedDate?: string;
  servingsMade?: number;
  batchId?: string; // set when served from fridge
}

export type BatchSourceType = 'recipe' | 'component' | 'bowl' | 'custom';

export interface CookBatch {
  id: string;
  dishName: string;
  sourceType: BatchSourceType;
  recipeId?: string;
  componentId?: string;
  category: string;
  servingsMade: number;
  servingsRemaining: number;
  servingsAllocated: number;
  storageLocation: StorageLocation;
  cookedDate: string;
  photo?: string;
  wasted: boolean;
}

export interface GroceryOverride {
  weekStart: string;
  ingredientName: string;
  checked: boolean;
  hidden: boolean;
  qtyOverride?: number;
  price?: number;
}

export interface GroceryExtra {
  id: string;
  weekStart: string;
  itemName: string;
  checked: boolean;
  price?: number;
}

export interface Expense {
  id: string;
  itemName: string;
  amount: number;
  quantity: number;
  unit: string;
  expenseDate: string;
  note?: string;
  category: ExpenseCategory;
}

export interface Settings {
  monthlyBudget: number;
}
