import verifyCodeService from "../src/service/verify-code-service";
import server from "../src/server";
import request = require("supertest");
import testUtil from "./test-util";

describe("登录模块", () => {
    beforeAll(async () => {
        await testUtil.clearDBTestData();
    })

    afterAll(async () => {
        await testUtil.clearDBTestData();
    })

    describe('注册功能', () => {
        beforeAll(async (done) => {
            await testUtil.clearDBTestData();
            done()
        })

        test('注册两个用户', async (done) => {
            const res = await testUtil.registerTwoUser();
            done();
        })
    })

    describe('邮箱验证码登录', () => {
        test("/login/loginByEmail", async (done) => {
            const emailCode = verifyCodeService.createEmailCode();
            await verifyCodeService.sendEmailCode(testUtil.account1.email, emailCode, false);

            const res = await request(server)
                .post("/login/loginByEmail")
                .send({
                    emailAddress: testUtil.account1.email,
                    verifyCode: emailCode
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('找回密码', () => {
        test("/login/findPasswordByEmail", async (done) => {
            const emailCode = verifyCodeService.createEmailCode();
            await verifyCodeService.sendEmailCode(testUtil.account1.email, emailCode, false);

            const res = await request(server)
                .post("/login/findPasswordByEmail")
                .send({
                    emailAddress: testUtil.account1.email,
                    verifyCode: emailCode,
                    newPassword: testUtil.account1.password
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('/login/loginByPassword', () => {
        let user: any = null;
        beforeAll(async (done) => {
            const emailCode = verifyCodeService.createEmailCode();
            await verifyCodeService.sendEmailCode(testUtil.account1.email, emailCode, false);

            const res = await request(server).post("/login/loginByEmail")
                .send({
                    emailAddress: testUtil.account1.email,
                    verifyCode: emailCode
                })
            expect(res.body.code).toBe(0);
            user = res.body.data;
            done();
        })

        test("当输入正确的密码", async (done) => {
            const res = await request(server).post("/login/loginByPassword")
                .send({
                    username: user.username,
                    password: user.password
                })
            expect(res.body.code).toBe(0);
            done();
        });

        test("当输入错误的密码", async (done) => {
            const res = await request(server).post("/login/loginByPassword")
                .send({
                    username: user.username,
                    password: user.password + 'err'
                })
            expect(res.body.code).not.toBe(0);
            done();
        });
    })
})
