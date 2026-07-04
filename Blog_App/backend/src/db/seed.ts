import {db} from "./index"
import{users,profiles,categories,posts,tags,postsToTags,comments} from "./schema"
import {hashPassword} from "../lib/auth"

async function seed (){
    console.log("Sending Database");

    //users
    const [admin] = await db
    .insert(users)
    .values({
        name:"Admin User",
        email:"admin@example.com",
        password: await hashPassword('Admin@123'),
        role:"admin"
    })
    .returning()


    const [john] = await db
    .insert(users)
    .values({
        name:"john Doe",
        email:"john@example.com",
        password: await hashPassword("john@123"),
        role:"user",
    })
    .returning()


    // Profiles 1:1
    await db.insert(profiles).values(
        [
            {userId:admin.id,bio:"I am the Admin user", avatarUrl:"", phone:9876543219},
            {userId:john.id,bio:"I am john Doe", avatarUrl:"", phone:9876543210}
        ]
    );

    //categories
    const [tech, life]= await db.insert(categories).values([
        {name:"Technology", slug:"technology"},
        {name:"Lifestyle", slug:"lifestyle"}
    ])
    .returning()

    //Tags
    const [tagBun, tagElysia, tagDrizzle] = await db.insert(tags).values([
        {name:'Bun'},
        {name:'Elysia'},
        {name:'Drizzle'}
    ])
    .returning();


    //posts (1:N)
    const[post1] = await db.insert(posts)
    .values({
        title:"Getting started with Bun + Elysia",
        slug:"getting started with bun + elysis",
        content:"Bun is a fast all in one javascript runtime",
        published:true,
        authorId:john.id,
        categoryId:tech.id,
    })
    .returning();



    // post <--> tags(N:N)
    await db.insert(postsToTags).values([
        {postId:post1.id, tagId:tagBun.id},
        {postId:post1.id,tagId:tagElysia.id},
        {postId:post1.id,tagId:tagDrizzle.id}
    ]);

    //comments (1:N)
    await db.insert(comments).values([
        {postId:post1.id, userId:admin.id, content:'Nice write-up!'},
    ]);

    console.log("seed completed.Login with admin@example.com/ Admin@123")
    process.exit(0);
}
seed().catch((err)=>{
    console.error("Seed Failed",err);
    process.exit(1);
})