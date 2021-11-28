import debug from '../util/debug';

const log = debug('error-handler');

export default function() {
    return async (ctx: any, next: any) => {
        try {
            await next();
            if (!ctx.body) {
                ctx.status = 404;
                ctx.body = "未匹配到对应资源";
            }
        } catch (e) {
            ctx.status = 500;
            ctx.body = e.message;
            log(e);
        }
    };
}