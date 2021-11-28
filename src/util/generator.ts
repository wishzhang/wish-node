import stringUtil from "./string-util";

/**
 大于等于10000的数字简单计算，
 小于10000{
        将字符串截取为两段，前一段0后一段非0开头{
            截取0开头：/^0*(?!0)/
            然后直接截取剩余字符串
        }
        将非0开头的字符串转成数字再+1，
        再将两段合起来，
        最后从尾到头截取长度为5的字符串，得到结果
    }
 * @param sqlMaxXinmiId
 * @returns {string}
 */
const createXinmiId = (sqlMaxXinmiId: any) => {
    if (sqlMaxXinmiId === null) return "00000";

    const num = Number.parseInt(sqlMaxXinmiId);
    if (Number.isNaN(num)) {
        throw Error("maxXinmiId值不符合格式要求");
    }

    const str = sqlMaxXinmiId + "";
    let finalStr = "";
    if (num < 10000) {
        let preStr = "";
        const preMatch = str.match(/^0*(?!0)/);
        let lastStr = '';

        if (preMatch.length > 0) {
            preStr = preMatch[0];
        }

        lastStr = str.substr(preStr.length);

        let lastNum = lastStr ? Number.parseInt(lastStr) : 0;
        lastNum++;
        lastStr = lastNum + "";

        // 这5个00000是为了补0，并且是提供足够的0
        finalStr = "00000" + preStr + lastStr;
        const tmp = stringUtil.reverseString(finalStr);
        finalStr = tmp.substr(0, str.length < 5 ? 5 : str.length);
        finalStr = stringUtil.reverseString(finalStr);
    } else {
        finalStr = (num + 1) + "";
    }

    return finalStr;
};

export default {
    createXinmiId
}

