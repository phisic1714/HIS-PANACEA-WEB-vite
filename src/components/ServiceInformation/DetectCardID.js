import thaiIdCard from 'thai-id-card';
import { GetMasterChkDup } from './Api';

export const checkCardNumberID = async (rule, value) => {
    const result = thaiIdCard.verify(value);
    if (result) {
        return Promise.resolve();
    } else {
        return Promise.reject();
    }
}

export const checkCardNumberIDFormatAndDup = async (rule, value, isUpdate, idcard) => {
    const result = thaiIdCard.verify(value);
    if (result) { // check format
        let res = await getMasterChkDup(value);
        if(isUpdate) {
            if(value === idcard) {
                return Promise.resolve();
            }else {
                return checkMasterChkDup(res.total);
            }
        }else { // check dup
            return checkMasterChkDup(res.total);
        }
        
    } else {
        return Promise.reject(new Error('เลขบัตรประชาชนมี Format ไม่ถูกต้อง'));
    }
}

const getMasterChkDup = async (idCard) => {
    let temp = { 
        idCard: idCard 
    }
    const res = await GetMasterChkDup(temp);
    if (res.isSuccess === true) {
        return res.responseData;
    } else {
        return 'data null';
    }
}

const checkMasterChkDup = (value) => {
    if (Number(value) === 0) {
        return Promise.resolve();
    } else {
        console.log('idCard พิมพ์ถูก เเต่ซ้ำในระบบ');
        return Promise.reject(new Error('เลขบัตรประชาชนซ้ำ'));
    }
}