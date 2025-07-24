import { pgTable, serial, varchar, text, timestamp, boolean, integer, json, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table for collaboration features
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  avatar: varchar('avatar', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Boards table
export const boards = pgTable('boards', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  background: varchar('background', { length: 255 }).default('#ffffff'),
  isTemplate: boolean('is_template').default(false),
  templateType: varchar('template_type', { length: 100 }),
  ownerId: integer('owner_id').references(() => users.id),
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

// Columns table
export const columns = pgTable('columns', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  position: integer('position').notNull(),
  boardId: integer('board_id').references(() => boards.id, { onDelete: 'cascade' }).notNull(),
  color: varchar('color', { length: 7 }).default('#e5e7eb'),
  wipLimit: integer('wip_limit'),
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

// Cards table
export const cards = pgTable('cards', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  position: integer('position').notNull(),
  columnId: integer('column_id').references(() => columns.id, { onDelete: 'cascade' }).notNull(),
  assigneeId: integer('assignee_id').references(() => users.id),
  dueDate: timestamp('due_date'),
  priority: varchar('priority', { length: 10 }).default('medium'),
  estimatedHours: real('estimated_hours'),
  actualHours: real('actual_hours'),
  color: varchar('color', { length: 7 }),
  archived: boolean('archived').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tags table
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 7 }).notNull(),
  boardId: integer('board_id').references(() => boards.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Card tags junction table
export const cardTags = pgTable('card_tags', {
  id: serial('id').primaryKey(),
  cardId: integer('card_id').references(() => cards.id, { onDelete: 'cascade' }).notNull(),
  tagId: integer('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
});

// Comments table
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  cardId: integer('card_id').references(() => cards.id, { onDelete: 'cascade' }).notNull(),
  authorId: integer('author_id').references(() => users.id).notNull(),
  mentions: json('mentions').$type<number[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Attachments table
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

// Activity log table
export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 50 }).notNull(),
  description: text('description').notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: integer('entity_id').notNull(),
  userId: integer('user_id').references(() => users.id),
  boardId: integer('board_id').references(() => boards.id, { onDelete: 'cascade' }).notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Board members table for collaboration
export const boardMembers = pgTable('board_members', {
  id: serial('id').primaryKey(),
  boardId: integer('board_id').references(() => boards.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 20 }).default('member').notNull(),
  permissions: json('permissions').$type<{
    canEdit: boolean;
    canDelete: boolean;
    canInvite: boolean;
    canManageSettings: boolean;
  }>().default({
    canEdit: true,
    canDelete: false,
    canInvite: false,
    canManageSettings: false,
  }),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedBoards: many(boards),
  assignedCards: many(cards),
  comments: many(comments),
  boardMemberships: many(boardMembers),
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
  owner: one(users, {
    fields: [boards.ownerId],
    references: [users.id],
  }),
  columns: many(columns),
  tags: many(tags),
  activities: many(activities),
  members: many(boardMembers),
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
  tags: many(cardTags),
  comments: many(comments),
  attachments: many(attachments),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  board: one(boards, {
    fields: [tags.boardId],
    references: [boards.id],
  }),
  cards: many(cardTags),
}));

export const cardTagsRelations = relations(cardTags, ({ one }) => ({
  card: one(cards, {
    fields: [cardTags.cardId],
    references: [cards.id],
  }),
  tag: one(tags, {
    fields: [cardTags.tagId],
    references: [tags.id],
  }),
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
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
  board: one(boards, {
    fields: [activities.boardId],
    references: [boards.id],
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

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Board = typeof boards.$inferSelect;
export type NewBoard = typeof boards.$inferInsert;
export type Column = typeof columns.$inferSelect;
export type NewColumn = typeof columns.$inferInsert;
export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type CardTag = typeof cardTags.$inferSelect;
export type NewCardTag = typeof cardTags.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type BoardMember = typeof boardMembers.$inferSelect;
export type NewBoardMember = typeof boardMembers.$inferInsert; 
