import { useCallback, useState } from 'react';

export function useSidebarCollapsed() {
  const [collapsed, setCollapsedState] = useState(() => localStorage.getItem('rq_sidebar_collapsed') === 'true');

  const toggle = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      localStorage.setItem('rq_sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  return [collapsed, toggle];
}
