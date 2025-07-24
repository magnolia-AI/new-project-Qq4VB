'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { KanbanBoard, KanbanColumn, KanbanCard, KanbanTag, KanbanUser, KanbanActivity, CardFilter } from '@/lib/types/kanban';
import { KanbanStorage } from '@/lib/utils/storage';

// State interface
interface BoardState {
  currentBoard: KanbanBoard | null;
  columns: KanbanColumn[];
  cards: KanbanCard[];
  tags: KanbanTag[];
  activities: KanbanActivity[];
  currentUser: KanbanUser | null;
  filter: CardFilter;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

// Action types
type BoardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BOARD'; payload: KanbanBoard }
  | { type: 'SET_COLUMNS'; payload: KanbanColumn[] }
  | { type: 'SET_CARDS'; payload: KanbanCard[] }
  | { type: 'SET_TAGS'; payload: KanbanTag[] }
  | { type: 'SET_ACTIVITIES'; payload: KanbanActivity[] }
  | { type: 'SET_CURRENT_USER'; payload: KanbanUser }
  | { type: 'SET_FILTER'; payload: CardFilter }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'ADD_COLUMN'; payload: KanbanColumn }
  | { type: 'UPDATE_COLUMN'; payload: { id: string; updates: Partial<KanbanColumn> } }
  | { type: 'DELETE_COLUMN'; payload: string }
  | { type: 'ADD_CARD'; payload: KanbanCard }
  | { type: 'UPDATE_CARD'; payload: { id: string; updates: Partial<KanbanCard> } }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'MOVE_CARD'; payload: { cardId: string; sourceColumnId: string; targetColumnId: string; newPosition: number } }
  | { type: 'REORDER_CARDS'; payload: { columnId: string; cardIds: string[] } }
  | { type: 'ADD_TAG'; payload: KanbanTag }
  | { type: 'ADD_ACTIVITY'; payload: KanbanActivity };

// Initial state
const initialState: BoardState = {
  currentBoard: null,
  columns: [],
  cards: [],
  tags: [],
  activities: [],
  currentUser: null,
  filter: {},
  searchQuery: '',
  isLoading: false,
  error: null,
};

// Reducer
function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_BOARD':
      return { ...state, currentBoard: action.payload };
    
    case 'SET_COLUMNS':
      return { ...state, columns: action.payload };
    
    case 'SET_CARDS':
      return { ...state, cards: action.payload };
    
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };
    
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'ADD_COLUMN':
      return { ...state, columns: [...state.columns, action.payload].sort((a, b) => a.position - b.position) };
    
    case 'UPDATE_COLUMN':
      return {
        ...state,
        columns: state.columns.map(col =>
          col.id === action.payload.id ? { ...col, ...action.payload.updates } : col
        ),
      };
    
    case 'DELETE_COLUMN':
      return {
        ...state,
        columns: state.columns.filter(col => col.id !== action.payload),
        cards: state.cards.filter(card => card.columnId !== action.payload),
      };
    
    case 'ADD_CARD':
      return { ...state, cards: [...state.cards, action.payload] };
    
    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map(card =>
          card.id === action.payload.id ? { ...card, ...action.payload.updates } : card
        ),
      };
    
    case 'DELETE_CARD':
      return {
        ...state,
        cards: state.cards.filter(card => card.id !== action.payload),
      };
    
    case 'MOVE_CARD':
      return {
        ...state,
        cards: state.cards.map(card => {
          if (card.id === action.payload.cardId) {
            return {
              ...card,
              columnId: action.payload.targetColumnId,
              position: action.payload.newPosition,
            };
          }
          // Update positions of other cards in the target column
          if (card.columnId === action.payload.targetColumnId && card.position >= action.payload.newPosition) {
            return { ...card, position: card.position + 1 };
          }
          // Update positions of cards in the source column
          if (card.columnId === action.payload.sourceColumnId && card.position > action.payload.newPosition) {
            return { ...card, position: card.position - 1 };
          }
          return card;
        }),
      };
    
    case 'REORDER_CARDS':
      return {
        ...state,
        cards: state.cards.map(card => {
          if (card.columnId === action.payload.columnId) {
            const newPosition = action.payload.cardIds.indexOf(card.id);
            return newPosition !== -1 ? { ...card, position: newPosition } : card;
          }
          return card;
        }),
      };
    
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.payload] };
    
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities].slice(0, 50) };
    
    default:
      return state;
  }
}

// Context
interface BoardContextType {
  state: BoardState;
  dispatch: React.Dispatch<BoardAction>;
  // Board actions
  loadBoard: (boardId: string) => Promise<void>;
  updateBoard: (updates: Partial<KanbanBoard>) => Promise<void>;
  // Column actions
  createColumn: (column: Omit<KanbanColumn, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateColumn: (id: string, updates: Partial<KanbanColumn>) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  // Card actions
  createCard: (card: Omit<KanbanCard, 'id' | 'createdAt' | 'updatedAt' | 'tags' | 'comments' | 'attachments'>) => Promise<void>;
  updateCard: (id: string, updates: Partial<KanbanCard>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  moveCard: (cardId: string, sourceColumnId: string, targetColumnId: string, newPosition: number) => Promise<void>;
  // Tag actions
  createTag: (tag: Omit<KanbanTag, 'id' | 'createdAt'>) => Promise<void>;
  // Filter actions
  setFilter: (filter: CardFilter) => void;
  setSearchQuery: (query: string) => void;
  // Utility functions
  getFilteredCards: (columnId: string) => KanbanCard[];
  getColumnCards: (columnId: string) => KanbanCard[];
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

// Provider component
interface BoardProviderProps {
  children: ReactNode;
}

export function BoardProvider({ children }: BoardProviderProps) {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  // Initialize current user on mount
  useEffect(() => {
    const currentUser = KanbanStorage.getCurrentUser();
    if (currentUser) {
      dispatch({ type: 'SET_CURRENT_USER', payload: currentUser });
    } else {
      // Initialize sample data if no user exists
      KanbanStorage.initializeSampleData();
      const newCurrentUser = KanbanStorage.getCurrentUser();
      if (newCurrentUser) {
        dispatch({ type: 'SET_CURRENT_USER', payload: newCurrentUser });
      }
    }
  }, []);

  // Board actions
  const loadBoard = async (boardId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const board = KanbanStorage.getBoardById(boardId);
      if (!board) {
        throw new Error('Board not found');
      }

      const columns = KanbanStorage.getColumnsByBoardId(boardId);
      const tags = KanbanStorage.getTagsByBoardId(boardId);
      const activities = KanbanStorage.getActivitiesByBoardId(boardId);

      // Load cards for all columns
      const allCards: KanbanCard[] = [];
      for (const column of columns) {
        const columnCards = KanbanStorage.getCardsByColumnId(column.id);
        allCards.push(...columnCards);
      }

      dispatch({ type: 'SET_BOARD', payload: board });
      dispatch({ type: 'SET_COLUMNS', payload: columns });
      dispatch({ type: 'SET_CARDS', payload: allCards });
      dispatch({ type: 'SET_TAGS', payload: tags });
      dispatch({ type: 'SET_ACTIVITIES', payload: activities });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load board' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateBoard = async (updates: Partial<KanbanBoard>) => {
    if (!state.currentBoard) return;

    try {
      const updatedBoard = KanbanStorage.updateBoard(state.currentBoard.id, updates);
      if (updatedBoard) {
        dispatch({ type: 'SET_BOARD', payload: updatedBoard });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update board' });
    }
  };

  // Column actions
  const createColumn = async (column: Omit<KanbanColumn, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newColumn = KanbanStorage.createColumn(column);
      dispatch({ type: 'ADD_COLUMN', payload: newColumn });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create column' });
    }
  };

  const updateColumn = async (id: string, updates: Partial<KanbanColumn>) => {
    try {
      const updatedColumn = KanbanStorage.updateColumn(id, updates);
      if (updatedColumn) {
        dispatch({ type: 'UPDATE_COLUMN', payload: { id, updates } });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update column' });
    }
  };

  const deleteColumn = async (id: string) => {
    try {
      const success = KanbanStorage.deleteColumn(id);
      if (success) {
        dispatch({ type: 'DELETE_COLUMN', payload: id });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete column' });
    }
  };

  // Card actions
  const createCard = async (card: Omit<KanbanCard, 'id' | 'createdAt' | 'updatedAt' | 'tags' | 'comments' | 'attachments'>) => {
    try {
      const newCard = KanbanStorage.createCard(card);
      dispatch({ type: 'ADD_CARD', payload: newCard });
      
      // Add activity
      const activity = KanbanStorage.createActivity({
        type: 'card_created',
        description: `Card "${newCard.title}" was created`,
        entityType: 'card',
        entityId: newCard.id,
        boardId: state.currentBoard?.id || '',
        userId: state.currentUser?.id,
      });
      dispatch({ type: 'ADD_ACTIVITY', payload: activity });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create card' });
    }
  };

  const updateCard = async (id: string, updates: Partial<KanbanCard>) => {
    try {
      const updatedCard = KanbanStorage.updateCard(id, updates);
      if (updatedCard) {
        dispatch({ type: 'UPDATE_CARD', payload: { id, updates } });
        
        // Add activity for significant changes
        if (updates.columnId) {
          const activity = KanbanStorage.createActivity({
            type: 'card_moved',
            description: `Card "${updatedCard.title}" was moved`,
            entityType: 'card',
            entityId: id,
            boardId: state.currentBoard?.id || '',
            userId: state.currentUser?.id,
          });
          dispatch({ type: 'ADD_ACTIVITY', payload: activity });
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update card' });
    }
  };

  const deleteCard = async (id: string) => {
    try {
      const success = KanbanStorage.deleteCard(id);
      if (success) {
        dispatch({ type: 'DELETE_CARD', payload: id });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete card' });
    }
  };

  const moveCard = async (cardId: string, sourceColumnId: string, targetColumnId: string, newPosition: number) => {
    try {
      // Update card in storage
      const updatedCard = KanbanStorage.updateCard(cardId, {
        columnId: targetColumnId,
        position: newPosition,
      });

      if (updatedCard) {
        dispatch({
          type: 'MOVE_CARD',
          payload: { cardId, sourceColumnId, targetColumnId, newPosition },
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to move card' });
    }
  };

  // Tag actions
  const createTag = async (tag: Omit<KanbanTag, 'id' | 'createdAt'>) => {
    try {
      const newTag = KanbanStorage.createTag(tag);
      dispatch({ type: 'ADD_TAG', payload: newTag });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create tag' });
    }
  };

  // Filter actions
  const setFilter = (filter: CardFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  // Utility functions
  const getFilteredCards = (columnId: string): KanbanCard[] => {
    let cards = state.cards.filter(card => card.columnId === columnId && !card.archived);

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      cards = cards.filter(card =>
        card.title.toLowerCase().includes(query) ||
        card.description?.toLowerCase().includes(query)
      );
    }

    // Apply other filters
    if (state.filter.assigneeId) {
      cards = cards.filter(card => card.assigneeId === state.filter.assigneeId);
    }

    if (state.filter.priority) {
      cards = cards.filter(card => card.priority === state.filter.priority);
    }

    if (state.filter.tags && state.filter.tags.length > 0) {
      cards = cards.filter(card =>
        card.tags.some(tag => state.filter.tags!.includes(tag.id))
      );
    }

    if (state.filter.dueDate) {
      cards = cards.filter(card => {
        if (!card.dueDate) return false;
        const dueDate = new Date(card.dueDate);
        const { from, to } = state.filter.dueDate!;
        
        if (from && dueDate < from) return false;
        if (to && dueDate > to) return false;
        
        return true;
      });
    }

    return cards.sort((a, b) => a.position - b.position);
  };

  const getColumnCards = (columnId: string): KanbanCard[] => {
    return state.cards
      .filter(card => card.columnId === columnId && !card.archived)
      .sort((a, b) => a.position - b.position);
  };

  const contextValue: BoardContextType = {
    state,
    dispatch,
    loadBoard,
    updateBoard,
    createColumn,
    updateColumn,
    deleteColumn,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    createTag,
    setFilter,
    setSearchQuery,
    getFilteredCards,
    getColumnCards,
  };

  return (
    <BoardContext.Provider value={contextValue}>
      {children}
    </BoardContext.Provider>
  );
}

// Hook to use the board context
export function useBoardContext() {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
}
