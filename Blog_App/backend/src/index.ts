import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { swagger } from "@elysiajs/swagger";
import { eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";
import { hashPassword, verifyPassword } from "./lib/auth";

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
      exp: 60 * 60 * 24 * 7, // 7 days
    })
  )
  // Health check
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }))
  // Database connection test
  .get("/db-test", async () => {
    try {
      const result = await db.select().from(users).limit(1);
      return {
        status: "connected",
        message: "✅ Database connection is working",
        database: "PostgreSQL",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Database connection error:", error);
      return {
        status: "disconnected",
        message: "❌ Database connection failed",
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  })
  // Auth Routes
  .post(
    "/auth/register",
    async ({ body, jwt: jwtPlugin }) => {
      try {
        const { email, password, name } = body as {
          email: string;
          password: string;
          name: string;
        };

        // Check if user exists
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (existingUser.length > 0) {
          return {
            error: "User already exists",
            status: 400,
          };
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const newUser = await db
          .insert(users)
          .values({
            email,
            name,
            password: hashedPassword,
            createdAt: new Date(),
          })
          .returning({ id: users.id, email: users.email, name: users.name });

        // Generate token
        const token = await jwtPlugin.sign({
          id: newUser[0].id,
          email: newUser[0].email,
        });

        return {
          message: "User registered successfully",
          token,
          user: newUser[0],
        };
      } catch (error) {
        console.error("Registration error:", error);
        return {
          error: "Registration failed",
          status: 500,
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
        name: t.String(),
      }),
    }
  )
  .post(
    "/auth/login",
    async ({ body, jwt: jwtPlugin }) => {
      try {
        const { email, password } = body as {
          email: string;
          password: string;
        };

        // Find user
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (user.length === 0) {
          return {
            error: "Invalid credentials",
            status: 401,
          };
        }

        // Verify password
        const isPasswordValid = await verifyPassword(
          password,
          user[0].password
        );

        if (!isPasswordValid) {
          return {
            error: "Invalid credentials",
            status: 401,
          };
        }

        // Generate token
        const token = await jwtPlugin.sign({
          id: user[0].id,
          email: user[0].email,
        });

        return {
          message: "Login successful",
          token,
          user: {
            id: user[0].id,
            email: user[0].email,
            name: user[0].name,
          },
        };
      } catch (error) {
        console.error("Login error:", error);
        return {
          error: "Login failed",
          status: 500,
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    }
  )
  .get("/user/profile", async ({ jwt: jwtPlugin, headers }) => {
    try {
      // Get token from headers
      const token = headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return {
          error: "No token provided",
          status: 401,
        };
      }

      // Verify token
      const payload = await jwtPlugin.verify(token);
      if (!payload) {
        return {
          error: "Invalid token",
          status: 401,
        };
      }

      // Get user
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.id as string))
        .limit(1);

      if (user.length === 0) {
        return {
          error: "User not found",
          status: 404,
        };
      }

      return {
        user: {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
        },
      };
    } catch (error) {
      console.error("Profile error:", error);
      return {
        error: "Failed to fetch profile",
        status: 500,
      };
    }
  });

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("\n🛑 Shutting down gracefully...");
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Start server
const port = parseInt(process.env.PORT || "3000");
app.listen(port, () => {
  console.log(`
   🚀 Blog API Server Started
  📍 http://localhost:${port}
    📚 Docs: http://localhost:${port}/swagger
  `);
});
