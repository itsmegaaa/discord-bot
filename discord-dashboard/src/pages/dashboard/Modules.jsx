import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { botApi } from '../../lib/botApi.js';
import { useToast } from '../../hooks/useToast.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SectionCard from '../../components/ui/SectionCard.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';

export default function Modules() {
  const { guildId } = useParams();
  const { toast } = useToast();
  
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    botApi.get(`/api/guilds/${guildId}/modules`)
      .then((data) => {
        if (mounted) {
          setModules(data.modules || []);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Gagal memuat daftar modul.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
      
    return () => { mounted = false; };
  }, [guildId]);

  const handleToggle = async (moduleId, currentEnabled) => {
    const action = currentEnabled ? 'disable' : 'enable';
    
    // Optimistic UI update
    setModules(prev => 
      prev.map(mod => mod.id === moduleId ? { ...mod, enabled: !currentEnabled } : mod)
    );

    try {
      await botApi.post(`/api/guilds/${guildId}/modules/${moduleId}/${action}`);
      toast.success(`Modul ${moduleId} berhasil di-${action}.`);
    } catch (err) {
      // Revert if failed
      setModules(prev => 
        prev.map(mod => mod.id === moduleId ? { ...mod, enabled: currentEnabled } : mod)
      );
      toast.error(err.message || `Gagal mengubah status modul ${moduleId}.`);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState title="Unable to load modules" description={error} />;

  return (
    <div>
      <PageHeader
        icon={Layers}
        title="Module Manager"
        subtitle="Control which features and commands are available on your server."
      />

      <div className="grid gap-5">
        {modules.map((mod) => (
          <SectionCard 
            key={mod.id} 
            title={mod.name} 
            description={mod.description}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-slate-400">
                <span className="font-mono text-xs opacity-75">ID: {mod.id}</span>
                <span className="mx-2 opacity-30">•</span>
                <span className="font-mono text-xs opacity-75">v{mod.version}</span>
              </div>
              <Toggle 
                checked={mod.enabled} 
                onChange={() => handleToggle(mod.id, mod.enabled)} 
                label={mod.enabled ? "Enabled" : "Disabled"}
              />
            </div>
          </SectionCard>
        ))}

        {modules.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-slate-400">
            Tidak ada modul yang tersedia.
          </div>
        )}
      </div>
    </div>
  );
}
