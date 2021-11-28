import {Chat} from "./model";
import {query} from "./sequelize";

async function findChatId(user1: string, user2: string) {
    const chat: any = await query(
        `SELECT xcm1.chat_id as chatId
                FROM
                xinmi_chat_member AS xcm1
                INNER JOIN xinmi_chat_member AS xcm2 ON xcm1.chat_id = xcm2.chat_id
                WHERE
                xcm1.user_id = '${user1}' AND
                xcm2.user_id = '${user2}' OR
                xcm1.user_id = '${user2}' AND
                xcm2.user_id = '${user1}'
                and xcm1.deleted_at is null
                GROUP BY
                xcm1.chat_id
            `
    )
    if (chat && chat.length === 1) {
        return chat[0].chatId;
    } else if (chat && chat.length > 1) {
        throw Error('xinmi_chat_member 两个联系人有多个chat')
    }

    return null;
}

export default {
    findChatId
}