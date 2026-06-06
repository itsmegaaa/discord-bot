import { Database } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SectionCard from '../../components/ui/SectionCard.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import SaveButton from '../../components/ui/SaveButton.jsx';
import { useToast } from '../../hooks/useToast.js';
import { useState } from 'react';

export default function PrivacyData() {
  const { toast } = useToast();
  const [config, setConfig] = useState({ allowDataRequest: true, allowDataDeletion: true });

  const handleSave = () => {
    toast.success('Privacy settings saved.');
  };

  return (
    <div>
      <PageHeader
        icon={Database}
        title="Privacy & Data"
        subtitle="Manage user data, privacy options, and retention policies."
        actions={<SaveButton onClick={handleSave}>Save Changes</SaveButton>}
      />
      <div className="grid gap-5">
        <SectionCard title="User Data Requests" description="Configure how the bot handles /mydata and /deletemydata commands.">
          <div className="grid gap-4">
            <Toggle checked={config.allowDataRequest} onChange={(val) => setConfig({...config, allowDataRequest: val})} label="Allow users to request their data" />
            <Toggle checked={config.allowDataDeletion} onChange={(val) => setConfig({...config, allowDataDeletion: val})} label="Allow users to delete their data" />
          </div>
        </SectionCard>
        <SectionCard title="Data Export" description="Export your server's configuration and stored data.">
          <button className="rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 border border-white/10">
            Export Server Data (JSON)
          </button>
        </SectionCard>
      </div>
    </div>
  );
}
