import verifyCodeService from "../src/service/verify-code-service";
import server from "../src/server";
import request = require("supertest");
import testUtil from "./test-util";

let user1: any;
let user2: any;

beforeAll(async (done) => {
    const res = await testUtil.prepareTest();
    user1 = res.user1;
    user2 = res.user2;

    const res1 = await request(server)
        .get("/contact/addContact")
        .query({
            userId: user1.userId,
            contactId: user2.userId,
            validateMsg: 'who am i'
        });
    expect(res1.body.code).toBe(0);

    const res2 = await request(server)
        .get("/contact/confirmContact")
        .query({
            userId: user2.userId,
            contactId: user1.userId
        });
    expect(res2.body.code).toBe(0);

    done();
})

afterAll(async () => {
    await testUtil.afterTest();
})

describe("消息模块", () => {

    describe('获取小窗的分页列表', () => {
        test("/message/getContactMessagePage", async (done) => {
            const res = await request(server)
                .get("/message/getContactMessagePage")
                .query({
                    originUser: user1.userId,
                    targetUser: user2.userId,
                    current: 1,
                    size: 10
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('获取会话消息列表', () => {
        test("/message/getMineAllChatList", async (done) => {
            const res = await request(server)
                .get("/message/getMineAllChatList")
                .query({
                    userId: user1.userId
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('添加一条消息', () => {
        test("/message/addMessage", async (done) => {
            const res = await request(server)
                .post("/message/addMessage")
                .send({
                    originUser: user1.userId,
                    targetUser: user2.userId,
                    content: '发消息测试' + Date.now()
                });
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('查看小窗所有未读消息', () => {
        let user: any = null;
        test("/message/checkMessage", async (done) => {
            const res = await request(server)
                .post("/message/checkMessage")
                .send({
                    userId: user1.userId,
                    contactId: user2.userId
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })
});

