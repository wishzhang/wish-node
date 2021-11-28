import fileService from '../service/file-service';
import R from "../util/response";
import {routerFactory} from "./router-factory";

const router = routerFactory("/file");

router.post("/put", async (ctx: any) => {
    const file = ctx.request.files["file"];
    const resData = await fileService.putFile(file);
    ctx.body = R.success(resData);
});

export default router;