import messageService from "../service/message-service";
import contactService from '../service/contact-service';
import userService from '../service/user-service';
import Joi from 'joi';
import socket from "../socket";
import {routerFactory} from "./router-factory";
import R from "../util/response";

const router = routerFactory("/message");

router.get("/getContactMessagePage", async (ctx: any) => {
    const query = ctx.query;
    const {originUser, targetUser, current, size} = query;

    const list = await messageService.getContactMessagePage(originUser, targetUser, current, size);
    ctx.body = R.success(list);
});

router.get("/getMineAllChatList", async (ctx: any) => {
    const query = ctx.query;
    const userId = query.userId;

    const list = await messageService.getMineAllChatList(userId);
    ctx.body = R.success(list);
});

router.post("/addMessage", async (ctx: any) => {
    const {originUser, targetUser, content} = ctx.request.body;

    await messageService.addMessage(originUser, targetUser, content);
    ctx.body = R.success();
});

router.post("/checkMessage", async (ctx: any) => {
    const {userId, contactId} = ctx.request.body;

    await messageService.checkMessage(userId, contactId);
    ctx.body = R.success();
});

export default router;