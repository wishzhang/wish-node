// 加载环境配置
import config from "./config/index";
import server from "./server";
import debug from './util/debug';

const log = debug('server');

server.listen(config.serverPort, () => {
    log(`http://localhost:${config.serverPort}`);
    log(`http://${config.serverIp}:${config.serverPort}`);
});