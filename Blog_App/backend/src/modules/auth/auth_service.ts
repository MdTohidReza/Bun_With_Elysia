import {eq} from 'drizzle-orm';
import {db} from '../../db';
import {users, profiles} from '../../db/schema';
import {hashPassword, verifyPassword} from '../../lib/auth';

export const AuthService = {
    async register(input:{name:string, email:string, password:string}){
        const existing = await db.query.users.findFirst({
            where: eq(users.email, input.email)
        });
        if(existing){
            throw new Error ("Email is already Registered");
        }

        const hashed = await hashPassword(input.password);

        const [newUser] = await db
        .insert(users)
        .values({
            name:input.name,
            email:input.email,
            password:hashed})
        .returning();

        await db.insert(profiles).values({userId: newUser.id})
        return newUser;
    },


    async login(input:{email:string, password:string}){
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, input.email),
        });
        if(!existingUser){
            throw new Error("Invalid Credentials");
        }
        const valid = await verifyPassword(input.password, existingUser.password);
        if(!valid) throw new Error("Invalid Email or Password")
            return existingUser;
    }
}