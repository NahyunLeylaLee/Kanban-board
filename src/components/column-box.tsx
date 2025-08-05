import { BoardData, Card, Column, DraggedCard, DragOver } from "../type/type";

interface IColumnProps {
  card: Card;
  cardIndex: number;
  setDragOverInfo: React.Dispatch<React.SetStateAction<DragOver | null>>;
  setDraggedCard: React.Dispatch<React.SetStateAction<DraggedCard | null>>;
  draggedCard: DraggedCard | null;
  dragOverInfo: DragOver | null;
  setData: React.Dispatch<React.SetStateAction<BoardData>>;
  data: BoardData;
  thisColumn: Column;
}

const ColumnBox = ({ card, cardIndex, setDragOverInfo, setDraggedCard, draggedCard, dragOverInfo, setData, data, thisColumn }: IColumnProps) => {
  const isDragging = draggedCard?.cardId === card.id;
  const isCardDropTarget = dragOverInfo?.cardId === card.id;
  const showDropIndicator = isCardDropTarget && draggedCard;

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

  // Card drop on another card
  const handleCardDragOver = (e: React.DragEvent, targetCardId: string, columnId: string) => {
    e.preventDefault();
    if (!draggedCard) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? 'before' : 'after';

    setDragOverInfo({ columnId, cardId: targetCardId, position });
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

  return (
    <div key={card.id} className="relative">
      {/* Drop indicator above */}
      {showDropIndicator && dragOverInfo?.position === 'before' && (
        <div className="h-1 bg-blue-400 rounded-full mb-2 animate-pulse" />
      )}

      <div
        draggable
        onDragStart={(e) => handleCardDragStart(e, card.id, thisColumn.id)}
        onDragEnd={handleCardDragEnd}
        onDragOver={(e) => handleCardDragOver(e, card.id, thisColumn.id)}
        onDrop={(e) => handleCardDrop(e, card.id, thisColumn.id)}
        className={`
                              group bg-white rounded-xl p-4 shadow-lg border border-gray-200 cursor-grab active:cursor-grabbing
                              transform transition-all duration-200 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]
                              relative ${isDragging ? 'z-50 opacity-50' : 'z-10'}
                              dark:bg-theme-card
                            `}
        style={{
          animationDelay: `${cardIndex * 50}ms`,
          animation: 'slideInUp 0.3s ease-out'
        }}
      >
        <button
          onClick={() => deleteCard(thisColumn.id, card.id)}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="pr-8">
          <h4 className="font-bold text-gray-900 mb-2 text-lg leading-tight dark:text-theme-text">
            {card.title}
          </h4>
          {card.description && (
            <p className="text-gray-600 text-sm leading-relaxed dark:text-theme-text">
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
};

export default ColumnBox;