import {Sequelize, Op, QueryTypes, Options} from 'sequelize';
import config from "../config";
import debug from '../util/debug';
import util from '../util/index'

const log = debug('db');

const sequelize: any = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password, {
    host: config.mysql.host,
    dialect: 'mysql',
    define: {
        timestamps: true,
        paranoid: true,
        underscored: true,
        charset: 'utf8'
    },
    query: {
        raw: true
    },
    dialectOptions: {
        dateStrings: true,
        typeCast: true
    },
    logging: (...msg) => {
        if (msg.length > 0) {
            log(msg[0]);
        } else {
            log(msg);
        }
    },
});

async function query(sql: string, options?: any) {
    let o = Object.assign({}, {type: QueryTypes.SELECT, raw: true}, options);
    let rows = await sequelize.query(sql, o);
    rows = util.toHumpList(rows);
    return rows;
}

async function queryPage(model: any, opt: any, current: number = 1, size: number = 10) {
    const c = +current;
    const s = +size;

    const offset = (c - 1) * s;
    const limit = s;
    const option = Object.assign({
        offset: offset,
        limit: s
    }, opt);

    const {count, rows} = await model.findAndCountAll(option);

    return {
        records: rows,
        current: current,
        size: size,
        total: count
    }
}

export {
    sequelize,
    Op,
    query,
    queryPage,
    Sequelize,
    QueryTypes
}
