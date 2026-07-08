import { Elysia, t } from "elysia";
import { authPlugin, isAdmin } from "../../middleware/auth.middleware";
import { TagsService } from "./tags_service";

export const tagsController = new Elysia({ prefix: "/tags", tags: ["Tags"] })
  .use(authPlugin)

  .get("/", async () => {
    const list = await TagsService.findAll();
    return { success: true, data: list };
  })

  .guard({ beforeHandle: isAdmin }, (app) =>
    app
      .post(
        "/",
        async ({ body, set }) => {
          const created = await TagsService.create(body.name);
          set.status = 201;
          return { success: true, data: created };
        },
        { body: t.Object({ name: t.String({ minLength: 1 }) }) }
      )
      .delete("/:id", async ({ params, set }) => {
        await TagsService.remove(Number(params.id));
        set.status = 204;
      })
  );
