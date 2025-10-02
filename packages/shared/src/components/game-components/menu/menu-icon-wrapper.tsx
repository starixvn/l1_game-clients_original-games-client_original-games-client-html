
export const MenuIconWrapper = ({ items }: { items?: React.ReactNode[] }) => {
    return <div className="flex gap-2 items-center">{items?.map((item) => item)}</div>;
};

export default MenuIconWrapper;
