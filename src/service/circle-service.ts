import circleDao from "../dao/circle-dao";
import datetime from "../util/datetime";
import {Contact, Thought, User} from "../dao/model";
import {queryPage} from "../dao/sequelize";
import contactDao from "../dao/contact-dao";
import contactService from './contact-service';
import userService from './user-service';
import fileService from './file-service';
import Joi from 'joi';


async function addThought(createUser: string, content: string, photoFiles: Array<any> = []) {
    const schema = Joi.object({
        content: Joi.string().required()
    });

    await schema.validateAsync({content});

    if (!await userService.hasUser(createUser)) {
        throw Error('找不到用户');
    }

    const ps = photoFiles.map((photoFile: any) => {
        return fileService.putFile(photoFile);
    });

    const resArr = await Promise.all(ps);
    const links = resArr.map((res: any) => {
        return res.link;
    });
    const photosUrl = links.join(",");

    await Thought.create({
        createUser: createUser,
        content: content,
        photosUrl: photosUrl
    });
};

/**
 * 获取我的朋友圈里的所有人发的，即我的所有好友包括我自己发的朋友圈
 * @param userId
 * @param current
 * @param size
 * @returns {Promise<{current: number, total: *, size: number, records}>}
 */
async function getPage(userId: string, current: number, size: number) {
    if (!await userService.hasUser(userId)) {
        throw '找不到用户';
    }

    let data: any = {};
    const list = [];
    let createUserIdList = [];
    const thoughtList = [];
    let contactList: any = [];

    contactList = await Contact.findAll({
        where: {
            userId: userId
        }
    })

    createUserIdList = contactList.map((el: any) => el.contactId);
    createUserIdList = [userId, ...createUserIdList];

    for (const id of createUserIdList) {
        const arr: any = await Thought.findAll({
            where: {
                createUser: id
            }
        })
        thoughtList.push(...arr);
    }

    for (const thought of thoughtList) {
        const obj = Object.assign({}, thought);
        let info: any = {};
        const createUserId = thought.createUser;

        info = await User.findByPk(createUserId);
        obj.name = info.username;
        obj.avatarUrl = info.avatarUrl;

        if (info.userId !== createUserId) {
            const contact = await contactService.getContactInfoHad(info.userId, createUserId);
            obj.name = contact.name;
        }

        list.push(obj);
    }

    list.sort((a, b) => {
        return new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf();
    });

    current = +current;
    size = +size;

    const curIndex = (current - 1) * size;
    const endIndex = curIndex + size;

    const records = list.slice(curIndex, endIndex);

    data = {
        records: records,
        current: current,
        size: size,
        total: list.length
    };

    data.records.forEach((el: any) => {
        el.createdAt = datetime.datePastLong(el.createdAt);
    });

    return data;
}

async function getUserThoughtPage(userId: string, current: number, size: number) {
    if (!await userService.hasUser(userId)) {
        throw Error('找不到用户');
    }

    const data = await queryPage(Thought, {
        where: {
            createUser: userId
        },
        order: [
            ['createdAt', 'DESC'],
        ]
    }, current, size)

    const records = [];
    for (const item of data.records) {
        const thoughtId = item.thoughtId;
        const thought = await getOneCircleDetail(thoughtId);
        if (thought) {
            records.push(thought);
        }
    }

    data.records = records;

    return data;
}

async function getOneCircleDetail(thoughtId: string) {
    const thought: any = await Thought.findOne({
        where: {thoughtId: thoughtId}
    });
    const user: any = await User.findOne({
        where: {userId: thought.createUser}
    });

    return {
        username: user.username,
        avatarUrl: user.avatarUrl,
        thoughtId: thought.thoughtId,
        content: thought.content,
        createUser: thought.create_user,
        photosUrl: thought.photosUrl,
        createdAt: thought.createdAt
    };
};

export default {
    addThought,
    getPage,
    getUserThoughtPage
}