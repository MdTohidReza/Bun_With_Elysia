import {Elysia, t} from "elysia";
import {authPlugin, isAdmin} from "../../middleware/auth.middleware";
import { CategoriesService} from "./categories_service";

export const categoriesController = new Elysia({prefix:'/categories',tags:["categories"]})

.use(authPlugin)

.get("/",async()=>{
    const list = await CategoriesService.findAll();
    return {success:true,data:list};
})

.guard({beforeHandle: isAdmin},(app)=>
    app.post("/",async({body, set})=>{
        const created = await CategoriesService.create(body.name)
        set.status = 201;
        return {success:true, data:created}
    },
{body:t.Object({name:t.String({minLength:2})})}
)

.delete("/:id",async({params, set})=>{
    await CategoriesService.remove(Number(params.id));
    set.status = 204;
    })
);