import Image from "next/image";

export const MenuIcon = ({ name, onClick }: { name: string; onClick?: () => void }) => {
    return (
        <div className="cursor-pointer p-1" onClick={onClick}>
            <Image src={`/static/images/icons/${name}.svg`} height={24} width={24} alt="Logo" />
        </div>
    );
};
