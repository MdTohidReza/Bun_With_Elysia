import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

import { authController } from "./modules/auth/auth_controller";
import { usersController } from "./modules/users/user_controller";
import { categoriesController } from "./modules/categories/categories_controller";
import { tagsController } from "./modules/tags/tags_controller";
import { postsController } from "./modules/posts/post_controller";
import { commentsController } from "./modules/comments/comments_controller";

const PORT = Number(process.env.PORT) || 4000;
const CORS_ORIGIN = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",");

const app = new Elysia()
  .use(cors({ origin: CORS_ORIGIN, credentials: true }))
  // Elysia's built-in OpenAPI/Swagger plugin auto-generates interactive API
  // docs from every route + typebox schema defined below.
  // Visit http://localhost:4000/docs once the server is running.
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: {
          title: "BlogApp API",
          version: "1.0.0",
          description:
            "Portfolio project API built with Bun + Elysia + Drizzle ORM + PostgreSQL. " +
            "Demonstrates JWT auth, role-based access control, and one-to-one, " +
            "one-to-many and many-to-many database relations.",
        },
        tags: [
          { name: "Auth", description: "Register / login / current user" },
          { name: "Users", description: "User profiles (1:1) & admin user management" },
          { name: "Categories", description: "Post categories (1:N with posts)" },
          { name: "Tags", description: "Post tags (N:N with posts)" },
          { name: "Posts", description: "Blog posts - the core resource" },
          { name: "Comments", description: "Comments nested under a post" },
        ],
      },
    })
  )
  .get("/", () => ({
    success: true,
    message: "BlogApp API is running. See /docs for interactive API documentation.",
  }))
  .use(authController)
  .use(usersController)
  .use(categoriesController)
  .use(tagsController)
  .use(postsController)
  .use(commentsController)
  .listen(PORT);

console.log(`🚀 Elysia server running at http://localhost:${app.server?.port}`);
console.log(`📚 Swagger docs available at http://localhost:${app.server?.port}/docs`);
