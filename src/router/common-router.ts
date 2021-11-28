import R from "../util/response";
import {routerFactory} from "./router-factory";
const router = routerFactory("/common");

router.get("/serverTime", async (ctx: any) => {
    ctx.body = R.success({serverTime: new Date()});
});

export = router;