// Core Kanban Board Types
export interface KanbanUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  clerkId?: string;
}

export interface KanbanLabel {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  position: number;
  columnId: string;
  assignee?: KanbanUser;
  creator: KanbanUser;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
  actualHours?: number;
  isArchived: boolean;
  labels: KanbanLabel[];
  checklist: ChecklistItem[];
  attachments: KanbanAttachment[];
  comments: KanbanComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanColumn {
  id: string;
  title: string;
  position: number;
  boardId: string;
  color: string;
  limit?: number; // WIP limit
  cards: KanbanCard[];
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

export interface KanbanBoard {
  id: string;
  title: string;
  description?: string;
  background: string;
  isTemplate: boolean;
  templateType?: string;
  owner: KanbanUser;
  isPublic: boolean;
  columns: KanbanColumn[];
  members: BoardMember[];
  settings: {
    allowComments: boolean;
    allowAttachments: boolean;
    autoArchive: boolean;
    dueDate: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanComment {
  id: string;
  content: string;
  cardId: string;
  author: KanbanUser;
  mentions: Array<{
    userId: string;
    name: string;
  }>;
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
  uploadedBy: KanbanUser;
  createdAt: Date;
}

export interface KanbanActivity {
  id: string;
  type: 'card_created' | 'card_moved' | 'card_updated' | 'comment_added' | 'attachment_added' | 'member_added' | 'column_created';
  description: string;
  boardId?: string;
  cardId?: string;
  user: KanbanUser;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface BoardMember {
  id: string;
  boardId: string;
  user: KanbanUser;
  role: 'admin' | 'member' | 'viewer';
  invitedAt: Date;
  joinedAt?: Date;
}

export interface CardTemplate {
  id: string;
  title: string;
  description?: string;
  boardId?: string;
  isGlobal: boolean;
  template: {
    title: string;
    description: string;
    labels: KanbanLabel[];
    checklist: ChecklistItem[];
    estimatedHours?: number;
  };
  createdBy: KanbanUser;
  createdAt: Date;
}

// Drag and Drop Types
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

// Filter and Search Types
export interface BoardFilters {
  search?: string;
  assignee?: string[];
  labels?: string[];
  priority?: string[];
  dueDate?: {
    from?: Date;
    to?: Date;
  };
  archived?: boolean;
}

// Analytics Types
export interface BoardAnalytics {
  totalCards: number;
  completedCards: number;
  overdueTasks: number;
  averageCompletionTime: number;
  velocityData: Array<{
    date: string;
    completed: number;
    created: number;
  }>;
  burndownData: Array<{
    date: string;
    remaining: number;
    ideal: number;
  }>;
  memberProductivity: Array<{
    user: KanbanUser;
    tasksCompleted: number;
    averageTime: number;
  }>;
  bottlenecks: Array<{
    columnId: string;
    columnTitle: string;
    avgTimeSpent: number;
    cardCount: number;
  }>;
}

// Board Template Types
export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  type: 'sprint_planning' | 'content_calendar' | 'bug_tracking' | 'project_management' | 'custom';
  columns: Array<{
    title: string;
    color: string;
    position: number;
    limit?: number;
  }>;
  cardTemplates: Array<{
    title: string;
    description: string;
    labels: KanbanLabel[];
    checklist: ChecklistItem[];
  }>;
  settings: {
    allowComments: boolean;
    allowAttachments: boolean;
    autoArchive: boolean;
    dueDate: boolean;
  };
}

// Local Storage Types
export interface LocalStorageData {
  boards: KanbanBoard[];
  lastSyncTimestamp: number;
  offlineChanges: Array<{
    id: string;
    type: 'create' | 'update' | 'delete';
    entity: 'board' | 'column' | 'card' | 'comment';
    data: any;
    timestamp: number;
  }>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
