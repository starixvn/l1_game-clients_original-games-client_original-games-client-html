import { cn } from "@shared";
import Image from "next/image";
import styles from "./baccarat-highlight-shared.module.scss";

interface BaccaratHighlightBaseProps {
    choice: string;
    imagePath: string;
    shadowClass: string;
    withAnimation?: boolean;
}

export const BaccaratHighlightBase = ({
    choice,
    imagePath,
    shadowClass,
    withAnimation = false
}: BaccaratHighlightBaseProps) => {
    if (!imagePath) {
        return null;
    }

    return (
        <div className={cn(
            styles.highlight,
            styles[choice],
            { [styles.withAnimation]: withAnimation }
        )}>
            {shadowClass && <div className={styles[shadowClass]}></div>}
            <Image
                src={imagePath}
                alt={`highlight-winning-${choice}`}
                width={199}
                height={185}
                className="w-full h-full object-contain"
                priority
            />
        </div>
    );
};

export default BaccaratHighlightBase;
