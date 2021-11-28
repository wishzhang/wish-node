import util from "../util";
import config from '../config/index'

const minioOrigin = `http://${config.serverIp}:${config.minioPort}`;

const convert:any = {
    "avatarUrl": function (oval: any) {
        return minioOrigin + oval;
    },
    "photosUrl": function (oval:any) {
        if (!oval) return oval;
        return oval.split(",").map((el:any) => {
            return minioOrigin + el;
        }).join(",");
    }
};

function _field(obj:any, key:any) {
    if (convert.hasOwnProperty(key) && typeof obj[key] === "string") {
        obj[key] = convert[key](obj[key]);
    } else {
        convertFields(obj[key]);
    }
}

function convertFields(arr:any) {
    if (Array.isArray(arr)) {
        arr.forEach(obj => {
            Object.keys(obj).forEach(key => {
                _field(obj, key);
            });
        });
    } else if (arr && typeof arr === "object") {
        const obj = arr;
        Object.keys(obj).forEach(key => {
            _field(obj, key);
        });
    }
}

export default () => {
    return (async (ctx:any, next:any) => {
        if (ctx.body && ctx.body.data) {
            const data = ctx.body.data;
            convertFields(data);
            ctx.body.data = data;
        }
        next();
    });
}

// export default () => {
//     return (async (ctx: any, next: any) => {
//         await next();
//     });
// }