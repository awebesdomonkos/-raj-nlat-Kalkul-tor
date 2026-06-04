
export enum PackageId {
  LANDING = 'landing',
  INTRO = 'intro',
  CATALOG = 'catalog',
  WEBSHOP = 'webshop',
  MAINTENANCE = 'maintenance',
  CONTINUOUS_MAINTENANCE = 'continuous_maintenance',
}

export enum PriceType {
  FIXED = 'fix',
  HOURLY = 'oradij',
  FROM = 'tol',
  CUSTOM = 'egyedi',
  FREE = 'ingyenes',
}

export enum QuoteStatus {
  DRAFT = 'vazlat',
  SENT = 'elkuldve',
  ACCEPTED = 'elfogadva',
  REJECTED = 'elutasitva',
}

export type ExtraCategory = 'oldalak' | 'webshop' | 'altalanos';

export interface BasePackage {
  id: PackageId;
  name: string;
  price: number;
  description: string;
}

export interface Extra {
  id: string;
  category: ExtraCategory;
  name: string;
  description?: string;
  price: number;
  type: PriceType;
  unit?: string;
  availableFor: PackageId[];
  isInstantiable?: boolean;
}

export interface BonusPage {
    id: string;
    name: string;
    description: string;
}

export interface CustomInstance {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface PackageFeatures {
  pages?: string[];
  features: string[];
}

export interface EditableContentItem {
  text: string;
  isNew?: boolean;
}

export interface QuoteDetailsType {
  clientName: string;
  clientEmail: string;
  quoteId: string;
  subject: string;
  estimatedTime: string;
  validityDays: number;
  priorityMultiplier: number;
  websiteUrl: string;
}

export interface MaintenanceFeature {
  name: string;
  description: string;
}

export interface MaintenancePlan {
  id: 'smart' | 'pro';
  name: string;
  price: number;
  description: string;
  features: MaintenanceFeature[];
}

export interface EliteExtension {
  id: string;
  name: string;
  description: string;
  priceOneTime: number;
  priceMonthly: number;
  priceOneTimeDisplay: string;
  priceMonthlyDisplay: string;
}

export interface AIQuoteResponse {
    packageId: PackageId;
    quoteDetails: Omit<QuoteDetailsType, 'validityDays' | 'priorityMultiplier'>;
    extras?: {
        id: string;
        customPrice?: number;
    }[];
    pages?: {
        extraId: string;
        name: string;
        description: string;
        price: number;
    }[];
    landingSections?: {
        name: string;
        price: number;
    }[];
    customAdditions?: {
        name: string;
        description: string;
        price: number;
        category: ExtraCategory;
    }[];
}

export interface QuoteState {
    selectedPackageId: PackageId | null;
    selectedExtras: Record<string, boolean>;
    customPrices: Record<string, number>;
    customSections: { id: string; name: string; price: number }[];
    customInstances: Record<string, CustomInstance[]>;
    quoteDetails: QuoteDetailsType;
    editablePackageContents: { pages: EditableContentItem[]; features: EditableContentItem[] };
    selectedPlanId: 'smart' | 'pro' | null;
    selectedEliteExtensions: Record<string, boolean>;
    customElitePrices: Record<string, number>;
    status: QuoteStatus;
    discountPercentage: number;
}

export interface ClientNotes {
    hasChanges: boolean;
    designNotes: string;
    itemChanges: string;
    pageChanges: string;
    generalNotes: string;
    submittedAt: number;
}

export type FigmaPhaseStatus =
    | 'not_started'
    | 'brief_ready'      // notes saved, waiting for JARVIS to start
    | 'figma_in_progress' // JARVIS is working on it
    | 'figma_done'        // Figma file created, waiting for client review
    | 'figma_approved';   // Client approved the Figma design

export interface QuoteHistoryItem {
    id: string; // quoteId
    savedAt: number; // timestamp
    clientName: string; // for display
    subject: string; // for display
    status: QuoteStatus;
    state: QuoteState;
    researchContent?: string; // markdown research document
    clientNotes?: ClientNotes; // notes from client at acceptance
    figmaClientNotes?: ClientNotes; // notes from client at figma approval
    figmaPhase?: FigmaPhaseStatus;
    figmaFileUrl?: string; // Figma file URL
    figmaBriefPath?: string; // local path to Figma_Brief.md
    figmaDesignBrief?: string; // AI-generated design brief (markdown)
}
