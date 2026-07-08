import { Elysia, t } from "elysia";
import { authPlugin, isAuthenticated, isAdmin } from "../../middleware/auth.middleware";
import { UsersService } from "./user_services";

export const usersController = new Elysia({ prefix: "/users", tags: ["Users"] })
  .use(authPlugin)

  // ---- Public route: anyone can view a public profile ----
  .get("/:id", async ({ params, set }) => {
    const user = await UsersService.findById(Number(params.id));
    if (!user) {
      set.status = 404;
      return { success: false, message: "User not found" };
    }
    return { success: true, data: user };
  })

  // ---- Admin-only routes: list all users / delete a user ----
  .guard({ beforeHandle: isAdmin }, (app) =>
    app
      .get("/", async () => {
        const list = await UsersService.findAll();
        return { success: true, data: list };
      })
      .delete("/:id", async ({ params, set }) => {
        await UsersService.remove(Number(params.id));
        set.status = 204;
      })
  )

  // ---- Logged-in user updates their own 1:1 profile ----
  .guard({ beforeHandle: isAuthenticated }, (app) =>
    app.patch(
      "/me/profile",
      async ({ user, body }) => {
        const updated = await UsersService.updateOwnProfile(user!.id, body);
        return { success: true, data: updated };
      },
      {
        body: t.Object({
          bio: t.Optional(t.String()),
          avatarUrl: t.Optional(t.String()),
          phone: t.Optional(t.String()),
        }),
      }
    )
  );
