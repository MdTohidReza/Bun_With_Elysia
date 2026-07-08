import { Elysia } from "elysia";
import { authPlugin, isAuthenticated } from "../../middleware/auth.middleware";
import { createPostBody, updatePostBody } from "./posts_models";
import { PostsService } from "./post_service";

export const postsController = new Elysia({ prefix: "/posts", tags: ["Posts"] })
  .use(authPlugin)

  // ---- Public: browse published posts ----
  .get("/", async () => {
    const list = await PostsService.findAll();
    return { success: true, data: list };
  })

  .get("/:postId", async ({ params, set }) => {
    const post = await PostsService.findBySlug(params.postId);
    if (!post) {
      set.status = 404;
      return { success: false, message: "Post not found" };
    }
    return { success: true, data: post };
  })

  // ---- Everything below requires login ----
  .guard({ beforeHandle: isAuthenticated }, (app) =>
    app
      .post(
        "/",
        async ({ user, body, set }) => {
          const post = await PostsService.create(user!.id, body);
          set.status = 201;
          return { success: true, data: post };
        },
        { body: createPostBody }
      )

      .patch(
        "/:postId",
        async ({ user, params, body, set }) => {
          const existing = await PostsService.findRawById(Number(params.postId));
          if (!existing) {
            set.status = 404;
            return { success: false, message: "Post not found" };
          }
          // Ownership check: only the author OR an admin may edit
          if (existing.authorId !== user!.id && user!.role !== "admin") {
            set.status = 403;
            return { success: false, message: "You can only edit your own posts" };
          }
          const updated = await PostsService.update(Number(params.postId), body);
          return { success: true, data: updated };
        },
        { body: updatePostBody }
      )

      .delete("/:postId", async ({ user, params, set }) => {
        const existing = await PostsService.findRawById(Number(params.postId));
        if (!existing) {
          set.status = 404;
          return { success: false, message: "Post not found" };
        }
        if (existing.authorId !== user!.id && user!.role !== "admin") {
          set.status = 403;
          return { success: false, message: "You can only delete your own posts" };
        }
        await PostsService.remove(Number(params.postId));
        set.status = 204;
      })
  );