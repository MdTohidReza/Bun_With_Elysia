import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const migrationClient = postgres(process.env.DATABASE_URL!, {max: 1 });

async function main (){
    const db = drizzle(migrationClient);
    console.log("Running Migration")
    await migrate(db,{migrationsFolder:"./src/db/migrations"});
    console.log("Migration Completed")
    await migrationClient.end()
}

main().catch((err)=>{
    console.error("Migration Failed:", err);
    process.exit(1);
});

