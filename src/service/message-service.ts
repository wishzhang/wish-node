import chatDao from "../dao/chat-dao";
import util from "../util";
import datetime from '../util/datetime';
import {Chat, ChatMember, Message, User} from "../dao/model";
import {Op, sequelize} from '../dao/sequelize'
import contactDao from "../dao/contact-dao";
import {queryPage} from "../dao/sequelize";
import contactService from './contact-service';
import userService from "./user-service";
import Joi from "joi";
import socket from "../socket";

const uuid = util.uuid;

/**
 * 添加一条消息: 如果没有对应的chatid就添加chat,有就更新
 * @param originUser
 * @param targetUser
 * @param content
 * @returns
 */
async function addMessage(originUser: string, targetUser: string, content: string) {
    const schema = Joi.object({
        content: Joi.string().required()
    });
    try {
        await schema.validateAsync({content});
    } catch (e) {
        throw e;
    }

    if (!await contactService.isContact(originUser, targetUser)) {
        throw Error(`${originUser}没有联系人${targetUser}`);
    }

    try {
        let chatId = await chatDao.findChatId(originUser, targetUser);
        if (chatId) {
            await Message.create({
                content: content,
                chatId: chatId,
                originUser: originUser
            })
        } else {
            await sequelize.transaction(async (t: any) => {
                const chatId = uuid();
                const chat = await Chat.create({chatId: chatId},
                    {transaction: t});

                await ChatMember.bulkCreate([
                    {chatId: chatId, userId: originUser},
                    {chatId: chatId, userId: targetUser}
                ], {transaction: t})

                const msg = await Message.create({
                    chatId: chatId,
                    content: content,
                    originUser: originUser
                }, {transaction: t});
            })
        }

        // 发送即时消息
        await socket.emitMessageToOneContact(originUser, targetUser, content);
        const messageChat = await getMineAllChatList(targetUser);
        await socket.emitUnread(originUser, targetUser, messageChat);
    } catch (e) {
        throw Error('消息发送失败');
    }
};

/**
 * 获取小窗私聊对话列表
 * @param originUser
 * @param targetUser
 * @returns
 */
async function getContactMessagePage(originUser: string, targetUser: string, current: number, size: number) {
    if (!contactService.isContact(originUser, targetUser)) {
        throw Error(`${originUser}没有联系人${targetUser}`);
    }

    const resData = await getMessagePage(originUser, targetUser, current, size);
    return resData;
};

async function getMessagePage(originUser: string, targetUser: string, current?: number, size?: number) {
    const chatId = await chatDao.findChatId(originUser, targetUser);

    const list = await getMessagePageByChatId(chatId, current, size);

    return list;
};

/*
 根据chatid查询聊天信息
*/
async function getMessagePageByChatId(chatId: string, current?: number, size?: number) {
    const resData = await queryPage(Message, {
        where: {
            chatId: chatId
        },
        order: [
            ['createdAt', 'DESC']
        ]
    }, current, size);

    const records = [];
    for (const [k, v] of Object.entries(resData.records)) {
        const msg = await getMessageDetail(v);
        records.push(msg);
    }

    return resData;
};

// 获取一条消息的详情
async function getMessageDetail(message: any) {
    const originUserId = message.originUser;
    const chatId = message.chatId;
    const targetUserId = await findTargetUserId(chatId, originUserId);

    const originUser: any = await User.findByPk(originUserId);
    message.originName = originUser.username;
    message.originAvatarUrl = originUser.avatarUrl;

    if (targetUserId) {
        const targetUser = await contactService.getContactInfoHad(originUserId, targetUserId);
        message.targetUser = targetUserId;
        message.targetAvatarUrl = targetUser.avatarUrl;
        message.targetName = targetUser.name;
    }

    return message;
};

/**
 * 获取我的消息列表
 * @param userId
 * @returns {Promise<any>}
 */
async function getMineAllChatList(userId: string) {
    if (!await userService.hasUser(userId)) {
        throw Error('没有找到这个用户' + userId);
    }

    const list = [];
    let myAllChatList: any[];

    try {
        myAllChatList = await ChatMember.findAll({
            where: {userId: userId}
        })
    } catch (e) {
        console.log(e);
    }

    for (const chat of myAllChatList) {
        const tmp = await getOneMessageChatByUserIdAndChatId(userId, chat.chatId);
        list.push(tmp);
    }

    return list;
};

async function findTargetUserId(chatId: string, originUser: string) {
    const row = await ChatMember.findOne({
        where: {
            chatId: chatId,
            userId: {
                [Op.ne]: originUser
            }
        }
    })
    return row && row.userId;
};

async function getChatAndUnreadCount(originUser: string, targetUser: string) {
    const chatId = await chatDao.findChatId(originUser, targetUser);
    const count = await getChatUnreadCount(chatId, targetUser);
    return {
        originUser,
        targetUser,
        chatId,
        count
    };
};

async function getChatUnreadCount(chatId: string, contactId: string) {
    const count = await Message.count({
        where: {
            [Op.or]: [
                {
                    chatId: chatId,
                    originUser: contactId,
                    isChecked: {
                        [Op.ne]: 1
                    }
                },
                {
                    chatId: chatId,
                    originUser: contactId,
                    isChecked: {
                        [Op.eq]: null
                    }
                },
            ]
        }
    });

    return count;
};

async function getOneMessageChatByUserIdAndChatId(originUser: string, chatId: string) {
    const targetUser = await findTargetUserId(chatId, originUser);

    let messageChat: any = {};
    let message: any;

    message = await Message.findOne({
        where: {
            chatId: chatId
        },
        order: [
            ['createdAt', 'DESC']
        ]
    })

    if (message) {
        const contactId = await findTargetUserId(chatId, originUser);
        const contactInfo: any = await contactService.getContactInfoHad(originUser, contactId);
        const chatUnreadMessageCount = await getChatUnreadCount(chatId, contactId);

        messageChat = {
            messageId: message.messageId,
            chatId: message.chatId,
            createdAt: message.createdAt,
            avatarUrl: contactInfo.avatarUrl,
            name: contactInfo.name,
            content: message.content,
            contactId: contactId,
            unreadCount: chatUnreadMessageCount
        };

        messageChat.createdAt = datetime.dateFromNow(messageChat.createdAt);
    }

    return {
        originUser,
        targetUser,
        ...messageChat
    };
}

async function getOneMessageChat(originUser: string, targetUser: string) {
    const chatId = await chatDao.findChatId(originUser, targetUser);
    const chatMsg = await getOneMessageChatByUserIdAndChatId(originUser, chatId);
    return chatMsg;
};

async function checkMessage(userId: string, contactId: string) {
    if (!await contactService.isContact(userId, contactId)) {
        throw Error(`${userId}没有联系人${contactId}`);
    }

    const chatId = await chatDao.findChatId(userId, contactId);
    await Message.update({
        isChecked: 1
    }, {
        where: {
            [Op.and]: [
                {chatId: chatId},
                {originUser: contactId},
            ]
        }
    })
};

export default {
    addMessage,
    getContactMessagePage,
    getMineAllChatList,
    getMessagePageByChatId,
    getChatAndUnreadCount,
    getOneMessageChat,
    checkMessage
}