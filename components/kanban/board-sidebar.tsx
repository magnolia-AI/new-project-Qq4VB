'use client'

import React, { useState } from 'react';
import { KanbanBoard } from '@/lib/types/kanban';
import { useBoardContext } from './board-context';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Settings,
  Users,
  Tag,
  Palette,
  BarChart3,
  Download,
  Trash2,
  Plus,
  X,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BoardSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: KanbanBoard;
}

export function BoardSidebar({ open, onOpenChange, board }: BoardSidebarProps) {
  const { 
    state, 
    updateBoard, 
    createTag, 
    updateTag, 
    deleteTag,
    exportBoard 
  } = useBoardContext();

  const [isEditing, setIsEditing] = useState(false);
  const [editedBoard, setEditedBoard] = useState(board);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveBoard = async () => {
    setIsLoading(true);
    try {
      await updateBoard(board.id, editedBoard);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update board:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      await createTag({
        name: newTagName.trim(),
        color: newTagColor,
        boardId: board.id,
      });
      setNewTagName('');
      setNewTagColor('#6366f1');
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (confirm('Are you sure you want to delete this tag? It will be removed from all cards.')) {
      try {
        await deleteTag(tagId);
      } catch (error) {
        console.error('Failed to delete tag:', error);
      }
    }
  };

  const handleExportBoard = async () => {
    try {
      await exportBoard(board.id);
    } catch (error) {
      console.error('Failed to export board:', error);
    }
  };

  // Calculate board statistics
  const totalCards = state.cards.length;
  const completedCards = state.cards.filter(card => {
    const column = state.columns.find(col => col.id === card.columnId);
    return column?.title.toLowerCase().includes('done') || 
           column?.title.toLowerCase().includes('complete');
  }).length;

  const cardsByPriority = {
    high: state.cards.filter(card => card.priority === 'high').length,
    medium: state.cards.filter(card => card.priority === 'medium').length,
    low: state.cards.filter(card => card.priority === 'low').length,
  };

  const overdueTasks = state.cards.filter(card => 
    card.dueDate && new Date(card.dueDate) < new Date()
  ).length;

  const predefinedColors = [
    '#6366f1', '#3b82f6', '#10b981', '#f59e0b', 
    '#ef4444', '#8b5cf6', '#ec4899', '#6b7280'
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Board Settings
          </SheetTitle>
          <SheetDescription>
            Manage your board settings, members, and analytics
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="general" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Board Information</h3>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveBoard} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setEditedBoard(board);
                        setIsEditing(false);
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="board-title">Title</Label>
                  {isEditing ? (
                    <Input
                      id="board-title"
                      value={editedBoard.title}
                      onChange={(e) => setEditedBoard(prev => ({ ...prev, title: e.target.value }))}
                      disabled={isLoading}
                    />
                  ) : (
                    <p className="text-sm mt-1">{board.title}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="board-description">Description</Label>
                  {isEditing ? (
                    <Textarea
                      id="board-description"
                      value={editedBoard.description || ''}
                      onChange={(e) => setEditedBoard(prev => ({ ...prev, description: e.target.value }))}
                      disabled={isLoading}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm mt-1 text-muted-foreground">
                      {board.description || 'No description'}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Background</Label>
                  {isEditing ? (
                    <div className="flex gap-2 mt-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "w-8 h-8 rounded border-2 transition-all",
                            editedBoard.background === color
                              ? 'border-foreground scale-110'
                              : 'border-border hover:scale-105'
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => setEditedBoard(prev => ({ ...prev, background: color }))}
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                  ) : (
                    <div 
                      className="w-full h-8 rounded border mt-2"
                      style={{ backgroundColor: board.background }}
                    />
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Actions</h4>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={handleExportBoard} className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Board Data
                  </Button>
                  <Button variant="destructive" className="justify-start">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Board
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Members */}
          <TabsContent value="members" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Board Members</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>

              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {state.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Member</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Tags */}
          <TabsContent value="tags" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Tags</h3>
              </div>

              {/* Create New Tag */}
              <div className="space-y-3 p-3 border rounded">
                <h4 className="font-medium text-sm">Create New Tag</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex gap-1">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "w-6 h-6 rounded border transition-all",
                          newTagColor === color
                            ? 'border-foreground scale-110'
                            : 'border-border hover:scale-105'
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewTagColor(color)}
                      />
                    ))}
                  </div>
                </div>
                <Button size="sm" onClick={handleCreateTag} disabled={!newTagName.trim()}>
                  Create Tag
                </Button>
              </div>

              {/* Existing Tags */}
              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {state.tags.map((tag) => (
                    <div key={tag.id} className="flex items-center justify-between p-2 border rounded">
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                          borderColor: `${tag.color}40`,
                        }}
                      >
                        {tag.name}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTag(tag.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Board Analytics
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded text-center">
                  <div className="text-2xl font-bold">{totalCards}</div>
                  <div className="text-sm text-muted-foreground">Total Cards</div>
                </div>
                <div className="p-3 border rounded text-center">
                  <div className="text-2xl font-bold">{completedCards}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="p-3 border rounded text-center">
                  <div className="text-2xl font-bold text-destructive">{overdueTasks}</div>
                  <div className="text-sm text-muted-foreground">Overdue</div>
                </div>
                <div className="p-3 border rounded text-center">
                  <div className="text-2xl font-bold">{state.columns.length}</div>
                  <div className="text-sm text-muted-foreground">Columns</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Priority Distribution</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Priority</span>
                    <Badge variant="destructive">{cardsByPriority.high}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium Priority</span>
                    <Badge variant="default">{cardsByPriority.medium}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Low Priority</span>
                    <Badge variant="secondary">{cardsByPriority.low}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Column Distribution</h4>
                <div className="space-y-2">
                  {state.columns.map((column) => {
                    const columnCards = state.cards.filter(card => card.columnId === column.id);
                    return (
                      <div key={column.id} className="flex items-center justify-between">
                        <span className="text-sm">{column.title}</span>
                        <Badge variant="outline">{columnCards.length}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
