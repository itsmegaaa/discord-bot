import { useState } from 'react';
import Button from './Button.jsx';

export default function SaveButton({ loading, children = 'Save', onClick, disabled, ...props }) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = loading || internalLoading;

  const handleClick = async (event) => {
    if (!onClick) return;

    const result = onClick(event);
    if (!result || typeof result.then !== 'function') return;

    setInternalLoading(true);
    try {
      await result;
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Button loading={isLoading} disabled={disabled || internalLoading} onClick={handleClick} {...props}>
      {isLoading ? 'Saving...' : children}
    </Button>
  );
}
