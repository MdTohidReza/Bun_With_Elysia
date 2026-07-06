import {
    pgTable,
    serial,
    text,
    varchar,
    timestamp,
    boolean,
    pgEnum,
    integer,
    primaryKey,
    unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enum
export const roleEnum = pgEnum("role", ['user', 'admin']);

// User Table
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(), // hashed password
    role: roleEnum("role").notNull().default('user'),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Profiles (1:1 with users)
export const profiles = pgTable("profiles", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: "cascade" }),
    bio: text("bio"),
    avatarUrl: varchar("avatar_url", { length: 500 }),
    phone: varchar("phone", { length: 10 }).unique(),
});

// Categories (1:N with posts)
export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
});

// Posts (N:1 with users, N:1 with categories)
export const posts = pgTable("posts", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    content: text("content").notNull(),
    published: boolean("published").notNull().default(false),
    authorId: integer("author_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
        .references(() => categories.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tags (N:N with posts)
export const tags = pgTable("tags", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 60 }).notNull().unique(),
});

// Join table: posts <-> tags
export const postsToTags = pgTable("posts_to_tags", {
    postId: integer("post_id")
        .notNull()
        .references(() => posts.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
        .notNull()
        .references(() => tags.id, { onDelete: "cascade" }),
}, (t) => ({
    pk: primaryKey({ columns: [t.postId, t.tagId] }),
}));

// Comments (1:N with users, 1:N with posts)
export const comments = pgTable("comments", {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    postId: integer("post_id")
        .notNull()
        .references(() => posts.id, { onDelete: "cascade" }),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------- Relations (used by db.query) ----------------

export const userRelations = relations(users, ({ one, many }) => ({
    profile: one(profiles, {
        fields: [users.id],
        references: [profiles.userId],
    }), // 1:1
    posts: many(posts), // 1:N (as author)
    comments: many(comments), // 1:N
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
    user: one(users, {
        fields: [profiles.userId],
        references: [users.id],
    }), // 1:1 (inverse side)
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
    posts: many(posts), // 1:N
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
    author: one(users, {
        fields: [posts.authorId],
        references: [users.id],
    }), // N:1

    category: one(categories, {
        fields: [posts.categoryId],
        references: [categories.id],
    }), // N:1

    comments: many(comments), // 1:N

    postsToTags: many(postsToTags), // N:N
}));

export const postsToTagsRelations = relations(postsToTags, ({ one }) => ({
    post: one(posts, {
        fields: [postsToTags.postId],
        references: [posts.id],
    }),
    tag: one(tags, {
        fields: [postsToTags.tagId],
        references: [tags.id],
    }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
    post: one(posts, {
        fields: [comments.postId],
        references: [posts.id],
    }),
    author: one(users, {
        fields: [comments.userId],
        references: [users.id],
    }),
}));