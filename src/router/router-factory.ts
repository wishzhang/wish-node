import debug from "../util/debug";

const log = debug('router');

const routerFactory = function (prefix: any) {
    const router = require("koa-router")({
        prefix: prefix
    });

    return {
        get(path: any, callback: any) {
            return router.get(path, async (ctx: any, next: any) => {
                log("请求路径为：" + ctx.request.path);
                await callback(ctx);
                next();
            });
        },
        post(path: any, callback: any) {
            return router.post(path, async (ctx: any, next: any) => {
                log("请求路径为：" + ctx.request.path);
                await callback(ctx);
                next();
            });
        },
        all(path: any, callback: any) {
            return router.all(path, async (ctx: any, next: any) => {
                log("请求路径为：" + ctx.request.path);
                await callback(ctx);
                next();
            });
        },
        routes() {
            return router.routes();
        }
    };
};

export {
    routerFactory
};