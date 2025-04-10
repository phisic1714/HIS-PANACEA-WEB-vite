/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { Form } from "antd"
export default function ShowCvd({
    form,
    age,
    gender,
}) {
    // Watch
    const bpSystolic = Form.useWatch("bpSystolic", form);
    const height = Form.useWatch("height", form);
    const dm = Form.useWatch("dm", form);
    const waistline = Form.useWatch("waistline", form);
    const smoke = Form.useWatch("smoke", form);
    const cvd = Form.useWatch("cvd", form);
    // console.log('age :>> ', age);
    // console.log('gender :>> ', gender);
    // console.log('bpSystolic :>> ', bpSystolic);
    // console.log('dm :>> ', dm);
    // console.log('waistline :>> ', waistline);
    // console.log('height :>> ', height);
    // console.log('smoke :>> ', smoke);
    // console.log('cvd :>> ', cvd);

    function calculateCVDRisk(AGE, SEX, SBP, DM, Waist, Height, SMOKING) {
        // คำนวณ Full Score
        const fullScore = (0.079 * AGE)
            + (0.128 * SEX)
            + (0.019350987 * SBP)
            + (0.58454 * DM)
            + (3.512566 * (Waist / Height))
            + (0.459 * SMOKING);
        // คำนวณ P Full Score (%)
        const pFullScore = (1 - (0.978296 ** Math.exp(fullScore - 7.720484))) * 100;
        return pFullScore;
    }
    const chkValues = () => {
        // console.log('chkValues :>> ');
        if (!age || !gender) return form.setFieldsValue({ cvd: null })
        if (!bpSystolic || !dm || !waistline || !height || !smoke) return form.setFieldsValue({ cvd: null })
        const AGE = Number(age || 0); // อายุ
        const SEX = Number(gender === "M" ? 1 : 0);// เพศ (1 สำหรับชาย, 0 สำหรับหญิง)
        const SBP = Number(bpSystolic || 0); // ความดันโลหิต (Systolic Blood Pressure)
        const DM = Number(dm || 0);// เบาหวาน (1 สำหรับมี, 0 ถ้าไม่มี)
        const Waist = Number(waistline || 0)/*  * 2.54 */; // รอบเอว (หน่วยเป็นเซนติเมตร)
        const Height = Number(height || 0); // ความสูง (หน่วยเป็นเซนติเมตร)
        const SMOKING = Number(smoke ? (smoke === "1" || smoke === "9" ? 0 : 1) : 0); // การสูบบุหรี่ (1 สำหรับสูบ, 0 ถ้าไม่สูบ)
        // console.log('AGE :>> ', AGE);
        // console.log('SEX :>> ', SEX);
        // console.log('SBP :>> ', SBP);
        // console.log('DM :>> ', DM);
        // console.log('Waist :>> ', Waist);
        // console.log('Height :>> ', Height);
        // console.log('SMOKING :>> ', SMOKING);

        let risk = calculateCVDRisk(AGE, SEX, SBP, DM, Waist, Height, SMOKING);
        risk = risk.toFixed(2)
        form.setFieldsValue({ cvd: String(risk) })
    }
    useEffect(() => {
        chkValues()
    }, [bpSystolic, dm, waistline, height, smoke])
    // function calculateCVDRisk1(age, sex, smoke, dm, sbp, waist, height) {
    //     // Calculate the full score based on the provided formula
    //     const fullScore = (0.079 * age) +
    //         (0.128 * sex) +
    //         (0.019350987 * sbp) +
    //         (0.58454 * dm) +
    //         (3.512566 * (waist / height)) +
    //         (0.459 * smoke);
    //     // Calculate the P Full Score (%) based on the formula
    //     const pFullScore = (1 - (0.978296 ** Math.exp(fullScore - 7.720484))) * 100;
    //     // const pFullScore = (1 - (Math.pow(0.978296, fullScore - 7.720484))) * 100;
    //     // Return the results
    //     return {
    //         fullScore: fullScore,
    //         pFullScore: pFullScore
    //     };
    // }

    // // Example usage
    // const age = 50;
    // const sex = 1; // Male
    // const smoke = 0; // Smoker
    // const dm = 0; // Diabetic
    // const sbp = 130; // Systolic Blood Pressure
    // const waist = 90; // Waist circumference in cm
    // const height = 170; // Height in cm

    // const result = calculateCVDRisk1(age, sex, smoke, dm, sbp, waist, height);

    // console.log("Full Score:", result?.fullScore);
    // console.log("P Full Score (%):", result?.pFullScore.toFixed(2));
    return ""
}