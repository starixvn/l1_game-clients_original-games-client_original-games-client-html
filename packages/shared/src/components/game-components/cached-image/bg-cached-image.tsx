import { useEffect, useState } from "react";
import { downloadAndCacheImage, imageCache } from '@shared/helpers/image-cache-controller';

type Props = {
    pathImage: string;
    className?: string;
    backgroundSize?: string;
    backgroundRepeat?: string;
    backgroundPosition?: string;
    children?: React.ReactNode;
};

export const BgCachedImage: React.FC<Props> = ({
    pathImage,
    className,
    backgroundSize,
    backgroundRepeat,
    backgroundPosition,
    children,
}) => {
    const [source, setSource] = useState<string | null>(imageCache[pathImage]?.data || null);
    const props = { backgroundSize, backgroundRepeat, backgroundPosition };
    Object.keys(props).forEach((key) => props[key] === undefined && delete props[key]);

    useEffect(() => {
        const loadImage = async () => {
            const result = await downloadAndCacheImage(pathImage);
            setSource(result.imageBase64);
        };
        if (!imageCache[pathImage]) {
            loadImage();
        } else {
            setSource(imageCache[pathImage].data);
        }
    }, [pathImage]);

    return source ? (
        <div
            className={className}
            style={{
                backgroundImage: `url('${source.replace(/(\r\n|\n|\r)/gm, "")}')`,
                ...props,
            }}
        >
            {children}
        </div>
    ) : (
        <>{children}</>
    );
};
