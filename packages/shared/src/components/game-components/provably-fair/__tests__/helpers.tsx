import { render } from "@testing-library/react";
import { ReactNode } from "react";

const renderModal = (content?: ReactNode) => {
    const root = <div id="dashboard"></div>;
    const renderResult = render(root);
    const newNode = (
        <>
            {root}
            {content}
        </>
    );
    renderResult.rerender(newNode);

    return { renderResult, newNode };
};

export default { renderModal };
