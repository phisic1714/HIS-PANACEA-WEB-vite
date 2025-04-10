import moment from "moment";
import dayjs from "dayjs";

export const addBusinessDays = (date, days) => {
    var d = moment(new Date(date)).add(Math.floor(days / 5) * 7, 'd');
    var remaining = days % 5;
    while (remaining) {
        d = d.add(1, 'd');
        if (d.day() !== 0 && d.day() !== 6)
            remaining--;
    }
    console.log(d)
    return d;
};

export const dayjsAddBusinessDays = (date, days) => {
    var d = dayjs(new Date(date)).add(Math.floor(days / 5) * 7, 'd');
    var remaining = days % 5;
    while (remaining) {
        d = d.add(1, 'd');
        if (d.day() !== 0 && d.day() !== 6)
            remaining--;
    }
    return d;
};

export const dayjsFineAddBusinessDays = (startDate, endDate) => {
    startDate = dayjs(new Date(startDate));
    endDate = dayjs(new Date(endDate));
    let weekDiff = endDate.diff(startDate, 'w');
    endDate = endDate.subtract(weekDiff*7, 'd');
    let dateDiff = 0;
    while (endDate.isSame(startDate, 'd')) {
        endDate = endDate.subtract(1, 'd');
        if (endDate.day() !== 0 && endDate.day() !== 6)
            dateDiff++;
    }
    return (weekDiff*5)+dateDiff;
};