import styled from "styled-components";

export const ScrollContainer = styled.div<{ $dragging?: boolean }>`
    overflow-x: auto;
    overflow-y: hidden;
    height: 100%;
    width: 100% !important; // Force full width
    min-width: 100% !important; // Force minimum width to parent
    max-width: none !important; // Remove max-width constraints
    display: grid;
    user-select: none;
    touch-action: none;
    align-items: center;
    cursor: ${({ $dragging }) => ($dragging ? "grabbing" : "grab")};
    grid-template-columns: 1fr; // Single column grid
    grid-template-rows: 1fr; // Single row grid
    box-sizing: border-box; // Include padding and border in width calculation
    flex: 1; // Take full available space
    flex-basis: 100%; // Ensure full basis
    flex-grow: 1; // Grow to fill available space
    flex-shrink: 0; // Don't shrink
    padding-bottom: 3px;

    &::-webkit-scrollbar {
        width: 5px;
        border-radius: 10px;
        background-color: #3d3d3d;
    }

    &::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background: linear-gradient(180deg, #84c0ff 0%, #064f9b 100%);
    }
`;
