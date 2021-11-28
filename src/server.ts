import errorHandlerMiddleware from "./middleware/error-handler-middleware";
import Koa from "koa";
import cors from '@koa/cors';
import socket from "./socket/index";
import {setupDatabase} from "./dao/model";
import debug from './util/debug';

import koaBody from "koa-body";

import initRouter from "./router/index";

import beforeMiddleware from "./middleware/before-middleware";
import afterMiddleware from "./middleware/after-middleware";

const log = debug('server');

const app = new Koa();

// 跨域
app.use(
    cors({
        origin: function (ctx) { //设置允许来自指定域名请求
            return '*';
        },
        maxAge: 5, //指定本次预检请求的有效期，单位为秒。
        credentials: true, //是否允许发送Cookie
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
        allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'xinmi-token'], //设置服务器支持的所有头信息字段
        exposeHeaders: ['WWW-Authenticate', 'Server-Authorization', 'xinmi-token'] //设置获取其他自定义字段
    })
);

setupDatabase();

app.use(beforeMiddleware());

app.use(koaBody({multipart: true}));

// 静态资源
app.use(require("koa-static")("./public"));

// 服务器出错处理，报500
app.use(errorHandlerMiddleware());

// 请求路由表
initRouter(app);

// minio中间件
app.use(afterMiddleware());

const server = require("http").createServer(app.callback());
socket.init(server);

export default server;