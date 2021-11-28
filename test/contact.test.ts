import verifyCodeService from "../src/service/verify-code-service";
import server from "../src/server";
import request = require("supertest");
import testUtil from "./test-util";

let userId1 = '';
let userId2 = '';

beforeAll(async (done) => {
    const res = await testUtil.prepareTest();
    userId1 = res.user1.userId;
    userId2 = res.user2.userId;
    done();
});

afterAll(async () => {
    await testUtil.afterTest();
});

describe("联系人模块", () => {

    describe('获取可添加的联系人', () => {
        test("/contact/getNoContactList", async (done) => {
            const res = await request(server)
                .get("/contact/getNoContactList")
                .query({
                    userId: userId1
                });
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('发送联系人验证请求', () => {
        test("/contact/addContact", async (done) => {
            const res = await request(server)
                .get("/contact/addContact")
                .query({
                    userId: userId1,
                    contactId: userId2,
                    validateMsg: 'who am i'
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('获取待确认的联系人列表', () => {
        test("/contact/getConfirmContactList", async (done) => {
            const res = await request(server)
                .get("/contact/getConfirmContactList")
                .query({
                    userId: userId1
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('获取未读的待确认的联系人提醒数量', () => {
        test("/contact/getContactWarnNum", async (done) => {
            const res = await request(server)
                .get("/contact/getContactWarnNum")
                .query({
                    userId: userId2
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('读取联系人待确认提醒信息', () => {
        test("/contact/setAllContactChecked", async (done) => {
            const res = await request(server)
                .post("/contact/setAllContactChecked")
                .send({
                    userId: userId1
                })
            expect(res.body.code).toBe(0);
            done();
        })
    })

    describe('确认联系人', () => {
        test("/contact/confirmContact", async (done) => {
            const res = await request(server)
                .get("/contact/confirmContact")
                .query({
                    userId: userId2,
                    contactId: userId1
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('获取已添加的联系人', () => {
        test("/contact/getYesContactList", async (done) => {
            const res = await request(server)
                .get("/contact/getYesContactList")
                .query({
                    userId: userId1
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('获取用户和联系人的握手状态', () => {
        test("/contact/getUserContactStatus", async (done) => {
            const res = await request(server)
                .get("/contact/getUserContactStatus")
                .query({
                    userId: userId1,
                    contactId: userId2
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('获取联系人详情', () => {
        test("/contact/getContactInfoHad", async (done) => {
            const res = await request(server)
                .get("/contact/getContactInfoHad")
                .query({
                    userId: userId1,
                    contactId: userId2
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('编辑联系人的备注名', () => {
        test("/contact/editContact", async (done) => {
            const res = await request(server)
                .post("/contact/editContact")
                .send({
                    userId: userId1,
                    contactId: userId2,
                    contactName: 'hihi'
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('删除联系人', () => {
        test("/contact/deleteContact", async (done) => {
            const res = await request(server)
                .post("/contact/deleteContact")
                .send({
                    userId: userId1,
                    contactId: userId2,
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })
})
