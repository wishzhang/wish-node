import userService from "../service/user-service";
import verifyCodeService from "../service/verify-code-service";
import R from "../util/response";
import {routerFactory} from "./router-factory";
import Joi from 'joi';
import validate from '../util/validate';

const router = routerFactory("/user");

router.get("/page", async (ctx: any) => {
    const list = await userService.getUserList();
    ctx.body = R.success(list);
});

router.get("/update", async (ctx: any) => {
    const query = ctx.request.query;
    const {username, password, avatarUrl, bgUrl, userId} = query;

    const schema = Joi.object({
        password: Joi.string().custom((value) => {
            if (!validate.validPassword(value)) {
                throw new Error('密码格式错误');
            }
        })
    })

    try {
        await schema.validateAsync({
            password: password
        })
    } catch (e) {
        throw e;
    }

    const obj = {
        username: username,
        password: password,
        avatarUrl: avatarUrl,
        bgUrl: bgUrl,
        userId: userId
    };

    await userService.updateUser(obj);
    ctx.body = R.success();
});

router.get("/detail", async (ctx: any) => {
    const {userId} = ctx.request.query;

    const detail = await userService.findByPk(userId);
    ctx.body = R.success(detail);
});

router.post("/editEmailAddress", async (ctx: any) => {
    const {originEmailAddress, targetEmailAddress, verifyCode, password} = ctx.request.body;

    await userService.editEmailAddress(originEmailAddress, targetEmailAddress, password, verifyCode);
    ctx.body = R.success();
});

export default router;