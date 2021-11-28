import util from "../util";
import {User} from "../dao/model";
import Joi from "joi";
import validate from "../util/validate";
import verifyCodeService from "./verify-code-service";
import R from "../util/response";

async function getUserList() {
    return await User.findAll();
};

async function insertUser(obj: any) {
    const user = await User.create(obj);
    return user.toJSON();
};

async function updateUser(obj: any) {
    if (!await hasUser(obj.userId)) {
        throw Error('找不到用户');
    }
    return await User.update(obj, {where: {userId: obj.userId}})
};

async function findByPk(userId: string) {
    if (!await hasUser(userId)) {
        throw Error('找不到用户');
    }
    return await User.findByPk(userId);
};

async function findEmailAddress(emailAddress: string) {
    return await User.findOne({
        where: {
            emailAddress: emailAddress
        }
    })
};

async function getMaxXinmiId() {
    return await User.max('username');
};

async function updatePasswordByEmailAddress(emailAddress: string, verifyCode: string, newPassword: string) {
    const schema = Joi.object({
        emailAddress: Joi.string().email().required(),
        verifyCode: Joi.string().required(),
        newPassword: Joi.string().custom((value) => {
            if (!validate.validPassword(value)) {
                throw new Error('密码格式错误');
            }
        })
    })
    try {
        await schema.validateAsync({emailAddress, verifyCode, newPassword});
    } catch (e) {
        throw e;
    }

    // 验证码是否有效
    const isValidCode = verifyCodeService.canMatchEmailCode(emailAddress, verifyCode);
    if (!isValidCode) {
        throw Error('验证码错误');
    }

    // 邮箱地址是否已注册
    const user = await findEmailAddress(emailAddress);
    if (!user) {
        throw Error('该邮箱未注册');
    }

    return await User.update({password: newPassword}, {
        where: {
            emailAddress
        }
    })
};

/**
 * 修改邮箱
 * @param originEmailAddress
 * @param targetEmailAddress
 * @param verifyCode
 * @param password
 * @return code: 1 该邮箱未注册 2 验证码错误
 */
async function editEmailAddress(originEmailAddress: string,
                                targetEmailAddress: string,
                                password: string,
                                verifyCode: string) {
    const schema = Joi.object({
        originEmailAddress: Joi.string().email().required(),
        targetEmailAddress: Joi.string().email().required(),
        verifyCode: Joi.required(),
        password: Joi.string().custom((value) => {
            if (!validate.validPassword(value)) {
                throw new Error('密码格式错误');
            }
        })
    });

    await schema.validateAsync({originEmailAddress, targetEmailAddress, verifyCode, password});

    // 验证码是否有效
    const isValidCode = verifyCodeService.canMatchEmailCode(targetEmailAddress, verifyCode);
    if (!isValidCode) {
        throw Error('验证码错误');
    }

    // 密码是否有效
    const user = await findOne({emailAddress: originEmailAddress, password: password});
    if (!user) {
        throw Error('密码错误');
    }

    await User.update({emailAddress: targetEmailAddress}, {
        where: {
            emailAddress: originEmailAddress,
            password: password
        }
    })
};

async function findOne(obj: any) {
    return await User.findOne({
        where: obj
    });
};

async function hasUser(userId: string) {
    const user = await findOne({userId: userId});
    return user !== null;
}

export default {
    getUserList,
    insertUser,
    updateUser,
    findByPk,
    getMaxXinmiId,
    updatePasswordByEmailAddress,
    editEmailAddress,
    findEmailAddress,
    findOne,
    hasUser
}