// Centralized app state
export interface AppState {
  orders: any[];
  products: any[];
  customers: any[];
  lastRefreshed: Date | null;
  isLoading: boolean;
  error: string | null;
}

export const state: AppState = {
  orders: [],
  products: [],
  customers: [],
  lastRefreshed: null,
  isLoading: false,
  error: null,
};
