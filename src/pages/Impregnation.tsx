import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Save, X, Droplet, Thermometer, Wind, Info } from 'lucide-react';
import { PageCard } from '@/components/PageCard';
import { FormField, Input, Select, Button } from '@/components/FormField';
import { useAppStore } from '@/store';
import { generateId, formatDate, calculateOilContentRate } from '@/utils';
import type { ImpregnationRecord, SizingRecord } from '@/types';

const oilOptions = [
  { value: '32号机械油', label: '32号机械油' },
  { value: '46号机械油', label: '46号机械油' },
  { value: '68号机械油', label: '68号机械油' },
  { value: '20号润滑油', label: '20号润滑油' },
  { value: '防锈油', label: '防锈油' },
];

export default function Impregnation() {
  const { impregnationRecords, addImpregnation, getAvailableBatches } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batchId, setBatchId] = useState('');
  const [productName, setProductName] = useState('');
  const [oilType, setOilType] = useState('32号机械油');
  const [oilTemperature, setOilTemperature] = useState(80);
  const [vacuumPressure, setVacuumPressure] = useState(-0.095);
  const [impregnationTime, setImpregnationTime] = useState(30);
  const [beforeWeight, setBeforeWeight] = useState(120.5);
  const [afterWeight, setAfterWeight] = useState(142.8);
  const [processedQty, setProcessedQty] = useState(370);
  const [operator, setOperator] = useState('');

  const availableBatches = getAvailableBatches('impregnation') as { batchId: string; productName: string; prevRecord: SizingRecord }[];

  const resetForm = () => {
    setSelectedBatch('');
    setBatchId('');
    setProductName('');
    setOilType('32号机械油');
    setOilTemperature(80);
    setVacuumPressure(-0.095);
    setImpregnationTime(30);
    setBeforeWeight(120.5);
    setAfterWeight(142.8);
    setProcessedQty(370);
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
          setProcessedQty(batch.prevRecord.sizingQty || 370);
          setBeforeWeight(batch.prevRecord.afterSizingSize ? 120.5 : 120.5);
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

    const oilContentRate = calculateOilContentRate(beforeWeight, afterWeight);

    const record: ImpregnationRecord = {
      id: generateId(),
      batchId,
      productName,
      oilType,
      oilTemperature,
      vacuumPressure,
      impregnationTime,
      oilContentRate,
      beforeWeight,
      afterWeight,
      processedQty,
      operator,
      createdAt: formatDate(new Date()),
    };

    addImpregnation(record);
    setShowForm(false);
    resetForm();
  };

  const totalProcessed = impregnationRecords.reduce((sum, r) => sum + r.processedQty, 0);
  const avgOilContent = impregnationRecords.length > 0
    ? (impregnationRecords.reduce((sum, r) => sum + r.oilContentRate, 0) / impregnationRecords.length).toFixed(2)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PageCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Droplet size={20} className="text-cyan-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">浸油批次</p>
              <p className="text-xl font-bold text-slate-800">{impregnationRecords.length}</p>
            </div>
          </div>
        </PageCard>
        <PageCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Droplet size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">累计数量</p>
              <p className="text-xl font-bold text-green-600">{totalProcessed.toLocaleString()} <span className="text-sm font-normal">件</span></p>
            </div>
          </div>
        </PageCard>
        <PageCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Thermometer size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">油温</p>
              <p className="text-xl font-bold text-blue-600">{oilTemperature} <span className="text-sm font-normal">°C</span></p>
            </div>
          </div>
        </PageCard>
        <PageCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Droplet size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">平均含油率</p>
              <p className="text-xl font-bold text-purple-600">{avgOilContent} <span className="text-sm font-normal">%</span></p>
            </div>
          </div>
        </PageCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PageCard
            title="浸油处理记录"
            subtitle="新增浸油批次"
            actions={
              <Button
                size="sm"
                variant={showForm ? 'secondary' : 'primary'}
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? <X size={14} className="mr-1" /> : <Plus size={14} className="mr-1" />}
                {showForm ? '取消' : '新增浸油'}
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
                      { value: '', label: '请选择复压整形批次' },
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
                      上道工序信息（复压整形）
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>产品名称: <span className="font-medium text-slate-800">{productName}</span></div>
                      <div>批次号: <span className="font-medium text-slate-800 font-mono">{batchId}</span></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="油品类型">
                    <Select
                      value={oilType}
                      onChange={(e) => setOilType(e.target.value)}
                      options={oilOptions}
                    />
                  </FormField>
                  <FormField label="油温 (°C)">
                    <Input
                      type="number"
                      value={oilTemperature}
                      onChange={(e) => setOilTemperature(parseFloat(e.target.value) || 0)}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="真空度 (MPa)">
                    <Input
                      type="number"
                      step="0.001"
                      value={vacuumPressure}
                      onChange={(e) => setVacuumPressure(parseFloat(e.target.value) || 0)}
                    />
                  </FormField>
                  <FormField label="浸油时间 (分钟)">
                    <Input
                      type="number"
                      value={impregnationTime}
                      onChange={(e) => setImpregnationTime(parseInt(e.target.value) || 0)}
                    />
                  </FormField>
                </div>

                <div className="p-3 bg-cyan-50 rounded-lg">
                  <p className="text-xs font-medium text-cyan-700 mb-2">含油率计算</p>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="浸油前重量 (g)">
                      <Input
                        type="number"
                        step="0.1"
                        value={beforeWeight}
                        onChange={(e) => setBeforeWeight(parseFloat(e.target.value) || 0)}
                      />
                    </FormField>
                    <FormField label="浸油后重量 (g)">
                      <Input
                        type="number"
                        step="0.1"
                        value={afterWeight}
                        onChange={(e) => setAfterWeight(parseFloat(e.target.value) || 0)}
                      />
                    </FormField>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-xs text-slate-500">含油率: </span>
                    <span className="text-lg font-bold text-cyan-600">{calculateOilContentRate(beforeWeight, afterWeight)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="处理数量 (件)">
                    <Input
                      type="number"
                      value={processedQty}
                      onChange={(e) => setProcessedQty(parseInt(e.target.value) || 0)}
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
                  保存浸油记录
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Droplet size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm">点击上方按钮新增浸油记录</p>
              </div>
            )}
          </PageCard>
        </div>

        <div className="lg:col-span-2">
          <PageCard title="浸油记录列表" subtitle={`共 ${impregnationRecords.length} 条记录`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">批次号</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">产品名称</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">油品类型</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">油温</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">真空度</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">浸油时间</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">含油率</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">数量</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">操作员</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {impregnationRecords.map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <Link to={`/batch/${record.batchId}`} className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline">
                          {record.batchId}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{record.productName}</td>
                      <td className="py-3 px-3 text-slate-600">{record.oilType}</td>
                      <td className="py-3 px-3 text-right text-slate-700">{record.oilTemperature}°C</td>
                      <td className="py-3 px-3 text-right text-slate-700">{record.vacuumPressure} MPa</td>
                      <td className="py-3 px-3 text-right text-slate-700">{record.impregnationTime} min</td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-block bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded text-xs font-medium">
                          {record.oilContentRate}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">{record.processedQty} 件</td>
                      <td className="py-3 px-3 text-slate-600">{record.operator}</td>
                      <td className="py-3 px-3 text-slate-500 text-xs">{record.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {impregnationRecords.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p>暂无浸油记录</p>
                </div>
              )}
            </div>
          </PageCard>
        </div>
      </div>
    </div>
  );
}
