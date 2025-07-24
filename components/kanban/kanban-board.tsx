'use client'

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useBoardContext } from './board-context';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { BoardHeader } from './board-header';
import { CreateColumnDialog } from './create-column-dialog';
import { CardDetailsDialog } from './card-details-dialog';
import { BoardSidebar } from './board-sidebar';
import { KanbanCard as KanbanCardType } from '@/lib/types/kanban';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface KanbanBoardProps {
  boardId: string;
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const {
    state,
    loadBoard,
    moveCard,
    getFilteredCards,
    setSearchQuery,
  } = useBoardContext();

  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [selectedCard, setSelectedCard] = useState<KanbanCardType | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  // Load board data on mount
  useEffect(() => {
    loadBoard(boardId);
  }, [boardId, loadBoard]);

  // Handle drag end
  const handleDragEnd = async (result: DropResult) => {
    setDraggedCard(null);
    
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Move the card
    await moveCard(
      draggableId,
      source.droppableId,
      destination.droppableId,
      destination.index
    );
  };

  const handleDragStart = (start: any) => {
    setDraggedCard(start.draggableId);
  };

  const handleCardClick = (card: KanbanCardType) => {
    setSelectedCard(card);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (state.isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="flex gap-6 h-full">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-80">
                <Skeleton className="h-12 w-full mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-28 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Board</h2>
          <p className="text-muted-foreground mb-4">{state.error}</p>
          <Button onClick={() => loadBoard(boardId)}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!state.currentBoard) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Board Not Found</h2>
          <p className="text-muted-foreground">The requested board could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Board Header */}
      <BoardHeader
        board={state.currentBoard}
        onSettingsClick={() => setShowSidebar(true)}
      />

      {/* Search and Filter Bar */}
      <div className="px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search cards..."
              value={state.searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowSidebar(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>

          {state.filter.assigneeId && (
            <Badge variant="secondary">
              Assignee: {state.currentUser?.name}
            </Badge>
          )}

          {state.filter.priority && (
            <Badge variant="secondary">
              Priority: {state.filter.priority}
            </Badge>
          )}

          {state.searchQuery && (
            <Badge variant="secondary">
              Search: "{state.searchQuery}"
            </Badge>
          )}
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <div className="h-full overflow-x-auto">
            <div className="flex gap-6 p-6 h-full min-w-max">
              {/* Columns */}
              {state.columns.map((column) => (
                <Droppable key={column.id} droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-shrink-0 w-80"
                    >
                      <KanbanColumn
                        column={column}
                        isDraggedOver={snapshot.isDraggingOver}
                        draggedCardId={draggedCard}
                      >
                        {getFilteredCards(column.id).map((card, index) => (
                          <Draggable
                            key={card.id}
                            draggableId={card.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => handleCardClick(card)}
                              >
                                <KanbanCard
                                  card={card}
                                  isDragging={snapshot.isDragging}
                                  isBeingDragged={draggedCard === card.id}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </KanbanColumn>
                    </div>
                  )}
                </Droppable>
              ))}

              {/* Add Column Button */}
              <div className="flex-shrink-0 w-80">
                <Button
                  variant="outline"
                  className="w-full h-12 border-dashed"
                  onClick={() => setShowCreateColumn(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
              </div>
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Dialogs */}
      <CreateColumnDialog
        open={showCreateColumn}
        onOpenChange={setShowCreateColumn}
        boardId={boardId}
      />

      {selectedCard && (
        <CardDetailsDialog
          card={selectedCard}
          open={!!selectedCard}
          onOpenChange={(open) => !open && setSelectedCard(null)}
        />
      )}

      <BoardSidebar
        open={showSidebar}
        onOpenChange={setShowSidebar}
        board={state.currentBoard}
      />
    </div>
  );
}
