const request = require("supertest");
import testUtil from "./test-util";
import verifyCodeService from "../src/service/verify-code-service";
import server from "../src/server";
import {deleteAllTable} from "../src/dao/model";


// 单元测试应该保持简单高效，直接操作测试数据库全部数据。
// 测试每个模块前清库。然后重新建立数据进行测试。每个模块有before,after钩子的过程处理
// 每个模块内部的功能点为一个describe,尽量减少功能点的测试依赖，可以在describe里的before,after在处理私有的一些数据处理

const account1 = {
    email: "2683536959@qq.com",
    password: "admin1"
}

const account2 = {
    email: "458799767@qq.com",
    password: "admin1"
}

const accountError = {
    email: '1535703141@1.',
    password: 'wwwwww'
}

async function clearDBTestData() {
    await deleteAllTable();
}

async function prepareTest() {
    await deleteAllTable();
    const res = await registerTwoUser();
    return res;
}

async function afterTest() {
    await deleteAllTable();
}

// 注册两个用户
async function registerTwoUser(): Promise<any> {
    let user1: any;
    let user2: any;
    let emailCode1: string;
    let emailCode2: string;
    let res1: any;
    let res2: any;

    emailCode1 = verifyCodeService.createEmailCode();
    await verifyCodeService.sendEmailCode(testUtil.account1.email, emailCode1, false);
    res1 = await request(server)
        .post("/login/loginByEmail")
        .send({
            emailAddress: testUtil.account1.email,
            verifyCode: emailCode1
        });
    user1 = res1.body.data;

    emailCode2 = verifyCodeService.createEmailCode();
    await verifyCodeService.sendEmailCode(testUtil.account2.email, emailCode2, false);
    res2 = await request(server)
        .post("/login/loginByEmail")
        .send({
            emailAddress: testUtil.account2.email,
            verifyCode: emailCode2
        });
    user2 = res2.body.data;

    expect(res1.body.code).toBe(0);
    expect(res1.body.data).not.toBeNull();
    expect(res2.body.code).toBe(0);
    expect(res2.body.data).not.toBeNull();
    expect(user1.username).not.toBe(user2.username);

    return {
        user1,
        user2
    }
}

export default {
    account1,
    account2,
    accountError,
    clearDBTestData,
    prepareTest,
    afterTest,
    registerTwoUser
}