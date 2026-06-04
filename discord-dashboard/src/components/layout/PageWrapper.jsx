import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function PageWrapper({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#0b0d13] text-slate-100">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="min-w-0 md:pl-72">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
