import { useRef, useEffect, useState } from 'react';

export const useElementSize = () => {
    const elementRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        setSize({ width, height });
        });
        // if(elementRef.current)
        resizeObserver.observe(elementRef.current);

        return () => {
            if(elementRef.current)
                // eslint-disable-next-line react-hooks/exhaustive-deps
                resizeObserver.unobserve(elementRef.current);
        };
    }, []);

    return [elementRef, size];
};