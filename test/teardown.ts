import {teardownDatabase} from "../src/dao/model";

export default async () => {
    await teardownDatabase();
};