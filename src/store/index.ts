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

function getLatestRecord(records: any[], batchId: string): any {
  return records.find((r: any) => r.batchId === batchId) || null;
}

function getLatestRework(reworkRecords: ReworkRecord[], batchId: string): ReworkRecord | null {
  return reworkRecords.find((r) => r.batchId === batchId) || null;
}

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
  hasUnfinishedRework: (batchId: string) => boolean;
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
        const powderMix = getLatestRecord(state.powderMixRecords, batchId) as PowderMixRecord | undefined;
        if (!powderMix) return null;

        const blending = getLatestRecord(state.blendingRecords, batchId) as BlendingRecord | undefined;
        const pressing = getLatestRecord(state.pressingRecords, batchId) as PressingRecord | undefined;
        const sintering = getLatestRecord(state.sinteringRecords, batchId) as SinteringRecord | undefined;
        const sizing = getLatestRecord(state.sizingRecords, batchId) as SizingRecord | undefined;
        const impregnation = getLatestRecord(state.impregnationRecords, batchId) as ImpregnationRecord | undefined;
        const inspection = getLatestRecord(state.inspectionRecords, batchId) as InspectionRecord | undefined;
        const batchReworkRecords = state.reworkRecords.filter((r) => r.batchId === batchId);

        let currentProcess: ProcessKey = 'powderMix';
        if (inspection) currentProcess = 'inspection';
        else if (impregnation) currentProcess = 'impregnation';
        else if (sizing) currentProcess = 'sizing';
        else if (sintering) currentProcess = 'sintering';
        else if (pressing) currentProcess = 'pressing';
        else if (blending) currentProcess = 'blending';

        const latestRework = getLatestRework(batchReworkRecords, batchId);
        if (latestRework) {
          const reworkToIndex = PROCESS_ORDER.indexOf(latestRework.reworkTo);
          const recordsMap: Record<string, unknown> = {
            powderMix, blending, pressing, sintering, sizing, impregnation, inspection,
          };
          const hasReworkToRecord = !!recordsMap[latestRework.reworkTo];

          if (!hasReworkToRecord) {
            currentProcess = latestRework.reworkTo;
          } else {
            let lastDoneProcess: ProcessKey = 'powderMix';
            for (let i = PROCESS_ORDER.length - 1; i > PROCESS_ORDER.indexOf(latestRework.reworkTo); i--) {
              const proc = PROCESS_ORDER[i];
              if (recordsMap[proc]) {
                lastDoneProcess = proc as ProcessKey;
                break;
              }
            }
            currentProcess = lastDoneProcess;
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

        const allRecordsMap: Record<string, any[]> = {
          powderMix: state.powderMixRecords,
          blending: state.blendingRecords,
          pressing: state.pressingRecords,
          sintering: state.sinteringRecords,
          sizing: state.sizingRecords,
          impregnation: state.impregnationRecords,
          inspection: state.inspectionRecords,
        };

        const currentRecords = allRecordsMap[currentProcess] || [];
        const currentBatchIds = new Set(
          currentRecords
            .filter((r: any) => {
              const rw = getLatestRework(state.reworkRecords, r.batchId);
              if (!rw) return true;
              return r.createdAt > rw.createdAt;
            })
            .map((r: any) => r.batchId)
        );

        const candidateBatches = new Map<string, { productName: string; prevRecord: any }>();

        for (const [procKey, records] of Object.entries(allRecordsMap)) {
          for (const record of records) {
            const r = record as any;
            if (candidateBatches.has(r.batchId)) continue;
            if (currentBatchIds.has(r.batchId)) continue;

            const rw = getLatestRework(state.reworkRecords, r.batchId);
            if (rw) {
              if (rw.reworkTo === currentProcess) {
                if (!currentBatchIds.has(r.batchId)) {
                  const reworkToRecords = allRecordsMap[rw.reworkTo] || [];
                  const hasNewRecord = reworkToRecords.some(
                    (rec: any) => rec.batchId === r.batchId && rec.createdAt > rw.createdAt
                  );
                  if (!hasNewRecord) {
                    const pmRecord = getLatestRecord(state.powderMixRecords, r.batchId);
                    if (pmRecord) {
                      candidateBatches.set(r.batchId, {
                        productName: pmRecord.productName,
                        prevRecord: r,
                      });
                    }
                  }
                }
                continue;
              }

              if (PROCESS_ORDER.indexOf(procKey as ProcessKey) >= PROCESS_ORDER.indexOf(rw.reworkTo)) {
                if (r.createdAt <= rw.createdAt) continue;
              }
            }

            if (procKey === prevProcess) {
              candidateBatches.set(r.batchId, {
                productName: r.productName,
                prevRecord: r,
              });
            }
          }
        }

        const available: { batchId: string; productName: string; prevRecord: unknown }[] = [];
        const blocked: { batchId: string; productName: string; reason: string; prevRecord: unknown }[] = [];

        candidateBatches.forEach(({ productName, prevRecord }, batchId) => {
          let blockedReason = '';
          const r = prevRecord;
          const rw = getLatestRework(state.reworkRecords, batchId);

          if (rw && rw.reworkTo !== currentProcess) {
            const reworkToRecords = allRecordsMap[rw.reworkTo] || [];
            const hasNewReworkToRecord = reworkToRecords.some(
              (rec: any) => rec.batchId === batchId && rec.createdAt > rw.createdAt
            );
            if (!hasNewReworkToRecord) {
              blockedReason = '返工进行中';
            }
          }

          if (!blockedReason && currentProcess === 'sizing') {
            const sinteringRec = getLatestRecord(state.sinteringRecords, batchId) as SinteringRecord | undefined;
            if (sinteringRec) {
              const isOldRecord = rw && sinteringRec.createdAt <= rw.createdAt;
              if (!isOldRecord && sinteringRec.status === 'sintering') {
                blockedReason = '烧结进行中';
              }
            }
          }

          if (!blockedReason && currentProcess === 'impregnation') {
            const sizingRec = getLatestRecord(state.sizingRecords, batchId) as SizingRecord | undefined;
            if (sizingRec) {
              const isOldRecord = rw && sizingRec.createdAt <= rw.createdAt;
              if (!isOldRecord && sizingRec.sizingQty === 0) {
                blockedReason = '数量为0';
              }
            }
          }

          if (!blockedReason && currentProcess === 'inspection') {
            const impregRec = getLatestRecord(state.impregnationRecords, batchId) as ImpregnationRecord | undefined;
            if (impregRec) {
              const isOldRecord = rw && impregRec.createdAt <= rw.createdAt;
              if (!isOldRecord && impregRec.processedQty === 0) {
                blockedReason = '数量为0';
              }
            }
          }

          if (blockedReason) {
            blocked.push({ batchId, productName, reason: blockedReason, prevRecord: r });
          } else {
            available.push({ batchId, productName, prevRecord: r });
          }
        });

        return { available, blocked };
      },

      getBatchProcessStatus: (batchId, processKey) => {
        const state = get();
        const batchData = get().getBatchById(batchId);
        if (!batchData) return 'pending';

        const record = batchData.records[processKey];
        const latestRework = getLatestRework(state.reworkRecords, batchId);
        const processIndex = PROCESS_ORDER.indexOf(processKey);

        if (processKey === 'inspection' && record) {
          const inspectRecord = record as InspectionRecord;
          if (inspectRecord.overallResult === 'fail' || inspectRecord.status === 'failed') {
            if (!latestRework) return 'failed';
            const newInspection = state.inspectionRecords.find(
              (r) => r.batchId === batchId && r.createdAt > latestRework.createdAt && r.overallResult === 'pass'
            );
            if (newInspection) return 'completed';
            return 'failed';
          }
          return 'completed';
        }

        if (latestRework) {
          const reworkToIndex = PROCESS_ORDER.indexOf(latestRework.reworkTo);
          const reworkFromIndex = PROCESS_ORDER.indexOf(latestRework.reworkFrom);
          const isNewRecord = record && (record as any).createdAt > latestRework.createdAt;

          if (processIndex < reworkToIndex) {
            return 'completed';
          }

          if (processKey === latestRework.reworkTo) {
            return isNewRecord ? 'completed' : 'in-progress';
          }

          if (processIndex > reworkToIndex && processIndex < reworkFromIndex) {
            return isNewRecord ? 'completed' : 'pending';
          }

          if (processIndex === reworkFromIndex) {
            const fromRecord = batchData.records[processKey];
            if (fromRecord) {
              const isOld = (fromRecord as any).createdAt <= latestRework.createdAt;
              if (isOld) return 'failed';
              return 'completed';
            }
            return 'pending';
          }

          if (processIndex > reworkFromIndex) {
            return isNewRecord ? 'completed' : 'pending';
          }
        }

        if (!record) {
          const currentProcessIndex = PROCESS_ORDER.indexOf(batchData.currentProcess);
          if (processIndex < currentProcessIndex) return 'completed';
          if (processIndex === currentProcessIndex) return 'in-progress';
          return 'pending';
        }

        if (processKey === 'sintering') {
          const sinterRecord = record as SinteringRecord;
          if (sinterRecord.status === 'sintering') return 'in-progress';
          if (sinterRecord.status === 'failed') return 'failed';
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

        const reworkToIndex = PROCESS_ORDER.indexOf(reworkTo);
        const reworkFromIndex = PROCESS_ORDER.indexOf(reworkFrom);

        const newState: any = {
          reworkRecords: [reworkRecord, ...state.reworkRecords],
        };

        const recordKeys: ProcessKey[] = ['sintering', 'sizing', 'impregnation', 'inspection'];
        for (const key of recordKeys) {
          const processIndex = PROCESS_ORDER.indexOf(key);
          if (processIndex >= reworkToIndex && processIndex < reworkFromIndex) {
            const stateKey = `${key}Records` as keyof typeof state;
            if (Array.isArray((state as any)[stateKey])) {
              newState[stateKey] = (state as any)[stateKey].filter(
                (r: any) => r.batchId !== batchId
              );
            }
          }
        }

        set(newState);
      },

      hasUnfinishedRework: (batchId) => {
        const state = get();
        const latestRework = getLatestRework(state.reworkRecords, batchId);
        if (!latestRework) return false;

        const reworkToRecords = (state as any)[`${latestRework.reworkTo}Records`] || [];
        const hasNewRecord = reworkToRecords.some(
          (r: any) => r.batchId === batchId && r.createdAt > latestRework.createdAt
        );
        if (hasNewRecord) {
          const newInspection = state.inspectionRecords.find(
            (r) => r.batchId === batchId && r.createdAt > latestRework.createdAt && r.overallResult === 'pass'
          );
          return !newInspection;
        }
        return true;
      },

      getAllBatchesWithStatus: () => {
        const state = get();
        const allBatches: Map<string, { productName: string; createdAt: string }> = new Map();

        state.powderMixRecords.forEach((r) => {
          allBatches.set(r.batchId, { productName: r.productName, createdAt: r.createdAt });
        });

        const batches = Array.from(allBatches.entries()).map(([batchId, info]) => {
          const latestRework = getLatestRework(state.reworkRecords, batchId);

          let currentProcess: ProcessKey = 'powderMix';
          const inspectionRecord = getLatestRecord(state.inspectionRecords, batchId) as InspectionRecord | undefined;
          const impregnationRecord = getLatestRecord(state.impregnationRecords, batchId) as ImpregnationRecord | undefined;
          const sizingRecord = getLatestRecord(state.sizingRecords, batchId) as SizingRecord | undefined;
          const sinteringRecord = getLatestRecord(state.sinteringRecords, batchId) as SinteringRecord | undefined;
          const pressingRecord = getLatestRecord(state.pressingRecords, batchId) as PressingRecord | undefined;
          const blendingRecord = getLatestRecord(state.blendingRecords, batchId) as BlendingRecord | undefined;

          if (inspectionRecord) currentProcess = 'inspection';
          else if (impregnationRecord) currentProcess = 'impregnation';
          else if (sizingRecord) currentProcess = 'sizing';
          else if (sinteringRecord) currentProcess = 'sintering';
          else if (pressingRecord) currentProcess = 'pressing';
          else if (blendingRecord) currentProcess = 'blending';

          let isReworkInProgress = false;
          const hasRework = !!latestRework;

          if (latestRework) {
            const reworkToIndex = PROCESS_ORDER.indexOf(latestRework.reworkTo);
            const recordsMap: Record<string, unknown> = {
              powderMix: getLatestRecord(state.powderMixRecords, batchId),
              blending: blendingRecord,
              pressing: pressingRecord,
              sintering: sinteringRecord,
              sizing: sizingRecord,
              impregnation: impregnationRecord,
              inspection: inspectionRecord,
            };

            const reworkToRecord = recordsMap[latestRework.reworkTo];
            const hasNewReworkToRecord = reworkToRecord && (reworkToRecord as any).createdAt > latestRework.createdAt;

            if (!hasNewReworkToRecord) {
              currentProcess = latestRework.reworkTo;
              isReworkInProgress = true;
            } else {
              let lastDoneProcess: ProcessKey = latestRework.reworkTo;
              for (let i = PROCESS_ORDER.length - 1; i > reworkToIndex; i--) {
                const proc = PROCESS_ORDER[i];
                const rec = recordsMap[proc];
                if (rec && (rec as any).createdAt > latestRework.createdAt) {
                  lastDoneProcess = proc as ProcessKey;
                  break;
                }
              }
              currentProcess = lastDoneProcess;
            }
          }

          const hasFailedInspection = !!(inspectionRecord && (inspectionRecord.status === 'failed' || inspectionRecord.overallResult === 'fail'));

          let batchStatus: 'completed' | 'in-progress' | 'failed' | 'rework' = 'in-progress';
          if (isReworkInProgress) {
            batchStatus = 'rework';
          } else if (hasRework && hasFailedInspection) {
            const newPassInspection = state.inspectionRecords.find(
              (r) => r.batchId === batchId && r.createdAt > (latestRework?.createdAt || '') && r.overallResult === 'pass'
            );
            batchStatus = newPassInspection ? 'completed' : 'rework';
          } else if (hasFailedInspection && !hasRework) {
            batchStatus = 'failed';
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
