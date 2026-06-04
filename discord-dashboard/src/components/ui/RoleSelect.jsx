export default function RoleSelect({ value, onChange, roles = [], label, multiple = false }) {
  return (
    <label className="grid gap-2 text-sm text-[#b5bac1]">
      {label}
      <select
        multiple={multiple}
        value={multiple ? value || [] : value || ''}
        onChange={(event) => {
          if (multiple) {
            onChange([...event.target.selectedOptions].map((option) => option.value));
          } else {
            onChange(event.target.value || null);
          }
        }}
        className="min-h-10 rounded border border-white/5 bg-[#2b2d31] px-3 py-2 text-[#f2f3f5] outline-none"
      >
        {!multiple && <option value="">Not set</option>}
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
    </label>
  );
}
