import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: '仪表盘', subtitle: '生产数据概览与关键指标监控' },
  '/mixing-powder': { title: '粉末配料', subtitle: '金属粉末配比管理与配料记录' },
  '/blending': { title: '混料制粒', subtitle: '润滑剂混料与制粒参数管理' },
  '/pressing': { title: '压制成型', subtitle: '压制压力记录与压坯密度控制' },
  '/sintering': { title: '高温烧结', subtitle: '烧结炉温曲线与保护气氛监控' },
  '/sizing': { title: '复压整形', subtitle: '复压整形量与尺寸精度控制' },
  '/impregnation': { title: '浸油处理', subtitle: '含油轴承浸油与含油率管理' },
  '/inspection': { title: '尺寸检验', subtitle: '零件密度测量与尺寸公差检验' },
  '/furnace-ledger': { title: '炉次台账', subtitle: '烧结炉次完整记录与查询' },
};

export function Layout() {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || {
    title: '粉末冶金管理系统',
    subtitle: '',
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
