import { toNumber, map, filter, find } from "lodash";
import moment from "moment";
import dayjs from "dayjs";
import CountDaysOfWeek from 'components/helper/function/CountDaysOfWeek'

export const calculateExpenseDrug = (param) => {
    // console.log('paramCalculateExpenseDrug :>> ', param);
    let { data, newNumOfDrugs, patientType, disabledDiscount } = param;
    // console.log('param :>> ', param);
    let calculate = { rate: data?.rate ? toNumber(data?.rate) : 0 };
    newNumOfDrugs = toNumber(newNumOfDrugs || 0);
    let amount = data?.rate ? toNumber(data?.rate) * newNumOfDrugs : 0;
    calculate.amount = amount;
    calculate.docQty = ((toNumber(data?.credit) + toNumber(data?.cashReturn)) > 0 && toNumber(data?.rate) > 0) ? ((toNumber(data?.credit) + toNumber(data?.cashReturn)) / toNumber(data?.rate)) * newNumOfDrugs : 0;
    calculate.credit = data?.credit ? toNumber(data?.credit) * newNumOfDrugs : 0;
    calculate.cashReturn = data?.cashReturn ? toNumber(data?.cashReturn) * newNumOfDrugs : 0;
    calculate.cashNotReturn = data?.cashNotReturn ? toNumber(data?.cashNotReturn) * newNumOfDrugs : 0;
    calculate.discount = disabledDiscount ? "" :
        (patientType === "opd" ?
            data?.opdDiscount ?
                toNumber(data?.opdDiscount) * newNumOfDrugs : 0
            :
            data?.ipdDiscount ?
                toNumber(data?.ipdDiscount) * newNumOfDrugs : 0
        );
    // console.log("calculateExpenseDrug", calculate);
    // }
    return calculate;
}

export const checkNED = (data, ised) => {
    if (ised === "F") {
        // console.log(data);
        let calculate = data;
        calculate.docQty = 0;
        calculate.credit = 0;
        calculate.cashReturn = 0;
        calculate.cashNotReturn = data.credit ? data.credit : data.cashReturn ? data.cashReturn : data.amount;
        return calculate;
    }
    return data;
}
const checkDays = [
    {
        value: "MON",
        label: "Monday",
    },
    {
        value: "TUE",
        label: "Tuesday",
    },
    {
        value: "WED",
        label: "Wednesday",
    },
    {
        value: "THU",
        label: "Thursday",
    },
    {
        value: "FRI",
        label: "Friday",
    },
    {
        value: "SAT",
        label: "Saturday",
    },
    {
        value: "SUN",
        label: "Sunday",
    },
]
const setFormDate = (newNumOfDays, chkdayjs) => {
    let resData = {};
    let addDate = newNumOfDays - 1 > 0 ? newNumOfDays - 1 : 0;
    if (newNumOfDays > 0) {
        if (chkdayjs) {
            resData.startDate = dayjs();
            resData.endDate = dayjs().add(addDate, 'day');
        } else {
            resData.startDate = moment();
            resData.endDate = moment().add(addDate, 'days');
        }
    } else {
        resData.startDate = null;
        resData.endDate = null;
    }
    return resData;
}
const clcSumDrugsByDosingInterval = ({
    chkDays = [],
    startDate = null,
    endDate = null,
    numOfDays = 0,
    numOfDrugs = 0,
}) => {
    // console.log('chkDays :>> ', chkDays);
    // console.log('startDate :>> ', startDate);
    // console.log('endDate :>> ', endDate);
    // console.log('numOfDays :>> ', numOfDays);
    // console.log('numOfDrugs :>> ', numOfDrugs);
    if (!chkDays.length) return 0
    const resCountDaysOfWeek = CountDaysOfWeek(startDate, endDate)
    // console.log('resCountDaysOfWeek :>> ', resCountDaysOfWeek);
    if (!resCountDaysOfWeek) return numOfDrugs
    let sumDays = 0
    map(chkDays, o => {
        const day = find(checkDays, ["value", o])
        if (day) {
            sumDays = sumDays + resCountDaysOfWeek[day.label]
        }
    })
    // console.log('sumDays :>> ', sumDays);
    const drugsPerDay = numOfDrugs / numOfDays
    // console.log('drugsPerDay :>> ', drugsPerDay);
    const sumDrugs = sumDays * drugsPerDay
    // console.log('sumDrugs :>> ', sumDrugs);
    return Math.ceil(sumDrugs)
}
const clcSumDaysByDosingInterval = ({
    startDate = null,
    daysOfWeek = [],
    numOfDays = 0,
    numOfDrugs = 0,
}) => {
    // console.log('startDate :>> ', startDate);
    // console.log('daysOfWeek :>> ', daysOfWeek);
    // console.log('numOfDays :>> ', numOfDays);
    // console.log('numOfDrugs :>> ', numOfDrugs);
    if (!daysOfWeek.length) return
    const pillsPerDay = numOfDrugs / numOfDays
    if (pillsPerDay <= 0 || numOfDrugs <= 0) {
        return
    }
    const isDesignatedDay = (date) => daysOfWeek.includes(date.format("ddd").toUpperCase());
    let remainingPills = numOfDrugs;
    let currentDate = startDate.locale('en').startOf('day');
    let endDate = null;

    while (remainingPills > 0) {
        if (isDesignatedDay(currentDate)) {
            remainingPills -= pillsPerDay;
        }
        if (remainingPills > 0) {
            currentDate = currentDate.add(1, 'day');
        }
    }
    endDate = currentDate;
    return {
        startDate: startDate,
        endDate: endDate,
        durationInDays: endDate.diff(startDate, "day") + 2, // Include the start date in the count
        remainingPills: Math.max(remainingPills, 0),
    };
}
export const calculatDayOrDrug = (param) => {
    let {
        value, field, expenseList, data, dataCalculatExpense, selectRight, chkdayjs = false,
        chkUnit = undefined, disabledDiscount, calBrine = false, unitList = []
    } = param;
    // console.log('calculatDayOrDrug :>> ', param);
    // console.log('chkdayjs', chkdayjs)
    //calBrine เอาไว้ chk สั่งรวมสารน้ำเกลือ
    // console.log('chkUnit', chkUnit)
    const dosingInterval = data?.dosingInterval || null
    const dosingIntervalChkDays = data?.dosingIntervalChkDays || []
    // console.log('dosingIntervalChkDays :>> ', dosingIntervalChkDays);
    const dosingUnit = data?.dosingUnit
    const findTabletFlag = find(unitList, ["code", dosingUnit])
    let checkUnit = findTabletFlag?.tabletFlag === "Y"
    checkUnit = chkUnit !== undefined ? chkUnit : checkUnit ? checkUnit : expenseList.find(val => val.expenseId === data.expenseId)?.unitText === "เม็ด";

    let dose = "";
    let resData = {};
    let numOfDays = toNumber(data?.numOfDays);
    let frequency = toNumber(data?.frequency || 1);
    let numOfDrugs = toNumber(data?.numOfDrugs);
    let multiply = data?.multiply ? toNumber(data?.multiply) : 0;
    let oldQty = data?.oldQty ? toNumber(data?.oldQty) : 0;
    if (field === "Dose") {
        dose = toNumber(value);
        if (!isNaN(dose)) {
            if (dose === 0) {
                return resData;
            }
            if (checkUnit && numOfDrugs && dose) {
                let newNumOfDays = (numOfDrugs / dose) / frequency;
                newNumOfDays = Math.ceil(newNumOfDays);
                resData.numOfDays = newNumOfDays;
                let formDate = setFormDate(newNumOfDays, chkdayjs);
                resData.startDate = formDate.startDate;
                resData.endDate = formDate.endDate;
                if (dosingInterval === "DIW") {
                    return calculatDayOrDrug({
                        ...param,
                        field: "จน.วัน",
                        value: newNumOfDays,
                        data: {
                            ...param.data,
                            numOfDrugs: newNumOfDays,
                            dose: dose,
                        }
                    })
                }
                return resData;
            }
            if (checkUnit && numOfDays) {
                let newNumOfDrugs = (numOfDays * dose) * frequency;
                resData.numOfDrugs = newNumOfDrugs
                if (dataCalculatExpense) {
                    resData.newcalculateExpense = calculateExpenseDrug({
                        data: dataCalculatExpense,
                        newNumOfDrugs: newNumOfDrugs,
                        cashFlag: selectRight?.cashFlag,
                        disabledDiscount: disabledDiscount
                    });
                }
                if (dosingInterval === "DIW") {
                    return calculatDayOrDrug({
                        ...param,
                        field: "จน.วัน",
                        value: numOfDays,
                        data: {
                            ...param.data,
                            numOfDrugs: newNumOfDrugs,
                            dose: dose,
                        }
                    })
                } else {
                    return resData;
                }
            }
        }
    }
    if (multiply !== 0) {
        dose = multiply;
    } else {
        dose = toNumber(data?.dose);
    }
    if (field === "Frequency") {
        frequency = toNumber(value);
        if (numOfDrugs > 0 && dose > 0 && frequency > 0) {
            let newNumOfDays = (numOfDrugs / dose) / value;
            newNumOfDays = Math.ceil(newNumOfDays);
            resData.numOfDays = newNumOfDays;
            const formDate = setFormDate(newNumOfDays, chkdayjs);
            resData.startDate = formDate.startDate;
            resData.endDate = formDate.endDate;
            if (dosingInterval === "DIW") {
                return calculatDayOrDrug({
                    ...param,
                    field: "จน.วัน",
                    value: numOfDays,
                    data: {
                        ...param.data,
                        numOfDrugs: numOfDrugs,
                        dose: dose,
                        frequency: frequency,
                    }
                })
            } else {
                if (dataCalculatExpense && selectRight) {
                    resData.newcalculateExpense = calculateExpenseDrug({
                        data: dataCalculatExpense,
                        newNumOfDrugs: resData.numOfDays,
                        cashFlag: selectRight?.cashFlag,
                        disabledDiscount: disabledDiscount
                    });
                }
                return resData;
            }
        }
    }
    if (field === "จน.วัน") {
        resData.numOfDays = toNumber(value);
        const formDate = setFormDate(value, chkdayjs);
        // console.log('formDate', formDate)
        resData.startDate = formDate.startDate;
        resData.endDate = formDate.endDate;
        if (checkUnit) {
            let newNumOfDrugs = dose !== "" ? (value * dose) * frequency : numOfDrugs;
            newNumOfDrugs = newNumOfDrugs - oldQty;
            if (oldQty && newNumOfDrugs < 0) {
                newNumOfDrugs = 0;
            }
            resData.numOfDrugs = newNumOfDrugs >= 0 ? newNumOfDrugs : "";
        } else {
            resData.numOfDrugs = numOfDrugs
        }
        resData.checkUnit = checkUnit;
        if (dosingInterval === "DIW") {
            const sumDrugsByDosingInterval = clcSumDrugsByDosingInterval({
                chkDays: dosingIntervalChkDays,
                startDate: resData.startDate,
                endDate: resData.endDate,
                numOfDays: resData.numOfDays,
                numOfDrugs: resData.numOfDrugs,
            })
            // console.log('sumDrugsByDosingInterval :>> ', sumDrugsByDosingInterval);
            resData.numOfDrugs = sumDrugsByDosingInterval
        }
        if (dataCalculatExpense && selectRight) {
            resData.newcalculateExpense = calculateExpenseDrug({
                data: dataCalculatExpense,
                newNumOfDrugs: calBrine ? 1 : resData.numOfDrugs,
                cashFlag: selectRight?.cashFlag,
                disabledDiscount: disabledDiscount
            });
        }
        return resData;
    }
    if (field === "จน.ยา") {
        // console.log('data', data)
        // console.log('checkUnit', checkUnit)
        resData.numOfDrugs = toNumber(value);
        if (checkUnit) {
            if (value > 0 && dose > 0 && frequency > 0) {
                let newNumOfDays = dose !== "" ? ((toNumber(value) + oldQty) / dose) / frequency : numOfDays;
                newNumOfDays = Math.ceil(newNumOfDays);
                resData.numOfDays = newNumOfDays;
                const formDate = setFormDate(newNumOfDays, chkdayjs);
                // console.log('formDate :>> ', formDate);
                resData.startDate = formDate.startDate;
                resData.endDate = formDate.endDate;
            }
        }
        // console.log('resData', resData)
        // console.log('dosingInterval', dosingInterval)
        if (dosingInterval === "DIW") {
            const sumDays = clcSumDaysByDosingInterval({
                daysOfWeek: dosingIntervalChkDays,
                startDate: resData.startDate,
                numOfDays: resData.numOfDays,
                numOfDrugs: resData.numOfDrugs,
            })
            // console.log('clcSumDaysByDosingInterval :>> ', sumDays);
            if (sumDays) {
                resData.startDate = sumDays?.startDate || null;
                resData.endDate = sumDays?.endDate || null;
                resData.numOfDays = sumDays?.durationInDays || 0;
            }
        }
        if (dataCalculatExpense && selectRight) {
            resData.newcalculateExpense = calculateExpenseDrug({
                data: dataCalculatExpense,
                newNumOfDrugs: resData.numOfDrugs,
                cashFlag: selectRight?.cashFlag,
                disabledDiscount: disabledDiscount
            });
        }
        return resData;
    }
    if (field === "ผป.เหลือ") {
        resData.numOfDrugs = toNumber(numOfDrugs);
        if (dataCalculatExpense && selectRight) {
            resData.newcalculateExpense = calculateExpenseDrug({
                data: dataCalculatExpense,
                newNumOfDrugs: numOfDrugs,
                cashFlag: selectRight?.cashFlag,
                disabledDiscount: disabledDiscount
            });
        }
        if (checkUnit) {
            if (numOfDrugs > 0 && dose > 0 && frequency > 0) {
                let newNumOfDays = dose !== "" ? ((toNumber(numOfDrugs) + oldQty) / dose) / frequency : numOfDays;
                newNumOfDays = Math.ceil(newNumOfDays);
                resData.numOfDays = newNumOfDays;
                let formDate = setFormDate(newNumOfDays, chkdayjs);
                resData.startDate = formDate.startDate;
                resData.endDate = formDate.endDate;
            }
        }
        return resData;
    }
}
const formItemNamesForCheckInjection = [
    "dose", "doseM", "doseL", "doseN", "doseE", "doseB", "quantity",
    "days", "dosingUnit", "drugTiming", "duration",
]
export const calculatDayOrDrugInjectionFlag = ({
    formValues = null,
    formItemName = null,
    dosagecontain = null,
    days = null,
    drugUse = null,
    frequency = 1,
    dataCalculatExpense = null,
    selectRight = null,
    disabledDiscount = false,
}) => {
    // console.log('formValues', formValues)
    // console.log('days', days)
    if (!find(formItemNamesForCheckInjection, o => formItemName === o)) return
    if (!formItemName || !formValues || !dosagecontain) return
    let { dose = null, doseM = null, doseL = null, doseN = null, doseE = null, doseB = null, quantity = null } = formValues
    dose = toNumber(dose || 0)
    doseM = toNumber(doseM || 0)
    doseL = toNumber(doseL || 0)
    doseN = toNumber(doseN || 0)
    doseE = toNumber(doseE || 0)
    doseB = toNumber(doseB || 0)
    dosagecontain = toNumber(dosagecontain || 0)
    days = toNumber(days || 1)
    let sumDose = 0
    if (drugUse === "A") sumDose = dose * frequency
    if (drugUse === "B") sumDose = doseM + doseL + doseN + doseE + doseB
    let result = { quantity: 0, daysDrug: 0 }
    switch (formItemName) {
        case "quantity":
            const sumUnit = dosagecontain * quantity
            result.quantity = quantity
            result.daysDrug = sumDose ? sumUnit / sumDose : 0
            break;
        default:
            sumDose = sumDose * days
            result.quantity = sumDose / dosagecontain
            result.daysDrug = days || 1
            break;
    }
    const formDate = setFormDate(Math.ceil(result.daysDrug) || 0, true);
    result = {
        quantity: Math.ceil(result.quantity) || 0,
        daysDrug: Math.ceil(result.daysDrug) || 0,
        quantityReal: result.quantity,
        daysDrugReal: result.daysDrug,
        startDate: formDate.startDate,
        endDate: formDate.endDate,
    }
    result.newcalculateExpense = calculateExpenseDrug({
        data: dataCalculatExpense,
        newNumOfDrugs: result.quantity,
        cashFlag: selectRight?.cashFlag,
        disabledDiscount: disabledDiscount
    });
    return result
}
const checkPill = (unit, dose, afterUnit = false, optionsConvertDose = [], addchar) => {
    if (addchar === "+") return `${dose}${unit}`
    optionsConvertDose = map(optionsConvertDose, o => {
        return {
            ...o,
            doseNumber: toNumber(o.dose)
        }
    })
    dose = toNumber(dose)
    const tempDose = dose > 1 ? dose % 1 : dose
    const findEqualDose = find(optionsConvertDose, ["doseNumber", tempDose])
    if (unit === "เม็ด") {
        if (afterUnit) {
            let converted = "เม็ด"
            if (findEqualDose) {
                if (dose > 1) {
                    converted = findEqualDose?.convertInteger
                } else {
                    converted = findEqualDose?.convert
                }
            }
            return converted
        } else {
            if (findEqualDose) {
                if (dose > 1) {
                    return Math.floor(dose)
                } else {
                    return ""
                }
            }
            return dose
        }
    } else {
        if (afterUnit) {
            return unit;
        } else {
            return dose % 1 === 0 ? toNumber(dose) : toNumber(dose)
        }
    }
}
const chkUseDateTime = (dataSource) => {
    // Step 1: Group by 'value' and store items
    const grouped = dataSource.reduce((acc, item) => {
        if (!acc[item.value]) {
            acc[item.value] = [];
        }
        // Add each item to the appropriate value group
        acc[item.value].push(item);
        return acc;
    }, {});

    // Step 2: Create the desired result format
    const result = Object.keys(grouped).map((value) => {
        // Sort items by 'seq' and join labels
        const labels = grouped[value]
            .sort((a, b) => a.seq - b.seq) // Sort by seq
            .map(item => item.label)        // Extract labels
            .join(", ");                     // Join labels with commas
        const nDays = grouped[value]
            .sort((a, b) => a.seq - b.seq) // Sort by seq
            .map(item => item?.nDay || "")        // Extract labels
            .join("");
        return { label: labels, value: Number(value), nDays: nDays };
    });

    // Step 3: Sort the result by 'value' in ascending order
    return result.sort((a, b) => a.value - b.value);
}
const chkNTimes = (getFieldValue = () => { }, formValues = null, addChar = "") => {
    const optionsNTime = ["nTime1", "nTime2", "nTime3", "nTime4", "nTime5", "nTime6", "nTime7", "nTime8",]
    let label = null
    map(optionsNTime, (o, i) => {
        let nTime = null
        if (formValues) {
            nTime = formValues?.[o] || null
        } else {
            if (getFieldValue) {
                nTime = getFieldValue(o) || null
            }
        }
        nTime = nTime ? nTime.format("HH:mm") : null
        if (nTime) {
            if (addChar === "+") {
                label = label
                    ? `${label}+${nTime}${o}`
                    : `+${nTime}${o}`
            } else {
                label = label ? label + ` , ${nTime}` : `เวลา ${nTime}`
            }

        }
    })
    return label || ""
}
const chkDoseByDuration = (dataSource) => {
    // Step 1: Group by 'value' and store items
    const grouped = dataSource.reduce((acc, item) => {
        if (!acc[item.value]) {
            acc[item.value] = [];
        }
        // Add each item to the appropriate value group
        acc[item.value].push(item);
        return acc;
    }, {});

    // Step 2: Create the desired result format
    const result = Object.keys(grouped).map((value) => {
        // Sort items by 'seq' and join labels
        const labels = grouped[value]
            .sort((a, b) => a.seq - b.seq) // Sort by seq
            .map(item => item.time ? item.time : item.label)        // Extract labels
            .join(", ");                     // Join labels with commas
        const joinDoseTime = grouped[value]
            .sort((a, b) => a.seq - b.seq) // Sort by seq
            .map(item => `${item?.dose}${item?.time}` || "")        // Extract labels
            .join("");
        return { label: labels, value: Number(value), joinDoseTime: joinDoseTime };
    });

    // Step 3: Sort the result by 'value' in ascending order
    return result.sort((a, b) => a.value - b.value);
}
const timeToHHmm = (value) => {
    if (!value) return ""
    return dayjs(value).format("HH:mm")
}
export const ShowDrugLabel = ({ drugUse, drugUsingLabel, getFieldValue, optionsConvertDose }) => {
    // console.log('drugUse =>', drugUse)
    // console.log('optionsConvertDose =>', optionsConvertDose)
    // console.log('ShowDrugLabel =>');
    // console.log("drugUsingLabel =>", drugUsingLabel);
    const label = drugUsingLabel
    let useDateTime = [
        {
            label: "จันทร์",
            nDay: "nMon",
            value: Number(getFieldValue("nMon") || 0),
            seq: 1,
        },
        {
            label: "อังคาร",
            nDay: "nTue",
            value: Number(getFieldValue("nTue") || 0),
            seq: 2,
        },
        {
            label: "พุธ",
            nDay: "nWed",
            value: Number(getFieldValue("nWed") || 0),
            seq: 3,
        },
        {
            label: "พฤหัสบดี",
            nDay: "nThu",
            value: Number(getFieldValue("nThu") || 0),
            seq: 4,
        },
        {
            label: "ศุกร์",
            nDay: "nFri",
            value: Number(getFieldValue("nFri") || 0),
            seq: 5,
        },
        {
            label: "เสาร์",
            nDay: "nSat",
            value: Number(getFieldValue("nSat") || 0),
            seq: 6,
        },
        {
            label: "อาทิตย์",
            nDay: "nSun",
            value: Number(getFieldValue("nSun") || 0),
            seq: 7,
        },
    ]
    let useDoseByDuration = [
        {
            label: "เช้า",
            dose: "doseM",
            time: timeToHHmm(getFieldValue("timeM")),
            value: Number(getFieldValue("doseM") || 0),
            seq: 1,
        },
        {
            label: "เที่ยง",
            dose: "doseL",
            time: timeToHHmm(getFieldValue("timeL")),
            value: Number(getFieldValue("doseL") || 0),
            seq: 2,
        },
        {
            label: "บ่าย",
            dose: "doseN",
            time: timeToHHmm(getFieldValue("timeN")),
            value: Number(getFieldValue("doseN") || 0),
            seq: 3,
        },
        {
            label: "เย็น",
            dose: "doseE",
            time: timeToHHmm(getFieldValue("timeE")),
            value: Number(getFieldValue("doseE") || 0),
            seq: 4,
        },
        {
            label: "ก่อนนอน",
            dose: "doseB",
            time: timeToHHmm(getFieldValue("timeB")),
            value: Number(getFieldValue("doseB") || 0),
            seq: 5,
        },
    ]
    const optionsDocLabel = [
        "docLabel1",
        "docLabel2",
        "docLabel3",
        "docLabel4",
    ]
    useDateTime = filter(useDateTime, o => o.value)
    // const resultChkUseDateTime = chkUseDateTime(filter(useDateTime, "value"))
    // const resultChkUseDoseByDuration = chkDoseByDuration(filter(useDoseByDuration, "value"))
    useDoseByDuration = filter(useDoseByDuration, "value")
    const resultChkNTimes = chkNTimes(getFieldValue)
    const dosingUnit = label?.dosingUnit || null
    let docLabels = ""
    if (drugUse === "D") {
        map(optionsDocLabel, o => {
            const temp = getFieldValue(o)
            if (temp) {
                docLabels = docLabels ? `${docLabels}, ${temp}` : temp
            }
        })
    }
    // console.log('docLabels', docLabels)
    return (
        <label className="data-value">
            {
                ((drugUse === "A" || drugUse === "B") && label?.drugUsing)
                    ? <>{label.drugUsing}&nbsp;{drugUse === "A" && !label.dose && <br />}</>
                    : ""
            }
            {
                drugUse === "A" && label.dose ?
                    <>
                        {checkPill(dosingUnit, label?.dose, false, optionsConvertDose)}&nbsp;
                        {dosingUnit ? checkPill(dosingUnit, label?.dose, true, optionsConvertDose) : ""}
                        <br />
                    </>
                    : ""
            }
            {drugUse !== "E" ?
                <>
                    {
                        map(useDateTime, (r, i) => {
                            let dose = checkPill(dosingUnit, r.value, false, optionsConvertDose)
                            if (dosingUnit) {
                                dose = dose + " " + checkPill(dosingUnit, r.value, true, optionsConvertDose)
                            }
                            return <label key={r.label} className="data-value d-block">{r.label} {dose}</label>
                        })
                    }
                    <label className="data-value d-block">
                        {resultChkNTimes}
                    </label>
                </>
                : ""
            }
            {
                drugUse === "B" && useDoseByDuration?.length
                    ? <>
                        {
                            map(useDoseByDuration, r => {
                                let dose = checkPill(dosingUnit, r.value, false, optionsConvertDose)
                                if (dosingUnit) {
                                    dose = dose + " " + checkPill(dosingUnit, r.value, true, optionsConvertDose)
                                }
                                return <label key={r.label} className="data-value d-block">{r.label} {dose} {r.time ? `เวลา ${r.time}` : ""}</label>
                            })
                        }
                    </>
                    : ""
            }
            {docLabels && <label className="d-block">{docLabels}</label>}
            {(drugUse === "E" && label.drugLabel) ? <>{label.drugLabel}<br /></> : ""}
            {(drugUse === "A" && label.drugTiming) ? <>{label.drugTiming + " "}{!label.dosingTime && <br />}</> : ""}
            {drugUse !== "E" ?
                <>
                    {label.dosingTime ? <>{label.dosingTime}&nbsp;<br /></> : ""}
                    {label.dosingInterval ?
                        label.alternateDay ?
                            <>{label.dosingInterval.replace("…", " " + label.alternateDay + " ").replace("...", " " + label.alternateDay + " ")}<br /></>
                            :
                            getFieldValue("otherDosingInterval") ?
                                label.dosingInterval === "อื่นๆ" ?
                                    <>{getFieldValue("otherDosingInterval")}<br /></>
                                    :
                                    <>{label.dosingInterval + " " + getFieldValue("otherDosingInterval")}<br /></>
                                :
                                <>{label.dosingInterval}<br /></>
                        : ""
                    }
                    {label.drugProperty ? <>{label.drugProperty}<br /></> : ""}
                    {label.drugWarning ? <>{label.drugWarning}<br /></> : ""}
                    {label.drugAdmin ? <>{label.drugAdmin}<br /></> : ""}
                    {getFieldValue("docRemark") ? <>{getFieldValue("docRemark")}<br /></> : ""}
                </>
                : null
            }
        </label>
    )
}
// eslint-disable-next-line no-unused-vars
export const drugLabelFunc = (data, addchar, drugUse, formValues, optionsConvertDose = [],) => {
    // console.log('drugLabelFunc :>> ');
    // console.log('formValues :>> ', formValues);
    // console.log('data', data)
    // console.log('addchar', addchar)
    let useDateTime = [
        {
            label: "จันทร์",
            nDay: "nMon",
            value: Number(formValues?.nMon || 0),
            seq: 1,
        },
        {
            label: "อังคาร",
            nDay: "nTue",
            value: Number(formValues?.nTue || 0),
            seq: 2,
        },
        {
            label: "พุธ",
            nDay: "nWed",
            value: Number(formValues?.nWed || 0),
            seq: 3,
        },
        {
            label: "พฤหัสบดี",
            nDay: "nThu",
            value: Number(formValues?.nThu || 0),
            seq: 4,
        },
        {
            label: "ศุกร์",
            nDay: "nFri",
            value: Number(formValues?.nFri || 0),
            seq: 5,
        },
        {
            label: "เสาร์",
            nDay: "nSat",
            value: Number(formValues?.nSat || 0),
            seq: 6,
        },
        {
            label: "อาทิตย์",
            nDay: "nSun",
            value: Number(formValues?.nSun || 0),
            seq: 7,
        },
    ]
    let useDoseByDuration = [
        {
            label: "เช้า",
            dose: "doseM",
            time: timeToHHmm(formValues?.timeM),
            value: Number(formValues?.doseM || 0),
            seq: 1,
        },
        {
            label: "เที่ยง",
            dose: "doseL",
            time: timeToHHmm(formValues?.timeL),
            value: Number(formValues?.doseL || 0),
            seq: 2,
        },
        {
            label: "บ่าย",
            dose: "doseN",
            time: timeToHHmm(formValues?.timeN),
            value: Number(formValues?.doseN || 0),
            seq: 3,
        },
        {
            label: "เย็น",
            dose: "doseE",
            time: timeToHHmm(formValues?.timeE),
            value: Number(formValues?.doseE || 0),
            seq: 4,
        },
        {
            label: "ก่อนนอน",
            dose: "doseB",
            time: timeToHHmm(formValues?.timeB),
            value: Number(formValues?.doseB || 0),
            seq: 5,
        },
    ]
    // const resultChkUseDateTime = chkUseDateTime(filter(useDateTime, "value"))
    useDateTime = filter(useDateTime, o => o.value)
    // const resultChkUseDoseByDuration = chkDoseByDuration(filter(useDoseByDuration, "value"))
    useDoseByDuration = filter(useDoseByDuration, "value")
    const resultChkNTimes = chkNTimes(false, formValues || null, addchar)
    const dosingUnit = data?.dosingUnit || null
    let drugLabel = `${(["A", "B"].includes(drugUse) && data.drugUsing) ? data.drugUsing : ""}`
    if (["A"].includes(drugUse) && data.dose) {
        drugLabel += addchar + checkPill(dosingUnit, data?.dose, false, optionsConvertDose, addchar)
        if (dosingUnit) {
            drugLabel += addchar + checkPill(dosingUnit, data?.dose, true, optionsConvertDose, addchar)
        }
    }
    // Robot
    if (addchar === "+") {
        {
            drugUse === "B" && useDoseByDuration?.length
                ? map(useDoseByDuration, r => {
                    drugLabel = `${drugLabel}+${r.value}${r?.dose || ""}${r?.time || ""}`
                })
                : ""
        }
        {
            map(useDateTime, r => {
                drugLabel = `${drugLabel}+${r.value}${r?.nDay || ""}`
            })
        }
        if (resultChkNTimes) {
            drugLabel = `${drugLabel}${resultChkNTimes}`
        }
    } else {
        {
            drugUse === "B" && useDoseByDuration?.length
                ? map(useDoseByDuration, r => {
                    let dose = checkPill(dosingUnit, r.value, false, optionsConvertDose)
                    if (dosingUnit) {
                        dose = dose + " " + checkPill(dosingUnit, r.value, true, optionsConvertDose)
                    }
                    drugLabel = `${drugLabel} ${r.label} ${dose} ${r.time ? `เวลา ${r.time}` : ""} ,`
                })
                : ""
        }
        {
            map(useDateTime, r => {
                let dose = checkPill(dosingUnit, r.value, false, optionsConvertDose)
                if (dosingUnit) {
                    dose = dose + " " + checkPill(dosingUnit, r.value, true, optionsConvertDose)
                }
                drugLabel = `${drugLabel} ${r.label} ${dose} ,`
            })
        }
        if (resultChkNTimes) {
            drugLabel = `${drugLabel} ${resultChkNTimes} ,`
        }
    }

    if (["A"].includes(drugUse) && data.drugTiming) {
        drugLabel += (addchar + data.drugTiming)
    }
    if (["E"].includes(drugUse) && data.drugLabel) {
        drugLabel += (addchar + data.drugLabel)
    }
    if (data.dosingTime) {
        drugLabel += (addchar + data.dosingTime)
    }
    if (addchar === " ") {
        drugLabel += data.alternateDay
            ? data.dosingInterval.split("…")[0] + " " + data.alternateDay + " " + data.dosingInterval.split("…")[data.dosingInterval.split("…").length - 1].replaceAll(".", "")
            : data.otherDosingInterval
                ? data.dosingInterval.replace("อื่นๆ", data.otherDosingInterval)
                : data.dosingInterval
                    ? data.dosingInterval
                    : "";
    } else {
        if (!["E"].includes(drugUse)) {
            drugLabel += data.dosingInterval
                ? data.dosingInterval + addchar + data?.alternateDay + data?.otherDosingInterval
                : ""
        }
    }
    drugLabel += `${(data.drugProperty) ? (data.drugProperty + addchar) : ""}`
        + `${(data.drugWarning) ? (data.drugWarning + addchar) : ""}`
        + `${(data.drugAdmin) ? (data.drugAdmin + addchar) : ""}`
        + `${(data.docRemark) ? (data.docRemark + addchar) : ""}`
    if (drugLabel[drugLabel.length - 1] === addchar) {
        drugLabel = drugLabel.slice(0, drugLabel.length - 1);
    }
    drugLabel = drugLabel.replaceAll("undefined", "")
    return drugLabel;
}
export const onChangeExpense = (param) => {
    // console.log(param, "param");
    let { value, field, form, numOfDrugs, disabledDiscount, tempDiscount, setTempDiscount, selectRight } = param;

    if (field === "price") {
        form.setFieldsValue({
            rate: value,
            amount: numOfDrugs !== 0 ? value * numOfDrugs : "",
            cashNotReturn: numOfDrugs !== 0 ? ((value * numOfDrugs) - (toNumber(form.getFieldValue("credit")) + toNumber(form.getFieldValue("cashReturn")))) : ""
        });
        return;
    }
    if (field === "cashNotReturn") {
        form.setFieldsValue({
            cashNotReturn: value
        });
        return;
    }
    if (field === "discount") {
        let numcashNotReturn = toNumber(form.getFieldValue("cashNotReturn")) + tempDiscount;
        console.log(numcashNotReturn - value, "TTT");
        if ((numcashNotReturn - value) >= 0) {
            form.setFieldsValue({
                cashNotReturn: numcashNotReturn - value,
                discount: value
            });
            setTempDiscount(value);
        } else {
            form.setFieldsValue({
                discount: tempDiscount
            });
        }
        return;
    }
    let rate = toNumber(form.getFieldValue("rate"));
    let amount = toNumber(form.getFieldValue("amount"));
    if (amount) {
        if (field === "credit") {
            let docQty = rate > 0 ? (toNumber(value) + toNumber(form.getFieldValue("cashReturn"))) / rate : 0;
            let cashNotReturn = amount - (toNumber(value) + toNumber(form.getFieldValue("cashReturn")))
            form.setFieldsValue({
                docQty: docQty,
                credit: value,
                cashReturn: form.getFieldValue("cashReturn"),
                cashNotReturn: cashNotReturn > 0 ? cashNotReturn : 0,
                discount: disabledDiscount ? "" : 0
            });
            return;
        }
        if (field === "cashReturn") {
            let docQty = rate > 0 ? (toNumber(form.getFieldValue("credit")) + toNumber(value)) / rate : 0;
            let cashNotReturn = amount - (toNumber(form.getFieldValue("credit")) + toNumber(value))
            form.setFieldsValue({
                docQty: docQty,
                credit: form.getFieldValue("credit"),
                cashReturn: value,
                cashNotReturn: cashNotReturn > 0 ? cashNotReturn : 0,
                discount: disabledDiscount ? "" : 0
            });
            return;
        }
        if (field === "จน.ที่เบิกได้") {
            let docQty = toNumber(value);
            let chkCredit = selectRight?.credit;
            let priceCashReturn = docQty * rate;

            form.setFieldsValue({
                docQty: docQty,
                credit: chkCredit > 0 ? priceCashReturn : 0,
                cashReturn: chkCredit > 0 ? 0 : priceCashReturn,
                cashNotReturn: amount - priceCashReturn,
                discount: disabledDiscount ? "" : 0
            });
        }
    }
}
export const dosingIntervalLabel = (array, dosingInterval) => {
    // console.log('dosingIntervalLabel', array)
    // console.log('dosingIntervalLabel', dosingInterval)
    let newArray = array;
    if (!Array.isArray(array)) {
        newArray = [array];
    }
    // console.log(dosingInterval, "dosingInterval");
    // console.log(newArray, "dosingInterval");
    let selectLabel = dosingInterval.filter(val => newArray.includes(val.datavalue));
    let selectLabelSub = dosingInterval.find(val => val.datavalue === "DIW")?.subData.filter(val => newArray.includes(val.datavalue));
    selectLabelSub = selectLabelSub ? selectLabelSub : [];
    selectLabel = [...selectLabel, ...selectLabelSub];
    let checkDate = ['DIW', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    let newLabel = "";
    for (let i = 0; i < checkDate.length; i++) {
        if (selectLabel.find(val => val.datavalue === checkDate[i])) {
            newLabel += " ";
            newLabel += selectLabel.find(val => val.datavalue === checkDate[i]).datadisplay;
        }
    }
    // console.log(Boolean(newLabel), "dosingIntervalLabel");
    // console.log(selectLabel, "dosingIntervalLabel");
    return newLabel ? newLabel : selectLabel[0]?.datadisplay;
};