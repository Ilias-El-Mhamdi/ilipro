import { useState } from 'react';

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  function copy(text: string) {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return { copied, copy };
}
