import {Elysia} from 'elysia';
import {authPlugin, isAuthenticated} from '../../middleware/auth.middleware';
import{registerBody, loginBody} from './auth.models';
import {AuthService} from './auth_service';

export const authController = new Elysia ({prefix:'/auth', tags:['auth']})
.use(authPlugin)

//post  /auth/register -> create a new user
.post('/register',
    async ({body,jwt,cookie,set})=>{
        try{
            const user = await AuthService.register(body);
            const token = await jwt.sign({id:user.id, email:user.email,role:user.role});

            cookie.auth.set({value:token, httpOnly:true, maxAge:7*86400, path:'/'});

            set.status= 201;
            return{
                success:true,
                message:'Account Created',
                data:{token, user:{id:user.id, name:user.name, email:user.email,role:user.role}},
            };
    }
        catch(err:any){
            set.status = 401;
            return{success:false, message:err.message}
        }
},
{body:registerBody}
)

//post /auth/login -> authenticate + return JWT
.post('/login',
async({body,jwt,cookie,set})=>{
    try{
        const user = await AuthService.login(body);
        const token = await jwt.sign({id:user.id,email:user.email, role:user.role});
        cookie.auth.set({value:token, httpOnly:true, maxAge:7*86400,path:'/'})
        set.status = 200;
        return{
            success:true,
            message:'Login Successful',
            data:{token, user:{id:user.id, name:user.name, email:user.email, role:user.role}}
        }
    }
    catch(err:any){
        set.status = 401;
        return{
            success:false,
            message:err.message
        }
    }
},
{body:loginBody}
)

//post /auth/logout -> clear cookie
.post('/logout',({cookie})=>{
    cookie.auth.remove();
    return {success:true, message:'Logged Out'}
})

//get /auth/me -> return currently logged-in user
.guard({beforeHandle: isAuthenticated},(app)=>
    app.get('/me',({user})=>{
        return {success:true, data:user}
    })
);