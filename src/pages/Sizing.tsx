import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Save, X, Target, ArrowRight, Info } from 'lucide-react';
import { PageCard } from '@/components/PageCard';
import { FormField, Input, Select, Button } from '@/components/FormField';
import { useAppStore } from '@/store';
import { generateId, formatDate } from '@/utils';
import type { SizingRecord, SinteringRecord } from '@/types';

const pressOptions = [
  { value: '100T精整机', label: '100T精整机' },
  { value: '200T精整机', label: '200T精整机' },
  { value: '315T整形机', label: '315T整形机' },
  { value: '机械式整形机', label: '机械式整形机' },
];

export default function Sizing() {
  const { sizingRecords, addSizing, getAvailableBatches } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batchId, setBatchId] = useState('');
  const [productName, setProductName] = useState('');
  const [pressModel, setPressModel] = useState('100T精整机');
  const [sizingPressure, setSizingPressure] = useState(80);
  const [beforeSinterSize, setBeforeSinterSize] = useState(30.5);
  const [afterSinterSize, setAfterSinterSize] = useState(29.8);
  const [afterSizingSize, setAfterSizingSize] = useState(30.0);
  const [sizingQty, setSizingQty] = useState(375);
  const [operator, setOperator] = useState('');

  const batches = getAvailableBatches('sizing') as { available: { batchId: string; productName: string; prevRecord: SinteringRecord }[]; blocked: { batchId: string; productName: string; reason: string; prevRecord: SinteringRecord }[] };

  const batchOptions = [
    { value: '', label: '请选择烧结批次' },
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

  const sizingAmount = parseFloat(Math.abs(afterSizingSize - afterSinterSize).toFixed(3));

  const resetForm = () => {
    setSelectedBatch('');
    setBatchId('');
    setProductName('');
    setPressModel('100T精整机');
    setSizingPressure(80);
    setBeforeSinterSize(30.5);
    setAfterSinterSize(29.8);
    setAfterSizingSize(30.0);
    setSizingQty(375);
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

    const record: SizingRecord = {
      id: generateId(),
      batchId,
      productName,
      pressModel,
      sizingPressure,
      beforeSinterSize,
      afterSinterSize,
      afterSizingSize,
      sizingAmount,
      sizingQty,
      operator,
      status: 'completed',
      createdAt: formatDate(new Date()),
    };

    addSizing(record);
    setShowForm(false);
    resetForm();
  };

  const totalSized = sizingRecords.reduce((sum, r) => sum + r.sizingQty, 0);
  const avgSizingAmount = sizingRecords.length > 0
    ? (sizingRecords.reduce((sum, r) => sum + r.sizingAmount, 0) / sizingRecords.length).toFixed(3)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PageCard>
          <div className="text-center">
            <p className="text-sm text-slate-500">复压整形批次</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{sizingRecords.length} <span className="text-sm font-normal">批</span></p>
          </div>
        </PageCard>
        <PageCard>
          <div className="text-center">
            <p className="text-sm text-slate-500">累计整形数量</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{totalSized.toLocaleString()} <span className="text-sm font-normal">件</span></p>
          </div>
        </PageCard>
        <PageCard>
          <div className="text-center">
            <p className="text-sm text-slate-500">平均整形量</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{avgSizingAmount} <span className="text-sm font-normal">mm</span></p>
          </div>
        </PageCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PageCard
            title="复压整形记录"
            subtitle="新增整形批次"
            actions={
              <Button
                size="sm"
                variant={showForm ? 'secondary' : 'primary'}
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? <X size={14} className="mr-1" /> : <Plus size={14} className="mr-1" />}
                {showForm ? '取消' : '新增整形'}
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
                      上道工序信息（高温烧结）
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>产品名称: <span className="font-medium text-slate-800">{productName}</span></div>
                      <div>批次号: <span className="font-medium text-slate-800 font-mono">{batchId}</span></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="整形设备">
                    <Select
                      value={pressModel}
                      onChange={(e) => setPressModel(e.target.value)}
                      options={pressOptions}
                    />
                  </FormField>
                  <FormField label="整形压力 (T)">
                    <Input
                      type="number"
                      value={sizingPressure}
                      onChange={(e) => setSizingPressure(parseFloat(e.target.value) || 0)}
                    />
                  </FormField>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-700 mb-2">尺寸变化对比 (mm)</p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-center flex-1">
                      <p className="text-xs text-slate-500">压坯尺寸</p>
                      <Input
                        type="number"
                        step="0.01"
                        value={beforeSinterSize}
                        onChange={(e) => setBeforeSinterSize(parseFloat(e.target.value) || 0)}
                        className="text-center text-sm mt-1"
                      />
                    </div>
                    <ArrowRight size={14} className="text-slate-400" />
                    <div className="text-center flex-1">
                      <p className="text-xs text-slate-500">烧结后</p>
                      <Input
                        type="number"
                        step="0.01"
                        value={afterSinterSize}
                        onChange={(e) => setAfterSinterSize(parseFloat(e.target.value) || 0)}
                        className="text-center text-sm mt-1"
                      />
                    </div>
                    <ArrowRight size={14} className="text-slate-400" />
                    <div className="text-center flex-1">
                      <p className="text-xs text-slate-500">整形后</p>
                      <Input
                        type="number"
                        step="0.01"
                        value={afterSizingSize}
                        onChange={(e) => setAfterSizingSize(parseFloat(e.target.value) || 0)}
                        className="text-center text-sm mt-1 bg-green-50 border-green-200"
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="text-xs text-slate-500">整形量: </span>
                    <span className="text-sm font-bold text-green-600">
                      {sizingAmount} mm
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="整形数量 (件)">
                    <Input
                      type="number"
                      value={sizingQty}
                      onChange={(e) => setSizingQty(parseInt(e.target.value) || 0)}
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
                  保存整形记录
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Target size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm">点击上方按钮新增整形记录</p>
              </div>
            )}
          </PageCard>
        </div>

        <div className="lg:col-span-2">
          <PageCard title="整形记录列表" subtitle={`共 ${sizingRecords.length} 条记录`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">批次号</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">产品名称</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">设备</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">整形压力</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">烧结后尺寸</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">整形后尺寸</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">整形量</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">数量</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">操作员</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {sizingRecords.map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <Link to={`/batch/${record.batchId}`} className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline">
                          {record.batchId}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{record.productName}</td>
                      <td className="py-3 px-3 text-slate-600">{record.pressModel}</td>
                      <td className="py-3 px-3 text-right text-slate-700">{record.sizingPressure} T</td>
                      <td className="py-3 px-3 text-right text-slate-500">{record.afterSinterSize} mm</td>
                      <td className="py-3 px-3 text-right font-medium text-green-600">{record.afterSizingSize} mm</td>
                      <td className="py-3 px-3 text-right font-medium text-blue-600">{record.sizingAmount} mm</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">{record.sizingQty} 件</td>
                      <td className="py-3 px-3 text-slate-600">{record.operator}</td>
                      <td className="py-3 px-3 text-slate-500 text-xs">{record.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sizingRecords.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p>暂无整形记录</p>
                </div>
              )}
            </div>
          </PageCard>
        </div>
      </div>
    </div>
  );
}
