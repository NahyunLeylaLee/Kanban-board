import { useState } from "react";
import { colors } from "../data/data";
import { BoardData, Card, DraggedCard, DragOver } from "../type/type";
import ColumnBox from "./column-box";

interface IBoardProps {
  columnId: string;
  index: number;
  data: BoardData
  setData: React.Dispatch<React.SetStateAction<BoardData>>;
}

const Board = ({ columnId, index, data, setData }: IBoardProps) => {
  // Drag state
  const [draggedCard, setDraggedCard] = useState<DraggedCard | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<DragOver | null>(null);
  const [newCardColumnId, setNewCardColumnId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');

  const column = data.columns[columnId];
  const isDropTarget = dragOverInfo?.columnId === columnId;
  const isDragSource = draggedColumn === columnId;
  // Column colors
  const getColumnColor = (index: number) => {
    return colors[index % colors.length];
  };
  const columnColor = getColumnColor(index);
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

  // Card drop on column (empty area)
  const handleColumnDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedCard) {
      setDragOverInfo({ columnId });
    } else if (draggedColumn) {
      setDragOverInfo({ columnId });
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

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverInfo(null);
    }
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

  const cancelAddCard = () => {
    setNewCardColumnId(null);
    setNewCardTitle('');
    setNewCardDescription('');
  };

  // 빈 공간에 대한 드래그 오버 핸들러 추가
  const handleEmptyAreaDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedCard) {
      setDragOverInfo({ columnId, isEmptyArea: true });
    }
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
                  dark:bg-theme-bg
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
      <div className="p-4 min-h-[300px] dark:bg-theme-bg">
        <div className="space-y-3">
          {column.cards.map((card, cardIndex) => (
            <ColumnBox
              card={card}
              cardIndex={cardIndex}
              setDragOverInfo={setDragOverInfo}
              setDraggedCard={setDraggedCard}
              draggedCard={draggedCard}
              dragOverInfo={dragOverInfo}
              setData={setData}
              data={data}
              thisColumn={column}
            />
          ))}
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
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 animate-in slide-in-from-bottom-4 duration-300 dark:bg-theme-bg">
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
}

export default Board;