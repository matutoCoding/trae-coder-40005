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
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'pm-system-storage',
    }
  )
);
