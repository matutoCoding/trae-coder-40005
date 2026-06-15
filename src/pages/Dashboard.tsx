import { Link } from 'react-router-dom';
import {
  Beaker,
  Shuffle,
  Gauge,
  Flame,
  Target,
  Droplet,
  Ruler,
  BookOpen,
  TrendingUp,
  ChevronRight,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { PageCard } from '@/components/PageCard';
import { StatusBadge } from '@/components/FormField';
import { useAppStore, PROCESS_NAMES, PROCESS_ORDER, type ProcessKey } from '@/store';
import { StatCard } from '@/components/StatCard';

const processItems = [
  { path: '/mixing-powder', label: '粉末配料', icon: Beaker, color: 'blue' as const, desc: '金属粉末配比' },
  { path: '/blending', label: '混料制粒', icon: Shuffle, color: 'green' as const, desc: '润滑剂混料' },
  { path: '/pressing', label: '压制成型', icon: Gauge, color: 'orange' as const, desc: '压坯密度控制' },
  { path: '/sintering', label: '高温烧结', icon: Flame, color: 'red' as const, desc: '炉温曲线监控' },
  { path: '/sizing', label: '复压整形', icon: Target, color: 'purple' as const, desc: '尺寸精度控制' },
  { path: '/impregnation', label: '浸油处理', icon: Droplet, color: 'blue' as const, desc: '含油轴承浸油' },
  { path: '/inspection', label: '尺寸检验', icon: Ruler, color: 'green' as const, desc: '密度公差检验' },
  { path: '/furnace-ledger', label: '炉次台账', icon: BookOpen, color: 'orange' as const, desc: '烧结炉次记录' },
];

export default function Dashboard() {
  const {
    powderMixRecords,
    blendingRecords,
    pressingRecords,
    sinteringRecords,
    sizingRecords,
    impregnationRecords,
    inspectionRecords,
    getAllBatchesWithStatus,
  } = useAppStore();

  const activeSintering = sinteringRecords.filter((r) => r.status === 'sintering').length;
  const completedSintering = sinteringRecords.filter((r) => r.status === 'completed').length;
  const passRate = inspectionRecords.length > 0
    ? ((inspectionRecords.filter((r) => r.overallResult === 'pass').length / inspectionRecords.length) * 100).toFixed(1)
    : 0;
  const totalPressed = pressingRecords.reduce((sum, r) => sum + r.pressedQty, 0);

  const recentSintering = [...sinteringRecords].slice(0, 5);
  const recentInspection = [...inspectionRecords].slice(0, 5);
  const batches = getAllBatchesWithStatus().slice(0, 8);

  const getProcessColor = (process: ProcessKey) => {
    const colors: Record<ProcessKey, string> = {
      powderMix: 'bg-blue-500',
      blending: 'bg-green-500',
      pressing: 'bg-orange-500',
      sintering: 'bg-red-500',
      sizing: 'bg-purple-500',
      impregnation: 'bg-cyan-500',
      inspection: 'bg-teal-500',
    };
    return colors[process];
  };

  const getBatchStatusInfo = (batch: { batchStatus: string; hasRework: boolean; hasFailedInspection: boolean; currentProcess: ProcessKey }) => {
    if (batch.batchStatus === 'failed') {
      return {
        text: '不合格',
        color: 'text-red-600',
        bgColor: 'bg-red-500',
        lightBg: 'bg-red-50',
        badgeText: '不合格',
        badgeClass: 'bg-red-100 text-red-700',
      };
    }
    if (batch.batchStatus === 'rework') {
      return {
        text: '返工中',
        color: 'text-orange-600',
        bgColor: 'bg-orange-500',
        lightBg: 'bg-orange-50',
        badgeText: '返工中',
        badgeClass: 'bg-orange-100 text-orange-700',
      };
    }
    if (batch.batchStatus === 'completed') {
      return {
        text: PROCESS_NAMES[batch.currentProcess],
        color: 'text-green-600',
        bgColor: 'bg-green-500',
        lightBg: 'bg-green-50',
        badgeText: '已完成检验',
        badgeClass: 'bg-green-100 text-green-700',
      };
    }
    return {
      text: PROCESS_NAMES[batch.currentProcess],
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      badgeText: '进行中',
      badgeClass: 'bg-blue-100 text-blue-700',
    };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="今日配料批次"
          value={powderMixRecords.length}
          unit="批"
          icon={Beaker}
          color="blue"
          trend={{ value: 12, isUp: true }}
        />
        <StatCard
          title="进行中烧结"
          value={activeSintering}
          unit="炉"
          icon={Flame}
          color="orange"
          trend={{ value: 0, isUp: true }}
        />
        <StatCard
          title="累计压制成品"
          value={totalPressed.toLocaleString()}
          unit="件"
          icon={Gauge}
          color="green"
          trend={{ value: 8.5, isUp: true }}
        />
        <StatCard
          title="检验合格率"
          value={passRate}
          unit="%"
          icon={CheckCircle}
          color="purple"
          trend={{ value: 2.3, isUp: true }}
        />
      </div>

      <PageCard title="生产工序" subtitle="点击进入对应工序管理">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {processItems.map((item) => {
            const Icon = item.icon;
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
              green: 'bg-green-50 text-green-600 group-hover:bg-green-100',
              orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100',
              red: 'bg-red-50 text-red-600 group-hover:bg-red-100',
              purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
            };
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${colorClasses[item.color]}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {item.label}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">{item.desc}</p>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
              </Link>
            );
          })}
        </div>
      </PageCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PageCard
          title="烧结炉次动态"
          subtitle="近期烧结炉次状态"
          actions={
            <Link
              to="/furnace-ledger"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              查看全部 <ChevronRight size={14} />
            </Link>
          }
        >
          <div className="space-y-3">
            {recentSintering.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      record.status === 'sintering' ? 'bg-amber-100' : 'bg-green-100'
                    }`}
                  >
                    <Flame
                      size={20}
                      className={record.status === 'sintering' ? 'text-amber-600' : 'text-green-600'}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{record.furnaceNo}</p>
                    <p className="text-xs text-slate-500">{record.productName}</p>
                  </div>
                </div>
                <div className="text-right">
                  {record.status === 'sintering' ? (
                    <StatusBadge status="sintering" text="烧结中" />
                  ) : (
                    <StatusBadge status="success" text="已完成" />
                  )}
                  <p className="text-xs text-slate-400 mt-1">{record.maxTemperature}°C</p>
                </div>
              </div>
            ))}
            {recentSintering.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                暂无烧结记录
              </div>
            )}
          </div>
        </PageCard>

        <PageCard
          title="质量检验概览"
          subtitle="近期产品检验结果"
          actions={
            <Link
              to="/inspection"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              查看全部 <ChevronRight size={14} />
            </Link>
          }
        >
          <div className="space-y-3">
            {recentInspection.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      record.overallResult === 'pass' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {record.overallResult === 'pass' ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <AlertTriangle size={20} className="text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{record.batchId}</p>
                    <p className="text-xs text-slate-500">{record.productName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      record.overallResult === 'pass'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {record.overallResult === 'pass' ? '合格' : '不合格'}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    密度: {record.density} g/cm³
                  </p>
                </div>
              </div>
            ))}
            {recentInspection.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                暂无检验记录
              </div>
            )}
          </div>
        </PageCard>
      </div>

      <PageCard
        title="批次流转进度"
        subtitle="各批次当前工序状态"
        actions={
          <span className="text-sm text-slate-500">
            共 {getAllBatchesWithStatus().length} 批
          </span>
        }
      >
        <div className="space-y-3">
          {batches.map((batch) => {
            const progressIndex = PROCESS_ORDER.indexOf(batch.currentProcess);
            const progressPercent = ((progressIndex + 1) / PROCESS_ORDER.length) * 100;
            const statusInfo = getBatchStatusInfo(batch);
            return (
              <Link
                key={batch.batchId}
                to={`/batch/${batch.batchId}`}
                className="block p-3 bg-slate-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-blue-600 font-medium">{batch.batchId}</span>
                    <span className="text-sm text-slate-700">{batch.productName}</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusInfo.badgeClass}`}>
                      {statusInfo.badgeText}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${statusInfo.bgColor}`} />
                    <span className={`text-xs ${statusInfo.color}`}>{statusInfo.text}</span>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400" />
                  </div>
                </div>
                <div className="relative h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all ${statusInfo.bgColor}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  {PROCESS_ORDER.map((proc, i) => (
                    <div
                      key={proc}
                      className={`w-2 h-2 rounded-full ${
                        i <= progressIndex ? statusInfo.bgColor : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </Link>
            );
          })}
          {batches.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              <Layers size={32} className="mx-auto mb-2 opacity-50" />
              暂无批次记录
            </div>
          )}
        </div>
      </PageCard>
    </div>
  );
}
