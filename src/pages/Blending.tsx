import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Save, X, Shuffle, Info } from 'lucide-react';
import { PageCard } from '@/components/PageCard';
import { FormField, Input, Select, Button } from '@/components/FormField';
import { useAppStore } from '@/store';
import { generateId, formatDate } from '@/utils';
import type { BlendingRecord, PowderMixRecord } from '@/types';

const lubricantOptions = [
  { value: '硬脂酸锌', label: '硬脂酸锌' },
  { value: '硬脂酸锂', label: '硬脂酸锂' },
  { value: '硬脂酸钙', label: '硬脂酸钙' },
  { value: '石蜡', label: '石蜡' },
];

const granulationSizeOptions = [
  { value: '40目', label: '40目' },
  { value: '60目', label: '60目' },
  { value: '80目', label: '80目' },
  { value: '100目', label: '100目' },
];

export default function Blending() {
  const { blendingRecords, addBlending, getAvailableBatches } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batchId, setBatchId] = useState('');
  const [productName, setProductName] = useState('');
  const [lubricantType, setLubricantType] = useState('硬脂酸锌');
  const [lubricantWeight, setLubricantWeight] = useState(500);
  const [mixingSpeed, setMixingSpeed] = useState(35);
  const [mixingTime, setMixingTime] = useState(45);
  const [granulationSize, setGranulationSize] = useState('60目');
  const [granulationYield, setGranulationYield] = useState(92);
  const [operator, setOperator] = useState('');

  const availableBatches = getAvailableBatches('blending') as { batchId: string; productName: string; prevRecord: PowderMixRecord }[];

  const resetForm = () => {
    setSelectedBatch('');
    setBatchId('');
    setProductName('');
    setLubricantType('硬脂酸锌');
    setLubricantWeight(500);
    setMixingSpeed(35);
    setMixingTime(45);
    setGranulationSize('60目');
    setGranulationYield(92);
    setOperator('');
  };

  const handleBatchChange = (batchIdVal: string) => {
    setSelectedBatch(batchIdVal);
    if (batchIdVal) {
      const batch = availableBatches.find((b) => b.batchId === batchIdVal);
      if (batch) {
        setBatchId(batchIdVal);
        setProductName(batch.productName);
        if (batch.prevRecord) {
          setLubricantType(batch.prevRecord.lubricant);
          setLubricantWeight(batch.prevRecord.lubricantWeight);
          setMixingTime(batch.prevRecord.mixingTime || 45);
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

    const record: BlendingRecord = {
      id: generateId(),
      batchId,
      productName,
      lubricantType,
      lubricantWeight,
      mixingSpeed,
      mixingTime,
      granulationSize,
      granulationYield,
      operator,
      createdAt: formatDate(new Date()),
    };

    addBlending(record);
    setShowForm(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PageCard
            title="混料制粒记录"
            subtitle="新增混料批次"
            actions={
              <Button
                size="sm"
                variant={showForm ? 'secondary' : 'primary'}
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? <X size={14} className="mr-1" /> : <Plus size={14} className="mr-1" />}
                {showForm ? '取消' : '新增混料'}
              </Button>
            }
          >
            {showForm ? (
              <div className="space-y-4">
                <FormField label="选择批次" required>
                  <Select
                    value={selectedBatch}
                    onChange={(e) => handleBatchChange(e.target.value)}
                    options={[
                      { value: '', label: '请选择配料批次' },
                      ...availableBatches.map((b) => ({
                        value: b.batchId,
                        label: `${b.batchId} - ${b.productName}`,
                      })),
                    ]}
                  />
                </FormField>

                {selectedBatch && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-700 text-xs font-medium mb-2">
                      <Info size={14} />
                      上道工序信息（粉末配料）
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>产品名称: <span className="font-medium text-slate-800">{productName}</span></div>
                      <div>批次号: <span className="font-medium text-slate-800 font-mono">{batchId}</span></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="润滑剂类型">
                    <Select
                      value={lubricantType}
                      onChange={(e) => setLubricantType(e.target.value)}
                      options={lubricantOptions}
                    />
                  </FormField>
                  <FormField label="润滑剂重量 (g)">
                    <Input
                      type="number"
                      value={lubricantWeight}
                      onChange={(e) => setLubricantWeight(parseFloat(e.target.value) || 0)}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="混料转速 (rpm)">
                    <Input
                      type="number"
                      value={mixingSpeed}
                      onChange={(e) => setMixingSpeed(parseInt(e.target.value) || 0)}
                    />
                  </FormField>
                  <FormField label="混料时间 (分钟)">
                    <Input
                      type="number"
                      value={mixingTime}
                      onChange={(e) => setMixingTime(parseInt(e.target.value) || 0)}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="制粒粒度">
                    <Select
                      value={granulationSize}
                      onChange={(e) => setGranulationSize(e.target.value)}
                      options={granulationSizeOptions}
                    />
                  </FormField>
                  <FormField label="制粒成品率 (%)">
                    <Input
                      type="number"
                      value={granulationYield}
                      onChange={(e) => setGranulationYield(parseFloat(e.target.value) || 0)}
                    />
                  </FormField>
                </div>

                <FormField label="操作员" required>
                  <Input
                    placeholder="请输入操作员"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                  />
                </FormField>

                <Button className="w-full" onClick={handleSubmit}>
                  <Save size={16} className="mr-2" />
                  保存混料记录
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Shuffle size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm">点击上方按钮新增混料记录</p>
              </div>
            )}
          </PageCard>
        </div>

        <div className="lg:col-span-2">
          <PageCard title="混料记录列表" subtitle={`共 ${blendingRecords.length} 条记录`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">批次号</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">产品名称</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">润滑剂</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">混料转速</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">混料时间</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">制粒粒度</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">成品率</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">操作员</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {blendingRecords.map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <Link to={`/batch/${record.batchId}`} className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline">
                          {record.batchId}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{record.productName}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {record.lubricantType} ({record.lubricantWeight}g)
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">{record.mixingSpeed} rpm</td>
                      <td className="py-3 px-3 text-right text-slate-700">{record.mixingTime} min</td>
                      <td className="py-3 px-3">
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                          {record.granulationSize}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-green-600">
                        {record.granulationYield}%
                      </td>
                      <td className="py-3 px-3 text-slate-600">{record.operator}</td>
                      <td className="py-3 px-3 text-slate-500 text-xs">{record.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {blendingRecords.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p>暂无混料记录</p>
                </div>
              )}
            </div>
          </PageCard>
        </div>
      </div>
    </div>
  );
}
