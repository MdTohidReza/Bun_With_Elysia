import {eq} from 'drizzle-orm';
import {db} from '../../db';
import {categories} from '../../db/schema';

function slugify(text:string){
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}

export const CategoriesService = {
    async findAll(){
        return db.query.categories.findMany({with:{posts:true}});
    },
    async create (name:string){
        const [created] = await db.insert(categories).values({name,slug:slugify(name)}).returning();
        return created;
    },

    async remove(id:number){
        await db.delete(categories).where(eq(categories.id, id));
    }
}