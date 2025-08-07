import { ReactEventHandler, useEffect, useState } from "react";
import { downloadAndCacheImage, imageCache } from "../../../_shared/helpers/image-cache-controller";
import Image from "next/image";

type Props = {
    src: string;
    alt: string;
    blurSrc?: string;
    width?: number;
    height?: number;
    priority?: boolean;
    className?: string;
    fill?: boolean;
    onLoad?: ReactEventHandler<HTMLImageElement>;
};

export const CachedImage: React.FC<Props> = ({ src, blurSrc, alt, width, height, priority, className, onLoad }) => {
    const [source, setSource] = useState<string | null>(imageCache[src]?.data || null);
    const props = { width, height, priority, className, onLoad };
    Object.keys(props).forEach((key) => props[key] === undefined && delete props[key]);
    useEffect(() => {
        const loadImage = async () => {
            const result = await downloadAndCacheImage(src);
            setSource(result.imageBase64);
        };
        if (!imageCache[src]) {
            loadImage();
        } else {
            setSource(imageCache[src].data);
        }
    }, [src]);
    return (source || blurSrc) && <Image className={className} src={source || blurSrc} alt={alt} {...props} />;
};
