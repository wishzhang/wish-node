import router from "./router";
import R from "../util/response";
import userRouter from "./user-router";
import loginRouter from "./login-router";
import contactRouter from "./contact-router";
import messageRouter from "./message-router";
import circleRouter from "./circle-router";
import fileRouter from "./file-router";
import commonRouter from "./common-router";
import verifyCodeRouter from "./verify-code-router";

export default (app: any) => {
    app.use(router.routes());
    app.use(userRouter.routes());
    app.use(loginRouter.routes());
    app.use(circleRouter.routes());
    app.use(contactRouter.routes());
    app.use(messageRouter.routes());
    app.use(fileRouter.routes());
    app.use(commonRouter.routes());
    app.use(verifyCodeRouter.routes());
}