import verifyCodeService from "../src/service/verify-code-service";
import server from "../src/server";
import request = require("supertest");
import testUtil from "./test-util";

let user: any = null;

beforeAll(async (done) => {
    const res = await testUtil.prepareTest();
    user = res.user1;
    done();
})

afterAll(async () => {
    await testUtil.afterTest();
})

describe("用户模块", () => {

    describe('获取用户分页列表', () => {
        test("/user/page", async (done) => {
            const res = await request(server)
                .get("/user/page")
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('更新用户信息', () => {
        test("/user/update", async (done) => {
            const res = await request(server)
                .get("/user/update")
                .query({
                    userId: user.userId,
                    username: user.username,
                    password: testUtil.account1.password
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('获取用户详情', () => {
        test("/user/detail", async (done) => {
            const res = await request(server)
                .get("/user/detail")
                .query({
                    userId: user.userId
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('修改email', () => {
        test("/user/editEmailAddress", async (done) => {
            const emailCode = verifyCodeService.createEmailCode();
            await verifyCodeService.sendEmailCode(testUtil.account2.email, emailCode, false);

            const res = await request(server)
                .post("/user/editEmailAddress")
                .send({
                    originEmailAddress: testUtil.account1.email,
                    targetEmailAddress: testUtil.account2.email,
                    password: testUtil.account1.password,
                    verifyCode: emailCode
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })
});
