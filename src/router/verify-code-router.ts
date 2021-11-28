import verifyCodeService from "../service/verify-code-service";
import R from "../util/response";
import {routerFactory} from "./router-factory";
import Joi from 'joi';

const router = routerFactory("/verifyCode");

/**
 * 发送邮件验证码
 * @param address 对方邮箱
 */
router.post("/sendEmailCode", async (ctx: any) => {
    const {emailAddress} = ctx.request.body;

    const schema = Joi.object({
        emailAddress: Joi.string().email().required()
    })

    try {
        await schema.validateAsync({emailAddress});
    } catch (e) {
        throw '邮箱格式错误';
    }

    const emailCode = verifyCodeService.createEmailCode();
    const res: any = await verifyCodeService.sendEmailCode(emailAddress, emailCode);
    if (res.code === 0) {
        ctx.body = R.success();
    }
});

export default router;