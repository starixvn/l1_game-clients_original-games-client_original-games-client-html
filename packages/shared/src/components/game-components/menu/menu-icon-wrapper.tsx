
export const MenuIconWrapper = ({ items }: { items?: React.ReactNode[] }) => {
    return <div className="flex gap-2 items-center">{items?.map((item, index) => <div key={index}>{item}</div>)}</div>;
};

export default MenuIconWrapper;
