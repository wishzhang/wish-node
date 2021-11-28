import {query} from './sequelize';
import debug from '../util/debug';

const log = debug('contact-dao');

// 获取当前用户的已添加的联系人
async function getYesContactList(userId: string) {
    const records = await query(`    
        select 
            xc.contact_id, 
            if(isnull(xc.contact_name), xu.username, xc.contact_name) as name,
            xu.avatar_url
        from xinmi_contact xc inner join xinmi_user xu 
            on xu.user_id = xc.contact_id
        where xc.user_id = '${userId}' and xc.deleted_at is null`
    );
    return records;
}

// 获取当前用户待确认的联系人
const getConfirmContactList = async (userId: string) => {
    return await query(`
        select
            xcr.contact_id,
            if(isnull(xc.contact_name), xu.username, xc.contact_name) as name,
            xcr.validate_msg,
            xu.avatar_url,
            xcr.status
        from xinmi_contact_record xcr
                 inner join xinmi_user xu on xcr.contact_id = xu.user_id
                 left join xinmi_contact xc on xcr.user_id = xc.user_id and xcr.contact_id = xc.contact_id
        where xcr.user_id = '${userId}' and xcr.deleted_at is null;
  `);
};

// 获取当前用户的可添加的联系人
const getNoContactList = async (userId: string, username: string = "") => {
    return await query(`
        select
            xu.user_id,
            xu.username,
            xu.avatar_url
        from
            xinmi_user xu
        where
            xu.user_id NOT IN ( SELECT xc.contact_id FROM xinmi_contact xc 
                WHERE xc.user_id = '${userId}' and xc.deleted_at is null)
            and xu.username LIKE '%${username}%'
            and xu.user_id != '${userId}'
            and xu.deleted_at is null
    `);
};

export default {
    getYesContactList,
    getConfirmContactList,
    getNoContactList,
}