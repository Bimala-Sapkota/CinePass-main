import React, { useEffect, useRef, useState } from 'react'

function useAnimateOnScroll(userOptions = {}) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null)
    const observer = useRef();

    useEffect(() => {
        observer.current = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                if (ref.current) observer.current.unobserve(ref.current);
            }
        }, userOptions);

        if (ref.current) observer.current.observe(ref.current);

        return () => observer.current.disconnect();
    }, [userOptions])
    return [ref, isVisible]
}

export default useAnimateOnScroll