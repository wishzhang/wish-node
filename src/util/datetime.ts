import moment from "moment";

const dateFormat = (date:any, format:any) => {
    return moment(date).format(format);
};

const dateFromNow = (date: any) => {
    const m = moment(date);
    const now = moment();
    if (m.isAfter(moment())) {
        throw Error("dateFromNow的date值只允许为过去时间");
    }

    const today = moment().format("YYYY-MM-DD");
    const yestoday = moment(today).subtract(1, "days");

    // 今天的date显示时分
    if (m.isSameOrAfter(today)) {
        return m.format("HH:mm");
        // 昨天的date显示昨天
    } else if (m.isSameOrAfter(yestoday)) {
        return "昨天";
        // 昨天并且本周的显示周几
    } else if (m.isSameOrAfter(now.startOf("week"))) {
        const z:any = {
            "0": "周日",
            "1": "周一",
            "2": "周二",
            "3": "周三",
            "4": "周四",
            "5": "周五",
            "6": "周六"
        };
        const num = m.weekday() + "";
        return z[num];
        // 本年的显示某月某日
    } else if (m.isSameOrAfter(now.startOf("year"))) {
        return m.format("M月D日");
        // 去年的显示某年某月某日
    } else if (m.isBefore(now.startOf("year"))) {
        return m.format("YYYY年M月D日");
    }
};

const datePastLong = (date: any) => {
    const m = moment(date);
    const now = moment();
    const dValue = now.diff(m);
    if (dValue < 0) {
        throw Error("dateFromNow的date值只允许为过去时间");
    }

    const today = moment().format("YYYY-MM-DD");
    const yestoday = moment(today).subtract(1, "days");

    const seconds = now.diff(m, "seconds");
    const minutes = now.diff(m, "minutes");
    const hours = now.diff(m, "hours");
    const days = now.diff(m, "days");

    if (seconds < 60) {
        return seconds + "秒前";
    } else if (minutes < 60) {
        return minutes + "分钟前";
    } else if (m.isSameOrAfter(today)) {
        return hours + "小时前";
    } else if (m.isSameOrAfter(yestoday)) {
        return "昨天";
    } else {
        return days + "天前";
    }
};

export default {
    dateFromNow,
    datePastLong
}
