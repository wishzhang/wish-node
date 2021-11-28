import verifyCodeService from "../src/service/verify-code-service";
import server from "../src/server";
import request = require("supertest");
import testUtil from "./test-util";

beforeAll(async () => {
    await testUtil.clearDBTestData();
})

afterAll(async () => {
    await testUtil.clearDBTestData();
})

describe("验证码模块", () => {
    describe('发送验证吗', () => {
        test("/verifyCode/sendEmailCode", async (done) => {
            const emailCode = verifyCodeService.createEmailCode();

            const res = await request(server)
                .post("/verifyCode/sendEmailCode")
                .send({
                    emailAddress: testUtil.account1.email,
                    verifyCode: emailCode
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })
})
