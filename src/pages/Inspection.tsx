import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Save, X, Ruler, Scale, Eye, CheckCircle, XCircle, Info, RotateCcw } from 'lucide-react';
import { PageCard } from '@/components/PageCard';
import { FormField, Input, Select, Button } from '@/components/FormField';
import { useAppStore } from '@/store';
import { generateId, formatDate, checkTolerance } from '@/utils';
import type { InspectionRecord, DimensionItem, ImpregnationRecord } from '@/types';

function generateDefaultDimensions(): DimensionItem[] {
  return [
    { name: '外径', nominal: 30, tolerance: '±0.05', measured: 30.02, result: 'pass' },
    { name: '内径', nominal: 15, tolerance: '±0.03', measured: 15.01, result: 'pass' },
    { name: '高度', nominal: 20, tolerance: '±0.05', measured: 20.03, result: 'pass' },
    { name: '厚度', nominal: 5, tolerance: '±0.02', measured: 4.99, result: 'pass' },
  ];
}

export default function Inspection() {
  const { inspectionRecords, addInspection, getAvailableBatches, createRework, hasUnfinishedRework } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batchId, setBatchId] = useState('');
  const [productName, setProductName] = useState('');
  const [density, setDensity] = useState(6.75);
  const [hardness, setHardness] = useState(65);
  const [dimensions, setDimensions] = useState<DimensionItem[]>(generateDefaultDimensions());
  const [crackCheck, setCrackCheck] = useState<'pass' | 'fail'>('pass');
  const [appearanceCheck, setAppearanceCheck] = useState<'pass' | 'fail'>('pass');
  const [sampleQty, setSampleQty] = useState(20);
  const [passQty, setPassQty] = useState(20);
  const [inspector, setInspector] = useState('');
  const [prevImpregnationRecord, setPrevImpregnationRecord] = useState<ImpregnationRecord | null>(null);

  const [showReworkDialog, setShowReworkDialog] = useState(false);
  const [reworkTo, setReworkTo] = useState<'sizing' | 'sintering'>('sizing');
  const [reworkReason, setReworkReason] = useState('');
  const [reworkOperator, setReworkOperator] = useState('');
  const [lastSavedRecord, setLastSavedRecord] = useState<InspectionRecord | null>(null);
  const [selectedRecordForRework, setSelectedRecordForRework] = useState<InspectionRecord | null>(null);

  const batches = getAvailableBatches('inspection');

  const batchOptions = [
    { value: '', label: '请选择浸油批次' },
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

  const updateDimension = (index: number, field: keyof DimensionItem, value: string | number) => {
    const newDims = [...dimensions];
    newDims[index] = { ...newDims[index], [field]: value };
    if (field === 'measured') {
      newDims[index].result = checkTolerance(
        Number(value),
        newDims[index].nominal,
        newDims[index].tolerance
      );
    }
    setDimensions(newDims);
  };

  const resetForm = () => {
    setSelectedBatch('');
    setBatchId('');
    setProductName('');
    setDensity(6.75);
    setHardness(65);
    setDimensions(generateDefaultDimensions());
    setCrackCheck('pass');
    setAppearanceCheck('pass');
    setSampleQty(20);
    setPassQty(20);
    setInspector('');
    setPrevImpregnationRecord(null);
    setLastSavedRecord(null);
    setSelectedRecordForRework(null);
    setShowReworkDialog(false);
    setReworkTo('sizing');
    setReworkReason('');
    setReworkOperator('');
  };

  const handleBatchChange = (batchIdVal: string) => {
    setSelectedBatch(batchIdVal);
    if (batchIdVal) {
      const batch = batches.available.find((b) => b.batchId === batchIdVal);
      if (batch) {
        setBatchId(batchIdVal);
        setProductName(batch.productName);
        if (batch.prevRecord) {
          setPrevImpregnationRecord(batch.prevRecord as ImpregnationRecord);
        }
      }
    } else {
      setBatchId('');
      setProductName('');
      setPrevImpregnationRecord(null);
    }
  };

  const allDimsPass = dimensions.every((d) => d.result === 'pass');
  const overallResult: 'pass' | 'fail' =
    allDimsPass && crackCheck === 'pass' && appearanceCheck === 'pass' ? 'pass' : 'fail';

  const handleSubmit = () => {
    if (!batchId || !inspector) {
      alert('请选择批次和质检员');
      return;
    }

    const record: InspectionRecord = {
      id: generateId(),
      batchId,
      productName,
      density,
      hardness,
      dimensions: [...dimensions],
      crackCheck,
      appearanceCheck,
      sampleQty,
      passQty,
      overallResult,
      status: overallResult === 'pass' ? 'completed' : 'failed',
      inspector,
      createdAt: formatDate(new Date()),
    };

    addInspection(record);
    setLastSavedRecord(record);
    setShowForm(false);
  };

  const handleCreateRework = () => {
    const activeRecord = selectedRecordForRework || lastSavedRecord;
    if (!activeRecord || !reworkReason.trim() || !reworkOperator.trim()) {
      alert('请填写返工原因和操作人');
      return;
    }

    createRework(
      activeRecord.batchId,
      'inspection',
      reworkTo,
      reworkReason,
      reworkOperator
    );

    setShowReworkDialog(false);
    resetForm();
  };

  const handleInitiateReworkFromList = (record: InspectionRecord) => {
    setSelectedRecordForRework(record);
    setReworkOperator(record.inspector);
    setShowReworkDialog(true);
  };

  const passRate = inspectionRecords.length > 0
    ? ((inspectionRecords.filter((r) => r.overallResult === 'pass').length / inspectionRecords.length) * 100).toFixed(1)
    : 0;

  const avgDensity = inspectionRecords.length > 0
    ? (inspectionRecords.reduce((sum, r) => sum + r.density, 0) / inspectionRecords.length).toFixed(2)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PageCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Ruler size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">检验批次</p>
              <p className="text-xl font-bold text-slate-800">{inspectionRecords.length}</p>
            </div>
          </div>
        </PageCard>
        <PageCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">合格率</p>
              <p className="text-xl font-bold text-green-600">{passRate}%</p>
            </div>
          </div>
        </PageCard>
        <PageCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Scale size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">平均密度</p>
              <p className="text-xl font-bold text-purple-600">{avgDensity} <span className="text-sm font-normal">g/cm³</span></p>
            </div>
          </div>
        </PageCard>
        <PageCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Eye size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">检验员</p>
              <p className="text-xl font-bold text-slate-800">质检员王</p>
            </div>
          </div>
        </PageCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PageCard
            title="尺寸检验记录"
            subtitle="新增检验批次"
            actions={
              <Button
                size="sm"
                variant={showForm ? 'secondary' : 'primary'}
                onClick={() => {
                  setShowForm(!showForm);
                  if (showForm) {
                    resetForm();
                  }
                }}
              >
                {showForm ? <X size={14} className="mr-1" /> : <Plus size={14} className="mr-1" />}
                {showForm ? '取消' : '新增检验'}
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

                {selectedBatch && prevImpregnationRecord && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-700 text-xs font-medium mb-2">
                      <Info size={14} />
                      上道工序信息（浸油处理）
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>产品名称: <span className="font-medium text-slate-800">{productName}</span></div>
                      <div>批次号: <span className="font-medium text-slate-800 font-mono">{batchId}</span></div>
                      <div>含油率: <span className="font-medium text-slate-800">{prevImpregnationRecord.oilContentRate}%</span></div>
                      <div>处理数量: <span className="font-medium text-slate-800">{prevImpregnationRecord.processedQty} 件</span></div>
                      <div>油品类型: <span className="font-medium text-slate-800">{prevImpregnationRecord.oilType}</span></div>
                      <div>油温: <span className="font-medium text-slate-800">{prevImpregnationRecord.oilTemperature}°C</span></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="密度 (g/cm³)">
                    <Input
                      type="number"
                      step="0.01"
                      value={density}
                      onChange={(e) => setDensity(parseFloat(e.target.value) || 0)}
                    />
                  </FormField>
                  <FormField label="硬度 (HRB)">
                    <Input
                      type="number"
                      value={hardness}
                      onChange={(e) => setHardness(parseInt(e.target.value) || 0)}
                    />
                  </FormField>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">尺寸公差检验</label>
                  <div className="space-y-2">
                    {dimensions.map((dim, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                        <span className="text-xs font-medium text-slate-600 w-10">{dim.name}</span>
                        <span className="text-xs text-slate-400">{dim.nominal}</span>
                        <span className="text-xs text-slate-400">{dim.tolerance}</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={dim.measured}
                          onChange={(e) => updateDimension(index, 'measured', parseFloat(e.target.value) || 0)}
                          className="w-20 text-center text-sm flex-1"
                        />
                        {dim.result === 'pass' ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <XCircle size={16} className="text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="裂纹检查">
                    <Select
                      value={crackCheck}
                      onChange={(e) => setCrackCheck(e.target.value as 'pass' | 'fail')}
                      options={[
                        { value: 'pass', label: '合格' },
                        { value: 'fail', label: '不合格' },
                      ]}
                    />
                  </FormField>
                  <FormField label="外观检查">
                    <Select
                      value={appearanceCheck}
                      onChange={(e) => setAppearanceCheck(e.target.value as 'pass' | 'fail')}
                      options={[
                        { value: 'pass', label: '合格' },
                        { value: 'fail', label: '不合格' },
                      ]}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="抽样数量">
                    <Input
                      type="number"
                      value={sampleQty}
                      onChange={(e) => setSampleQty(parseInt(e.target.value) || 0)}
                    />
                  </FormField>
                  <FormField label="合格数量">
                    <Input
                      type="number"
                      value={passQty}
                      onChange={(e) => setPassQty(parseInt(e.target.value) || 0)}
                    />
                  </FormField>
                </div>

                <div className={`p-3 rounded-lg ${overallResult === 'pass' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center justify-center gap-2">
                    {overallResult === 'pass' ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <XCircle size={20} className="text-red-600" />
                    )}
                    <span className={`font-bold ${overallResult === 'pass' ? 'text-green-700' : 'text-red-700'}`}>
                      综合判定: {overallResult === 'pass' ? '合格' : '不合格'}
                    </span>
                  </div>
                </div>

                <FormField label="质检员" required>
                  <Input
                    placeholder="请输入质检员"
                    value={inspector}
                    onChange={(e) => setInspector(e.target.value)}
                  />
                </FormField>

                <Button className="w-full" onClick={handleSubmit}>
                  <Save size={16} className="mr-2" />
                  保存检验记录
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Ruler size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm">点击上方按钮新增检验记录</p>
              </div>
            )}

            {lastSavedRecord && lastSavedRecord.overallResult === 'fail' && !showForm && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="p-3 bg-red-50 rounded-lg border border-red-100 mb-3">
                  <div className="flex items-center gap-2 text-red-700 text-xs font-medium mb-1">
                    <XCircle size={14} />
                    上一条检验记录不合格
                  </div>
                  <p className="text-xs text-red-600">批次: {lastSavedRecord.batchId} - {lastSavedRecord.productName}</p>
                </div>
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => setShowReworkDialog(true)}
                >
                  <RotateCcw size={16} className="mr-2" />
                  发起返工
                </Button>
              </div>
            )}
          </PageCard>
        </div>

        <div className="lg:col-span-2">
          <PageCard title="检验记录列表" subtitle={`共 ${inspectionRecords.length} 条记录`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">批次号</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">产品名称</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">密度</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">硬度</th>
                    <th className="text-center py-3 px-3 font-semibold text-slate-600">尺寸</th>
                    <th className="text-center py-3 px-3 font-semibold text-slate-600">裂纹</th>
                    <th className="text-center py-3 px-3 font-semibold text-slate-600">外观</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">抽样/合格</th>
                    <th className="text-center py-3 px-3 font-semibold text-slate-600">结果</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">质检员</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">时间</th>
                    <th className="text-center py-3 px-3 font-semibold text-slate-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {inspectionRecords.map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <Link to={`/batch/${record.batchId}`} className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline">
                          {record.batchId}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{record.productName}</td>
                      <td className="py-3 px-3 text-right text-slate-700">{record.density} g/cm³</td>
                      <td className="py-3 px-3 text-right text-slate-700">HRB {record.hardness}</td>
                      <td className="py-3 px-3 text-center">
                        {record.dimensions.every((d) => d.result === 'pass') ? (
                          <span className="inline-flex items-center text-green-600 text-xs">
                            <CheckCircle size={14} className="mr-1" />合格
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-600 text-xs">
                            <XCircle size={14} className="mr-1" />不合格
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {record.crackCheck === 'pass' ? (
                          <CheckCircle size={16} className="mx-auto text-green-500" />
                        ) : (
                          <XCircle size={16} className="mx-auto text-red-500" />
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {record.appearanceCheck === 'pass' ? (
                          <CheckCircle size={16} className="mx-auto text-green-500" />
                        ) : (
                          <XCircle size={16} className="mx-auto text-red-500" />
                        )}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        {record.sampleQty}/{record.passQty}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            record.overallResult === 'pass'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {record.overallResult === 'pass' ? '合格' : '不合格'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{record.inspector}</td>
                      <td className="py-3 px-3 text-slate-500 text-xs">{record.createdAt}</td>
                      <td className="py-3 px-3 text-center">
                        {(record.status === 'failed' || record.overallResult === 'fail') && (
                          hasUnfinishedRework(record.batchId) ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                              返工中
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleInitiateReworkFromList(record)}
                            >
                              <RotateCcw size={12} className="mr-1" />
                              发起返工
                            </Button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {inspectionRecords.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p>暂无检验记录</p>
                </div>
              )}
            </div>
          </PageCard>
        </div>
      </div>

      {showReworkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">发起返工</h3>
              <button
                onClick={() => setShowReworkDialog(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                <p className="text-xs text-red-600">
                  批次: <span className="font-medium">{(selectedRecordForRework || lastSavedRecord)?.batchId}</span> - {(selectedRecordForRework || lastSavedRecord)?.productName}
                </p>
              </div>

              <FormField label="返工至" required>
                <Select
                  value={reworkTo}
                  onChange={(e) => setReworkTo(e.target.value as 'sizing' | 'sintering')}
                  options={[
                    { value: 'sizing', label: '复压整形' },
                    { value: 'sintering', label: '高温烧结' },
                  ]}
                />
              </FormField>

              <FormField label="返工原因" required>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                  rows={3}
                  placeholder="请填写返工原因"
                  value={reworkReason}
                  onChange={(e) => setReworkReason(e.target.value)}
                />
              </FormField>

              <FormField label="操作人" required>
                <Input
                  placeholder="请输入操作人"
                  value={reworkOperator}
                  onChange={(e) => setReworkOperator(e.target.value)}
                />
              </FormField>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <Button variant="secondary" onClick={() => setShowReworkDialog(false)}>
                取消
              </Button>
              <Button variant="danger" onClick={handleCreateRework}>
                <RotateCcw size={16} className="mr-2" />
                确认返工
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
