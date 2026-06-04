export default function Toast({ message, tone = 'success', onClose }) {
  if (!message) return null;
  const color = tone === 'error' ? 'bg-[#ed4245]' : 'bg-[#57f287] text-black';
  return (
    <div className={`fixed bottom-5 right-5 z-50 rounded px-4 py-3 text-sm font-medium shadow-lg ${color}`}>
      <button type="button" onClick={onClose}>{message}</button>
    </div>
  );
}
