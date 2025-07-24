'use client'

import React, { useState, useEffect } from 'react';
import { KanbanCard } from '@/lib/types/kanban';
import { useBoardContext } from './board-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar as CalendarIcon,
  User,
  Tag,
  MessageSquare,
  Paperclip,
  Clock,
  Trash2,
  Save,
  X,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CardDetailsDialogProps {
  card: KanbanCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardDetailsDialog({ 
  card, 
  open, 
  onOpenChange 
}: CardDetailsDialogProps) {
  const { 
    state, 
    updateCard, 
    deleteCard, 
    createComment, 
    createTag 
  } = useBoardContext();

  const [isEditing, setIsEditing] = useState(false);
  const [editedCard, setEditedCard] = useState(card);
  const [newComment, setNewComment] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [showNewTag, setShowNewTag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update local state when card prop changes
  useEffect(() => {
    setEditedCard(card);
  }, [card]);

  // Get related data
  const assignee = editedCard.assigneeId 
    ? state.users.find(u => u.id === editedCard.assigneeId)
    : null;

  const cardTags = state.tags.filter(tag => 
    editedCard.tags.includes(tag.id)
  );

  const comments = state.comments
    .filter(c => c.cardId === card.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const attachments = state.attachments.filter(a => a.cardId === card.id);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateCard(card.id, editedCard);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this card?')) {
      setIsLoading(true);
      try {
        await deleteCard(card.id);
        onOpenChange(false);
      } catch (error) {
        console.error('Failed to delete card:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await createComment({
        cardId: card.id,
        content: newComment.trim(),
        authorId: state.currentUser?.id || 'current-user',
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const newTag = await createTag({
        name: newTagName.trim(),
        color: '#6366f1',
        boardId: state.currentBoard?.id || '',
      });

      if (newTag) {
        setEditedCard(prev => ({
          ...prev,
          tags: [...prev.tags, newTag.id]
        }));
      }

      setNewTagName('');
      setShowNewTag(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setEditedCard(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editedCard.title}
                  onChange={(e) => setEditedCard(prev => ({ ...prev, title: e.target.value }))}
                  className="text-lg font-semibold"
                />
              ) : (
                <DialogTitle className="text-xl">{card.title}</DialogTitle>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setEditedCard(card);
                      setIsEditing(false);
                    }}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-3 gap-6 h-full">
            {/* Main Content */}
            <div className="col-span-2 space-y-6 overflow-y-auto pr-2">
              {/* Description */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Description</Label>
                {isEditing ? (
                  <Textarea
                    value={editedCard.description}
                    onChange={(e) => setEditedCard(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add a description..."
                    rows={6}
                  />
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {card.description ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {card.description}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-muted-foreground italic">No description</p>
                    )}
                  </div>
                )}
              </div>

              {/* Comments */}
              <div>
                <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments ({comments.length})
                </Label>

                {/* Add Comment */}
                <div className="flex gap-2 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={state.currentUser?.avatar} />
                    <AvatarFallback>
                      {state.currentUser?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                    />
                    <Button 
                      size="sm" 
                      className="mt-2" 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      Comment
                    </Button>
                  </div>
                </div>

                {/* Comments List */}
                <ScrollArea className="h-64">
                  <div className="space-y-4">
                    {comments.map((comment) => {
                      const author = state.users.find(u => u.id === comment.authorId);
                      return (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={author?.avatar} />
                            <AvatarFallback>
                              {author?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{author?.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.createdAt), 'MMM d, yyyy at h:mm a')}
                              </span>
                            </div>
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {comment.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 overflow-y-auto">
              {/* Assignee */}
              <div>
                <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assignee
                </Label>
                {isEditing ? (
                  <Select
                    value={editedCard.assigneeId || 'none'}
                    onValueChange={(value) => 
                      setEditedCard(prev => ({ 
                        ...prev, 
                        assigneeId: value === 'none' ? null : value 
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {state.users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2">
                    {assignee ? (
                      <>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={assignee.avatar} />
                          <AvatarFallback className="text-xs">
                            {assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{assignee.name}</span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div>
                <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Due Date
                </Label>
                {isEditing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editedCard.dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedCard.dueDate ? (
                          format(new Date(editedCard.dueDate), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editedCard.dueDate ? new Date(editedCard.dueDate) : undefined}
                        onSelect={(date) => 
                          setEditedCard(prev => ({ 
                            ...prev, 
                            dueDate: date ? date.toISOString() : null 
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="text-sm">
                    {card.dueDate ? (
                      format(new Date(card.dueDate), "PPP")
                    ) : (
                      <span className="text-muted-foreground">No due date</span>
                    )}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Priority</Label>
                {isEditing ? (
                  <Select
                    value={editedCard.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setEditedCard(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={
                    card.priority === 'high' ? 'destructive' : 
                    card.priority === 'medium' ? 'default' : 'secondary'
                  }>
                    {card.priority.charAt(0).toUpperCase() + card.priority.slice(1)}
                  </Badge>
                )}
              </div>

              {/* Tags */}
              <div>
                <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </Label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {cardTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className={cn(
                          "text-xs cursor-pointer",
                          isEditing && "hover:opacity-70"
                        )}
                        style={{
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                          borderColor: `${tag.color}40`,
                        }}
                        onClick={() => isEditing && handleTagToggle(tag.id)}
                      >
                        {tag.name}
                        {isEditing && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>

                  {isEditing && (
                    <div className="space-y-2">
                      {/* Available Tags */}
                      <div className="flex flex-wrap gap-1">
                        {state.tags
                          .filter(tag => !editedCard.tags.includes(tag.id))
                          .map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="text-xs cursor-pointer hover:opacity-70"
                              onClick={() => handleTagToggle(tag.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              {tag.name}
                            </Badge>
                          ))}
                      </div>

                      {/* Create New Tag */}
                      {showNewTag ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Tag name"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            size="sm"
                          />
                          <Button size="sm" onClick={handleAddTag}>
                            Add
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              setShowNewTag(false);
                              setNewTagName('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowNewTag(true)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Tag
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments */}
              {attachments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Attachments ({attachments.length})
                  </Label>
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-2 p-2 border rounded">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm flex-1 truncate">{attachment.filename}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity */}
              <div>
                <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Activity
                </Label>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Created {format(new Date(card.createdAt), 'MMM d, yyyy')}</div>
                  <div>Updated {format(new Date(card.updatedAt), 'MMM d, yyyy')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
