import contactService from "../service/contact-service";
import R from "../util/response";
import userService from "../service/user-service";
import socket from "../socket";
import {routerFactory} from "./router-factory";
import Joi from 'joi';

const router = routerFactory("/contact");

router.get("/getYesContactList", async (ctx: any) => {
    const query = ctx.query;
    const {userId} = query;

    const list = await contactService.getYesContactList(userId);
    ctx.body = R.success(list);
});

router.get("/addContact", async (ctx: any) => {
    const {userId, contactId, validateMsg} = ctx.query;

    const r = await contactService.addContact(userId, contactId, validateMsg);

    if (r) {
        await socket.emitContactAddContact(userId, contactId);
    }

    ctx.body = R.success();
});

router.get("/getNoContactList", async (ctx: any) => {
    const query = ctx.query;
    const {userId, username = ''} = query;

    const list = await contactService.getNoContactList(userId, username);
    ctx.body = R.success(list);
});

router.get("/getConfirmContactList", async (ctx: any) => {
    const query = ctx.query;
    const userId = query.userId;

    const list = await contactService.getConfirmContactList(userId);
    ctx.body = R.success(list);
});

router.get("/confirmContact", async (ctx: any) => {
    const query = ctx.query;
    const {userId, contactId} = query;

    await contactService.confirmContact(userId, contactId);
    ctx.body = R.success();
});

router.get("/getUserContactStatus", async (ctx: any) => {
    const query = ctx.query;
    const {userId, contactId} = query;

    const status = await contactService.getUserContactStatus(userId, contactId);
    ctx.body = R.success(status);
});

router.get("/getContactInfoHad", async (ctx: any) => {
    const query = ctx.query;
    const {userId, contactId} = query;

    const info = await contactService.getContactInfoHad(userId, contactId);
    ctx.body = R.success(info);
});

/**
 *
 */
router.get("/getContactDetail", async (ctx: any) => {
    const query = ctx.query;
    const {userId, contactId} = query;

    const status = await contactService.getUserContactStatus(userId, contactId);
    const info = await contactService.getContactInfoHad(userId, contactId);
    info.contactStatus = status;

    ctx.body = R.success(info);
})

/**
 * ??????????????????????????????????????????????????????????????????????????????
 */
router.get("/getContactWarnNum", async (ctx: any) => {
    const {userId} = ctx.query;

    const num = await contactService.getContactWarnNum(userId);
    ctx.body = R.success(num);
});

/**
 * ?????????????????????????????????????????????
 */
router.post("/setAllContactChecked", async (ctx: any) => {
    const {userId} = ctx.request.body;

    await contactService.setAllContactChecked(userId);
    ctx.body = R.success();
});

/**
 * ?????????????????????
 */
router.post("/editContact", async (ctx: any) => {
    const {userId, contactId, contactName} = ctx.request.body;

    await contactService.editContact(userId, contactId, contactName);
    ctx.body = R.success();
});

/**
 * ???????????????
 */
router.post("/deleteContact", async (ctx: any) => {
    const {userId, contactId} = ctx.request.body;

    await contactService.deleteContact(userId, contactId);
    ctx.body = R.success();
});

export default router;