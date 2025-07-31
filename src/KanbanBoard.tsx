import React, { useState } from 'react';
import { colors, initial } from './data/data';
import { BoardData, Card, Column, DraggedCard, DragOver } from './type/type';
import Board from './components/board';

const KanbanBoard: React.FC = () => {
  // Initial data
  const [data, setData] = useState<BoardData>(initial);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

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

  const cancelAddColumn = () => {
    setIsAddingColumn(false);
    setNewColumnTitle('');
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
          {data.columnOrder.map((columnId, index) => (
            <Board columnId={columnId} index={index} data={data} setData={setData} />
          ))}

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