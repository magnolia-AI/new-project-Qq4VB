'use client'

import React from 'react';
import { KanbanCard as KanbanCardType } from '@/lib/types/kanban';
import { useBoardContext } from './board-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface KanbanCardProps {
  card: KanbanCardType;
  isDragging: boolean;
  isBeingDragged: boolean;
}

export function KanbanCard({ card, isDragging, isBeingDragged }: KanbanCardProps) {
  const { state } = useBoardContext();
  
  // Get assignee details
  const assignee = card.assigneeId 
    ? state.users.find(u => u.id === card.assigneeId)
    : null;

  // Get card tags
  const cardTags = state.tags.filter(tag => 
    card.tags.includes(tag.id)
  );

  // Get comments count
  const commentsCount = state.comments.filter(c => c.cardId === card.id).length;
  
  // Get attachments count
  const attachmentsCount = state.attachments.filter(a => a.cardId === card.id).length;

  // Due date status
  const getDueDateStatus = () => {
    if (!card.dueDate) return null;
    
    const dueDate = new Date(card.dueDate);
    const now = new Date();
    const tomorrow = addDays(now, 1);
    
    if (isBefore(dueDate, now)) {
      return 'overdue';
    } else if (isBefore(dueDate, tomorrow)) {
      return 'due-soon';
    }
    return 'upcoming';
  };

  const dueDateStatus = getDueDateStatus();

  // Priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className={cn(
      "cursor-pointer transition-all duration-200 hover:shadow-md group",
      isDragging && "rotate-3 shadow-lg",
      isBeingDragged && "opacity-50"
    )}>
      <CardContent className="p-3">
        {/* Priority Indicator */}
        <div className="flex items-start gap-2 mb-2">
          <div className={cn(
            "w-1 h-4 rounded-full flex-shrink-0 mt-0.5",
            getPriorityColor(card.priority)
          )} />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm leading-tight mb-1 group-hover:text-primary transition-colors">
              {card.title}
            </h4>
          </div>
        </div>

        {/* Description Preview */}
        {card.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {card.description}
          </p>
        )}

        {/* Tags */}
        {cardTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {cardTags.slice(0, 3).map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs px-2 py-0.5"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                  borderColor: `${tag.color}40`,
                }}
              >
                {tag.name}
              </Badge>
            ))}
            {cardTags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                +{cardTags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Due Date */}
        {card.dueDate && (
          <div className={cn(
            "flex items-center gap-1 text-xs mb-2 px-2 py-1 rounded",
            dueDateStatus === 'overdue' && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
            dueDateStatus === 'due-soon' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
            dueDateStatus === 'upcoming' && "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
          )}>
            {dueDateStatus === 'overdue' ? (
              <AlertCircle className="h-3 w-3" />
            ) : dueDateStatus === 'due-soon' ? (
              <Clock className="h-3 w-3" />
            ) : (
              <Calendar className="h-3 w-3" />
            )}
            <span>
              {format(new Date(card.dueDate), 'MMM d')}
            </span>
            {dueDateStatus === 'overdue' && (
              <span className="font-medium">Overdue</span>
            )}
          </div>
        )}

        {/* Card Footer */}
        <div className="flex items-center justify-between mt-3">
          {/* Assignee */}
          <div className="flex items-center gap-2">
            {assignee && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                <AvatarFallback className="text-xs">
                  {assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Card Stats */}
          <div className="flex items-center gap-2 text-muted-foreground">
            {commentsCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span className="text-xs">{commentsCount}</span>
              </div>
            )}
            
            {attachmentsCount > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                <span className="text-xs">{attachmentsCount}</span>
              </div>
            )}

            {/* Completion indicator for cards with checklist items */}
            {card.description && card.description.includes('- [ ]') && (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span className="text-xs">
                  {card.description.split('- [x]').length - 1}/
                  {card.description.split('- [').length - 1}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Drag Handle Indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
