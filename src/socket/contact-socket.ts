import contactService from "../service/contact-service";

export default (emit: any) => {
    return {
        async emitContactAddContact(originUserId: string, targetUserId: string) {
            const num = await contactService.getContactWarnNum(targetUserId);
            emit("contact-add-contact", {
                originUserId,
                targetUserId,
                data: num
            });
        }
    };
}