import {eq} from 'drizzle-orm'
import{db} from '../../db';
import {comments} from '../../db/schema'

export const CommentService = {
    async create (userId:number,postId:number, content:String){
        const [created] = await db.insert(comments).values({postId,userId,content}).returning()
        return created;
    },

    async findRawById(id:number){
        return db.query.comments.findFirst({where: eq(comments.id, id)});
    },

    async remove(id:number){
        await db.delete(comments).where(eq(comments.id,id));
    },
}