import React, { useState } from 'react';

// Types
interface Card {
  id: string;
  title: string;
  description?: string;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

interface BoardData {
  columns: { [key: string]: Column };
  columnOrder: string[];
}

const KanbanBoard: React.FC = () => {
  // Initial data
  const [data, setData] = useState<BoardData>({
    columns: {
      'todo': {
        id: 'todo',
        title: 'To Do',
        cards: [
          { id: '1', title: 'Design system review', description: 'Review and update the design system components' },
          { id: '2', title: 'API integration', description: 'Integrate user authentication API' },
          { id: '3', title: 'User testing', description: 'Conduct usability testing for the new features' },
        ]
      },
      'in-progress': {
        id: 'in-progress',
        title: 'In Progress',
        cards: [
          { id: '4', title: 'Database optimization', description: 'Optimize database queries for better performance' },
          { id: '5', title: 'Mobile responsiveness', description: 'Make the app fully responsive for mobile devices' },
        ]
      },
      'review': {
        id: 'review',
        title: 'Code Review',
        cards: [
          { id: '6', title: 'Pull request #123', description: 'Review authentication implementation' },
        ]
      },
      'done': {
        id: 'done',
        title: 'Done',
        cards: [
          { id: '7', title: 'Setup project', description: 'Initial project setup and configuration' },
          { id: '8', title: 'Create mockups', description: 'Design mockups for the main dashboard' },
        ]
      }
    },
    columnOrder: ['todo', 'in-progress', 'review', 'done']
  });

  const [newCardColumnId, setNewCardColumnId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  // Drag state
  const [draggedCard, setDraggedCard] = useState<{
    cardId: string;
    sourceColumnId: string;
  } | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<{
    columnId: string;
    cardId?: string;
    position?: 'before' | 'after';
    isEmptyArea?: boolean;
  } | null>(null);

  // Card drag handlers
  const handleCardDragStart = (e: React.DragEvent, cardId: string, sourceColumnId: string) => {
    setDraggedCard({ cardId, sourceColumnId });
    e.dataTransfer.effectAllowed = 'move';

    setTimeout(() => {
      const element = e.target as HTMLElement;
      element.style.opacity = '0.5';
    }, 0);
  };

  const handleCardDragEnd = (e: React.DragEvent) => {
    const element = e.target as HTMLElement;
    element.style.opacity = '1';
    setDraggedCard(null);
    setDragOverInfo(null);
  };

  // Column drag handlers
  const handleColumnDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = 'move';

    setTimeout(() => {
      const element = e.target as HTMLElement;
      element.style.opacity = '0.6';
    }, 0);
  };

  const handleColumnDragEnd = (e: React.DragEvent) => {
    const element = e.target as HTMLElement;
    element.style.opacity = '1';
    setDraggedColumn(null);
    setDragOverInfo(null);
  };

  // Card drop on another card
  const handleCardDragOver = (e: React.DragEvent, targetCardId: string, columnId: string) => {
    e.preventDefault();
    if (!draggedCard) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? 'before' : 'after';

    setDragOverInfo({ columnId, cardId: targetCardId, position });
  };

  // Card drop on column (empty area)
  const handleColumnDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedCard) {
      setDragOverInfo({ columnId });
    } else if (draggedColumn) {
      setDragOverInfo({ columnId });
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverInfo(null);
    }
  };

  // Handle card drop
  const handleCardDrop = (e: React.DragEvent, targetCardId: string, targetColumnId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedCard || !dragOverInfo) return;

    const { cardId: draggedCardId, sourceColumnId } = draggedCard;
    const { position } = dragOverInfo;

    if (draggedCardId === targetCardId) return;

    moveCard(draggedCardId, sourceColumnId, targetColumnId, targetCardId, position);
    setDraggedCard(null);
    setDragOverInfo(null);
  };

  // Handle column drop
  const handleColumnDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();

    if (draggedCard) {
      // Card dropped on column
      const { cardId, sourceColumnId } = draggedCard;
      if (sourceColumnId !== targetColumnId) {
        moveCardToColumn(cardId, sourceColumnId, targetColumnId);
      }
    } else if (draggedColumn) {
      // Column reordering
      if (draggedColumn !== targetColumnId) {
        moveColumn(draggedColumn, targetColumnId);
      }
    }

    setDraggedCard(null);
    setDraggedColumn(null);
    setDragOverInfo(null);
  };

  // Handle drop on empty area at end of column - 수정된 부분
  const handleEmptyAreaDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedCard) return;

    const { cardId, sourceColumnId } = draggedCard;

    // 다른 컬럼에서 이동하는 경우
    if (sourceColumnId !== columnId) {
      moveCardToColumn(cardId, sourceColumnId, columnId);
    } else {
      // 같은 컬럼 내에서 마지막 위치로 이동
      const column = data.columns[columnId];
      const sourceCardIndex = column.cards.findIndex(card => card.id === cardId);
      const lastIndex = column.cards.length - 1;

      // 이미 마지막 위치가 아닌 경우에만 이동
      if (sourceCardIndex !== lastIndex) {
        const reorderedCards = [...column.cards];
        const [movedCard] = reorderedCards.splice(sourceCardIndex, 1);
        reorderedCards.push(movedCard);

        setData({
          ...data,
          columns: {
            ...data.columns,
            [columnId]: { ...column, cards: reorderedCards }
          }
        });
      }
    }

    setDraggedCard(null);
    setDragOverInfo(null);
  };

  // 빈 공간에 대한 드래그 오버 핸들러 추가
  const handleEmptyAreaDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedCard) {
      setDragOverInfo({ columnId, isEmptyArea: true });
    }
  };

  // Move card to specific position
  const moveCard = (
    cardId: string,
    sourceColumnId: string,
    targetColumnId: string,
    targetCardId: string,
    position?: 'before' | 'after'
  ) => {
    const sourceColumn = data.columns[sourceColumnId];
    const targetColumn = data.columns[targetColumnId];
    const cardToMove = sourceColumn.cards.find(card => card.id === cardId);

    if (!cardToMove) return;

    if (sourceColumnId === targetColumnId) {
      // Moving within same column
      const sourceCardIndex = sourceColumn.cards.findIndex(card => card.id === cardId);
      const targetCardIndex = sourceColumn.cards.findIndex(card => card.id === targetCardId);

      if (sourceCardIndex === targetCardIndex) return;

      const reorderedCards = [...sourceColumn.cards];

      // Remove source card first
      reorderedCards.splice(sourceCardIndex, 1);

      // Calculate insert position after removal
      let insertIndex = targetCardIndex;

      // If we removed a card before the target, adjust target index
      if (sourceCardIndex < targetCardIndex) {
        insertIndex = targetCardIndex - 1;
      }

      // Apply position (before or after)
      if (position === 'after') {
        insertIndex += 1;
      }

      // Ensure index is within valid range
      insertIndex = Math.max(0, Math.min(insertIndex, reorderedCards.length));

      // Insert at calculated position
      reorderedCards.splice(insertIndex, 0, cardToMove);

      setData({
        ...data,
        columns: {
          ...data.columns,
          [sourceColumnId]: { ...sourceColumn, cards: reorderedCards }
        }
      });
    } else {
      // Moving to different column
      const newSourceCards = sourceColumn.cards.filter(card => card.id !== cardId);
      const targetCardIndex = targetColumn.cards.findIndex(card => card.id === targetCardId);

      let insertIndex = targetCardIndex;
      if (position === 'after') {
        insertIndex = targetCardIndex + 1;
      }

      const newTargetCards = [...targetColumn.cards];
      newTargetCards.splice(insertIndex, 0, cardToMove);

      setData({
        ...data,
        columns: {
          ...data.columns,
          [sourceColumnId]: { ...sourceColumn, cards: newSourceCards },
          [targetColumnId]: { ...targetColumn, cards: newTargetCards }
        }
      });
    }
  };

  // Move card to end of column
  const moveCardToColumn = (cardId: string, sourceColumnId: string, targetColumnId: string) => {
    const sourceColumn = data.columns[sourceColumnId];
    const targetColumn = data.columns[targetColumnId];
    const cardToMove = sourceColumn.cards.find(card => card.id === cardId);

    if (!cardToMove) return;

    const newSourceCards = sourceColumn.cards.filter(card => card.id !== cardId);
    const newTargetCards = [...targetColumn.cards, cardToMove];

    setData({
      ...data,
      columns: {
        ...data.columns,
        [sourceColumnId]: { ...sourceColumn, cards: newSourceCards },
        [targetColumnId]: { ...targetColumn, cards: newTargetCards }
      }
    });
  };

  // Move column
  const moveColumn = (sourceColumnId: string, targetColumnId: string) => {
    const sourceIndex = data.columnOrder.indexOf(sourceColumnId);
    const targetIndex = data.columnOrder.indexOf(targetColumnId);

    const newColumnOrder = [...data.columnOrder];
    newColumnOrder.splice(sourceIndex, 1);
    newColumnOrder.splice(targetIndex, 0, sourceColumnId);

    setData({
      ...data,
      columnOrder: newColumnOrder
    });
  };

  const addColumn = () => {
    if (!newColumnTitle.trim()) return;

    const newColumnId = `column-${Date.now()}`;
    const newColumn: Column = {
      id: newColumnId,
      title: newColumnTitle.trim(),
      cards: []
    };

    setData({
      columns: {
        ...data.columns,
        [newColumnId]: newColumn
      },
      columnOrder: [...data.columnOrder, newColumnId]
    });

    setIsAddingColumn(false);
    setNewColumnTitle('');
  };

  const deleteColumn = (columnId: string) => {
    const newColumns = { ...data.columns };
    delete newColumns[columnId];

    const newColumnOrder = data.columnOrder.filter(id => id !== columnId);

    setData({
      columns: newColumns,
      columnOrder: newColumnOrder
    });
  };

  const addCard = (columnId: string) => {
    if (!newCardTitle.trim()) return;

    const newCard: Card = {
      id: `card-${Date.now()}`,
      title: newCardTitle.trim(),
      description: newCardDescription.trim() || undefined
    };

    const column = data.columns[columnId];
    setData({
      ...data,
      columns: {
        ...data.columns,
        [columnId]: { ...column, cards: [...column.cards, newCard] }
      }
    });

    setNewCardColumnId(null);
    setNewCardTitle('');
    setNewCardDescription('');
  };

  const deleteCard = (columnId: string, cardId: string) => {
    const column = data.columns[columnId];
    const newCards = column.cards.filter(card => card.id !== cardId);

    setData({
      ...data,
      columns: {
        ...data.columns,
        [columnId]: { ...column, cards: newCards }
      }
    });
  };

  const cancelAddCard = () => {
    setNewCardColumnId(null);
    setNewCardTitle('');
    setNewCardDescription('');
  };

  const cancelAddColumn = () => {
    setIsAddingColumn(false);
    setNewColumnTitle('');
  };

  // Column colors
  const getColumnColor = (index: number) => {
    const colors = [
      { bg: 'bg-cyan-500', text: 'text-white' },
      { bg: 'bg-orange-500', text: 'text-white' },
      { bg: 'bg-green-500', text: 'text-white' },
      { bg: 'bg-purple-500', text: 'text-white' },
      { bg: 'bg-red-500', text: 'text-white' },
      { bg: 'bg-blue-500', text: 'text-white' },
      { bg: 'bg-pink-500', text: 'text-white' },
      { bg: 'bg-indigo-500', text: 'text-white' }
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2 tracking-tight">
            Kanban Board
          </h1>
          <p className="text-gray-600 text-lg">
            Drag and drop cards between columns to organize your tasks
          </p>
        </div>

        {/* Board */}
        <div className="flex gap-6 overflow-x-auto pb-6">
          {data.columnOrder.map((columnId, index) => {
            const column = data.columns[columnId];
            const isDropTarget = dragOverInfo?.columnId === columnId;
            const isDragSource = draggedColumn === columnId;
            const columnColor = getColumnColor(index);

            return (
              <div
                key={column.id}
                draggable
                onDragStart={(e) => handleColumnDragStart(e, column.id)}
                onDragEnd={handleColumnDragEnd}
                onDragOver={(e) => handleColumnDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleColumnDrop(e, column.id)}
                className={`
                  flex-shrink-0 w-80 bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-300 cursor-grab active:cursor-grabbing
                  ${isDropTarget && draggedCard ? 'ring-4 ring-cyan-300/60 bg-cyan-50 scale-105' : ''}
                  ${isDropTarget && draggedColumn ? 'ring-4 ring-yellow-300/60 bg-yellow-50 scale-105' : ''}
                  ${isDragSource ? 'opacity-75' : ''}
                `}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Column Header */}
                <div className={`${columnColor.bg} p-4 rounded-t-lg relative group flex items-center justify-between`}>
                  <h3 className={`text-lg font-bold ${columnColor.text} flex items-center gap-2`}>
                    {column.title}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </h3>

                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 text-white text-sm px-2 py-1 rounded-full font-medium">
                      {column.cards.length}
                    </div>

                    <button
                      onClick={() => deleteColumn(column.id)}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-4 min-h-[300px]">
                  <div className="space-y-3">
                    {column.cards.map((card, cardIndex) => {
                      const isDragging = draggedCard?.cardId === card.id;
                      const isCardDropTarget = dragOverInfo?.cardId === card.id;
                      const showDropIndicator = isCardDropTarget && draggedCard;

                      return (
                        <div key={card.id} className="relative">
                          {/* Drop indicator above */}
                          {showDropIndicator && dragOverInfo?.position === 'before' && (
                            <div className="h-1 bg-blue-400 rounded-full mb-2 animate-pulse" />
                          )}

                          <div
                            draggable
                            onDragStart={(e) => handleCardDragStart(e, card.id, column.id)}
                            onDragEnd={handleCardDragEnd}
                            onDragOver={(e) => handleCardDragOver(e, card.id, column.id)}
                            onDrop={(e) => handleCardDrop(e, card.id, column.id)}
                            className={`
                              group bg-white rounded-xl p-4 shadow-lg border border-gray-200 cursor-grab active:cursor-grabbing
                              transform transition-all duration-200 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]
                              relative ${isDragging ? 'z-50 opacity-50' : 'z-10'}
                            `}
                            style={{
                              animationDelay: `${cardIndex * 50}ms`,
                              animation: 'slideInUp 0.3s ease-out'
                            }}
                          >
                            <button
                              onClick={() => deleteCard(column.id, card.id)}
                              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>

                            <div className="pr-8">
                              <h4 className="font-bold text-gray-900 mb-2 text-lg leading-tight">
                                {card.title}
                              </h4>
                              {card.description && (
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {card.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              </div>
                              <div className="text-xs text-gray-400 font-medium">
                                #{cardIndex + 1}
                              </div>
                            </div>
                          </div>

                          {/* Drop indicator below */}
                          {showDropIndicator && dragOverInfo?.position === 'after' && (
                            <div className="h-1 bg-blue-400 rounded-full mt-2 animate-pulse" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Empty drop zone at the end of cards - 수정된 부분 */}
                  <div
                    className="mt-3 min-h-[40px] flex items-center justify-center"
                    onDragOver={(e) => handleEmptyAreaDragOver(e, column.id)}
                    onDrop={(e) => handleEmptyAreaDrop(e, column.id)}
                  >
                    {draggedCard && dragOverInfo?.columnId === column.id && dragOverInfo.isEmptyArea && (
                      <div className="w-full h-1 bg-blue-400 rounded-full animate-pulse" />
                    )}
                  </div>

                  {/* Add Card Section */}
                  <div className="mt-4">
                    {newCardColumnId === column.id ? (
                      <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 animate-in slide-in-from-bottom-4 duration-300">
                        <input
                          type="text"
                          placeholder="Enter card title..."
                          value={newCardTitle}
                          onChange={(e) => setNewCardTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              addCard(column.id);
                            } else if (e.key === 'Escape') {
                              cancelAddCard();
                            }
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          autoFocus
                        />
                        <textarea
                          placeholder="Add a description (optional)..."
                          value={newCardDescription}
                          onChange={(e) => setNewCardDescription(e.target.value)}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => addCard(column.id)}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                          >
                            Add Card
                          </button>
                          <button
                            onClick={cancelAddCard}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setNewCardColumnId(column.id)}
                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 group"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="font-medium">Add a card</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Column Section */}
          {isAddingColumn ? (
            <div className="flex-shrink-0 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <input
                type="text"
                placeholder="Enter column title..."
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addColumn();
                  } else if (e.key === 'Escape') {
                    cancelAddColumn();
                  }
                }}
                className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 font-medium"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={addColumn}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  Add Board
                </button>
                <button
                  onClick={cancelAddColumn}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="flex-shrink-0 w-80 h-24 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 group font-medium text-lg"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Board
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;