import { t } from "elysia";

export const createPostBody = t.Object({
  title: t.String({ minLength: 3, maxLength: 200 }),
  content: t.String({ minLength: 10 }),
  published: t.Optional(t.Boolean()),
  categoryId: t.Optional(t.Numeric()),
  tagIds: t.Optional(t.Array(t.Numeric())), // many-to-many: list of tag ids to attach
});

export const updatePostBody = t.Partial(createPostBody);
