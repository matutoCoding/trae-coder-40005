import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Save, X, Beaker } from 'lucide-react';
import { PageCard } from '@/components/PageCard';
import { FormField, Input, Select, Button } from '@/components/FormField';
import { useAppStore } from '@/store';
import { generateId, generateBatchNo, formatDate } from '@/utils';
import type { PowderFormula, PowderMixRecord } from '@/types';

const powderOptions = [
  { value: '铁粉', label: '铁粉' },
  { value: '铜粉', label: '铜粉' },
  { value: '石墨粉', label: '石墨粉' },
  { value: '镍粉', label: '镍粉' },
  { value: '钼粉', label: '钼粉' },
  { value: '锰粉', label: '锰粉' },
  { value: '锡粉', label: '锡粉' },
  { value: '钴粉', label: '钴粉' },
];

const lubricantOptions = [
  { value: '硬脂酸锌', label: '硬脂酸锌' },
  { value: '硬脂酸锂', label: '硬脂酸锂' },
  { value: '硬脂酸钙', label: '硬脂酸钙' },
  { value: '石蜡', label: '石蜡' },
];

export default function PowderMix() {
  const { powderMixRecords, addPowderMix } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [batchId, setBatchId] = useState(generateBatchNo());
  const [productName, setProductName] = useState('');
  const [formula, setFormula] = useState<PowderFormula[]>([
    { name: '铁粉', percentage: 95, weight: 47500 },
    { name: '铜粉', percentage: 2, weight: 1000 },
    { name: '石墨粉', percentage: 3, weight: 1500 },
  ]);
  const [lubricant, setLubricant] = useState('硬脂酸锌');
  const [lubricantWeight, setLubricantWeight] = useState(500);
  const [operator, setOperator] = useState('');
  const [mixingTime, setMixingTime] = useState(45);

  const totalWeight = formula.reduce((sum, f) => sum + f.weight, 0);
  const totalPercentage = formula.reduce((sum, f) => sum + f.percentage, 0);

  const recalcPercentages = (formulaList: PowderFormula[]): PowderFormula[] => {
    const total = formulaList.reduce((sum, f) => sum + f.weight, 0);
    return formulaList.map((f) => ({
      ...f,
      percentage: total > 0 ? parseFloat(((f.weight / total) * 100).toFixed(2)) : 0,
    }));
  };

  const addPowder = () => {
    const newFormula = [
      ...formula,
      { name: '铜粉', percentage: 0, weight: 1000 },
    ];
    setFormula(recalcPercentages(newFormula));
  };

  const removePowder = (index: number) => {
    if (formula.length > 1) {
      const newFormula = formula.filter((_, i) => i !== index);
      setFormula(recalcPercentages(newFormula));
    }
  };

  const updatePowder = (index: number, field: keyof PowderFormula, value: string | number) => {
    const newFormula = [...formula];
    newFormula[index] = { ...newFormula[index], [field]: value };

    if (field === 'weight') {
      const recalculated = recalcPercentages(newFormula);
      setFormula(recalculated);
    } else if (field === 'percentage') {
      const newPct = parseFloat(Number(value).toFixed(2));
      const otherTotalWeight = newFormula.reduce((sum, f, i) => sum + (i === index ? 0 : f.weight), 0);
      const otherTotalPct = newFormula.reduce((sum, f, i) => sum + (i === index ? 0 : f.percentage), 0);

      if (otherTotalPct > 0 && newPct > 0 && newPct < 100) {
        const targetTotalWeight = otherTotalWeight / ((100 - newPct) / 100);
        newFormula[index].weight = Math.round(targetTotalWeight * (newPct / 100));
        setFormula(recalcPercentages(newFormula));
      }
    } else {
      setFormula(newFormula);
    }
  };

  const handleSubmit = () => {
    if (!productName || !operator) {
      alert('请填写产品名称和操作员');
      return;
    }

    const finalFormula = recalcPercentages(formula);
    const finalTotalWeight = finalFormula.reduce((sum, f) => sum + f.weight, 0);

    const record: PowderMixRecord = {
      id: generateId(),
      batchId,
      productName,
      formula: finalFormula,
      totalWeight: finalTotalWeight,
      lubricant,
      lubricantWeight,
      operator,
      mixingTime,
      createdAt: formatDate(new Date()),
    };

    addPowderMix(record);
    setShowForm(false);
    setBatchId(generateBatchNo());
    setProductName('');
    setFormula([
      { name: '铁粉', percentage: 95, weight: 47500 },
      { name: '铜粉', percentage: 2, weight: 1000 },
      { name: '石墨粉', percentage: 3, weight: 1500 },
    ]);
    setLubricantWeight(500);
    setOperator('');
    setMixingTime(45);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PageCard
            title="粉末配料记录"
            subtitle="新增配料批次"
            actions={
              <Button
                size="sm"
                variant={showForm ? 'secondary' : 'primary'}
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? <X size={14} className="mr-1" /> : <Plus size={14} className="mr-1" />}
                {showForm ? '取消' : '新增配料'}
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

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">粉末配方</label>
                    <Button variant="ghost" size="sm" onClick={addPowder}>
                      <Plus size={14} className="mr-1" />
                      添加粉末
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formula.map((powder, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Select
                          value={powder.name}
                          onChange={(e) => updatePowder(index, 'name', e.target.value)}
                          options={powderOptions}
                          className="flex-1"
                        />
                        <div className="flex items-center gap-1 w-28">
                          <Input
                            type="number"
                            value={powder.weight}
                            onChange={(e) => updatePowder(index, 'weight', parseFloat(e.target.value) || 0)}
                            className="w-16 text-right"
                            placeholder="重量"
                          />
                          <span className="text-xs text-slate-500">g</span>
                        </div>
                        <div className="flex items-center gap-1 w-20">
                          <Input
                            type="number"
                            step="0.01"
                            value={powder.percentage}
                            onChange={(e) => updatePowder(index, 'percentage', parseFloat(e.target.value) || 0)}
                            className="w-14 text-right"
                            placeholder="占比"
                          />
                          <span className="text-xs text-slate-500">%</span>
                        </div>
                        <button
                          onClick={() => removePowder(index)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          disabled={formula.length <= 1}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">总重量</span>
                      <span className="font-semibold text-slate-800">{totalWeight.toLocaleString()} g</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">配比合计</span>
                      <span className={`font-semibold ${Math.abs(totalPercentage - 100) < 0.1 ? 'text-green-600' : 'text-orange-600'}`}>
                        {totalPercentage.toFixed(2)}%
                        {Math.abs(totalPercentage - 100) >= 0.1 && ' (需调整)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="润滑剂类型">
                    <Select
                      value={lubricant}
                      onChange={(e) => setLubricant(e.target.value)}
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
                  <FormField label="混料时间 (分钟)">
                    <Input
                      type="number"
                      value={mixingTime}
                      onChange={(e) => setMixingTime(parseInt(e.target.value) || 0)}
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
                  保存配料记录
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Beaker size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm">点击上方按钮新增配料记录</p>
              </div>
            )}
          </PageCard>
        </div>

        <div className="lg:col-span-2">
          <PageCard title="配料记录列表" subtitle={`共 ${powderMixRecords.length} 条记录`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">批次号</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">产品名称</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">配方</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600">总重量</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">润滑剂</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">操作员</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {powderMixRecords.map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <Link to={`/batch/${record.batchId}`} className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline">
                          {record.batchId}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{record.productName}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {record.formula.slice(0, 3).map((f, i) => (
                            <span
                              key={i}
                              className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded"
                            >
                              {f.name} {f.percentage}%
                            </span>
                          ))}
                          {record.formula.length > 3 && (
                            <span className="text-xs text-slate-400">+{record.formula.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">
                        {record.totalWeight.toLocaleString()} g
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {record.lubricant} ({record.lubricantWeight}g)
                      </td>
                      <td className="py-3 px-3 text-slate-600">{record.operator}</td>
                      <td className="py-3 px-3 text-slate-500 text-xs">{record.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {powderMixRecords.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p>暂无配料记录</p>
                </div>
              )}
            </div>
          </PageCard>
        </div>
      </div>
    </div>
  );
}
