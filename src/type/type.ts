export interface Card {
  id: string;
  title: string;
  description?: string;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface BoardData {
  columns: { [key: string]: Column };
  columnOrder: string[];
}

export interface DragOver {
  columnId: string;
  cardId?: string;
  position?: 'before' | 'after';
  isEmptyArea?: boolean;
}

export interface DraggedCard {
  cardId: string;
  sourceColumnId: string;
}