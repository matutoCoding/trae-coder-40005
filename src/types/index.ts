export interface PowderFormula {
  name: string;
  percentage: number;
  weight: number;
}

export interface PowderMixRecord {
  id: string;
  batchId: string;
  productName: string;
  formula: PowderFormula[];
  totalWeight: number;
  lubricant: string;
  lubricantWeight: number;
  operator: string;
  mixingTime: number;
  createdAt: string;
}

export interface BlendingRecord {
  id: string;
  batchId: string;
  productName: string;
  lubricantType: string;
  lubricantWeight: number;
  mixingSpeed: number;
  mixingTime: number;
  granulationSize: string;
  granulationYield: number;
  operator: string;
  createdAt: string;
}

export interface PressingRecord {
  id: string;
  batchId: string;
  productName: string;
  pressModel: string;
  pressingPressure: number;
  pressingSpeed: number;
  greenDensity: number;
  greenWeight: number;
  greenHeight: number;
  pressedQty: number;
  operator: string;
  createdAt: string;
}

export interface TempPoint {
  time: number;
  temperature: number;
}

export interface SinteringRecord {
  id: string;
  batchId: string;
  productName: string;
  furnaceId: string;
  furnaceNo: string;
  atmosphereType: string;
  atmosphereFlow: number;
  dewPoint: number;
  maxTemperature: number;
  sinteringTime: number;
  tempCurve: TempPoint[];
  startTime: string;
  endTime: string;
  operator: string;
  status: 'sintering' | 'completed' | 'pending';
  createdAt: string;
}

export interface SizingRecord {
  id: string;
  batchId: string;
  productName: string;
  pressModel: string;
  sizingPressure: number;
  beforeSinterSize: number;
  afterSinterSize: number;
  afterSizingSize: number;
  sizingAmount: number;
  sizingQty: number;
  operator: string;
  createdAt: string;
}

export interface ImpregnationRecord {
  id: string;
  batchId: string;
  productName: string;
  oilType: string;
  oilTemperature: number;
  vacuumPressure: number;
  impregnationTime: number;
  oilContentRate: number;
  beforeWeight: number;
  afterWeight: number;
  processedQty: number;
  operator: string;
  createdAt: string;
}

export interface DimensionItem {
  name: string;
  nominal: number;
  tolerance: string;
  measured: number;
  result: 'pass' | 'fail';
}

export interface InspectionRecord {
  id: string;
  batchId: string;
  productName: string;
  density: number;
  hardness: number;
  dimensions: DimensionItem[];
  crackCheck: 'pass' | 'fail';
  appearanceCheck: 'pass' | 'fail';
  sampleQty: number;
  passQty: number;
  overallResult: 'pass' | 'fail';
  inspector: string;
  createdAt: string;
}

export interface Batch {
  id: string;
  batchNo: string;
  productName: string;
  material: string;
  plannedQty: number;
  status: 'pending' | 'mixing' | 'blending' | 'pressing' | 'sintering' | 'sizing' | 'impregnation' | 'inspection' | 'completed';
  currentProcess: string;
  createdAt: string;
}

export type ProcessStatus = 'pending' | 'in-progress' | 'completed' | 'failed';
