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
} from '@/types';
import {
  mockPowderMixRecords,
  mockBlendingRecords,
  mockPressingRecords,
  mockSinteringRecords,
  mockSizingRecords,
  mockImpregnationRecords,
  mockInspectionRecords,
} from '@/data/mockData';

export type ProcessKey = 'powderMix' | 'blending' | 'pressing' | 'sintering' | 'sizing' | 'impregnation' | 'inspection';

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
  sidebarCollapsed: boolean;

  addPowderMix: (record: PowderMixRecord) => void;
  addBlending: (record: BlendingRecord) => void;
  addPressing: (record: PressingRecord) => void;
  addSintering: (record: SinteringRecord) => void;
  addSizing: (record: SizingRecord) => void;
  addImpregnation: (record: ImpregnationRecord) => void;
  addInspection: (record: InspectionRecord) => void;
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
  } | null;
  getAvailableBatches: (currentProcess: ProcessKey) => { batchId: string; productName: string; prevRecord: unknown }[];
  getAllBatchesWithStatus: () => { batchId: string; productName: string; currentProcess: ProcessKey; createdAt: string }[];
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

        let currentProcess: ProcessKey = 'powderMix';
        if (inspection) currentProcess = 'inspection';
        else if (impregnation) currentProcess = 'impregnation';
        else if (sizing) currentProcess = 'sizing';
        else if (sintering) currentProcess = 'sintering';
        else if (pressing) currentProcess = 'pressing';
        else if (blending) currentProcess = 'blending';

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
        };
      },

      getAvailableBatches: (currentProcess) => {
        const state = get();
        const prevIndex = PROCESS_ORDER.indexOf(currentProcess) - 1;
        if (prevIndex < 0) return [];
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

        return prevRecords
          .filter((r: any) => !currentBatchIds.has(r.batchId))
          .map((r: any) => ({
            batchId: r.batchId,
            productName: r.productName,
            prevRecord: r,
          }));
      },

      getAllBatchesWithStatus: () => {
        const state = get();
        const allBatches: Map<string, { productName: string; createdAt: string }> = new Map();

        state.powderMixRecords.forEach((r) => {
          allBatches.set(r.batchId, { productName: r.productName, createdAt: r.createdAt });
        });

        const batches = Array.from(allBatches.entries()).map(([batchId, info]) => {
          let currentProcess: ProcessKey = 'powderMix';
          if (state.inspectionRecords.find((r) => r.batchId === batchId)) currentProcess = 'inspection';
          else if (state.impregnationRecords.find((r) => r.batchId === batchId)) currentProcess = 'impregnation';
          else if (state.sizingRecords.find((r) => r.batchId === batchId)) currentProcess = 'sizing';
          else if (state.sinteringRecords.find((r) => r.batchId === batchId)) currentProcess = 'sintering';
          else if (state.pressingRecords.find((r) => r.batchId === batchId)) currentProcess = 'pressing';
          else if (state.blendingRecords.find((r) => r.batchId === batchId)) currentProcess = 'blending';

          return {
            batchId,
            productName: info.productName,
            currentProcess,
            createdAt: info.createdAt,
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
