import { toNumber, find, map } from "lodash";

export const chkVitalSignConfigs = (object = "", value, vitalSignConfigs) => {
    if (!vitalSignConfigs) return

    const { minValue = 0, maxValue = 0 } = Array.isArray(vitalSignConfigs) ? vitalSignConfigs[0] : vitalSignConfigs

    if (value === undefined || value === null) return

    const numericValue = toNumber(value);

    if (object === "color") {
        if (minValue !== null && numericValue < minValue) return "red";
        if (maxValue !== null && numericValue > maxValue) return "red";
        return "";
    }

    if (object === "status") {
        if (minValue !== null && numericValue < minValue) return "error";
        if (maxValue !== null && numericValue > maxValue) return "error";
        return "";
    }
    return "";
};
// รอทำข้อเช็คค่า VitalSign ใหม่ค่อยเปิด
export const chkVitalSignAlert = (v, vitalSignAlert, vitalSignConfigs) => {
    // return false
    const fieldsForChk = ["bodyTemperature", "bpDiastolic", "bpSystolic", "height", "pulse", "weight"];

    const chk = vitalSignAlert === 'Y';

    const findConfigRsp = find(vitalSignConfigs?.respiratory, ['meaningFlag', null]);
    const minValueRsp = findConfigRsp?.maxValue || null
    const maxValueRsp = findConfigRsp?.minValue || null

    let alert = false;
    if (chk) {
        map(fieldsForChk, o => {
            const a = v[o];
            const min = vitalSignConfigs[o]?.minValue || null;
            const max = vitalSignConfigs[o]?.maxValue || null;
            if (min !== null && a !== null && a < min) alert = true;
            else if (max !== null && a !== null && a > max) alert = true;
        });

        if (minValueRsp !== null && v?.respiratory !== null && v < minValueRsp) alert = true;
        if (maxValueRsp !== null && v?.respiratory !== null && v > maxValueRsp) alert = true;
    }
    return alert;
};
