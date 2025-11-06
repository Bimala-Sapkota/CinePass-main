import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react"

export const useScrollAnimation = (options = {}) => {
    const {
        threshold = 0.1,
        rootMargin = '0px 0px -50px 0px',
        triggerOnce = false
    } = options;

    const [isVisible, setIsVisible] = useState(false)
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                if (triggerOnce) {
                    observer.disconnect();
                }
            } else if (!triggerOnce) {
                setIsVisible(false);
            }
        }, { threshold, rootMargin })

        const currentElement = elementRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        }
    }, [threshold, rootMargin, triggerOnce])

    return [elementRef, isVisible]
}

export const useReversibleScrollAnimation = (options = {}) => {
    return useScrollAnimation({
        ...options,
        triggerOnce: false
    })
}

export const useOnceScrollAnimation = (options = {}) => {
    return useScrollAnimation({
        ...options,
        triggerOnce: true
    });
};

export const useStaggeredAnimaton = (items, delay = 100) => {
    const [visibleItems, setVisibleItems] = useState(new Set())
    const [triggerRef, isInView] = useScrollAnimation({ threshold: 0.1 });

    useEffect(() => {
        if (isInView) {
            items.forEach((_, index) => {
                setTimeout(() => {
                    setVisibleItems(prev => new Set([...prev, index]));
                }, index * delay);
            })
        }
    }, [isInView, items, delay])

    return [triggerRef, visibleItems]
}

