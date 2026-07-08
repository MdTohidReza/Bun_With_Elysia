import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users, profiles } from "../../db/schema";

export const UsersService = {
  // Admin-only: list every user together with their 1:1 profile
  async findAll() {
    return db.query.users.findMany({
      columns: { password: false }, // never leak password hashes
      with: { profile: true },
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    });
  },

  // Public profile page: user + profile + their posts (1:N)
  async findById(id: number) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
      columns: { password: false },
      with: {
        profile: true,
        posts: { orderBy: (p, { desc }) => [desc(p.createdAt)] },
      },
    });
  },

  async updateOwnProfile(
    userId: number,
    data: { bio?: string; avatarUrl?: string; phone?: string }
  ) {
    const [updated] = await db
      .update(profiles)
      .set(data)
      .where(eq(profiles.userId, userId))
      .returning();
    return updated;
  },

  async remove(id: number) {
    await db.delete(users).where(eq(users.id, id));
  },
};
