import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Filter, ChevronDown, ChevronUp, Flame, Clock, User } from 'lucide-react';
import { PageCard } from '@/components/PageCard';
import { Input, Button, Select, StatusBadge } from '@/components/FormField';
import { useAppStore } from '@/store';
import { formatDate } from '@/utils';

export default function FurnaceLedger() {
  const { sinteringRecords } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredRecords = sinteringRecords.filter((record) => {
    const matchSearch =
      record.furnaceNo.toLowerCase().includes(searchText.toLowerCase()) ||
      record.productName.toLowerCase().includes(searchText.toLowerCase()) ||
      record.batchId.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchSearch && matchStatus;
  });

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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <PageCard>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="搜索炉次号、产品、批次..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: '全部状态' },
                  { value: 'sintering', label: '烧结中' },
                  { value: 'completed', label: '已完成' },
                  { value: 'pending', label: '待烧结' },
                ]}
                className="w-36"
              />
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Download size={14} className="mr-2" />
            导出台账
          </Button>
        </div>
      </PageCard>

      <PageCard title="烧结炉次台账" subtitle={`共 ${filteredRecords.length} 条记录`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-3 font-semibold text-slate-600 w-10"></th>
                <th className="text-left py-3 px-3 font-semibold text-slate-600">炉次号</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-600">批次号</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-600">产品名称</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-600">烧结炉</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-600">保护气氛</th>
                <th className="text-right py-3 px-3 font-semibold text-slate-600">最高温度</th>
                <th className="text-right py-3 px-3 font-semibold text-slate-600">保温时间</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-600">状态</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-600">操作员</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-600">开始时间</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <>
                  <tr
                    key={record.id}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    onClick={() => toggleExpand(record.id)}
                  >
                    <td className="py-3 px-3">
                      {expandedId === record.id ? (
                        <ChevronUp size={16} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-400" />
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs font-medium text-blue-600">
                      {record.furnaceNo}
                    </td>
                    <td className="py-3 px-3">
                      <Link
                        to={`/batch/${record.batchId}`}
                        className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {record.batchId}
                      </Link>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">{record.productName}</td>
                    <td className="py-3 px-3 text-slate-600">{record.furnaceId}</td>
                    <td className="py-3 px-3 text-slate-600">{record.atmosphereType}</td>
                    <td className="py-3 px-3 text-right font-medium text-orange-600">
                      {record.maxTemperature}°C
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700">{record.sinteringTime} min</td>
                    <td className="py-3 px-3">{getStatusBadge(record.status)}</td>
                    <td className="py-3 px-3 text-slate-600">{record.operator}</td>
                    <td className="py-3 px-3 text-slate-500 text-xs">{record.startTime}</td>
                  </tr>
                  {expandedId === record.id && (
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <td colSpan={11} className="py-4 px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-3">基本信息</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-500">炉次号</span>
                                <span className="font-medium text-slate-800">{record.furnaceNo}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">批次号</span>
                                <Link
                                  to={`/batch/${record.batchId}`}
                                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {record.batchId}
                                </Link>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">产品名称</span>
                                <span className="font-medium text-slate-800">{record.productName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">烧结炉</span>
                                <span className="font-medium text-slate-800">{record.furnaceId}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-3">
                              <Flame size={12} className="inline mr-1" />
                              温度参数
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-500">最高温度</span>
                                <span className="font-medium text-orange-600">{record.maxTemperature}°C</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">保温时间</span>
                                <span className="font-medium text-slate-800">{record.sinteringTime} 分钟</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">气氛流量</span>
                                <span className="font-medium text-slate-800">{record.atmosphereFlow} m³/h</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">露点</span>
                                <span className="font-medium text-slate-800">{record.dewPoint}°C</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-3">
                              <Clock size={12} className="inline mr-1" />
                              时间记录
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-500">开始时间</span>
                                <span className="font-medium text-slate-800">{record.startTime}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">结束时间</span>
                                <span className="font-medium text-slate-800">
                                  {record.endTime || '进行中'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">创建时间</span>
                                <span className="font-medium text-slate-800">{record.createdAt}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-3">
                              <User size={12} className="inline mr-1" />
                              人员信息
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-500">操作员</span>
                                <span className="font-medium text-slate-800">{record.operator}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">保护气氛</span>
                                <span className="font-medium text-slate-800">{record.atmosphereType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">状态</span>
                                {getStatusBadge(record.status)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {filteredRecords.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p>暂无匹配的炉次记录</p>
            </div>
          )}
        </div>
      </PageCard>
    </div>
  );
}
