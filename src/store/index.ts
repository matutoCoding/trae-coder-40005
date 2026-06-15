import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PowderMixRecord,
  BlendingRecord,
  PressingRecord,
  SinteringRecord,
  SizingRecord,
  ImpregnationRecord,
  InspectionRecord,
  ReworkRecord,
  RecordStatus,
  ProcessKey,
} from '@/types';

export type { ProcessKey, RecordStatus };
import {
  mockPowderMixRecords,
  mockBlendingRecords,
  mockPressingRecords,
  mockSinteringRecords,
  mockSizingRecords,
  mockImpregnationRecords,
  mockInspectionRecords,
} from '@/data/mockData';
import { generateId, formatDate } from '@/utils';

export const PROCESS_ORDER: ProcessKey[] = [
  'powderMix',
  'blending',
  'pressing',
  'sintering',
  'sizing',
  'impregnation',
  'inspection',
];

export const PROCESS_NAMES: Record<ProcessKey, string> = {
  powderMix: '粉末配料',
  blending: '混料制粒',
  pressing: '压制成型',
  sintering: '高温烧结',
  sizing: '复压整形',
  impregnation: '浸油处理',
  inspection: '尺寸检验',
};

interface AppState {
  powderMixRecords: PowderMixRecord[];
  blendingRecords: BlendingRecord[];
  pressingRecords: PressingRecord[];
  sinteringRecords: SinteringRecord[];
  sizingRecords: SizingRecord[];
  impregnationRecords: ImpregnationRecord[];
  inspectionRecords: InspectionRecord[];
  reworkRecords: ReworkRecord[];
  sidebarCollapsed: boolean;

  addPowderMix: (record: PowderMixRecord) => void;
  addBlending: (record: BlendingRecord) => void;
  addPressing: (record: PressingRecord) => void;
  addSintering: (record: SinteringRecord) => void;
  addSizing: (record: SizingRecord) => void;
  addImpregnation: (record: ImpregnationRecord) => void;
  addInspection: (record: InspectionRecord) => void;
  addRework: (record: ReworkRecord) => void;
  updateSintering: (id: string, record: Partial<SinteringRecord>) => void;
  toggleSidebar: () => void;
  resetAll: () => void;

  getBatchById: (batchId: string) => {
    productName: string;
    currentProcess: ProcessKey;
    records: {
      powderMix?: PowderMixRecord;
      blending?: BlendingRecord;
      pressing?: PressingRecord;
      sintering?: SinteringRecord;
      sizing?: SizingRecord;
      impregnation?: ImpregnationRecord;
      inspection?: InspectionRecord;
    };
    reworkRecords: ReworkRecord[];
  } | null;
  getAvailableBatches: (currentProcess: ProcessKey) => {
    available: { batchId: string; productName: string; prevRecord: unknown }[];
    blocked: { batchId: string; productName: string; reason: string; prevRecord: unknown }[];
  };
  getBatchProcessStatus: (batchId: string, processKey: ProcessKey) => 'pending' | 'in-progress' | 'completed' | 'failed' | 'rework';
  createRework: (batchId: string, reworkFrom: ProcessKey, reworkTo: ProcessKey, reason: string, operator: string) => void;
  getAllBatchesWithStatus: () => { batchId: string; productName: string; currentProcess: ProcessKey; createdAt: string; hasRework: boolean; hasFailedInspection: boolean; batchStatus: 'completed' | 'in-progress' | 'failed' | 'rework' }[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      powderMixRecords: mockPowderMixRecords,
      blendingRecords: mockBlendingRecords,
      pressingRecords: mockPressingRecords,
      sinteringRecords: mockSinteringRecords,
      sizingRecords: mockSizingRecords,
      impregnationRecords: mockImpregnationRecords,
      inspectionRecords: mockInspectionRecords,
      reworkRecords: [],
      sidebarCollapsed: false,

      addPowderMix: (record) =>
        set((state) => ({
          powderMixRecords: [record, ...state.powderMixRecords],
        })),
      addBlending: (record) =>
        set((state) => ({
          blendingRecords: [record, ...state.blendingRecords],
        })),
      addPressing: (record) =>
        set((state) => ({
          pressingRecords: [record, ...state.pressingRecords],
        })),
      addSintering: (record) =>
        set((state) => ({
          sinteringRecords: [record, ...state.sinteringRecords],
        })),
      addSizing: (record) =>
        set((state) => ({
          sizingRecords: [record, ...state.sizingRecords],
        })),
      addImpregnation: (record) =>
        set((state) => ({
          impregnationRecords: [record, ...state.impregnationRecords],
        })),
      addInspection: (record) =>
        set((state) => ({
          inspectionRecords: [record, ...state.inspectionRecords],
        })),
      addRework: (record) =>
        set((state) => ({
          reworkRecords: [record, ...state.reworkRecords],
        })),
      updateSintering: (id, updates) =>
        set((state) => ({
          sinteringRecords: state.sinteringRecords.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      resetAll: () =>
        set({
          powderMixRecords: mockPowderMixRecords,
          blendingRecords: mockBlendingRecords,
          pressingRecords: mockPressingRecords,
          sinteringRecords: mockSinteringRecords,
          sizingRecords: mockSizingRecords,
          impregnationRecords: mockImpregnationRecords,
          inspectionRecords: mockInspectionRecords,
          reworkRecords: [],
        }),

      getBatchById: (batchId) => {
        const state = get();
        const powderMix = state.powderMixRecords.find((r) => r.batchId === batchId);
        if (!powderMix) return null;

        const blending = state.blendingRecords.find((r) => r.batchId === batchId);
        const pressing = state.pressingRecords.find((r) => r.batchId === batchId);
        const sintering = state.sinteringRecords.find((r) => r.batchId === batchId);
        const sizing = state.sizingRecords.find((r) => r.batchId === batchId);
        const impregnation = state.impregnationRecords.find((r) => r.batchId === batchId);
        const inspection = state.inspectionRecords.find((r) => r.batchId === batchId);
        const batchReworkRecords = state.reworkRecords.filter((r) => r.batchId === batchId);

        let currentProcess: ProcessKey = 'powderMix';
        if (inspection) currentProcess = 'inspection';
        else if (impregnation) currentProcess = 'impregnation';
        else if (sizing) currentProcess = 'sizing';
        else if (sintering) currentProcess = 'sintering';
        else if (pressing) currentProcess = 'pressing';
        else if (blending) currentProcess = 'blending';

        if (batchReworkRecords.length > 0) {
          const latestRework = batchReworkRecords[0];
          const reworkToIndex = PROCESS_ORDER.indexOf(latestRework.reworkTo);
          const currentIndex = PROCESS_ORDER.indexOf(currentProcess);
          if (reworkToIndex < currentIndex) {
            currentProcess = latestRework.reworkTo;
          }
        }

        return {
          productName: powderMix.productName,
          currentProcess,
          records: {
            powderMix,
            blending,
            pressing,
            sintering,
            sizing,
            impregnation,
            inspection,
          },
          reworkRecords: batchReworkRecords,
        };
      },

      getAvailableBatches: (currentProcess) => {
        const state = get();
        const prevIndex = PROCESS_ORDER.indexOf(currentProcess) - 1;
        if (prevIndex < 0) return { available: [], blocked: [] };
        const prevProcess = PROCESS_ORDER[prevIndex];

        const prevRecordsMap: Record<string, unknown[]> = {
          powderMix: state.powderMixRecords,
          blending: state.blendingRecords,
          pressing: state.pressingRecords,
          sintering: state.sinteringRecords,
          sizing: state.sizingRecords,
          impregnation: state.impregnationRecords,
        };

        const currentRecordsMap: Record<string, unknown[]> = {
          powderMix: state.powderMixRecords,
          blending: state.blendingRecords,
          pressing: state.pressingRecords,
          sintering: state.sinteringRecords,
          sizing: state.sizingRecords,
          impregnation: state.impregnationRecords,
          inspection: state.inspectionRecords,
        };

        const prevRecords = prevRecordsMap[prevProcess] || [];
        const currentRecords = currentRecordsMap[currentProcess] || [];
        const currentBatchIds = new Set(currentRecords.map((r: any) => r.batchId));

        const available: { batchId: string; productName: string; prevRecord: unknown }[] = [];
        const blocked: { batchId: string; productName: string; reason: string; prevRecord: unknown }[] = [];

        prevRecords.forEach((r: any) => {
          if (currentBatchIds.has(r.batchId)) return;

          let blockedReason = '';

          if (prevProcess === 'sintering' && r.status === 'sintering') {
            blockedReason = '烧结进行中';
          }

          if (!blockedReason && prevProcess === 'inspection') {
            if (r.status === 'failed' || r.overallResult === 'fail') {
              blockedReason = '检验不合格';
            }
          }

          if (!blockedReason) {
            if (prevProcess === 'pressing' && r.pressedQty === 0) {
              blockedReason = '数量为0';
            } else if (prevProcess === 'sizing' && r.sizingQty === 0) {
              blockedReason = '数量为0';
            } else if (prevProcess === 'impregnation' && r.processedQty === 0) {
              blockedReason = '数量为0';
            }
          }

          const batchReworks = state.reworkRecords.filter((rw) => rw.batchId === r.batchId);
          if (batchReworks.length > 0) {
            const latestRework = batchReworks[0];
            const reworkToIndex = PROCESS_ORDER.indexOf(latestRework.reworkTo);
            const currentProcessIndex = PROCESS_ORDER.indexOf(currentProcess);
            if (reworkToIndex !== currentProcessIndex) {
              if (!blockedReason) {
                blockedReason = '工序不匹配（返工中）';
              }
            }
          }

          if (blockedReason) {
            blocked.push({
              batchId: r.batchId,
              productName: r.productName,
              reason: blockedReason,
              prevRecord: r,
            });
          } else {
            available.push({
              batchId: r.batchId,
              productName: r.productName,
              prevRecord: r,
            });
          }
        });

        return { available, blocked };
      },

      getBatchProcessStatus: (batchId, processKey) => {
        const state = get();
        const batchData = get().getBatchById(batchId);
        if (!batchData) return 'pending';

        const record = batchData.records[processKey];
        const batchReworks = state.reworkRecords.filter((r) => r.batchId === batchId);

        if (batchReworks.length > 0) {
          const latestRework = batchReworks[0];
          const reworkFromIndex = PROCESS_ORDER.indexOf(latestRework.reworkFrom);
          const reworkToIndex = PROCESS_ORDER.indexOf(latestRework.reworkTo);
          const processIndex = PROCESS_ORDER.indexOf(processKey);

          if (processIndex > reworkToIndex && processIndex <= reworkFromIndex) {
            return 'rework';
          }
        }

        if (!record) {
          const currentProcessIndex = PROCESS_ORDER.indexOf(batchData.currentProcess);
          const processIndex = PROCESS_ORDER.indexOf(processKey);
          if (processIndex < currentProcessIndex) return 'completed';
          if (processIndex === currentProcessIndex) return 'in-progress';
          return 'pending';
        }

        if (processKey === 'sintering') {
          const sinterRecord = record as SinteringRecord;
          if (sinterRecord.status === 'sintering') return 'in-progress';
          if (sinterRecord.status === 'failed') return 'failed';
          if (sinterRecord.status === 'completed') return 'completed';
          return 'pending';
        }

        if (processKey === 'inspection') {
          const inspectRecord = record as InspectionRecord;
          if (inspectRecord.status === 'failed' || inspectRecord.overallResult === 'fail') {
            return 'failed';
          }
          return 'completed';
        }

        const anyRecord = record as any;
        if (anyRecord.status === 'failed') return 'failed';
        if (anyRecord.status === 'in-progress') return 'in-progress';

        return 'completed';
      },

      createRework: (batchId, reworkFrom, reworkTo, reason, operator) => {
        const state = get();

        const reworkRecord: ReworkRecord = {
          id: generateId(),
          batchId,
          reworkFrom,
          reworkTo,
          reason,
          operator,
          createdAt: formatDate(new Date()),
        };

        const reworkFromIndex = PROCESS_ORDER.indexOf(reworkFrom);

        set((state) => {
          const newRecords = { ...state };

          PROCESS_ORDER.forEach((process, index) => {
            if (index > reworkFromIndex) return;
            if (index < PROCESS_ORDER.indexOf(reworkTo)) return;

            const key = `${process}Records` as keyof AppState;
            if (Array.isArray((state as any)[key])) {
              (newRecords as any)[key] = (state as any)[key].filter(
                (r: any) => r.batchId !== batchId
              );
            }
          });

          return {
            ...newRecords,
            reworkRecords: [reworkRecord, ...state.reworkRecords],
          };
        });
      },

      getAllBatchesWithStatus: () => {
        const state = get();
        const allBatches: Map<string, { productName: string; createdAt: string }> = new Map();

        state.powderMixRecords.forEach((r) => {
          allBatches.set(r.batchId, { productName: r.productName, createdAt: r.createdAt });
        });

        const batches = Array.from(allBatches.entries()).map(([batchId, info]) => {
          let currentProcess: ProcessKey = 'powderMix';
          const inspectionRecord = state.inspectionRecords.find((r) => r.batchId === batchId);
          if (inspectionRecord) currentProcess = 'inspection';
          else if (state.impregnationRecords.find((r) => r.batchId === batchId)) currentProcess = 'impregnation';
          else if (state.sizingRecords.find((r) => r.batchId === batchId)) currentProcess = 'sizing';
          else if (state.sinteringRecords.find((r) => r.batchId === batchId)) currentProcess = 'sintering';
          else if (state.pressingRecords.find((r) => r.batchId === batchId)) currentProcess = 'pressing';
          else if (state.blendingRecords.find((r) => r.batchId === batchId)) currentProcess = 'blending';

          const batchReworks = state.reworkRecords.filter((r) => r.batchId === batchId);
          const hasRework = batchReworks.length > 0;

          if (hasRework) {
            const latestRework = batchReworks[0];
            const reworkToIndex = PROCESS_ORDER.indexOf(latestRework.reworkTo);
            const currentIndex = PROCESS_ORDER.indexOf(currentProcess);
            if (reworkToIndex < currentIndex) {
              currentProcess = latestRework.reworkTo;
            }
          }

          const hasFailedInspection = !!(inspectionRecord && (inspectionRecord.status === 'failed' || inspectionRecord.overallResult === 'fail'));

          let batchStatus: 'completed' | 'in-progress' | 'failed' | 'rework' = 'in-progress';
          if (hasFailedInspection) {
            batchStatus = 'failed';
          } else if (hasRework) {
            batchStatus = 'rework';
          } else if (currentProcess === 'inspection' && inspectionRecord && inspectionRecord.overallResult === 'pass') {
            batchStatus = 'completed';
          }

          return {
            batchId,
            productName: info.productName,
            currentProcess,
            createdAt: info.createdAt,
            hasRework,
            hasFailedInspection,
            batchStatus,
          };
        });

        return batches.sort((a, b) =>
          PROCESS_ORDER.indexOf(b.currentProcess) - PROCESS_ORDER.indexOf(a.currentProcess)
        );
      },
    }),
    {
      name: 'pm-system-storage',
    }
  )
);
