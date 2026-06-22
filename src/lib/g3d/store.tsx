import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AppState, BrandConfig, CatalogItem, Client, Consumable, FilamentStock, PrintOrder, Printer } from "./types";

const KEY = "g3d.state.v1";

const defaultBrand: BrandConfig = {
  name: "Ateliê 3D Hub",
  logoUrl: "",
  theme: "bambuzau",
  kwhPrice: 0.92,
  hourlyLabor: 35,
  lastAuditDate: Date.now(),
};

function seed(): AppState {
  const now = Date.now();
  const day = 86_400_000;
  return {
    brand: defaultBrand,
    printers: [
      { id: 1, name: "Prusa MK4", model: "MK4", status: "PRINTING", ipAddress: "192.168.0.21", apiType: "OCTOPRINT", wattsPerHour: 120, printProgress: 42, currentJob: "Vaso Hex Médio" },
      { id: 2, name: "Bambu X1C", model: "X1 Carbon", status: "IDLE", ipAddress: "192.168.0.22", apiType: "BAMBU_CLOUD", wattsPerHour: 150, printProgress: 0 },
      { id: 3, name: "Voron 2.4", model: "Voron 2.4 350", status: "MAINTENANCE", ipAddress: "192.168.0.23", apiType: "KLIPPER", wattsPerHour: 180 },
    ],
    clients: [
      { id: 1, name: "Mariana Souza", phone: "(11) 98877-1234", email: "mari@exemplo.com", address: "Rua das Flores, 120 - SP", stockCount: 3, stockValue: 540 },
      { id: 2, name: "Carlos Pereira", phone: "(21) 99988-4321", email: "carlos@exemplo.com", address: "Av. Atlântica, 200 - RJ", stockCount: 1, stockValue: 180 },
      { id: 3, name: "Studio Lupa", phone: "(31) 91234-5678", email: "studio@lupa.com", address: "Rua A, 50 - BH", stockCount: 5, stockValue: 1320 },
    ],
    orders: [
      { id: 1, clientId: 1, clientName: "Mariana Souza", itemName: "Vaso Hex Médio", quantity: 1, filamentType: "PLA", filamentColor: "Preto", weightGrams: 180, printTimeHours: 6, priceCharged: 180, createdAt: now - 2 * day, deadline: now + 2 * day, platformSource: "MANUAL", status: "PRINTING", printingProgress: 42, assignedPrinterId: 1, printerName: "Prusa MK4", paymentStatus: "PAGO", paymentMethod: "CARTÃO" },
      { id: 2, clientId: 2, clientName: "Carlos Pereira", itemName: "Suporte Headset", quantity: 2, filamentType: "PETG", filamentColor: "Azul", weightGrams: 90, printTimeHours: 3, priceCharged: 120, createdAt: now - 1 * day, deadline: now + 4 * day, platformSource: "SHOPEE", status: "QUEUE", printingProgress: 0, paymentStatus: "PAGO" },
      { id: 3, clientId: 3, clientName: "Studio Lupa", itemName: "Luminária Voronoi", quantity: 1, filamentType: "PLA", filamentColor: "Branco", weightGrams: 320, printTimeHours: 12, priceCharged: 410, createdAt: now - 7 * day, deadline: now - 1 * day, platformSource: "MERCADO_LIVRE", status: "READY", printingProgress: 100, paymentStatus: "PENDENTE" },
      { id: 4, clientId: 1, clientName: "Mariana Souza", itemName: "Porta-cartão", quantity: 4, filamentType: "PLA", filamentColor: "Vermelho", weightGrams: 60, printTimeHours: 2, priceCharged: 95, createdAt: now - 15 * day, deadline: now - 10 * day, platformSource: "MANUAL", status: "DELIVERED", printingProgress: 100, paymentStatus: "PAGO" },
    ],
    catalog: [
      { id: 1, name: "Vaso Hex Médio", description: "Vaso hexagonal decorativo", weightGrams: 180, printTimeHours: 6, filamentType: "PLA", defaultPrice: 180, productCode: "VH-MED-01" },
      { id: 2, name: "Suporte Headset", description: "Suporte de mesa para headset", weightGrams: 90, printTimeHours: 3, filamentType: "PETG", defaultPrice: 60, productCode: "SH-01" },
      { id: 3, name: "Luminária Voronoi", description: "Luminária estilo voronoi", weightGrams: 320, printTimeHours: 12, filamentType: "PLA", defaultPrice: 410, productCode: "LV-01" },
    ],
    filaments: [
      { id: 1, type: "PLA", color: "Preto", stockGrams: 820, minStockGrams: 300, priceRoll: 95, supplier: "3D Fila" },
      { id: 2, type: "PLA", color: "Branco", stockGrams: 410, minStockGrams: 300, priceRoll: 95, supplier: "3D Fila" },
      { id: 3, type: "PLA", color: "Vermelho", stockGrams: 180, minStockGrams: 300, priceRoll: 99, supplier: "Sunlu" },
      { id: 4, type: "PETG", color: "Azul", stockGrams: 540, minStockGrams: 300, priceRoll: 119, supplier: "Voolt3D" },
      { id: 5, type: "PLA", color: "Cinza", stockGrams: 120, minStockGrams: 300, priceRoll: 89, supplier: "3D Fila" },
    ],
    consumables: [
      { id: 1, name: "Spray Adesivo de Mesa", unitCost: 32, stock: 2 },
      { id: 2, name: "Álcool Isopropílico 1L", unitCost: 28, stock: 3 },
      { id: 3, name: "Caixa de Papelão P", unitCost: 1.8, stock: 60 },
    ],
  };
}

function load(): AppState {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as AppState;
    return { ...seed(), ...parsed, brand: { ...defaultBrand, ...parsed.brand } };
  } catch {
    return seed();
  }
}

interface Ctx {
  state: AppState;
  set: <K extends keyof AppState>(key: K, value: AppState[K]) => void;
  replaceAll: (next: AppState) => void;
  reset: () => void;
  nextId: (key: "clients" | "printers" | "orders" | "catalog" | "filaments" | "consumables") => number;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => load());

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const value: Ctx = {
    state,
    set: (k, v) => setState((s) => ({ ...s, [k]: v })),
    replaceAll: (next) => setState(next),
    reset: () => setState(seed()),
    nextId: (k) => {
      const arr = state[k] as { id: number }[];
      return arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1;
    },
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}

// Typed convenience helpers
export function useClients() {
  const { state, set, nextId } = useStore();
  return {
    clients: state.clients,
    addClient: (c: Omit<Client, "id">) => set("clients", [...state.clients, { ...c, id: nextId("clients") }]),
    updateClient: (id: number, patch: Partial<Client>) =>
      set("clients", state.clients.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    removeClient: (id: number) => set("clients", state.clients.filter((x) => x.id !== id)),
  };
}

export function usePrinters() {
  const { state, set, nextId } = useStore();
  return {
    printers: state.printers,
    addPrinter: (p: Omit<Printer, "id">) => set("printers", [...state.printers, { ...p, id: nextId("printers") }]),
    updatePrinter: (id: number, patch: Partial<Printer>) =>
      set("printers", state.printers.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    removePrinter: (id: number) => set("printers", state.printers.filter((x) => x.id !== id)),
  };
}

export function useOrders() {
  const { state, set, nextId } = useStore();
  return {
    orders: state.orders,
    addOrder: (o: Omit<PrintOrder, "id">) => set("orders", [...state.orders, { ...o, id: nextId("orders") }]),
    updateOrder: (id: number, patch: Partial<PrintOrder>) =>
      set("orders", state.orders.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    removeOrder: (id: number) => set("orders", state.orders.filter((x) => x.id !== id)),
  };
}

export function useCatalog() {
  const { state, set, nextId } = useStore();
  return {
    catalog: state.catalog,
    addItem: (c: Omit<CatalogItem, "id">) => set("catalog", [...state.catalog, { ...c, id: nextId("catalog") }]),
    updateItem: (id: number, patch: Partial<CatalogItem>) =>
      set("catalog", state.catalog.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    removeItem: (id: number) => set("catalog", state.catalog.filter((x) => x.id !== id)),
  };
}

export function useFilaments() {
  const { state, set, nextId } = useStore();
  return {
    filaments: state.filaments,
    addFilament: (f: Omit<FilamentStock, "id">) =>
      set("filaments", [...state.filaments, { ...f, id: nextId("filaments") }]),
    updateFilament: (id: number, patch: Partial<FilamentStock>) =>
      set("filaments", state.filaments.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    removeFilament: (id: number) => set("filaments", state.filaments.filter((x) => x.id !== id)),
  };
}

export function useConsumables() {
  const { state, set, nextId } = useStore();
  return {
    consumables: state.consumables,
    addConsumable: (c: Omit<Consumable, "id">) =>
      set("consumables", [...state.consumables, { ...c, id: nextId("consumables") }]),
    updateConsumable: (id: number, patch: Partial<Consumable>) =>
      set("consumables", state.consumables.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    removeConsumable: (id: number) => set("consumables", state.consumables.filter((x) => x.id !== id)),
  };
}

export function useBrand() {
  const { state, set } = useStore();
  return {
    brand: state.brand,
    updateBrand: (patch: Partial<BrandConfig>) => set("brand", { ...state.brand, ...patch }),
  };
}