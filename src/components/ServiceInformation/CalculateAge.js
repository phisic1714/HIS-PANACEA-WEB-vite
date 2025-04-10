import moment from "moment-timezone";

function getFormatedStringFromDays(numberOfDays) {
    var years = Math.floor(numberOfDays / 365.25);
    var months = Math.floor(numberOfDays % 365.25 / 30.44);
    var days = Math.ceil(numberOfDays % 365.25 % 30.44);

    if (days === 30) {
        days = 0;
        months += 1;
    }
    if (months === 12) {
        months = 0;
        years += 1;
    }

    return {
        years: years,
        months: months,
        days: days
    };
}

export const calculateAge = (value, realValue) => {
    var date = new Date(value);
    const dateString = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`; // M D Y

    const now = new Date();

    const yearNow = Number(now.getFullYear());
    const monthNow = Number(now.getMonth());
    const dateNow = Number(now.getDate());

    const dob = new Date(dateString);

    const yearDob = Number(dob.getFullYear());
    const monthDob = Number(dob.getMonth());
    const dateDob = Number(dob.getDate());

    let yearAge = yearNow - yearDob;
    let monthAge;

    if (monthNow >= monthDob) {
        monthAge = monthNow - monthDob;
    } else {
        yearAge--;
        monthAge = 12 + monthNow - monthDob;
    }

    let dateAge;
    if (dateNow >= dateDob) {
        dateAge = dateNow - dateDob;
    } else {
        monthAge--;
        dateAge = 31 + dateNow - dateDob;
        if (monthAge < 0) {
            monthAge = 11;
            yearAge--;
        }
    }

    const age = {
        years: yearAge,
        months: monthAge,
        days: dateAge
    };

    const yearString = "Y";
    const monthString = "M";
    const dayString = "D";

    let ageString = "";

    if ((age.years > 0) && (age.months > 0) && (age.days > 0)) {
        ageString = age.years + yearString + " " + age.months + monthString + " " + age.days + dayString;
    } else if ((age.years === 0) && (age.months === 0) && (age.days > 0)) {
        ageString = age.months + monthString + " " + age.days + dayString;
    } else if ((age.years > 0) && (age.months === 0) && (age.days === 0)) {
        ageString = age.years + yearString;
    } else if ((age.years > 0) && (age.months > 0) && (age.days === 0)) {
        ageString = age.years + yearString + " " + age.months + monthString;
    } else if ((age.years === 0) && (age.months > 0) && (age.days > 0)) {
        ageString = age.months + monthString + " " + age.days + dayString;
    } else if ((age.years > 0) && (age.months === 0) && (age.days > 0)) {
        ageString = age.years + yearString + " " + age.days + dayString;
    } else if ((age.years === 0) && (age.months > 0) && (age.days === 0)) {
        ageString = age.months + monthString + " old.";
    } else {
        // eslint-disable-next-line no-unused-vars
        ageString = age.months + monthString + " " + age.days + dayString;
    }

    // console.log(moment().format("DD/MM/YYYY"));
    // console.log(realValue);

    // var years = moment(moment().format("DD/MM/YYYY"), "DD/MM/YYYY").diff(moment(realValue, "DD/MM/YYYY"), 'years',false);
    // var months = moment(moment().format("DD/MM/YYYY"), "DD/MM/YYYY").diff(moment(realValue, "DD/MM/YYYY"), 'months',false);


    var days = moment(moment().startOf("date").format("DD/MM/YYYY HH:mm:ss"), "DD/MM/YYYY HH:mm:ss").diff(moment(realValue, "DD/MM/YYYY").add(543, "years").startOf("date"), 'days', false);
    // console.log(years);
    // console.log(months);
    // console.log(days);
    let resAge = getFormatedStringFromDays(days);
    // console.log(getFormatedStringFromDays(days));

    let ageObj = {
        ageYear: resAge.years,
        ageMonth: resAge.months,
        ageDay: resAge.days,
        // ageFull: ageString,
    }
    // console.log('age : ', ageObj);
    return ageObj;
};