import { eq } from "drizzle-orm";
import { db } from "../../db";
import { tags } from "../../db/schema";

export const TagsService = {
  async findAll() {
    return db.query.tags.findMany();
  },

  async create(name: string) {
    const [created] = await db.insert(tags).values({ name }).returning();
    return created;
  },

  async remove(id: number) {
    await db.delete(tags).where(eq(tags.id, id));
  },
};
