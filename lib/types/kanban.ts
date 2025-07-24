// Core Kanban Board Types
export interface KanbanUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface KanbanBoard {
  id: string;
  title: string;
  description?: string;
  background: string;
  isTemplate: boolean;
  templateType?: 'sprint' | 'content-calendar' | 'bug-tracking' | 'custom';
  ownerId: string;
  settings: {
    allowComments: boolean;
    allowAttachments: boolean;
    autoArchive: boolean;
    dueDate: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanColumn {
  id: string;
  title: string;
  position: number;
  boardId: string;
  color: string;
  wipLimit?: number;
  rules?: {
    autoMove: boolean;
    conditions: Array<{
      field: string;
      operator: string;
      value: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  position: number;
  columnId: string;
  assigneeId?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
  actualHours?: number;
  color?: string;
  archived: boolean;
  tags: KanbanTag[];
  comments: KanbanComment[];
  attachments: KanbanAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanTag {
  id: string;
  name: string;
  color: string;
  boardId: string;
  createdAt: Date;
}

export interface KanbanComment {
  id: string;
  content: string;
  cardId: string;
  authorId: string;
  author: KanbanUser;
  mentions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  cardId: string;
  uploadedById: string;
  uploadedBy: KanbanUser;
  createdAt: Date;
}

export interface KanbanActivity {
  id: string;
  type: 'card_created' | 'card_moved' | 'card_updated' | 'card_deleted' | 
        'comment_added' | 'attachment_added' | 'user_assigned' | 'due_date_changed';
  description: string;
  entityType: 'card' | 'column' | 'board' | 'comment';
  entityId: string;
  userId?: string;
  user?: KanbanUser;
  boardId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  user: KanbanUser;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canInvite: boolean;
    canManageSettings: boolean;
  };
  joinedAt: Date;
}

// Extended types with relations
export interface KanbanBoardWithData extends KanbanBoard {
  columns: KanbanColumnWithCards[];
  tags: KanbanTag[];
  members: BoardMember[];
  activities: KanbanActivity[];
}

export interface KanbanColumnWithCards extends KanbanColumn {
  cards: KanbanCard[];
}

// Filter and search types
export interface CardFilter {
  assigneeId?: string;
  tags?: string[];
  priority?: KanbanCard['priority'];
  dueDate?: {
    from?: Date;
    to?: Date;
  };
  archived?: boolean;
  search?: string;
}

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  type: KanbanBoard['templateType'];
  columns: Omit<KanbanColumn, 'id' | 'boardId' | 'createdAt' | 'updatedAt'>[];
  defaultTags: Omit<KanbanTag, 'id' | 'boardId' | 'createdAt'>[];
  settings: KanbanBoard['settings'];
}

// Analytics types
export interface VelocityMetrics {
  completedCards: number;
  totalPoints: number;
  averageCompletionTime: number;
  burndownData: Array<{
    date: Date;
    remaining: number;
    completed: number;
  }>;
}

export interface TeamProductivityMetrics {
  memberStats: Array<{
    userId: string;
    user: KanbanUser;
    cardsCompleted: number;
    averageCompletionTime: number;
    estimationAccuracy: number;
  }>;
  bottlenecks: Array<{
    columnId: string;
    column: KanbanColumn;
    averageTimeInColumn: number;
    cardCount: number;
  }>;
}

// Drag and drop types
export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  } | null;
  reason: 'DROP' | 'CANCEL';
}

// Local storage structure
export interface LocalStorageData {
  boards: KanbanBoard[];
  columns: KanbanColumn[];
  cards: KanbanCard[];
  tags: KanbanTag[];
  users: KanbanUser[];
  comments: KanbanComment[];
  attachments: KanbanAttachment[];
  activities: KanbanActivity[];
  boardMembers: BoardMember[];
  currentUser?: KanbanUser;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface CreateBoardForm {
  title: string;
  description?: string;
  background: string;
  templateType?: KanbanBoard['templateType'];
  useTemplate?: boolean;
}

export interface CreateCardForm {
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: Date;
  priority: KanbanCard['priority'];
  estimatedHours?: number;
  tags: string[];
}

export interface CreateColumnForm {
  title: string;
  color: string;
  wipLimit?: number;
}

export interface CreateTagForm {
  name: string;
  color: string;
}
