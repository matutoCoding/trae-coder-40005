import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Beaker,
  Shuffle,
  Gauge,
  Flame,
  Target,
  Droplet,
  Ruler,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { PageCard } from '@/components/PageCard';
import { useAppStore, PROCESS_NAMES, PROCESS_ORDER, ProcessKey } from '@/store';
import type {
  PowderMixRecord,
  BlendingRecord,
  PressingRecord,
  SinteringRecord,
  SizingRecord,
  ImpregnationRecord,
  InspectionRecord,
} from '@/types';

const processIcons: Record<ProcessKey, typeof Beaker> = {
  powderMix: Beaker,
  blending: Shuffle,
  pressing: Gauge,
  sintering: Flame,
  sizing: Target,
  impregnation: Droplet,
  inspection: Ruler,
};

const processColors: Record<ProcessKey, string> = {
  powderMix: 'blue',
  blending: 'green',
  pressing: 'orange',
  sintering: 'red',
  sizing: 'purple',
  impregnation: 'cyan',
  inspection: 'emerald',
};

type ProcessStatus = 'completed' | 'in-progress' | 'pending';

function getProcessStatus(
  processKey: ProcessKey,
  currentProcess: ProcessKey,
  record: unknown
): ProcessStatus {
  if (record) return 'completed';
  if (processKey === currentProcess) return 'in-progress';
  return 'pending';
}

function PowderMixDetail({ record }: { record: PowderMixRecord }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">总重量</p>
          <p className="text-lg font-semibold text-slate-800">
            {(record.totalWeight / 1000).toFixed(1)} <span className="text-sm font-normal">kg</span>
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">混合时间</p>
          <p className="text-lg font-semibold text-slate-800">
            {record.mixingTime} <span className="text-sm font-normal">分钟</span>
          </p>
        </div>
      </div>
      <div>
        <p className="text-xs text-slate-500 mb-2">配方组成</p>
        <div className="space-y-2">
          {record.formula.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{item.name}</span>
              <span className="font-medium text-slate-800">
                {item.percentage}% ({item.weight}g)
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-500 mb-1">润滑剂</p>
        <p className="text-sm text-slate-700">
          {record.lubricant} - {record.lubricantWeight}g
        </p>
      </div>
    </div>
  );
}

function BlendingDetail({ record }: { record: BlendingRecord }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">混合转速</p>
          <p className="text-lg font-semibold text-slate-800">
            {record.mixingSpeed} <span className="text-sm font-normal">rpm</span>
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">混合时间</p>
          <p className="text-lg font-semibold text-slate-800">
            {record.mixingTime} <span className="text-sm font-normal">分钟</span>
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">制粒粒度</p>
          <p className="text-lg font-semibold text-slate-800">{record.granulationSize}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">制粒合格率</p>
          <p className="text-lg font-semibold text-green-600">{record.granulationYield}%</p>
        </div>
      </div>
      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-500 mb-1">润滑剂类型</p>
        <p className="text-sm text-slate-700">
          {record.lubricantType} - {record.lubricantWeight}g
        </p>
      </div>
    </div>
  );
}

function PressingDetail({ record }: { record: PressingRecord }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-1">压制压力</p>
          <p className="text-base font-semibold text-slate-800">{record.pressingPressure}T</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-1">生坯密度</p>
          <p className="text-base font-semibold text-slate-800">{record.greenDensity} g/cm³</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-1">压制数量</p>
          <p className="text-base font-semibold text-slate-800">{record.pressedQty} 件</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-1">压制速度</p>
          <p className="text-base font-semibold text-slate-800">{record.pressingSpeed} 件/分</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-1">生坯重量</p>
          <p className="text-base font-semibold text-slate-800">{record.greenWeight} g</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-1">生坯高度</p>
          <p className="text-base font-semibold text-slate-800">{record.greenHeight} mm</p>
        </div>
      </div>
      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-500 mb-1">设备型号</p>
        <p className="text-sm text-slate-700">{record.pressModel}</p>
      </div>
    </div>
  );
}

function SinteringDetail({ record }: { record: SinteringRecord }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">最高温度</p>
          <p className="text-lg font-semibold text-red-600">
            {record.maxTemperature} <span className="text-sm font-normal">°C</span>
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">保温时间</p>
          <p className="text-lg font-semibold text-slate-800">
            {record.sinteringTime} <span className="text-sm font-normal">分钟</span>
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">气氛类型</p>
          <p className="text-lg font-semibold text-slate-800 text-sm">{record.atmosphereType}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">气氛流量</p>
          <p className="text-lg font-semibold text-slate-800">
            {record.atmosphereFlow} <span className="text-sm font-normal">m³/h</span>
          </p>
        </div>
      </div>
      <div className="pt-2 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-500 mb-1">炉号</p>
            <p className="text-slate-700 font-medium">{record.furnaceNo}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">露点</p>
            <p className="text-slate-700 font-medium">{record.dewPoint}°C</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SizingDetail({ record }: { record: SizingRecord }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-1">整形压力</p>
          <p className="text-base font-semibold text-slate-800">{record.sizingPressure}T</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-1">整形量</p>
          <p className="text-base font-semibold text-purple-600">{record.sizingAmount} mm</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-1">整形数量</p>
          <p className="text-base font-semibold text-slate-800">{record.sizingQty} 件</p>
        </div>
      </div>
      <div>
        <p className="text-xs text-slate-500 mb-2">尺寸变化</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">烧结前尺寸</span>
            <span className="text-slate-700">{record.beforeSinterSize} mm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">烧结后尺寸</span>
            <span className="text-slate-700">{record.afterSinterSize} mm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">整形后尺寸</span>
            <span className="font-medium text-green-600">{record.afterSizingSize} mm</span>
          </div>
        </div>
      </div>
      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-500 mb-1">设备型号</p>
        <p className="text-sm text-slate-700">{record.pressModel}</p>
      </div>
    </div>
  );
}

function ImpregnationDetail({ record }: { record: ImpregnationRecord }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-1">油温</p>
          <p className="text-base font-semibold text-slate-800">{record.oilTemperature}°C</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-1">真空度</p>
          <p className="text-base font-semibold text-cyan-600">{record.vacuumPressure} MPa</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-1">含油率</p>
          <p className="text-base font-semibold text-green-600">{record.oilContentRate}%</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">浸油时间</p>
          <p className="text-lg font-semibold text-slate-800">
            {record.impregnationTime} <span className="text-sm font-normal">分钟</span>
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">处理数量</p>
          <p className="text-lg font-semibold text-slate-800">
            {record.processedQty} <span className="text-sm font-normal">件</span>
          </p>
        </div>
      </div>
      <div className="pt-2 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-500 mb-1">油品类型</p>
            <p className="text-slate-700 font-medium">{record.oilType}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">重量变化</p>
            <p className="text-slate-700">
              {record.beforeWeight}g → {record.afterWeight}g
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InspectionDetail({ record }: { record: InspectionRecord }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-1">密度</p>
          <p className="text-base font-semibold text-slate-800">{record.density} g/cm³</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-1">硬度</p>
          <p className="text-base font-semibold text-slate-800">HRB {record.hardness}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-1">抽样数量</p>
          <p className="text-base font-semibold text-slate-800">{record.sampleQty} 件</p>
        </div>
      </div>
      <div>
        <p className="text-xs text-slate-500 mb-2">尺寸检验</p>
        <div className="space-y-2">
          {record.dimensions.map((dim, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{dim.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs">
                  {dim.nominal}{dim.tolerance}
                </span>
                <span
                  className={`font-medium ${
                    dim.result === 'pass' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {dim.measured} mm
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pt-2 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">裂纹检查:</span>
            <span className={record.crackCheck === 'pass' ? 'text-green-600' : 'text-red-600'}>
              {record.crackCheck === 'pass' ? '合格' : '不合格'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">外观检查:</span>
            <span
              className={record.appearanceCheck === 'pass' ? 'text-green-600' : 'text-red-600'}
            >
              {record.appearanceCheck === 'pass' ? '合格' : '不合格'}
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-slate-500">综合判定</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              record.overallResult === 'pass'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {record.overallResult === 'pass' ? '合格' : '不合格'}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProcessDetail({
  processKey,
  record,
}: {
  processKey: ProcessKey;
  record: unknown;
}) {
  if (!record) return null;

  switch (processKey) {
    case 'powderMix':
      return <PowderMixDetail record={record as PowderMixRecord} />;
    case 'blending':
      return <BlendingDetail record={record as BlendingRecord} />;
    case 'pressing':
      return <PressingDetail record={record as PressingRecord} />;
    case 'sintering':
      return <SinteringDetail record={record as SinteringRecord} />;
    case 'sizing':
      return <SizingDetail record={record as SizingRecord} />;
    case 'impregnation':
      return <ImpregnationDetail record={record as ImpregnationRecord} />;
    case 'inspection':
      return <InspectionDetail record={record as InspectionRecord} />;
    default:
      return null;
  }
}

function getOperator(processKey: ProcessKey, record: unknown): string {
  if (!record) return '-';
  if (processKey === 'inspection') {
    return (record as InspectionRecord).inspector;
  }
  return (record as any).operator || '-';
}

function getTime(processKey: ProcessKey, record: unknown): string {
  if (!record) return '-';
  if (processKey === 'sintering') {
    const sinter = record as SinteringRecord;
    return sinter.startTime || sinter.createdAt;
  }
  return (record as any).createdAt || '-';
}

export default function BatchHistory() {
  const { batchId } = useParams<{ batchId: string }>();
  const { getBatchById } = useAppStore();
  const [expandedProcess, setExpandedProcess] = useState<ProcessKey | null>(null);

  const batchData = batchId ? getBatchById(batchId) : null;

  if (!batchData) {
    return (
      <div className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} />
          返回首页
        </Link>
        <PageCard>
          <div className="py-16 text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">批次不存在</h3>
            <p className="text-slate-500 text-sm">未找到批次号为 "{batchId}" 的记录</p>
          </div>
        </PageCard>
      </div>
    );
  }

  const { productName, currentProcess, records } = batchData;

  const toggleExpand = (processKey: ProcessKey) => {
    if (!records[processKey]) return;
    setExpandedProcess(expandedProcess === processKey ? null : processKey);
  };

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={16} />
        返回首页
      </Link>

      <PageCard>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-slate-800">{batchId}</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {PROCESS_NAMES[currentProcess]}
              </span>
            </div>
            <p className="text-slate-500 text-sm">产品名称: {productName}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800">
                {PROCESS_ORDER.filter((p) => records[p]).length}
              </p>
              <p className="text-xs text-slate-500">已完成工序</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{PROCESS_ORDER.length}</p>
              <p className="text-xs text-slate-500">总工序数</p>
            </div>
          </div>
        </div>
      </PageCard>

      <PageCard title="工艺履历" subtitle="批次生产全流程时间线">
        <div className="relative">
          <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-200" />

          <div className="space-y-4">
            {PROCESS_ORDER.map((processKey) => {
              const record = records[processKey];
              const status = getProcessStatus(processKey, currentProcess, record);
              const Icon = processIcons[processKey];
              const color = processColors[processKey];
              const isExpanded = expandedProcess === processKey;
              const hasRecord = !!record;

              const dotColorClasses = {
                completed: 'bg-green-500 border-green-500',
                'in-progress': 'bg-blue-500 border-blue-500 animate-pulse',
                pending: 'bg-slate-200 border-slate-300',
              };

              const iconBgClasses = {
                blue: 'bg-blue-50 text-blue-600',
                green: 'bg-green-50 text-green-600',
                orange: 'bg-orange-50 text-orange-600',
                red: 'bg-red-50 text-red-600',
                purple: 'bg-purple-50 text-purple-600',
                cyan: 'bg-cyan-50 text-cyan-600',
                emerald: 'bg-emerald-50 text-emerald-600',
              };

              return (
                <div key={processKey} className="relative flex gap-4">
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                        dotColorClasses[status]
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 size={18} className="text-white" />
                      ) : status === 'in-progress' ? (
                        <Clock size={16} className="text-white" />
                      ) : (
                        <Icon size={16} className="text-slate-400" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 pb-2">
                    <div
                      className={`bg-white rounded-lg border transition-all ${
                        hasRecord
                          ? 'border-slate-200 hover:border-blue-300 hover:shadow-sm cursor-pointer'
                          : 'border-slate-100 bg-slate-50'
                      }`}
                      onClick={() => hasRecord && toggleExpand(processKey)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                iconBgClasses[color as keyof typeof iconBgClasses]
                              }`}
                            >
                              <Icon size={20} />
                            </div>
                            <div>
                              <h4
                                className={`font-semibold ${
                                  status === 'pending' ? 'text-slate-400' : 'text-slate-800'
                                }`}
                              >
                                {PROCESS_NAMES[processKey]}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <User size={12} />
                                  {getOperator(processKey, record)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {getTime(processKey, record)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {status === 'completed' && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                已完成
                              </span>
                            )}
                            {status === 'in-progress' && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                进行中
                              </span>
                            )}
                            {status === 'pending' && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-medium">
                                未开始
                              </span>
                            )}
                            {hasRecord && (
                              <button className="p-1 text-slate-400 hover:text-slate-600">
                                {isExpanded ? (
                                  <ChevronUp size={18} />
                                ) : (
                                  <ChevronDown size={18} />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {isExpanded && hasRecord && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <ProcessDetail processKey={processKey} record={record} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PageCard>
    </div>
  );
}
