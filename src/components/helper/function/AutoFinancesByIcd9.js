import dayjs from 'dayjs'
import { callApis } from 'components/helper/function/CallApi';
import { getDateCalculatExpenses as getExpenseRate } from "components/helper/GetDateCalculatExpenses";
import { notiError, notiSuccess } from 'components/Notification/notificationX';

// const hosParam = JSON.parse(localStorage.getItem("hos_param"));
const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;

export default async function AutoFinancesByIcd9({
    patient = null,
    serviceId = null,
    admitId = null,
    clinicId = null,
    workId = null,
    doctor = null,
    rightId = null,
    cashFlag = null,
    opdRightId = null,
    admitRightId = null,
    icd9Code = [],
}) {
    // console.log('patient :>> ', patient);
    // console.log('serviceId :>> ', serviceId);
    // console.log('admitId :>> ', admitId);
    // console.log('clinicId :>> ', clinicId);
    // console.log('workId :>> ', workId);
    // console.log('doctor :>> ', doctor);
    // console.log('rightId :>> ', rightId);
    // console.log('opdRightId :>> ', opdRightId);
    // console.log('admitRightId :>> ', admitRightId);
    // console.log('icd9Code :>> ', icd9Code);

    if (!clinicId && !admitId) return
    if (!icd9Code?.length) return

    const crrDateTime = dayjs().format("YYYY-MM-DD HH:mm")
    let expenses = icd9Code.map(icd => {
        const expenses = callApis(apis["GetExpenses"], { icd9: icd })
        return expenses
    });

    expenses = await Promise.all(expenses);
    expenses = expenses.flat();
    if (!expenses?.length) return
    expenses = expenses.map(o => {
        return getExpenseRate({ expenseId: o.expenseId, rightId: rightId || "10" }).then(value => {
            const quantity = 1
            let {
                rate = null,
                credit = "0",
                cashReturn = "0",
                cashNotReturn = "0",
                minRate = null,
                maxRate = null
            } = value;
            rate = rate ? Number(rate) : 0;
            credit = credit ? Number(credit) * Number(quantity) : "0";
            cashReturn = cashReturn ? Number(cashReturn) * Number(quantity) : "0";
            cashNotReturn = cashNotReturn ? Number(cashNotReturn) * Number(quantity) : "0";
            const amount = rate ? Number(rate) * Number(quantity) : 0;
            return {
                // Expense
                ...o,
                orderId: null,
                financeId: null,
                expenseName: o.name,
                quantity: String(quantity),
                code: o.code,
                price: String(rate),
                amount: String(amount),
                credit: String(credit),
                cashReturn: String(cashReturn),
                cashNotReturn: String(cashNotReturn),
                claim: "0",
                copay: "0",
                discount: "0",
                payment: "0",
                reminburse: "0",
                receive: "0",
                // Patient
                cashFlag: cashFlag,
                patientId: patient?.patientId,
                hn: patient?.hn,
                runHn: patient?.runHn,
                yearHn: patient?.yearHn,
                admitId,
                serviceId,
                clinicId,
                fromWork: workId,
                toWork: workId,
                opdRightId,
                admitRightId,
                rightId,
                doctor,
                // General
                opdipd: admitId ? "I" : "O",
                userCreated: user,
                dateCreated: crrDateTime,
                orderDate: crrDateTime,
                orderTime: crrDateTime,
                notTriggerFlag: "Y",
            };
        });
    });
    expenses = await Promise.all(expenses)
    // console.log('expenses :>> ', expenses);
    const res = await callApis(apis["InsNewOrder"], expenses)
    if (res?.isSuccess) notiSuccess({ message: "บันทึกค่าใช้จ่าย จาก ICD9" })
    if (!res?.isSuccess) notiError({ message: "บันทึกค่าใช้จ่าย จาก ICD9" })
    return res
}
const apis = {
    GetExpenses: {
        url: "OpdExamination/GetExpenses",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    InsNewOrder: {
        url: "Finances/InsNewOrderListFinance",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
}