function validatenull(val: any) {
    if (typeof val == "boolean") {
        return false;
    }
    if (typeof val == "number") {
        return false;
    }
    if (val instanceof Array) {
        if (val.length == 0) return true;
    } else if (val instanceof Object) {
        if (JSON.stringify(val) === "{}") return true;
    } else {
        if (val == "null" || val == null || val == "undefined" || val == undefined || val == "") return true;
        return false;
    }
    return false;
}

// 密码为6-20位数字字母组合且不能有空格
function validPassword(password: string) {
    const reg = /^[A-Za-z]+[0-9]+[A-Za-z0-9]*$|^[0-9]+[A-Za-z]+[A-Za-z0-9]*$/;
    if (password.length >= 6 && password.length <= 20 && reg.test(password))
        if (reg.test(password)) {
            return true;
        }
    return false;
}

// 验证邮箱地址格式
function validEmailAddress(emailAddress: any) {
    const reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    return reg.test(emailAddress);
}

export default {
    validatenull,
    validPassword
}