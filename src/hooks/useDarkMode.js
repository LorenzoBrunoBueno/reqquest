import { useCallback, useEffect, useState } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('rq_dark_mode') === 'true');

  useEffect(() => {
    document.body.setAttribute('data-dark', isDark ? 'true' : 'false');
  }, [isDark]);

  const toggle = useCallback((checked) => {
    localStorage.setItem('rq_dark_mode', String(checked));
    setIsDark(checked);
  }, []);

  return [isDark, toggle];
}
