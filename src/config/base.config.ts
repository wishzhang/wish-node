const ip = (function getIPAddress() {
    const interfaces = require("os").networkInterfaces();
    for (const [networkType, networks] of Object.entries(interfaces)) {
        if (networkType.startsWith("VM")) continue;

        const networks1: any = networks;
        for (const network of networks1) {
            if (network.family === "IPv4"
                && network.address !== "127.0.0.1"
                && !network.internal) {
                return network.address;
            }
        }
    }
})();

// 公共环境配置
export default {
    projectName: "xinmi",
    projectCName: "信迷",
    // 服务器配置, 没有实际用到，只用来打印
    serverIp: '159.75.234.119',
    // minio配置
    minioEndPoint: "localhost",
    minioPort: 9000,
    minioAccessKey: "minioadmin",
    minioSecretKey: "minioadmin",
    minioUseSSL: false,
    minioBucketName: "xinmi-minio",
    // mysql的配置
    mysql: {
        host: "localhost",
        user: "root",
        password: "123456",
        database: "xinmi"
    },
    // token
    token: {
        header: 'xinmi-token',
        secret: 'xinmi_v1',
        expires: 3600,
        whiteList: [
            '/login/loginByPassword',
            '/login/loginByEmail',
            '/login/findPasswordByEmail',
            '/verifyCode/sendEmailCode'
        ]
    }
};