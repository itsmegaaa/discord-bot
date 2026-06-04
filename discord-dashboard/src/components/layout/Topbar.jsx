import { Menu } from 'lucide-react';

export default function Topbar({ onMenu }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-white/5 bg-[#2b2d31] px-4">
      <button type="button" onClick={onMenu} className="rounded p-2 hover:bg-[#35373c] md:hidden">
        <Menu size={20} />
      </button>
      <div className="text-sm text-[#b5bac1]">Manage your Discord community</div>
    </header>
  );
}
