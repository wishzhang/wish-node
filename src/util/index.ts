import {v1} from "uuid";

const pinyin = require("pinyin");
import config from '../config/index';
import circleService from "../service/circle-service";
import R from "./response";

const generateRouteKey = (namespace: any) => {
    return (name: any) => {
        return namespace + name;
    };
};


const uuid = () => {
    return v1();
};

const getFirstUpperLetter = (str = "") => {
    const arr = pinyin(str, {
        style: pinyin.STYLE_FIRST_LETTER,
    });
    const pureOnePinyin = arr[0][0];
    const letter = pureOnePinyin.substr(0, 1).toUpperCase();
    return letter;
};

const _toHump = (name: any) => {
    return name.replace(/\_(\w)/g, function (all: any, letter: any) {
        return letter.toUpperCase();
    });
};

const toHumpList = (list: any = []) => {
    return list.map((el: any) => {
        if (typeof el === 'object') {
            Object.keys(el).forEach(key => {
                if (typeof key !== 'undefined') {
                    const humpKey = _toHump(key);
                    if (humpKey !== key) {
                        el[humpKey] = el[key];
                        delete el[key];
                    }
                }
            });
        }
        return el;
    });
};

// 获取文件名的后缀名
function getSuffix(filename: any) {
    return /\.[^\.]+$/.exec(filename);
}

// function removeDomain(url: any) {
//     if (!url) return "";
//     url = "/" + url.split("/").slice(3).join("/");
//     return url;
// }

function getMinioUrl(filename: string) {
    return `/${config.minioBucketName}/${filename}`;
}

const type = (function () {
    const class2type: any = {};
    "Boolean Number String Function Array Date RegExp Object Error".split(" ")
        .map(function (item, index) {
            class2type["[object " + item + "]"] = item.toLowerCase();
        });
    return function (obj: any) {
        if (obj === null || obj === undefined) {
            return obj + "";
        }
        return typeof obj === "object" || typeof obj === "function" ?
            class2type[Object.prototype.toString.call(obj)] || "object" : typeof obj;
    };
})();

const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;
const isPlainObject = function isPlainObject(obj: any) {
    if (!obj || toStr.call(obj) !== "[object Object]") {
        return false;
    }
    const hasOwnConstructor = hasOwn.call(obj, "constructor");
    const hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, "isPrototypeOf");
    if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
        return false;
    }
    let key;
    for (key in obj) { /**/
    }
    return typeof key === "undefined" || hasOwn.call(obj, key);
};

function isPromise(value: any) {
    return value && Object.prototype.toString.call(value) === "[object Promise]";
}

function humpToUnderline(str: string) {
    return str.replace(/([A-Z])/g, "_$1").toLowerCase()
}

export default {
    generateRouteKey,
    uuid,
    getFirstUpperLetter,
    toHumpList,
    getSuffix,
    // removeDomain,
    getMinioUrl,

    isPlainObject,
    isPromise,
    humpToUnderline
}