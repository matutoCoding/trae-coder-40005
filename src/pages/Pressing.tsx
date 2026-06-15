import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Save, X, Gauge, Info } from 'lucide-react';
import { PageCard } from '@/components/PageCard';
import { FormField, Input, Select, Button } from '@/components/FormField';
import { useAppStore } from '@/store';
import { generateId, formatDate } from '@/utils';
import type { PressingRecord, BlendingRecord } from '@/types';

const pressOptions = [
  { value: '100T液压机', label: '100T液压机' },
  { value: '200T液压机', label: '200T液压机' },
  { value: '315T液压机', label: '315T液压机' },
  { value: '500T液压机', label: '500T液压机' },
  { value: '机械式压力机', label: '机械式压力机' },
];

export default function Pressing() {
  const { pressingRecords, addPressing, getAvailableBatches } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batchId, setBatchId] = useState('');
  const [productName, setProductName] = useState('');
  const [pressModel, setPressModel] = useState('315T液压机');
  const [pressingPressure, setPressingPressure] = useState(315);
  const [pressingSpeed, setPressingSpeed] = useState(12);
  const [greenDensity, setGreenDensity] = useState(6.8);
  const [greenWeight, setGreenWeight] = useState(125.5);
  const [greenHeight, setGreenHeight] = useState(20.5);
  const [pressedQty, setPressedQty] = useState(380);
  const [operator, setOperator] = useState('');

  const batches = getAvailableBatches('pressing') as { available: { batchId: string; productName: string; prevRecord: BlendingRecord }[]; blocked: { batchId: string; productName: string; reason: string; prevRecord: BlendingRecord }[] };

  const batchOptions = [
    { value: '', label: '请选择混料批次' },
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

  const resetForm = () => {
    setSelectedBatch('');
    setBatchId('');
    setProductName('');
    setPressModel('315T液压机');
    setPressingPressure(315);
    setPressingSpeed(12);
    setGreenDensity(6.8);
    setGreenWeight(125.5);
    setGreenHeight(20.5);
    setPressedQty(380);
    setOperator('');
  };

  const handleBatchChange = (batchIdVal: string) => {
    setSelectedBatch(batchIdVal);
    if (batchIdVal) {
      const batch = batches.available.find((b) => b.batchId === batchIdVal);
      if (batch) {
        setBatchId(batchIdVal);
        setProductName(batch.productName);
        if (batch.prevRecord) {
          setPressingSpeed(batch.prevRecord.mixingSpeed || 12);
        }
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

    const record: PressingRecord = {
      id: generateId(),
      batchId,
      productName,
      pressModel,
      pressingPressure,
      pressingSpeed,
      greenDensity,
      greenWeight,
      greenHeight,
      pressedQty,
      operator,
      status: 'completed',
      createdAt: formatDate(new Date()),
    };

    addPressing(record);
    setShowForm(false);
    resetForm();
  };

  const avgPressure = pressingRecords.length > 0
    ? (pressingRecords.reduce((sum, r) => sum + r.pressingPressure, 0) / pressingRecords.length).toFixed(0)
    : 0;

  const avgDensity = pressingRecords.length > 0
    ? (pressingRecords.reduce((sum, r) => sum + r.greenDensity, 0) / pressingRecords.length).toFixed(2)
    : 0;

  const totalPressed = pressingRecords.reduce((sum, r) => sum + r.pressedQty, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PageCard>
          <div className="text-center">
            <p className="text-sm text-slate-500">平均压制压力</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{avgPressure} <span className="text-sm font-normal">T</span></p>
          </div>
        </PageCard>
        <PageCard>
          <div className="text-center">
            <p className="text-sm text-slate-500">平均压坯密度</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{avgDensity} <span className="text-sm font-normal">g/cm³</span></p>
          </div>
        </PageCard>
        <PageCard>
          <div className="text-center">
            <p className="text-sm text-slate-500">累计压制数量</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{totalPressed.toLocaleString()} <span className="text-sm font-normal">件</span></p>
          </div>
        </PageCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PageCard
            title="压制成型记录"
            subtitle="新增压制批次"
            actions={
              <Button
                size="sm"
                variant={showForm ? 'secondary' : 'primary'}
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? <X size={14} className="mr-1" /> : <Plus size={14} className="mr-1" />}
                {showForm ? '取消' : '新增压制'}
              </Button>
            }
          >
            {showForm ? (
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
                      上道工序信息（混料制粒）
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>产品名称: <span className="font-medium text-slate-800">{productName}</span></div>
                      <div>批次号: <span className="font-medium text-slate-800 font-mono">{batchId}</span></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="压机型号">
                    <Select
                      value={pressModel}
                      onChange={(e) => setPressModel(e.target.value)}
                      options={pressOptions}
                    />
                  </FormField>
                  <FormField label="压制压力 (T)">
                    <Input
                      type="number"
                      value={pressingPressure}
                      onChange={(e) => setPressingPressure(parseFloat(e.target.value) || 0)}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="压制速度 (件/min)">
                    <Input
                      type="number"
                      value={pressingSpeed}
                      onChange={(e) => setPressingSpeed(parseInt(e.target.value) || 0)}
                    />
                  </FormField>
                  <FormField label="压坯密度 (g/cm³)">
                    <Input
                      type="number"
                      step="0.1"
                      value={greenDensity}
                      onChange={(e) => setGreenDensity(parseFloat(e.target.value) || 0)}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="压坯重量 (g)">
                    <Input
                      type="number"
                      step="0.1"
                      value={greenWeight}
                      onChange={(e) => setGreenWeight(parseFloat(e.target.value) || 0)}
                    />
                  </FormField>
                  <FormField label="压坯高度 (mm)">
                    <Input
                      type="number"
                      step="0.1"
                      value={greenHeight}
                      onChange={(e) => setGreenHeight(parseFloat(e.target.value) || 0)}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="压制数量 (件)">
                    <Input
                      type="number"
                      value={pressedQty}
                      onChange={(e) => setPressedQty(parseInt(e.target.value) || 0)}
                    />
                  </FormField>
                  <FormField label="操作员" required>
                    <Input
                      placeholder="请输入操作员"
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                    />
                  </FormField>
                </div>

                <Button className="w-full" onClick={handleSubmit}>
                  <Save size={16} className="mr-2" />
                  保存压制记录
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Gauge size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm">点击上方按钮新增压制记录</p>
              </div>
            )}
          </PageCard>
        </div>

        <div className="lg:col-span-2">
          <PageCard title="压制记录列表" subtitle={`共 ${pressingRecords.length} 条记录`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">批次号</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">产品名称</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">压机型号</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">压制压力</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">压坯密度</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">压坯重量</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">数量</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">操作员</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {pressingRecords.map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <Link to={`/batch/${record.batchId}`} className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline">
                          {record.batchId}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{record.productName}</td>
                      <td className="py-3 px-3 text-slate-600">{record.pressModel}</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">{record.pressingPressure} T</td>
                      <td className="py-3 px-3 text-right text-green-600 font-medium">{record.greenDensity} g/cm³</td>
                      <td className="py-3 px-3 text-right text-slate-700">{record.greenWeight} g</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">{record.pressedQty} 件</td>
                      <td className="py-3 px-3 text-slate-600">{record.operator}</td>
                      <td className="py-3 px-3 text-slate-500 text-xs">{record.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pressingRecords.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p>暂无压制记录</p>
                </div>
              )}
            </div>
          </PageCard>
        </div>
      </div>
    </div>
  );
}
