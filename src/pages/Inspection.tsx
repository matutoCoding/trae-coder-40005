import { useState } from 'react';
import { Plus, Save, X, Ruler, Scale, Eye, CheckCircle, XCircle } from 'lucide-react';
import { PageCard } from '@/components/PageCard';
import { FormField, Input, Select, Button } from '@/components/FormField';
import { useAppStore } from '@/store';
import { generateId, generateBatchNo, formatDate, checkTolerance } from '@/utils';
import type { InspectionRecord, DimensionItem } from '@/types';

function generateDefaultDimensions(): DimensionItem[] {
  return [
    { name: '外径', nominal: 30, tolerance: '±0.05', measured: 30.02, result: 'pass' },
    { name: '内径', nominal: 15, tolerance: '±0.03', measured: 15.01, result: 'pass' },
    { name: '高度', nominal: 20, tolerance: '±0.05', measured: 20.03, result: 'pass' },
    { name: '厚度', nominal: 5, tolerance: '±0.02', measured: 4.99, result: 'pass' },
  ];
}

export default function Inspection() {
  const { inspectionRecords, addInspection } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [batchId, setBatchId] = useState(generateBatchNo());
  const [productName, setProductName] = useState('');
  const [density, setDensity] = useState(6.75);
  const [hardness, setHardness] = useState(65);
  const [dimensions, setDimensions] = useState<DimensionItem[]>(generateDefaultDimensions());
  const [crackCheck, setCrackCheck] = useState<'pass' | 'fail'>('pass');
  const [appearanceCheck, setAppearanceCheck] = useState<'pass' | 'fail'>('pass');
  const [sampleQty, setSampleQty] = useState(20);
  const [passQty, setPassQty] = useState(20);
  const [inspector, setInspector] = useState('');

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

  const allDimsPass = dimensions.every((d) => d.result === 'pass');
  const overallResult: 'pass' | 'fail' =
    allDimsPass && crackCheck === 'pass' && appearanceCheck === 'pass' ? 'pass' : 'fail';

  const handleSubmit = () => {
    if (!productName || !inspector) {
      alert('请填写产品名称和质检员');
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
      inspector,
      createdAt: formatDate(new Date()),
    };

    addInspection(record);
    setShowForm(false);
    setBatchId(generateBatchNo());
    setProductName('');
    setDensity(6.75);
    setHardness(65);
    setDimensions(generateDefaultDimensions());
    setCrackCheck('pass');
    setAppearanceCheck('pass');
    setSampleQty(20);
    setPassQty(20);
    setInspector('');
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
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? <X size={14} className="mr-1" /> : <Plus size={14} className="mr-1" />}
                {showForm ? '取消' : '新增检验'}
              </Button>
            }
          >
            {showForm ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="批次号" required>
                    <Input value={batchId} readOnly className="bg-slate-50" />
                  </FormField>
                  <FormField label="产品名称" required>
                    <Input
                      placeholder="请输入产品名称"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </FormField>
                </div>

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
                  </tr>
                </thead>
                <tbody>
                  {inspectionRecords.map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono text-xs text-blue-600">{record.batchId}</td>
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
    </div>
  );
}
