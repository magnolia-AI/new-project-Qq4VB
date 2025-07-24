'use client'

import React, { useState } from 'react';
import { KanbanColumn as KanbanColumnType } from '@/lib/types/kanban';
import { useBoardContext } from './board-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MoreHorizontal, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  column: KanbanColumnType;
  isDraggedOver: boolean;
  draggedCardId: string | null;
  children: React.ReactNode;
}

export function KanbanColumn({ 
  column, 
  isDraggedOver, 
  draggedCardId,
  children 
}: KanbanColumnProps) {
  const { updateColumn, deleteColumn, createCard } = useBoardContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const handleSaveTitle = async () => {
    if (editTitle.trim() && editTitle !== column.title) {
      await updateColumn(column.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(column.title);
    setIsEditing(false);
  };

  const handleDeleteColumn = async () => {
    if (confirm('Are you sure you want to delete this column? All cards will be moved to the first column.')) {
      await deleteColumn(column.id);
    }
  };

  const handleCreateCard = async () => {
    if (newCardTitle.trim()) {
      await createCard({
        title: newCardTitle.trim(),
        columnId: column.id,
        description: '',
        priority: 'medium',
        dueDate: null,
        assigneeId: null,
        tags: [],
        position: 0,
      });
      setNewCardTitle('');
      setShowCreateCard(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isEditing) {
        handleSaveTitle();
      } else if (showCreateCard) {
        handleCreateCard();
      }
    } else if (e.key === 'Escape') {
      if (isEditing) {
        handleCancelEdit();
      } else if (showCreateCard) {
        setShowCreateCard(false);
        setNewCardTitle('');
      }
    }
  };

  const cardCount = React.Children.count(children);

  return (
    <Card className={cn(
      "h-full flex flex-col transition-colors duration-200",
      isDraggedOver && "ring-2 ring-primary ring-opacity-50 bg-primary/5"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="h-8 text-sm font-medium"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSaveTitle}
                  className="h-8 w-8 p-0"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <h3 
                  className="font-medium text-sm cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  {column.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {cardCount}
                </Badge>
              </>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Column
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowCreateCard(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDeleteColumn}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {column.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {column.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 pt-0 space-y-3 overflow-y-auto">
        {/* Quick Add Card */}
        {showCreateCard && (
          <Card className="border-dashed border-2 border-primary/30">
            <CardContent className="p-3">
              <Input
                placeholder="Enter card title..."
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateCard}>
                  Add Card
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setShowCreateCard(false);
                    setNewCardTitle('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cards */}
        {children}

        {/* Add Card Button */}
        {!showCreateCard && (
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground border-dashed border-2 border-transparent hover:border-border"
            onClick={() => setShowCreateCard(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add a card
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
