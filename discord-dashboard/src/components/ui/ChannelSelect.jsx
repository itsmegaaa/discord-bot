import FormField from './FormField.jsx';
import Select, { optionClassName } from './Select.jsx';

export default function ChannelSelect({ value, onChange, channels = [], label }) {
  return (
    <FormField label={label}>
      <Select
        value={value || ''}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="" className={optionClassName}>Not set</option>
        {channels.map((channel) => (
          <option key={channel.id} value={channel.id} className={optionClassName}>
            {channel.type === 'voice' ? 'Voice' : '#'} {channel.name}
          </option>
        ))}
      </Select>
    </FormField>
  );
}
