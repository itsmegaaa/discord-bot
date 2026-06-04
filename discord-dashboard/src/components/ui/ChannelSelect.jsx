export default function ChannelSelect({ value, onChange, channels = [], label }) {
  return (
    <label className="grid gap-2 text-sm text-[#b5bac1]">
      {label}
      <select
        value={value || ''}
        onChange={(event) => onChange(event.target.value || null)}
        className="rounded border border-white/5 bg-[#2b2d31] px-3 py-2 text-[#f2f3f5] outline-none"
      >
        <option value="">Not set</option>
        {channels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            {channel.type === 'voice' ? 'Voice' : '#'} {channel.name}
          </option>
        ))}
      </select>
    </label>
  );
}
