import { useEffect } from "react";
import { useState } from "react";

function useSkeletonCount() {
    const [count, setCount] = useState(getSkeletonCount(window.innerWidth));

    useEffect(() => {
        const handleResize = () => {
            setCount(getSkeletonCount(window.innerWidth));
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize)
    }, [])
    return count;
}

function getSkeletonCount(width) {
    if (width >= 1280) return 8;
    if (width >= 1024) return 6;
    if (width >= 640) return 4;
    return 2;
}

export default useSkeletonCount;