import { SmilePlus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SectionCard from '../../components/ui/SectionCard.jsx';
import FormField from '../../components/ui/FormField.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import SaveButton from '../../components/ui/SaveButton.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function ReactionRoles() {
  const { toast } = useToast();

  const handleSave = () => {
    toast.success('Reaction roles saved.');
  };

  return (
    <div>
      <PageHeader
        icon={SmilePlus}
        title="Reaction Roles"
        subtitle="Allow members to self-assign roles by reacting to messages."
        actions={<SaveButton onClick={handleSave}>Save Changes</SaveButton>}
      />
      <div className="grid gap-5">
        <SectionCard title="Reaction Role Settings" description="Create and manage your reaction role sets.">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-slate-400">
            <p className="mb-4">No reaction roles configured yet.</p>
            <button className="rounded-xl bg-[#5865f2] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4752c4]">
              Create New Set
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
