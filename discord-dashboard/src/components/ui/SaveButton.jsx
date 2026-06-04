import Button from './Button.jsx';

export default function SaveButton({ loading, children = 'Save', ...props }) {
  return (
    <Button loading={loading} {...props}>
      {loading ? 'Saving...' : children}
    </Button>
  );
}
