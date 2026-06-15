import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import PowderMix from '@/pages/PowderMix';
import Blending from '@/pages/Blending';
import Pressing from '@/pages/Pressing';
import Sintering from '@/pages/Sintering';
import Sizing from '@/pages/Sizing';
import Impregnation from '@/pages/Impregnation';
import Inspection from '@/pages/Inspection';
import FurnaceLedger from '@/pages/FurnaceLedger';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mixing-powder" element={<PowderMix />} />
          <Route path="/blending" element={<Blending />} />
          <Route path="/pressing" element={<Pressing />} />
          <Route path="/sintering" element={<Sintering />} />
          <Route path="/sizing" element={<Sizing />} />
          <Route path="/impregnation" element={<Impregnation />} />
          <Route path="/inspection" element={<Inspection />} />
          <Route path="/furnace-ledger" element={<FurnaceLedger />} />
        </Route>
      </Routes>
    </Router>
  );
}
