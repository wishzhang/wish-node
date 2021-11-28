import contactSocket from "./contact-socket";
import messageSocket from "./message-socket";
import userService from "../service/user-service";

const hashSocketId: any = {};
let io: any = {};

async function emit(emitName: string, obj: { originUserId: string, targetUserId: string, data: any }
) {
    const targetUser: any = await userService.findByPk(obj.targetUserId);
    const originUser: any = await userService.findByPk(obj.originUserId);

    console.log(`${originUser.username}向${targetUser.username}发送消息：` + JSON.stringify(obj.data));

    const socketId = hashSocketId[targetUser.username];
    if (socketId) {
        const s = io.to(socketId);
        s.emit(emitName, obj.data);
    }
};

export default {
    init: (server: any) => {
        const options = {
            cors: {
                "origin": /.*/ig,
                "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
                credentials: true,
            }
        };

        io = require("socket.io")(server, options);

        io.on("connection", (socket: any) => {

            socket.on("sessionOff", (obj: any) => {
                console.log(`下线：${obj.account}`);
                delete hashSocketId[obj.account];
            });

            socket.on("sessionOn", (obj: any) => {
                console.log(`上线：${obj.account}`);
                hashSocketId[obj.account] = socket.id;
            });
        });
    },
    ...contactSocket(emit),
    ...messageSocket(emit),
}

