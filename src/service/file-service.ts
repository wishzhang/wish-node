const Minio = require("minio");
import util from "../util/index";
import config from "../config/index";
import debug from '../util/debug';
import fs from "fs";

const log = debug('file');

const bucketName = config.minioBucketName;

const minioClient: any = new Minio.Client({
    endPoint: config.minioEndPoint,
    port: config.minioPort,
    useSSL: config.minioUseSSL,
    accessKey: config.minioAccessKey,
    secretKey: config.minioSecretKey
});

async function putFile(file: any) {
    const uniqueFilename = util.uuid() + util.getSuffix(file.name);

    const isExist = await minioClient.bucketExists(bucketName);
    if (!isExist) {
        await minioClient.makeBucket(bucketName);
        log("Bucket created successfully.");
    }

    const rs = fs.createReadStream(file.path);
    await minioClient.putObject(bucketName, uniqueFilename, rs);

    return {
        originName: file.name,
        filename: uniqueFilename,
        link: getMinioUrl(uniqueFilename)
    };
};

function getMinioUrl(filename: string) {
    return `/${config.minioBucketName}/${filename}`;
}

export default {
    putFile
}