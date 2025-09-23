import { useCallback, useEffect, useState } from "react";
import { downloadAndCacheImage, imageCache } from "../helpers/image-cache-controller";

export const useMemoriedImage = (path: string) => {
    console.log(`[useMemoriedImage] Received path: "${path}"`);
    const [data, setData] = useState<string | null>(imageCache[path]?.data || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const { imageBase64, valid } = await downloadAndCacheImage(path);
            if (!valid) {
                throw new Error("Network response was not ok");
            }
            setData(imageBase64);
        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    }, [path]);

    useEffect(() => {
        if (!path || typeof path !== "string") {
            setError(new Error("Invalid image path"));
            return;
        }
        setIsLoading(true);
        if (imageCache[path]) {
            setData(imageCache[path].data);
            setIsLoading(false);
        } else {
            fetchData();
        }
    }, [path]);

    return { data, isLoading, error };
};
