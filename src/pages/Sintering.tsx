import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Plus, Play, Square, Flame, Thermometer, Wind, Droplets, Clock, Info } from 'lucide-react';
import { PageCard } from '@/components/PageCard';
import { FormField, Input, Select, Button, StatusBadge } from '@/components/FormField';
import { useAppStore } from '@/store';
import { generateId, generateFurnaceNo, formatDate } from '@/utils';
import type { SinteringRecord, TempPoint, PressingRecord } from '@/types';

const furnaceOptions = [
  { value: 'F01', label: '1号烧结炉 (F01)' },
  { value: 'F02', label: '2号烧结炉 (F02)' },
  { value: 'F03', label: '3号烧结炉 (F03)' },
];

const atmosphereOptions = [
  { value: '氨分解气氛', label: '氨分解气氛' },
  { value: '氮基气氛', label: '氮基气氛' },
  { value: '氢氮混合气氛', label: '氢氮混合气氛' },
  { value: '吸热式气氛', label: '吸热式气氛' },
];

function generateDefaultTempCurve(): TempPoint[] {
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

export default function Sintering() {
  const { sinteringRecords, addSintering, getAvailableBatches } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    sinteringRecords.length > 0 ? sinteringRecords[0].id : null
  );
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batchId, setBatchId] = useState('');
  const [productName, setProductName] = useState('');
  const [furnaceId, setFurnaceId] = useState('F01');
  const [atmosphereType, setAtmosphereType] = useState('氨分解气氛');
  const [atmosphereFlow, setAtmosphereFlow] = useState(15);
  const [dewPoint, setDewPoint] = useState(-40);
  const [maxTemperature, setMaxTemperature] = useState(1120);
  const [sinteringTime, setSinteringTime] = useState(120);
  const [operator, setOperator] = useState('');

  const batches = getAvailableBatches('sintering') as { available: { batchId: string; productName: string; prevRecord: PressingRecord }[]; blocked: { batchId: string; productName: string; reason: string; prevRecord: PressingRecord }[] };

  const batchOptions = [
    { value: '', label: '请选择压制成型批次' },
    ...batches.available.map((b) => ({
      value: b.batchId,
      label: `${b.batchId} - ${b.productName}`,
    })),
    ...batches.blocked.map((b) => ({
      value: b.batchId,
      label: `${b.batchId} - ${b.productName}（${b.reason}）`,
      disabled: true,
    })),
  ];

  const selectedRecord = sinteringRecords.find((r) => r.id === selectedId);

  const activeCount = sinteringRecords.filter((r) => r.status === 'sintering').length;
  const completedCount = sinteringRecords.filter((r) => r.status === 'completed').length;

  const resetForm = () => {
    setSelectedBatch('');
    setBatchId('');
    setProductName('');
    setFurnaceId('F01');
    setAtmosphereType('氨分解气氛');
    setAtmosphereFlow(15);
    setDewPoint(-40);
    setMaxTemperature(1120);
    setSinteringTime(120);
    setOperator('');
  };

  const handleBatchChange = (batchIdVal: string) => {
    setSelectedBatch(batchIdVal);
    if (batchIdVal) {
      const batch = batches.available.find((b) => b.batchId === batchIdVal);
      if (batch) {
        setBatchId(batchIdVal);
        setProductName(batch.productName);
      }
    } else {
      setBatchId('');
      setProductName('');
    }
  };

  const handleSubmit = () => {
    if (!batchId || !operator) {
      alert('请选择批次和操作员');
      return;
    }

    const record: SinteringRecord = {
      id: generateId(),
      batchId,
      productName,
      furnaceId,
      furnaceNo: generateFurnaceNo(),
      atmosphereType,
      atmosphereFlow,
      dewPoint,
      maxTemperature,
      sinteringTime,
      tempCurve: generateDefaultTempCurve(),
      startTime: formatDate(new Date()),
      endTime: '',
      operator,
      status: 'sintering',
      createdAt: formatDate(new Date()),
    };

    addSintering(record);
    setShowForm(false);
    setSelectedId(record.id);
    resetForm();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sintering':
        return <StatusBadge status="sintering" text="烧结中" />;
      case 'completed':
        return <StatusBadge status="success" text="已完成" />;
      default:
        return <StatusBadge status="pending" text="待烧结" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PageCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flame size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">总炉次数</p>
              <p className="text-xl font-bold text-slate-800">{sinteringRecords.length}</p>
            </div>
          </div>
        </PageCard>
        <PageCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Play size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">进行中</p>
              <p className="text-xl font-bold text-amber-600">{activeCount}</p>
            </div>
          </div>
        </PageCard>
        <PageCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Square size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">已完成</p>
              <p className="text-xl font-bold text-green-600">{completedCount}</p>
            </div>
          </div>
        </PageCard>
        <PageCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Thermometer size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">最高温度</p>
              <p className="text-xl font-bold text-blue-600">
                {selectedRecord?.maxTemperature || 1120}°C
              </p>
            </div>
          </div>
        </PageCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PageCard
            title="烧结炉温曲线"
            subtitle={selectedRecord ? `${selectedRecord.furnaceNo} - ${selectedRecord.productName}` : '请选择炉次'}
            actions={
              <Button
                size="sm"
                variant={showForm ? 'secondary' : 'primary'}
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? <Square size={14} className="mr-1" /> : <Plus size={14} className="mr-1" />}
                {showForm ? '取消' : '新开炉次'}
              </Button>
            }
          >
            {selectedRecord ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedRecord.tempCurve} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      label={{ value: '时间 (分钟)', position: 'bottom', offset: -2, fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      label={{ value: '温度 (°C)', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#64748b' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`${value}°C`, '温度']}
                      labelFormatter={(label) => `时间: ${label} 分钟`}
                    />
                    <ReferenceLine y={selectedRecord.maxTemperature} stroke="#f97316" strokeDasharray="5 5" />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#165DFF"
                      strokeWidth={2}
                      dot={{ r: 2, fill: '#165DFF' }}
                      activeDot={{ r: 5, fill: '#165DFF' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Flame size={48} className="mx-auto mb-3 text-slate-300" />
                  <p>选择右侧炉次查看温度曲线</p>
                </div>
              </div>
            )}

            {showForm && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-4">新开烧结炉次</h4>
                <div className="space-y-4">
                  <FormField label="选择批次" required>
                    <Select
                      value={selectedBatch}
                      onChange={(e) => handleBatchChange(e.target.value)}
                      options={batchOptions}
                    />
                  </FormField>

                  {selectedBatch && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 text-blue-700 text-xs font-medium mb-2">
                        <Info size={14} />
                        上道工序信息（压制成型）
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600">
                        <div>产品名称: <span className="font-medium text-slate-800">{productName}</span></div>
                        <div>批次号: <span className="font-medium text-slate-800 font-mono">{batchId}</span></div>
                        <div>压坯密度: <span className="font-medium text-slate-800">{batches.available.find(b => b.batchId === selectedBatch)?.prevRecord?.greenDensity || '-'} g/cm³</span></div>
                        <div>压坯重量: <span className="font-medium text-slate-800">{batches.available.find(b => b.batchId === selectedBatch)?.prevRecord?.greenWeight || '-'} g</span></div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <FormField label="烧结炉">
                      <Select
                        value={furnaceId}
                        onChange={(e) => setFurnaceId(e.target.value)}
                        options={furnaceOptions}
                      />
                    </FormField>
                    <FormField label="保护气氛">
                      <Select
                        value={atmosphereType}
                        onChange={(e) => setAtmosphereType(e.target.value)}
                        options={atmosphereOptions}
                      />
                    </FormField>
                    <FormField label="气氛流量 (m³/h)">
                      <Input
                        type="number"
                        value={atmosphereFlow}
                        onChange={(e) => setAtmosphereFlow(parseFloat(e.target.value) || 0)}
                      />
                    </FormField>
                    <FormField label="露点 (°C)">
                      <Input
                        type="number"
                        value={dewPoint}
                        onChange={(e) => setDewPoint(parseFloat(e.target.value) || 0)}
                      />
                    </FormField>
                    <FormField label="最高温度 (°C)">
                      <Input
                        type="number"
                        value={maxTemperature}
                        onChange={(e) => setMaxTemperature(parseInt(e.target.value) || 0)}
                      />
                    </FormField>
                    <FormField label="保温时间 (分钟)">
                      <Input
                        type="number"
                        value={sinteringTime}
                        onChange={(e) => setSinteringTime(parseInt(e.target.value) || 0)}
                      />
                    </FormField>
                    <FormField label="操作员" required>
                      <Input
                        placeholder="操作员"
                        value={operator}
                        onChange={(e) => setOperator(e.target.value)}
                      />
                    </FormField>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={handleSubmit}>
                      <Play size={14} className="mr-2" />
                      开始烧结
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </PageCard>
        </div>

        <div className="space-y-6">
          <PageCard title="保护气氛监控" subtitle="实时参数">
            {selectedRecord ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wind size={18} className="text-blue-500" />
                    <span className="text-sm text-slate-600">气氛类型</span>
                  </div>
                  <span className="text-sm font-medium text-slate-800">{selectedRecord.atmosphereType}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wind size={18} className="text-green-500" />
                    <span className="text-sm text-slate-600">流量</span>
                  </div>
                  <span className="text-sm font-medium text-slate-800">{selectedRecord.atmosphereFlow} m³/h</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Droplets size={18} className="text-cyan-500" />
                    <span className="text-sm text-slate-600">露点</span>
                  </div>
                  <span className="text-sm font-medium text-slate-800">{selectedRecord.dewPoint} °C</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-orange-500" />
                    <span className="text-sm text-slate-600">保温时间</span>
                  </div>
                  <span className="text-sm font-medium text-slate-800">{selectedRecord.sinteringTime} 分钟</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                请选择炉次查看气氛参数
              </div>
            )}
          </PageCard>

          <PageCard title="炉次列表" subtitle={`${sinteringRecords.length} 条记录`}>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sinteringRecords.map((record) => (
                <div
                  key={record.id}
                  onClick={() => setSelectedId(record.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedId === record.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-medium text-slate-700">
                      {record.furnaceNo}
                    </span>
                    {getStatusBadge(record.status)}
                  </div>
                  <p className="text-sm font-medium text-slate-800">{record.productName}</p>
                  <Link
                    to={`/batch/${record.batchId}`}
                    className="text-xs font-mono text-blue-600 hover:text-blue-800 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {record.batchId}
                  </Link>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>炉号: {record.furnaceId}</span>
                    <span>{record.maxTemperature}°C</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{record.createdAt}</p>
                </div>
              ))}
            </div>
          </PageCard>
        </div>
      </div>
    </div>
  );
}
