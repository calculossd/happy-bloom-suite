export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  note?: string;
  lastContactDate?: number;
  stockCount?: number;
  stockValue?: number;
}

export interface Printer {
  id: number;
  name: string;
  model: string;
  status: "IDLE" | "PRINTING" | "MAINTENANCE";
  ipAddress: string;
  cameraUrl?: string;
  nozzleTemp?: number;
  bedTemp?: number;
  apiType?: "KLIPPER" | "OCTOPRINT" | "BAMBU_CLOUD" | "NONE";
  apiKey?: string;
  port?: string;
  printProgress?: number;
  currentJob?: string;
  wattsPerHour?: number;
}

export type PlatformSource =
  | "MANUAL"
  | "SHOPEE"
  | "MERCADO_LIVRE"
  | "NUVEMSHOP"
  | "AMAZON"
  | "TIKTOK_SHOP";

export type OrderStatus =
  | "WAITING"
  | "QUEUE"
  | "PRINTING"
  | "POST_PROCESS"
  | "READY"
  | "DELIVERED";

export interface PrintOrder {
  id: number;
  clientId?: number | null;
  clientName: string;
  itemName: string;
  quantity: number;
  filamentType: string;
  filamentColor: string;
  weightGrams: number;
  printTimeHours: number;
  priceCharged: number;
  createdAt: number;
  deadline: number;
  platformSource: PlatformSource;
  status: OrderStatus;
  printingProgress: number;
  assignedPrinterId?: number | null;
  printerName?: string;
  paymentMethod?: "CONSIGNADO" | "CARTÃO" | "DINHEIRO" | "OUTROS";
  paymentStatus?: "PAGO" | "PENDENTE";
}

export interface CatalogItem {
  id: number;
  name: string;
  description: string;
  weightGrams: number;
  printTimeHours: number;
  filamentType: string;
  defaultPrice: number;
  productCode: string;
  spentPartId?: number | null;
  spentPartQty?: number;
  imageUrl?: string;
}

export interface FilamentStock {
  id: number;
  type: string;
  color: string;
  stockGrams: number;
  minStockGrams: number;
  priceRoll: number;
  supplier?: string;
}

export interface Consumable {
  id: number;
  name: string;
  unitCost: number;
  stock: number;
}

export interface BrandConfig {
  name: string;
  logoUrl: string;
  theme: "bambuzau" | "cyberpunk" | "mint" | "obsidian";
  kwhPrice: number;
  hourlyLabor: number;
  lastAuditDate: number;
}

export interface AppState {
  clients: Client[];
  printers: Printer[];
  orders: PrintOrder[];
  catalog: CatalogItem[];
  filaments: FilamentStock[];
  consumables: Consumable[];
  brand: BrandConfig;
}