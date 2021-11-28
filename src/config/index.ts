import devConfig from "./dev.config";
import testConfig from "./test.config";

let config: any;

if (process.env.NODE_ENV === "test") {
    config = testConfig;
}else{
    config = devConfig;
}

export default config;
