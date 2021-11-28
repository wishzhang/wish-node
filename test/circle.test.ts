import verifyCodeService from "../src/service/verify-code-service";
import server from "../src/server";

const request = require("supertest");
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

describe("朋友圈", () => {
    describe('获取我的公共朋友圈', () => {
        test("/circle/getPage", async (done) => {
            const res = await request(server)
                .get("/circle/getPage")
                .query({
                    userId: user1.userId,
                    current: 1,
                    size: 10
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('获取某人的朋友圈', () => {
        test("/circle/getUserThoughtPage", async (done) => {
            const res = await request(server)
                .get("/circle/getUserThoughtPage")
                .query({
                    userId: user1.userId
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })

    describe('发一条朋友圈', () => {
        test("/circle/addThought", async (done) => {
            const res = await request(server)
                .post("/message/addMessage")
                .send({
                    originUser: user1.userId,
                    targetUser: user2.userId,
                    content: '圈圈内容' + Date.now()
                })
            expect(res.body.code).toBe(0);
            done();
        });
    })
});

