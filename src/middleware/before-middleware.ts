import loginService from '../service/login-service'
import config from '../config'
import debug from '../util/debug'

const log = debug('before-middleware')

export default () => {
    return (async (ctx: any, next: any) => {
        if (config.token.whiteList.includes(ctx.originalUrl)) {
            await next();
        } else {
            try {
                const headers = ctx.req.headers;
                const token = headers[config.token.header];
                const decode: any = loginService.verifyToken(token);
                log(`token: ${token}`);
                log(`token decode: %o`, decode);
                ctx.userId = decode.userId;
                await next();
            } catch (e) {
                ctx.status = 401;
                ctx.body = '请求未授权 :' + e.toString();
                log(e);
            }
        }
    });
}