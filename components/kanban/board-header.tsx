'use client'

import React, { useState } from 'react';
import { KanbanBoard } from '@/lib/types/kanban';
import { useBoardContext } from './board-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Settings, 
  Star, 
  Share2, 
  MoreHorizontal, 
  Edit3, 
  Check, 
  X,
  Users,
  Activity,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface BoardHeaderProps {
  board: KanbanBoard;
  onSettingsClick: () => void;
}

export function BoardHeader({ board, onSettingsClick }: BoardHeaderProps) {
  const { updateBoard, state } = useBoardContext();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(board.title);
  const [editDescription, setEditDescription] = useState(board.description || '');

  const handleSaveTitle = async () => {
    if (editTitle.trim() && editTitle !== board.title) {
      await updateBoard({ title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = async () => {
    if (editDescription !== board.description) {
      await updateBoard({ description: editDescription });
    }
    setIsEditingDescription(false);
  };

  const handleCancelTitle = () => {
    setEditTitle(board.title);
    setIsEditingTitle(false);
  };

  const handleCancelDescription = () => {
    setEditDescription(board.description || '');
    setIsEditingDescription(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: 'title' | 'description') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (action === 'title') {
        handleSaveTitle();
      } else {
        handleSaveDescription();
      }
    } else if (e.key === 'Escape') {
      if (action === 'title') {
        handleCancelTitle();
      } else {
        handleCancelDescription();
      }
    }
  };

  const totalCards = state.cards.filter(card => !card.archived).length;
  const completedCards = state.cards.filter(card => {
    const doneColumn = state.columns.find(col => 
      col.title.toLowerCase().includes('done') || 
      col.title.toLowerCase().includes('complete')
    );
    return doneColumn && card.columnId === doneColumn.id && !card.archived;
  }).length;

  return (
    <div className="bg-card border-b px-6 py-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Board Title */}
          <div className="flex items-center gap-3 mb-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'title')}
                  className="text-2xl font-bold h-auto py-1 px-2 border-none shadow-none focus-visible:ring-1"
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={handleSaveTitle}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelTitle}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-2xl font-bold text-foreground truncate">
                  {board.title}
                </h1>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            )}

            {board.isTemplate && (
              <Badge variant="secondary">Template</Badge>
            )}

            {board.templateType && (
              <Badge variant="outline" className="capitalize">
                {board.templateType.replace('-', ' ')}
              </Badge>
            )}
          </div>

          {/* Board Description */}
          <div className="mb-3">
            {isEditingDescription ? (
              <div className="flex items-start gap-2">
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'description')}
                  placeholder="Add a description for this board..."
                  className="min-h-[60px] resize-none"
                  autoFocus
                />
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="ghost" onClick={handleSaveDescription}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelDescription}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="group cursor-pointer" onClick={() => setIsEditingDescription(true)}>
                {board.description ? (
                  <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground transition-colors">
                    {board.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm italic group-hover:text-foreground transition-colors">
                    Add a description for this board...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Board Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>{totalCards} cards</span>
              {completedCards > 0 && (
                <span>• {completedCards} completed</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Updated {format(new Date(board.updatedAt), 'MMM d, yyyy')}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>1 member</span>
            </div>
          </div>
        </div>

        {/* Board Actions */}
        <div className="flex items-center gap-2 ml-4">
          {/* Board Members */}
          <div className="flex items-center -space-x-2">
            {state.currentUser && (
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarImage src={state.currentUser.avatar} />
                <AvatarFallback className="text-xs">
                  {state.currentUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Action Buttons */}
          <Button variant="ghost" size="sm">
            <Star className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm" onClick={onSettingsClick}>
            <Settings className="h-4 w-4" />
          </Button>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Board
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="h-4 w-4 mr-2" />
                Manage Members
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Activity className="h-4 w-4 mr-2" />
                View Activity
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share Board
              </DropdownMenuItem>
              <DropdownMenuItem>
                Export Board
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Archive Board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
