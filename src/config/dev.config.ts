import baseConfig from "./base.config";

const devConfig = Object.assign({}, baseConfig, {
    serverPort: 3000
});

export default devConfig