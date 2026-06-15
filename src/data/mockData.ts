import type {
  PowderMixRecord,
  BlendingRecord,
  PressingRecord,
  SinteringRecord,
  SizingRecord,
  ImpregnationRecord,
  InspectionRecord,
  TempPoint,
  DimensionItem,
} from '@/types';

function generateTempCurve(): TempPoint[] {
  return [
    { time: 0, temperature: 25 },
    { time: 30, temperature: 200 },
    { time: 60, temperature: 400 },
    { time: 90, temperature: 600 },
    { time: 120, temperature: 800 },
    { time: 150, temperature: 1000 },
    { time: 180, temperature: 1120 },
    { time: 240, temperature: 1120 },
    { time: 270, temperature: 1050 },
    { time: 300, temperature: 900 },
    { time: 330, temperature: 700 },
    { time: 360, temperature: 500 },
    { time: 390, temperature: 300 },
    { time: 420, temperature: 100 },
  ];
}

function generateDimensions(): DimensionItem[] {
  return [
    { name: '外径', nominal: 30, tolerance: '±0.05', measured: 30.02, result: 'pass' },
    { name: '内径', nominal: 15, tolerance: '±0.03', measured: 15.01, result: 'pass' },
    { name: '高度', nominal: 20, tolerance: '±0.05', measured: 20.03, result: 'pass' },
    { name: '厚度', nominal: 5, tolerance: '±0.02', measured: 4.99, result: 'pass' },
  ];
}

export const mockPowderMixRecords: PowderMixRecord[] = [
  {
    id: 'pm001',
    batchId: 'PM250616001',
    productName: '铁基轴承套',
    formula: [
      { name: '铁粉', percentage: 92, weight: 46000 },
      { name: '铜粉', percentage: 2, weight: 1000 },
      { name: '石墨粉', percentage: 1, weight: 500 },
      { name: '镍粉', percentage: 5, weight: 2500 },
    ],
    totalWeight: 50000,
    lubricant: '硬脂酸锌',
    lubricantWeight: 500,
    operator: '张工',
    mixingTime: 45,
    status: 'completed',
    createdAt: '2025-06-16 08:30:00',
  },
  {
    id: 'pm002',
    batchId: 'PM250616002',
    productName: '铁基齿轮',
    formula: [
      { name: '铁粉', percentage: 95, weight: 47500 },
      { name: '铜粉', percentage: 3, weight: 1500 },
      { name: '石墨粉', percentage: 2, weight: 1000 },
    ],
    totalWeight: 50000,
    lubricant: '硬脂酸锂',
    lubricantWeight: 400,
    operator: '李工',
    mixingTime: 50,
    status: 'completed',
    createdAt: '2025-06-16 10:15:00',
  },
];

export const mockBlendingRecords: BlendingRecord[] = [
  {
    id: 'bl001',
    batchId: 'PM250616001',
    productName: '铁基轴承套',
    lubricantType: '硬脂酸锌',
    lubricantWeight: 500,
    mixingSpeed: 35,
    mixingTime: 45,
    granulationSize: '60目',
    granulationYield: 92,
    operator: '王师傅',
    status: 'completed',
    createdAt: '2025-06-16 09:20:00',
  },
];

export const mockPressingRecords: PressingRecord[] = [
  {
    id: 'pr001',
    batchId: 'PM250616001',
    productName: '铁基轴承套',
    pressModel: '315T液压机',
    pressingPressure: 315,
    pressingSpeed: 12,
    greenDensity: 6.8,
    greenWeight: 125.5,
    greenHeight: 20.5,
    pressedQty: 380,
    operator: '刘师傅',
    status: 'completed',
    createdAt: '2025-06-16 11:00:00',
  },
  {
    id: 'pr002',
    batchId: 'PM250616002',
    productName: '铁基齿轮',
    pressModel: '200T液压机',
    pressingPressure: 200,
    pressingSpeed: 15,
    greenDensity: 6.5,
    greenWeight: 85.2,
    greenHeight: 15.8,
    pressedQty: 500,
    operator: '陈师傅',
    status: 'completed',
    createdAt: '2025-06-16 13:30:00',
  },
];

export const mockSinteringRecords: SinteringRecord[] = [
  {
    id: 'si001',
    batchId: 'PM250616001',
    productName: '铁基轴承套',
    furnaceId: 'F01',
    furnaceNo: 'L25061601',
    atmosphereType: '氨分解气氛',
    atmosphereFlow: 15,
    dewPoint: -40,
    maxTemperature: 1120,
    sinteringTime: 120,
    tempCurve: generateTempCurve(),
    startTime: '2025-06-16 14:00:00',
    endTime: '2025-06-16 21:00:00',
    operator: '赵师傅',
    status: 'completed',
    createdAt: '2025-06-16 14:00:00',
  },
  {
    id: 'si002',
    batchId: 'PM250616002',
    productName: '铁基齿轮',
    furnaceId: 'F02',
    furnaceNo: 'L25061602',
    atmosphereType: '氮基气氛',
    atmosphereFlow: 20,
    dewPoint: -45,
    maxTemperature: 1130,
    sinteringTime: 90,
    tempCurve: generateTempCurve(),
    startTime: '2025-06-16 16:30:00',
    endTime: '',
    operator: '孙师傅',
    status: 'sintering',
    createdAt: '2025-06-16 16:30:00',
  },
];

export const mockSizingRecords: SizingRecord[] = [
  {
    id: 'sz001',
    batchId: 'PM250616001',
    productName: '铁基轴承套',
    pressModel: '100T精整机',
    sizingPressure: 80,
    beforeSinterSize: 30.5,
    afterSinterSize: 29.8,
    afterSizingSize: 30.0,
    sizingAmount: 0.2,
    sizingQty: 375,
    operator: '周师傅',
    status: 'completed',
    createdAt: '2025-06-16 22:30:00',
  },
];

export const mockImpregnationRecords: ImpregnationRecord[] = [
  {
    id: 'im001',
    batchId: 'PM250616001',
    productName: '铁基轴承套',
    oilType: '32号机械油',
    oilTemperature: 80,
    vacuumPressure: -0.095,
    impregnationTime: 30,
    oilContentRate: 18.5,
    beforeWeight: 120.5,
    afterWeight: 142.8,
    processedQty: 370,
    operator: '吴师傅',
    status: 'completed',
    createdAt: '2025-06-17 08:00:00',
  },
];

export const mockInspectionRecords: InspectionRecord[] = [
  {
    id: 'in001',
    batchId: 'PM250616001',
    productName: '铁基轴承套',
    density: 6.75,
    hardness: 65,
    dimensions: generateDimensions(),
    crackCheck: 'pass',
    appearanceCheck: 'pass',
    sampleQty: 20,
    passQty: 20,
    overallResult: 'pass',
    inspector: '质检员王',
    status: 'completed',
    createdAt: '2025-06-17 10:00:00',
  },
];
