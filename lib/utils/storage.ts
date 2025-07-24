import { LocalStorageData, KanbanBoard, KanbanColumn, KanbanCard, KanbanTag, KanbanUser, KanbanComment, KanbanAttachment, KanbanActivity, BoardMember } from '@/lib/types/kanban';

const STORAGE_KEY = 'kanban-board-data';

// Default data structure
const defaultData: LocalStorageData = {
  boards: [],
  columns: [],
  cards: [],
  tags: [],
  users: [],
  comments: [],
  attachments: [],
  activities: [],
  boardMembers: [],
  currentUser: undefined,
};

// Storage utilities
export class KanbanStorage {
  private static getData(): LocalStorageData {
    if (typeof window === 'undefined') return defaultData;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return defaultData;
      
      const parsed = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      return {
        ...parsed,
        boards: parsed.boards?.map((board: any) => ({
          ...board,
          createdAt: new Date(board.createdAt),
          updatedAt: new Date(board.updatedAt),
        })) || [],
        columns: parsed.columns?.map((column: any) => ({
          ...column,
          createdAt: new Date(column.createdAt),
          updatedAt: new Date(column.updatedAt),
        })) || [],
        cards: parsed.cards?.map((card: any) => ({
          ...card,
          createdAt: new Date(card.createdAt),
          updatedAt: new Date(card.updatedAt),
          dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
        })) || [],
        tags: parsed.tags?.map((tag: any) => ({
          ...tag,
          createdAt: new Date(tag.createdAt),
        })) || [],
        users: parsed.users?.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
        })) || [],
        comments: parsed.comments?.map((comment: any) => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
          updatedAt: new Date(comment.updatedAt),
        })) || [],
        attachments: parsed.attachments?.map((attachment: any) => ({
          ...attachment,
          createdAt: new Date(attachment.createdAt),
        })) || [],
        activities: parsed.activities?.map((activity: any) => ({
          ...activity,
          createdAt: new Date(activity.createdAt),
        })) || [],
        boardMembers: parsed.boardMembers?.map((member: any) => ({
          ...member,
          joinedAt: new Date(member.joinedAt),
        })) || [],
        currentUser: parsed.currentUser ? {
          ...parsed.currentUser,
          createdAt: new Date(parsed.currentUser.createdAt),
        } : undefined,
      };
    } catch (error) {
      console.error('Error parsing stored data:', error);
      return defaultData;
    }
  }

  private static setData(data: LocalStorageData): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing data:', error);
    }
  }

  // Board operations
  static getBoards(): KanbanBoard[] {
    return this.getData().boards;
  }

  static getBoardById(id: string): KanbanBoard | undefined {
    return this.getData().boards.find(board => board.id === id);
  }

  static createBoard(board: Omit<KanbanBoard, 'id' | 'createdAt' | 'updatedAt'>): KanbanBoard {
    const data = this.getData();
    const newBoard: KanbanBoard = {
      ...board,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    data.boards.push(newBoard);
    this.setData(data);
    
    // Create activity
    this.createActivity({
      type: 'card_created',
      description: `Board "${newBoard.title}" was created`,
      entityType: 'board',
      entityId: newBoard.id,
      boardId: newBoard.id,
      userId: data.currentUser?.id,
    });
    
    return newBoard;
  }

  static updateBoard(id: string, updates: Partial<KanbanBoard>): KanbanBoard | null {
    const data = this.getData();
    const boardIndex = data.boards.findIndex(board => board.id === id);
    
    if (boardIndex === -1) return null;
    
    data.boards[boardIndex] = {
      ...data.boards[boardIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    this.setData(data);
    return data.boards[boardIndex];
  }

  static deleteBoard(id: string): boolean {
    const data = this.getData();
    const boardIndex = data.boards.findIndex(board => board.id === id);
    
    if (boardIndex === -1) return false;
    
    // Delete related data
    data.columns = data.columns.filter(column => column.boardId !== id);
    data.cards = data.cards.filter(card => !data.columns.some(col => col.id === card.columnId));
    data.tags = data.tags.filter(tag => tag.boardId !== id);
    data.activities = data.activities.filter(activity => activity.boardId !== id);
    data.boardMembers = data.boardMembers.filter(member => member.boardId !== id);
    
    data.boards.splice(boardIndex, 1);
    this.setData(data);
    
    return true;
  }

  // Column operations
  static getColumnsByBoardId(boardId: string): KanbanColumn[] {
    return this.getData().columns
      .filter(column => column.boardId === boardId)
      .sort((a, b) => a.position - b.position);
  }

  static createColumn(column: Omit<KanbanColumn, 'id' | 'createdAt' | 'updatedAt'>): KanbanColumn {
    const data = this.getData();
    const newColumn: KanbanColumn = {
      ...column,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    data.columns.push(newColumn);
    this.setData(data);
    
    return newColumn;
  }

  static updateColumn(id: string, updates: Partial<KanbanColumn>): KanbanColumn | null {
    const data = this.getData();
    const columnIndex = data.columns.findIndex(column => column.id === id);
    
    if (columnIndex === -1) return null;
    
    data.columns[columnIndex] = {
      ...data.columns[columnIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    this.setData(data);
    return data.columns[columnIndex];
  }

  static deleteColumn(id: string): boolean {
    const data = this.getData();
    const columnIndex = data.columns.findIndex(column => column.id === id);
    
    if (columnIndex === -1) return false;
    
    // Delete related cards
    data.cards = data.cards.filter(card => card.columnId !== id);
    data.columns.splice(columnIndex, 1);
    this.setData(data);
    
    return true;
  }

  // Card operations
  static getCardsByColumnId(columnId: string): KanbanCard[] {
    const data = this.getData();
    return data.cards
      .filter(card => card.columnId === columnId && !card.archived)
      .sort((a, b) => a.position - b.position)
      .map(card => ({
        ...card,
        tags: data.tags.filter(tag => card.tags?.some(cardTag => cardTag.id === tag.id)) || [],
        comments: data.comments.filter(comment => comment.cardId === card.id).map(comment => ({
          ...comment,
          author: data.users.find(user => user.id === comment.authorId)!,
        })) || [],
        attachments: data.attachments.filter(attachment => attachment.cardId === card.id).map(attachment => ({
          ...attachment,
          uploadedBy: data.users.find(user => user.id === attachment.uploadedById)!,
        })) || [],
      }));
  }

  static getCardById(id: string): KanbanCard | undefined {
    const data = this.getData();
    const card = data.cards.find(card => card.id === id);
    
    if (!card) return undefined;
    
    return {
      ...card,
      tags: data.tags.filter(tag => card.tags?.some(cardTag => cardTag.id === tag.id)) || [],
      comments: data.comments.filter(comment => comment.cardId === card.id).map(comment => ({
        ...comment,
        author: data.users.find(user => user.id === comment.authorId)!,
      })) || [],
      attachments: data.attachments.filter(attachment => attachment.cardId === card.id).map(attachment => ({
        ...attachment,
        uploadedBy: data.users.find(user => user.id === attachment.uploadedById)!,
      })) || [],
    };
  }

  static createCard(card: Omit<KanbanCard, 'id' | 'createdAt' | 'updatedAt' | 'tags' | 'comments' | 'attachments'> & { tagIds?: string[] }): KanbanCard {
    const data = this.getData();
    const newCard: KanbanCard = {
      ...card,
      id: crypto.randomUUID(),
      tags: [],
      comments: [],
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    data.cards.push(newCard);
    this.setData(data);
    
    // Create activity
    const column = data.columns.find(col => col.id === card.columnId);
    this.createActivity({
      type: 'card_created',
      description: `Card "${newCard.title}" was created in ${column?.title}`,
      entityType: 'card',
      entityId: newCard.id,
      boardId: column?.boardId || '',
      userId: data.currentUser?.id,
    });
    
    return newCard;
  }

  static updateCard(id: string, updates: Partial<KanbanCard>): KanbanCard | null {
    const data = this.getData();
    const cardIndex = data.cards.findIndex(card => card.id === id);
    
    if (cardIndex === -1) return null;
    
    const oldCard = data.cards[cardIndex];
    data.cards[cardIndex] = {
      ...oldCard,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.setData(data);
    
    // Create activity for significant changes
    if (updates.columnId && updates.columnId !== oldCard.columnId) {
      const oldColumn = data.columns.find(col => col.id === oldCard.columnId);
      const newColumn = data.columns.find(col => col.id === updates.columnId);
      
      this.createActivity({
        type: 'card_moved',
        description: `Card "${oldCard.title}" was moved from ${oldColumn?.title} to ${newColumn?.title}`,
        entityType: 'card',
        entityId: id,
        boardId: newColumn?.boardId || oldColumn?.boardId || '',
        userId: data.currentUser?.id,
      });
    }
    
    return data.cards[cardIndex];
  }

  static deleteCard(id: string): boolean {
    const data = this.getData();
    const cardIndex = data.cards.findIndex(card => card.id === id);
    
    if (cardIndex === -1) return false;
    
    // Delete related data
    data.comments = data.comments.filter(comment => comment.cardId !== id);
    data.attachments = data.attachments.filter(attachment => attachment.cardId !== id);
    
    data.cards.splice(cardIndex, 1);
    this.setData(data);
    
    return true;
  }

  // Tag operations
  static getTagsByBoardId(boardId: string): KanbanTag[] {
    return this.getData().tags.filter(tag => tag.boardId === boardId);
  }

  static createTag(tag: Omit<KanbanTag, 'id' | 'createdAt'>): KanbanTag {
    const data = this.getData();
    const newTag: KanbanTag = {
      ...tag,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    data.tags.push(newTag);
    this.setData(data);
    
    return newTag;
  }

  // User operations
  static getCurrentUser(): KanbanUser | undefined {
    return this.getData().currentUser;
  }

  static setCurrentUser(user: KanbanUser): void {
    const data = this.getData();
    data.currentUser = user;
    
    // Add user to users array if not exists
    if (!data.users.find(u => u.id === user.id)) {
      data.users.push(user);
    }
    
    this.setData(data);
  }

  static getUsers(): KanbanUser[] {
    return this.getData().users;
  }

  // Activity operations
  static createActivity(activity: Omit<KanbanActivity, 'id' | 'createdAt' | 'user'>): KanbanActivity {
    const data = this.getData();
    const newActivity: KanbanActivity = {
      ...activity,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      user: activity.userId ? data.users.find(user => user.id === activity.userId) : undefined,
    };
    
    data.activities.push(newActivity);
    
    // Keep only last 1000 activities to prevent storage bloat
    if (data.activities.length > 1000) {
      data.activities = data.activities.slice(-1000);
    }
    
    this.setData(data);
    return newActivity;
  }

  static getActivitiesByBoardId(boardId: string, limit: number = 50): KanbanActivity[] {
    const data = this.getData();
    return data.activities
      .filter(activity => activity.boardId === boardId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map(activity => ({
        ...activity,
        user: activity.userId ? data.users.find(user => user.id === activity.userId) : undefined,
      }));
  }

  // Bulk operations
  static moveCards(cardIds: string[], targetColumnId: string): void {
    const data = this.getData();
    const targetColumn = data.columns.find(col => col.id === targetColumnId);
    
    if (!targetColumn) return;
    
    cardIds.forEach((cardId, index) => {
      const cardIndex = data.cards.findIndex(card => card.id === cardId);
      if (cardIndex !== -1) {
        const oldColumnId = data.cards[cardIndex].columnId;
        data.cards[cardIndex].columnId = targetColumnId;
        data.cards[cardIndex].position = index;
        data.cards[cardIndex].updatedAt = new Date();
        
        // Create activity
        if (oldColumnId !== targetColumnId) {
          const oldColumn = data.columns.find(col => col.id === oldColumnId);
          this.createActivity({
            type: 'card_moved',
            description: `Card "${data.cards[cardIndex].title}" was moved from ${oldColumn?.title} to ${targetColumn.title}`,
            entityType: 'card',
            entityId: cardId,
            boardId: targetColumn.boardId,
            userId: data.currentUser?.id,
          });
        }
      }
    });
    
    this.setData(data);
  }

  // Search and filter
  static searchCards(boardId: string, query: string): KanbanCard[] {
    const data = this.getData();
    const boardColumns = data.columns.filter(col => col.boardId === boardId);
    const columnIds = boardColumns.map(col => col.id);
    
    return data.cards
      .filter(card => 
        columnIds.includes(card.columnId) &&
        !card.archived &&
        (card.title.toLowerCase().includes(query.toLowerCase()) ||
         card.description?.toLowerCase().includes(query.toLowerCase()))
      )
      .map(card => ({
        ...card,
        tags: data.tags.filter(tag => card.tags?.some(cardTag => cardTag.id === tag.id)) || [],
        comments: [],
        attachments: [],
      }));
  }

  // Initialize with sample data
  static initializeSampleData(): void {
    const data = this.getData();
    
    if (data.boards.length > 0) return; // Already has data
    
    // Create sample user
    const sampleUser: KanbanUser = {
      id: crypto.randomUUID(),
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      createdAt: new Date(),
    };
    
    data.users.push(sampleUser);
    data.currentUser = sampleUser;
    
    // Create sample board
    const sampleBoard: KanbanBoard = {
      id: crypto.randomUUID(),
      title: 'Sample Project Board',
      description: 'A sample kanban board to get you started',
      background: '#ffffff',
      isTemplate: false,
      ownerId: sampleUser.id,
      settings: {
        allowComments: true,
        allowAttachments: true,
        autoArchive: false,
        dueDate: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    data.boards.push(sampleBoard);
    
    // Create sample columns
    const columns = [
      { title: 'To Do', color: '#ef4444', position: 0 },
      { title: 'In Progress', color: '#f59e0b', position: 1 },
      { title: 'Review', color: '#3b82f6', position: 2 },
      { title: 'Done', color: '#10b981', position: 3 },
    ];
    
    const createdColumns = columns.map(col => {
      const column: KanbanColumn = {
        id: crypto.randomUUID(),
        title: col.title,
        position: col.position,
        boardId: sampleBoard.id,
        color: col.color,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      data.columns.push(column);
      return column;
    });
    
    // Create sample tags
    const sampleTags = [
      { name: 'Bug', color: '#ef4444' },
      { name: 'Feature', color: '#3b82f6' },
      { name: 'Enhancement', color: '#10b981' },
      { name: 'Documentation', color: '#8b5cf6' },
    ];
    
    sampleTags.forEach(tag => {
      data.tags.push({
        id: crypto.randomUUID(),
        name: tag.name,
        color: tag.color,
        boardId: sampleBoard.id,
        createdAt: new Date(),
      });
    });
    
    // Create sample cards
    const sampleCards = [
      {
        title: 'Set up project repository',
        description: 'Initialize the project with proper folder structure and dependencies',
        columnId: createdColumns[3].id, // Done
        priority: 'high' as const,
        estimatedHours: 2,
        actualHours: 1.5,
      },
      {
        title: 'Design user interface mockups',
        description: 'Create wireframes and mockups for the main application screens',
        columnId: createdColumns[1].id, // In Progress
        priority: 'medium' as const,
        estimatedHours: 8,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        title: 'Implement user authentication',
        description: 'Add login, registration, and password reset functionality',
        columnId: createdColumns[0].id, // To Do
        priority: 'high' as const,
        estimatedHours: 12,
      },
      {
        title: 'Write API documentation',
        description: 'Document all API endpoints with examples and response formats',
        columnId: createdColumns[2].id, // Review
        priority: 'low' as const,
        estimatedHours: 4,
      },
    ];
    
    sampleCards.forEach((card, index) => {
      data.cards.push({
        id: crypto.randomUUID(),
        title: card.title,
        description: card.description,
        position: index,
        columnId: card.columnId,
        assigneeId: sampleUser.id,
        dueDate: card.dueDate,
        priority: card.priority,
        estimatedHours: card.estimatedHours,
        actualHours: card.actualHours,
        archived: false,
        tags: [],
        comments: [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    
    this.setData(data);
  }

  // Clear all data
  static clearAllData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
