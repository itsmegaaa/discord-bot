import FormField from './FormField.jsx';
import Select, { optionClassName } from './Select.jsx';

export default function RoleSelect({ value, onChange, roles = [], label, multiple = false }) {
  return (
    <FormField label={label}>
      <Select
        multiple={multiple}
        value={multiple ? value || [] : value || ''}
        onChange={(event) => {
          if (multiple) {
            onChange([...event.target.selectedOptions].map((option) => option.value));
          } else {
            onChange(event.target.value || null);
          }
        }}
        className={multiple ? 'min-h-28' : ''}
      >
        {!multiple && <option value="" className={optionClassName}>Not set</option>}
        {roles.map((role) => (
          <option key={role.id} value={role.id} className={optionClassName}>
            {role.name}
          </option>
        ))}
      </Select>
    </FormField>
  );
}
