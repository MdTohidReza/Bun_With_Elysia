import {Elysia} from "elysia";
import {jwt} from "@elysiajs/jwt";

export type JwtUser = {
    id:string,
    email:string,
    role: 'user' | 'admin';
};

export const authPlugin = new Elysia({name:'auth'})
.use(
    jwt({
        name:'jwt',
        secret: process.env.JWT_SECRET || "dev_secret",
        exp:'7d',
    })
)

.derive({ as: "global" }, async ({ jwt, headers, cookie }) => {
    const authHeader = headers.authorization;
    const bearer = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : undefined;

    const token = bearer || cookie.auth?.value;

    if (!token) return { user: null as JwtUser | null };

    const payload = await jwt.verify(token);
    if (!payload) return { user: null as JwtUser | null };

    return { user: payload as unknown as JwtUser };
});


export function isAuthenticated({user,set}:{user: JwtUser | null; set:any}){
    if(!user){
        set.status = 401;
        return {success:false, message : "Unauthorized.please login."}
    }
}


export function isAdmin({user,set}:{user:JwtUser | null; set:any}){
    if(!user){
        set.status = 401;
        return{success:false, message:"Unauthorized.please login."}
    }
    if(user.role !== 'admin'){
        set.status = 403;
        return {success:false, message:"Forbidden. Admin access required."}
    }
}