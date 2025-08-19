import styled from 'styled-components';

export const ScrollContainer = styled.div<{ $dragging?: boolean }>`
  overflow-x: auto;
  overflow-y: hidden;
  height: 100%;
  display: grid;
  user-select: none;
  touch-action: none;
  align-items: center;
  cursor: ${({ $dragging }) => ($dragging ? 'grabbing' : 'grab')};

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
