import { pgTable, serial, varchar, text, timestamp, boolean, integer, json, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table for authentication and collaboration
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  avatar: varchar('avatar', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Boards table for kanban boards
export const boards = pgTable('boards', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  background: varchar('background', { length: 255 }).default('#ffffff'),
  isTemplate: boolean('is_template').default(false),
  templateType: varchar('template_type', { length: 100 }),
  ownerId: integer('owner_id').references(() => users.id).notNull(),
  isPublic: boolean('is_public').default(false),
  settings: json('settings').$type<{
    allowComments: boolean;
    allowAttachments: boolean;
    autoArchive: boolean;
    dueDate: boolean;
  }>().default({
    allowComments: true,
    allowAttachments: true,
    autoArchive: false,
    dueDate: true,
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Columns table for board columns
export const columns = pgTable('columns', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  position: integer('position').notNull(),
  boardId: integer('board_id').references(() => boards.id, { onDelete: 'cascade' }).notNull(),
  color: varchar('color', { length: 7 }).default('#e5e7eb'),
  limit: integer('limit'), // WIP limit
  rules: json('rules').$type<{
    autoMove: boolean;
    conditions: Array<{
      field: string;
      operator: string;
      value: string;
    }>;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Cards table for kanban cards
export const cards = pgTable('cards', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  position: integer('position').notNull(),
  columnId: integer('column_id').references(() => columns.id, { onDelete: 'cascade' }).notNull(),
  assigneeId: integer('assignee_id').references(() => users.id),
  creatorId: integer('creator_id').references(() => users.id).notNull(),
  dueDate: timestamp('due_date'),
  priority: varchar('priority', { length: 10 }).default('medium'), // low, medium, high, urgent
  estimatedHours: integer('estimated_hours'),
  actualHours: integer('actual_hours'),
  isArchived: boolean('is_archived').default(false),
  labels: json('labels').$type<Array<{
    id: string;
    name: string;
    color: string;
  }>>().default([]),
  checklist: json('checklist').$type<Array<{
    id: string;
    text: string;
    completed: boolean;
  }>>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Comments table for card comments
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  cardId: integer('card_id').references(() => cards.id, { onDelete: 'cascade' }).notNull(),
  authorId: integer('author_id').references(() => users.id).notNull(),
  mentions: json('mentions').$type<Array<{
    userId: number;
    name: string;
  }>>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Attachments table for file uploads
export const attachments = pgTable('attachments', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  cardId: integer('card_id').references(() => cards.id, { onDelete: 'cascade' }).notNull(),
  uploadedById: integer('uploaded_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Activity log table for tracking changes
export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 50 }).notNull(), // card_created, card_moved, comment_added, etc.
  description: text('description').notNull(),
  boardId: integer('board_id').references(() => boards.id, { onDelete: 'cascade' }),
  cardId: integer('card_id').references(() => cards.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id).notNull(),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Board members table for collaboration
export const boardMembers = pgTable('board_members', {
  id: serial('id').primaryKey(),
  boardId: integer('board_id').references(() => boards.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 20 }).default('member'), // admin, member, viewer
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
  joinedAt: timestamp('joined_at'),
});

// Card templates table
export const cardTemplates = pgTable('card_templates', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  boardId: integer('board_id').references(() => boards.id, { onDelete: 'cascade' }),
  isGlobal: boolean('is_global').default(false),
  template: json('template').$type<{
    title: string;
    description: string;
    labels: Array<{ id: string; name: string; color: string; }>;
    checklist: Array<{ id: string; text: string; completed: boolean; }>;
    estimatedHours: number;
  }>().notNull(),
  createdById: integer('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedBoards: many(boards),
  assignedCards: many(cards),
  comments: many(comments),
  activities: many(activities),
  boardMemberships: many(boardMembers),
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
  owner: one(users, {
    fields: [boards.ownerId],
    references: [users.id],
  }),
  columns: many(columns),
  members: many(boardMembers),
  activities: many(activities),
  cardTemplates: many(cardTemplates),
}));

export const columnsRelations = relations(columns, ({ one, many }) => ({
  board: one(boards, {
    fields: [columns.boardId],
    references: [boards.id],
  }),
  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  column: one(columns, {
    fields: [cards.columnId],
    references: [columns.id],
  }),
  assignee: one(users, {
    fields: [cards.assigneeId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [cards.creatorId],
    references: [users.id],
  }),
  comments: many(comments),
  attachments: many(attachments),
  activities: many(activities),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  card: one(cards, {
    fields: [comments.cardId],
    references: [cards.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  card: one(cards, {
    fields: [attachments.cardId],
    references: [cards.id],
  }),
  uploadedBy: one(users, {
    fields: [attachments.uploadedById],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  board: one(boards, {
    fields: [activities.boardId],
    references: [boards.id],
  }),
  card: one(cards, {
    fields: [activities.cardId],
    references: [cards.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const boardMembersRelations = relations(boardMembers, ({ one }) => ({
  board: one(boards, {
    fields: [boardMembers.boardId],
    references: [boards.id],
  }),
  user: one(users, {
    fields: [boardMembers.userId],
    references: [users.id],
  }),
}));

export const cardTemplatesRelations = relations(cardTemplates, ({ one }) => ({
  board: one(boards, {
    fields: [cardTemplates.boardId],
    references: [boards.id],
  }),
  createdBy: one(users, {
    fields: [cardTemplates.createdById],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Board = typeof boards.$inferSelect;
export type NewBoard = typeof boards.$inferInsert;
export type Column = typeof columns.$inferSelect;
export type NewColumn = typeof columns.$inferInsert;
export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type BoardMember = typeof boardMembers.$inferSelect;
export type NewBoardMember = typeof boardMembers.$inferInsert;
export type CardTemplate = typeof cardTemplates.$inferSelect;
export type NewCardTemplate = typeof cardTemplates.$inferInsert; 
