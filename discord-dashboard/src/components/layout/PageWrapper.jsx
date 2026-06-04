import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function PageWrapper({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-[#2b2d31]">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="min-w-0 flex-1">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
