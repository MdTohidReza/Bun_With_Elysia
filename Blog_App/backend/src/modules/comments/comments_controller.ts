import {Elysia,t} from 'elysia';
import {authPlugin,  isAuthenticated} from "../../middleware/auth.middleware"
import { CommentService } from './comments_service';

export const commentsController = new Elysia({prefix:'/posts/:postId/comments',tags:["comments"]})
.use(authPlugin)
.guard({beforeHandle: isAuthenticated}, (app) =>
    app.post(
        '/',
    async ({user,params,body,set})=>{
        const created = await CommentService.create(user!.id, Number(params.postId),body.content);
        set.status = 204;
        return {success: true, data:created}
    },
    {body:t.Object({content:t.String({minLength:5, maxLength:1000}) }) }
)

.delete("/:commentId",async({user, params,set})=>{
    const existing = await CommentService.findRawById(Number(params.commentId));
    if(!existing){
        set.status = 404;
        return {success:false, message:"Comment Not Found"}
    }
    if(existing.userId !== user!.id && user!.role !== "admin"){
        set.status = 403;
        return {success:false,message:"You can Only Delete Your Own Comments"}
    }
    await CommentService.remove(Number(params.commentId));
    })
)