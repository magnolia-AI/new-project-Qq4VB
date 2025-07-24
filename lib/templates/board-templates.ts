import { BoardTemplate } from '@/lib/types/kanban';

export const boardTemplates: BoardTemplate[] = [
  {
    id: 'sprint-planning',
    name: 'Sprint Planning',
    description: 'Agile sprint planning board with backlog, sprint, and review columns',
    type: 'sprint',
    columns: [
      {
        title: 'Product Backlog',
        position: 0,
        color: '#6b7280',
        wipLimit: undefined,
      },
      {
        title: 'Sprint Backlog',
        position: 1,
        color: '#3b82f6',
        wipLimit: 10,
      },
      {
        title: 'In Progress',
        position: 2,
        color: '#f59e0b',
        wipLimit: 5,
      },
      {
        title: 'Code Review',
        position: 3,
        color: '#8b5cf6',
        wipLimit: 3,
      },
      {
        title: 'Testing',
        position: 4,
        color: '#06b6d4',
        wipLimit: 3,
      },
      {
        title: 'Done',
        position: 5,
        color: '#10b981',
        wipLimit: undefined,
      },
    ],
    defaultTags: [
      { name: 'Story', color: '#3b82f6' },
      { name: 'Bug', color: '#ef4444' },
      { name: 'Task', color: '#10b981' },
      { name: 'Epic', color: '#8b5cf6' },
      { name: 'Spike', color: '#f59e0b' },
      { name: 'Critical', color: '#dc2626' },
      { name: 'Frontend', color: '#06b6d4' },
      { name: 'Backend', color: '#84cc16' },
    ],
    settings: {
      allowComments: true,
      allowAttachments: true,
      autoArchive: true,
      dueDate: true,
    },
  },
  {
    id: 'content-calendar',
    name: 'Content Calendar',
    description: 'Content creation and publishing workflow board',
    type: 'content-calendar',
    columns: [
      {
        title: 'Ideas',
        position: 0,
        color: '#6b7280',
        wipLimit: undefined,
      },
      {
        title: 'Research',
        position: 1,
        color: '#3b82f6',
        wipLimit: 5,
      },
      {
        title: 'Writing',
        position: 2,
        color: '#f59e0b',
        wipLimit: 3,
      },
      {
        title: 'Review',
        position: 3,
        color: '#8b5cf6',
        wipLimit: 2,
      },
      {
        title: 'Design',
        position: 4,
        color: '#06b6d4',
        wipLimit: 2,
      },
      {
        title: 'Scheduled',
        position: 5,
        color: '#84cc16',
        wipLimit: undefined,
      },
      {
        title: 'Published',
        position: 6,
        color: '#10b981',
        wipLimit: undefined,
      },
    ],
    defaultTags: [
      { name: 'Blog Post', color: '#3b82f6' },
      { name: 'Social Media', color: '#06b6d4' },
      { name: 'Newsletter', color: '#8b5cf6' },
      { name: 'Video', color: '#ef4444' },
      { name: 'Podcast', color: '#f59e0b' },
      { name: 'High Priority', color: '#dc2626' },
      { name: 'Evergreen', color: '#10b981' },
      { name: 'Trending', color: '#f97316' },
    ],
    settings: {
      allowComments: true,
      allowAttachments: true,
      autoArchive: false,
      dueDate: true,
    },
  },
  {
    id: 'bug-tracking',
    name: 'Bug Tracking',
    description: 'Software bug tracking and resolution workflow',
    type: 'bug-tracking',
    columns: [
      {
        title: 'Reported',
        position: 0,
        color: '#ef4444',
        wipLimit: undefined,
      },
      {
        title: 'Triaged',
        position: 1,
        color: '#f59e0b',
        wipLimit: 10,
      },
      {
        title: 'In Progress',
        position: 2,
        color: '#3b82f6',
        wipLimit: 5,
      },
      {
        title: 'Testing',
        position: 3,
        color: '#8b5cf6',
        wipLimit: 3,
      },
      {
        title: 'Verified',
        position: 4,
        color: '#10b981',
        wipLimit: undefined,
      },
      {
        title: 'Closed',
        position: 5,
        color: '#6b7280',
        wipLimit: undefined,
      },
    ],
    defaultTags: [
      { name: 'Critical', color: '#dc2626' },
      { name: 'High', color: '#ef4444' },
      { name: 'Medium', color: '#f59e0b' },
      { name: 'Low', color: '#10b981' },
      { name: 'UI/UX', color: '#06b6d4' },
      { name: 'Performance', color: '#8b5cf6' },
      { name: 'Security', color: '#dc2626' },
      { name: 'Regression', color: '#f97316' },
    ],
    settings: {
      allowComments: true,
      allowAttachments: true,
      autoArchive: true,
      dueDate: true,
    },
  },
  {
    id: 'personal-tasks',
    name: 'Personal Tasks',
    description: 'Simple personal task management board',
    type: 'custom',
    columns: [
      {
        title: 'To Do',
        position: 0,
        color: '#6b7280',
        wipLimit: undefined,
      },
      {
        title: 'Today',
        position: 1,
        color: '#f59e0b',
        wipLimit: 5,
      },
      {
        title: 'In Progress',
        position: 2,
        color: '#3b82f6',
        wipLimit: 3,
      },
      {
        title: 'Waiting',
        position: 3,
        color: '#8b5cf6',
        wipLimit: undefined,
      },
      {
        title: 'Done',
        position: 4,
        color: '#10b981',
        wipLimit: undefined,
      },
    ],
    defaultTags: [
      { name: 'Work', color: '#3b82f6' },
      { name: 'Personal', color: '#10b981' },
      { name: 'Urgent', color: '#ef4444' },
      { name: 'Health', color: '#06b6d4' },
      { name: 'Learning', color: '#8b5cf6' },
      { name: 'Finance', color: '#f59e0b' },
    ],
    settings: {
      allowComments: false,
      allowAttachments: false,
      autoArchive: true,
      dueDate: true,
    },
  },
  {
    id: 'product-roadmap',
    name: 'Product Roadmap',
    description: 'Product development roadmap and feature planning',
    type: 'custom',
    columns: [
      {
        title: 'Ideas',
        position: 0,
        color: '#6b7280',
        wipLimit: undefined,
      },
      {
        title: 'Research',
        position: 1,
        color: '#3b82f6',
        wipLimit: 5,
      },
      {
        title: 'Planned',
        position: 2,
        color: '#f59e0b',
        wipLimit: 8,
      },
      {
        title: 'Development',
        position: 3,
        color: '#8b5cf6',
        wipLimit: 5,
      },
      {
        title: 'Testing',
        position: 4,
        color: '#06b6d4',
        wipLimit: 3,
      },
      {
        title: 'Released',
        position: 5,
        color: '#10b981',
        wipLimit: undefined,
      },
    ],
    defaultTags: [
      { name: 'Feature', color: '#3b82f6' },
      { name: 'Enhancement', color: '#10b981' },
      { name: 'Integration', color: '#8b5cf6' },
      { name: 'API', color: '#06b6d4' },
      { name: 'UI/UX', color: '#f59e0b' },
      { name: 'Performance', color: '#ef4444' },
      { name: 'Mobile', color: '#84cc16' },
      { name: 'Analytics', color: '#f97316' },
    ],
    settings: {
      allowComments: true,
      allowAttachments: true,
      autoArchive: false,
      dueDate: true,
    },
  },
  {
    id: 'event-planning',
    name: 'Event Planning',
    description: 'Event organization and task management board',
    type: 'custom',
    columns: [
      {
        title: 'Ideas',
        position: 0,
        color: '#6b7280',
        wipLimit: undefined,
      },
      {
        title: 'Planning',
        position: 1,
        color: '#3b82f6',
        wipLimit: 10,
      },
      {
        title: 'In Progress',
        position: 2,
        color: '#f59e0b',
        wipLimit: 8,
      },
      {
        title: 'Pending Approval',
        position: 3,
        color: '#8b5cf6',
        wipLimit: 5,
      },
      {
        title: 'Ready',
        position: 4,
        color: '#06b6d4',
        wipLimit: undefined,
      },
      {
        title: 'Completed',
        position: 5,
        color: '#10b981',
        wipLimit: undefined,
      },
    ],
    defaultTags: [
      { name: 'Venue', color: '#3b82f6' },
      { name: 'Catering', color: '#f59e0b' },
      { name: 'Marketing', color: '#10b981' },
      { name: 'Speakers', color: '#8b5cf6' },
      { name: 'Logistics', color: '#06b6d4' },
      { name: 'Budget', color: '#ef4444' },
      { name: 'Urgent', color: '#dc2626' },
      { name: 'Optional', color: '#6b7280' },
    ],
    settings: {
      allowComments: true,
      allowAttachments: true,
      autoArchive: false,
      dueDate: true,
    },
  },
];

export function getBoardTemplate(templateId: string): BoardTemplate | undefined {
  return boardTemplates.find(template => template.id === templateId);
}

export function getBoardTemplatesByType(type: BoardTemplate['type']): BoardTemplate[] {
  return boardTemplates.filter(template => template.type === type);
}

export function createBoardFromTemplate(
  template: BoardTemplate,
  boardTitle: string,
  boardDescription?: string,
  ownerId?: string
) {
  return {
    title: boardTitle,
    description: boardDescription || template.description,
    background: '#ffffff',
    isTemplate: false,
    templateType: template.type,
    ownerId: ownerId || '',
    settings: template.settings,
  };
}
