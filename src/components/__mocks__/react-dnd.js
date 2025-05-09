// Mock für react-dnd
module.exports = {
  useDrag: () => [{ isDragging: false }, jest.fn(), jest.fn()],
  useDrop: () => [{ isOver: false }, jest.fn()],
  DndProvider: ({ children }) => children
};
