import {User} from "../dao/model";
import Joi from "joi";
import validate from "../util/validate";
import userService from "./user-service";
import verifyCodeService from "./verify-code-service";
import R from "../util/response";
import generator from "../util/generator";
import jwt from "jsonwebtoken";
import config from '../config'

async function loginByPassword(username: string, password: string) {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().custom((value) => {
            if (!validate.validPassword(value)) {
                throw new Error('密码格式错误');
            }
        })
    })

    await schema.validateAsync({username, password});

    const user = await userService.findOne({username, password});

    if (!user) {
        throw Error('用户名或密码错误');
    }

    return user;
}

async function loginByEmail(emailAddress: string, verifyCode: string) {
    const schema = Joi.object({
        emailAddress: Joi.string().email().required(),
        verifyCode: Joi.required()
    })

    await schema.validateAsync({emailAddress, verifyCode});

    // 验证码是否有效
    const isValidCode = verifyCodeService.canMatchEmailCode(emailAddress, verifyCode);
    if (!isValidCode) {
        throw Error('验证码错误')
    }

    // 邮箱地址是否已注册，没有注册就自动注册
    let user: any = await userService.findEmailAddress(emailAddress);
    if (!user) {
        const maxId = await userService.getMaxXinmiId();
        const xinmiId = generator.createXinmiId(maxId);
        const obj = {
            username: xinmiId,
            emailAddress: emailAddress
        };
        user = await userService.insertUser(obj);
    }

    return user;
}

// 生成token
function createToken(data: { userId: string }) {
    const token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + config.token.expires,
        data: data
    }, config.token.secret);

    return token;
}

function verifyToken(token: string) {
    return jwt.verify(token, config.token.secret);
}

export default {
    loginByPassword,
    loginByEmail,
    createToken,
    verifyToken
}