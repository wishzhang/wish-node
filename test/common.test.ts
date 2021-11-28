import server from "../src/server";
import request = require("supertest");
import testUtil from "./test-util";
import validate from '../src/util/validate';

test("密码为6-20位数字字母组合且不能有空格", async (done) => {
    let r = validate.validPassword('goodstudy123');
    expect(r).toBe(true);

    r = validate.validPassword('gooAAu4343dy');
    expect(r).toBe(true);

    r = validate.validPassword('3333333343dy');
    expect(r).toBe(true);

    r = validate.validPassword('good1');
    expect(r).toBe(false);

    r = validate.validPassword('goodstudy123goodstudy123');
    expect(r).toBe(false);

    r = validate.validPassword('12345678');
    expect(r).toBe(false);

    r = validate.validPassword('goodstudy');
    expect(r).toBe(false);

    r = validate.validPassword('goodstudy_123');
    expect(r).toBe(false);

    r = validate.validPassword('goodstudy 123');
    expect(r).toBe(false);

    done();
});