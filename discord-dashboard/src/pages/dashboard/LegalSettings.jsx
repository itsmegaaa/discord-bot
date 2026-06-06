import { FileText, ExternalLink } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SectionCard from '../../components/ui/SectionCard.jsx';

export default function LegalSettings() {
  return (
    <div>
      <PageHeader
        icon={FileText}
        title="Legal Pages"
        subtitle="Check the status and links of your public Terms and Privacy pages."
      />
      <div className="grid gap-5">
        <SectionCard title="Public Legal Pages" description="These pages are publicly accessible without login.">
          <div className="grid gap-4">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div>
                <div className="font-medium text-slate-200">Terms of Service</div>
                <div className="text-sm text-slate-400">/terms</div>
              </div>
              <a href="/terms" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 border border-white/10">
                Open <ExternalLink size={16} />
              </a>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div>
                <div className="font-medium text-slate-200">Privacy Policy</div>
                <div className="text-sm text-slate-400">/privacy</div>
              </div>
              <a href="/privacy" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 border border-white/10">
                Open <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
