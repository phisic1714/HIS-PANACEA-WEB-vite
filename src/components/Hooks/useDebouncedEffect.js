import { useEffect } from "react";

export const useDebouncedEffect = (effectFunc, deps, delay = 1000) => {
  useEffect(() => {
    const handler = setTimeout(() => effectFunc(), delay);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || []), delay]);
};
