import contactDao from "../dao/contact-dao";
import userService from "./user-service";
import util from "../util";
import {sequelize, Op} from "../dao/sequelize";
import messageDao from "../dao/message-dao";
import chatDao from "../dao/chat-dao";
import {Chat, ChatMember, Contact, ContactRecord, Message, User} from "../dao/model";

async function getYesContactList(userId: string) {
    if (!await userService.hasUser(userId)) {
        throw Error('找不到用户');
    }

    const contactList: any = await contactDao.getYesContactList(userId);
    const ch = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
        "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    const list = ch.map(label => {
        const obj: any = {};
        const records = contactList.filter((user: any) => {
            const letter = util.getFirstUpperLetter(user.name);
            return letter === label;
        });

        obj.label = label;
        obj.records = records;
        return obj;
    });

    const otherRecords = contactList.filter((user: any) => {
        const letter = util.getFirstUpperLetter(user.name);
        return !ch.includes(letter);
    });
    const otherObj = {
        label: "#",
        records: otherRecords
    };

    const allList = [...list, otherObj];
    return allList;
}

async function getNoContactList(userId: string, username = "") {
    if (!await userService.hasUser(userId)) {
        throw Error('找不到用户');
    }

    const list = await contactDao.getNoContactList(userId, username);
    return list;
}

async function addContact(userId: string, contactId: string, validateMsg: string) {
    if (!await userService.hasUser(userId)) {
        throw Error(`找不到${userId}`);
    }

    if (!await userService.hasUser(contactId)) {
        throw Error(`找不到对应联系人${contactId}`);
    }

    const targetDetail: any = await userService.findByPk(contactId);
    const originDetail: any = await userService.findByPk(userId);
    const msg = validateMsg ? validateMsg : `你好，我是${originDetail.username}`;

    const row: any = await ContactRecord.findOne({where: {userId: userId, contactId: contactId}});
    if (row !== null || row && row.status !== 2) {
        throw Error(`当前用户${userId}不能添加${contactId}为联系人`);
    }

    if (row && row.status === 2) {
        await confirmContact(userId, contactId);
        return false
    } else if (row === null) {
        await sequelize.transaction(async (t: any) => {
            await ContactRecord.bulkCreate([
                {userId: userId, contactId: contactId, status: 1, validateMsg: msg},
                {userId: contactId, contactId: userId, status: 2, validateMsg: msg}
            ], {transaction: t})
        });
        return true;
    }
}

async function getConfirmContactList(userId: string) {
    if (!await userService.hasUser(userId)) {
        throw Error('找不到用户');
    }

    const list = await contactDao.getConfirmContactList(userId);
    return list;
}

async function confirmContact(userId: string, contactId: string) {
    if (!await userService.hasUser(userId)) {
        throw Error('找不到用户');
    }

    if (!await userService.hasUser(userId)) {
        throw Error('找不到用户');
    }

    const targetDetail: any = await userService.findByPk(contactId);
    const originDetail: any = await userService.findByPk(userId);
    const originName = originDetail.username;
    const targetName = targetDetail.username;

    const row = await ContactRecord.findOne({where: {userId: userId, contactId: contactId}});
    if (!(row && row.status === 2)) {
        throw Error(`当前用户${userId}不能确认${contactId}为联系人`);
    }

    const result = await sequelize.transaction(async (t: any) => {
        await ContactRecord.update({status: 3}, {
            where: {
                [Op.or]: [
                    {userId: userId, contactId: contactId},
                    {userId: contactId, contactId: userId},
                ]
            },
            transaction: t
        })

        const is = await isContact(userId, contactId, true);
        if (!is) {
            await Contact.bulkCreate([
                {userId: userId, contactId: contactId, contactName: targetName},
                {contactId: userId, userId: contactId, contactName: originName}
            ], {transaction: t})
        } else {
            await Contact.restore({
                where: {
                    [Op.or]: [
                        {userId: userId, contactId: contactId},
                        {userId: contactId, contactId: userId},
                    ]
                },
                transaction: t
            })
        }
    })
}

async function getUserContactStatus(userId: string, contactId: string) {
    if (!await userService.hasUser(userId)) {
        throw Error('找不到用户' + userId);
    }

    if (!await userService.hasUser(contactId)) {
        throw Error('找不到用户' + contactId);
    }

    const row: any = await ContactRecord.findOne({
        where: {
            userId: userId,
            contactId: contactId
        }
    });
    return row && row.status;
}

// 获取某个对方用户的信息，已经是联系人和还不是联系人返回的信息不一样的
async function getContactInfoHad(userId: string, contactId: string) {
    let contactor = null;

    if (!await userService.hasUser(userId)) {
        throw Error('找不到用户' + userId);
    }

    if (!await userService.hasUser(contactId)) {
        throw Error('找不到用户' + contactId);
    }

    const contactorUserInfo: any = await User.findByPk(contactId);
    contactor = contactorUserInfo;

    if (!await isContact(userId, contactId)) {
        contactor.name = contactorUserInfo.username;
    } else {
        const c = await Contact.findOne({
            where: {
                userId: userId,
                contactId: contactId
            }
        });
        contactor.name = c.contactName;
    }

    return contactor;
};

async function getContactWarnNum(userId: string) {
    if (!await userService.hasUser(userId)) {
        throw Error('找不到用户' + userId);
    }

    const num = await ContactRecord.count({
        where: {
            userId: userId,
            status: 2,
            [Op.or]: [
                {
                    isChecked: {
                        [Op.ne]: 1
                    }
                },
                {
                    isChecked: {
                        [Op.eq]: null
                    }
                }
            ]
        }
    });
    return num;
};

async function setAllContactChecked(userId: string) {
    if (!await userService.hasUser(userId)) {
        throw Error('找不到用户' + userId);
    }

    await ContactRecord.update({isChecked: 1}, {
        where: {
            userId: userId
        }
    })
};

async function editContact(userId: string, contactId: string, contactName: string) {
    if (!await userService.hasUser(userId)) {
        throw Error('找不到用户' + userId);
    }

    if (!await userService.hasUser(contactId)) {
        throw Error('找不到用户' + contactId);
    }

    return await Contact.update({
        contactName
    }, {
        where: {
            userId: userId,
            contactId: contactId
        }
    })
};

// 硬删除联系人及相关记录
async function deleteContact(userId: string, contactId: string) {
    if (!await userService.hasUser(userId)) {
        throw Error('找不到用户' + userId);
    }

    if (!await userService.hasUser(contactId)) {
        throw Error('找不到用户' + contactId);
    }

    const is = await isContact(userId, contactId);
    if (!is) {
        throw Error(`${userId}没有联系人${contactId}`);
    }

    const chatId = await chatDao.findChatId(userId, contactId);

    await sequelize.transaction(async (t: any) => {
        // 删除消息
        await Message.destroy({
            where: {
                [Op.or]: [
                    {chatId: chatId, originUser: userId},
                    {chatId: chatId, originUser: contactId},
                ]
            },
            force: true,
            transaction: t
        });

        // 删除会话成员
        await ChatMember.destroy({
            where: {
                chatId: chatId
            },
            force: true,
            transaction: t
        })
        // 删除会话
        await Chat.destroy({
            where: {
                chatId: chatId
            },
            force: true,
            transaction: t
        })

        // 硬删除联系人
        await Contact.destroy({
            where: {
                [Op.or]: [
                    {userId: userId, contactId: contactId},
                    {userId: contactId, contactId: userId}
                ]
            },
            force: true,
            transaction: t
        });
        // 硬删除联系人记录
        await ContactRecord.destroy({
            where: {
                [Op.or]: [
                    {userId: userId, contactId: contactId},
                    {userId: contactId, contactId: userId}
                ]
            },
            force: true,
            transaction: t
        });
    });
};

async function isContact(userId: string, contactId: string, isAll = false) {
    const contactor: any = await Contact.findOne({
        where: {
            userId: userId,
            contactId: contactId
        },
        paranoid: !isAll
    });
    return contactor !== null;
}

export default {
    getNoContactList,
    getYesContactList,
    addContact,
    getConfirmContactList,
    confirmContact,
    getUserContactStatus,
    getContactInfoHad,
    getContactWarnNum,
    setAllContactChecked,
    editContact,
    deleteContact,
    isContact
}