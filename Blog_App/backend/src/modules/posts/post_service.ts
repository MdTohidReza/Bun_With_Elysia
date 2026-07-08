import { eq } from "drizzle-orm";
import { db } from "../../db";
import { posts, postsToTags } from "../../db/schema";

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString(36) // keep slugs unique even for duplicate titles
  );
}

export const PostsService = {
  // List posts with their author, category, and tags (N:N resolved through the join table)
  async findAll() {
    const rows = await db.query.posts.findMany({
      where: (p, { eq }) => eq(p.published, true),
      orderBy: (p, { desc }) => [desc(p.createdAt)],
      with: {
        author: { columns: { id: true, name: true } },
        category: true,
        postsToTags: { with: { tag: true } },
      },
    });

    // flatten postsToTags -> tags for a cleaner API response
    return rows.map((p) => ({
      ...p,
      tags: p.postsToTags.map((pt) => pt.tag),
      postsToTags: undefined,
    }));
  },

  async findBySlug(slug: string) {
    const post = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
      with: {
        author: { columns: { id: true, name: true } },
        category: true,
        postsToTags: { with: { tag: true } },
        comments: {
          orderBy: (c, { desc }) => [desc(c.createdAt)],
          with: { author: { columns: { id: true, name: true } } },
        },
      },
    });
    if (!post) return null;
    return { ...post, tags: post.postsToTags.map((pt) => pt.tag), postsToTags: undefined };
  },

  async findRawById(id: number) {
    return db.query.posts.findFirst({ where: eq(posts.id, id) });
  },

  async create(
    authorId: number,
    data: { title: string; content: string; published?: boolean; categoryId?: number; tagIds?: number[] }
  ) {
    const [post] = await db
      .insert(posts)
      .values({
        title: data.title,
        slug: slugify(data.title),
        content: data.content,
        published: data.published ?? false,
        authorId,
        categoryId: data.categoryId,
      })
      .returning();

    // Many-to-many: attach the chosen tags through the join table
    if (data.tagIds?.length) {
      await db.insert(postsToTags).values(data.tagIds.map((tagId) => ({ postId: post.id, tagId })));
    }

    return post;
  },

  async update(
    id: number,
    data: { title?: string; content?: string; published?: boolean; categoryId?: number; tagIds?: number[] }
  ) {
    const { tagIds, ...rest } = data;

    const [updated] = await db.update(posts).set(rest).where(eq(posts.id, id)).returning();

    // If tagIds were supplied, replace the whole set of linked tags
    if (tagIds) {
      await db.delete(postsToTags).where(eq(postsToTags.postId, id));
      if (tagIds.length) {
        await db.insert(postsToTags).values(tagIds.map((tagId) => ({ postId: id, tagId })));
      }
    }

    return updated;
  },

  async remove(id: number) {
    await db.delete(posts).where(eq(posts.id, id));
  },
};