import axios from 'axios';
import dayjs from "dayjs";
import {map , uniqBy ,differenceBy, filter} from "lodash";
import { env } from '../../../env.js';

export const AutoIcd = async (listExpense = []) => {
  if (!listExpense?.length) return;
  const {
    patientId,
    serviceId,
    clinicId,
    runHn,
    yearHn,
    hn,
    userCreated,
    fromWork
  } = listExpense[0];
  let res = await Promise.all(listExpense.map(async o => {
    let req = {
      code: o.code,
      financeType: o.financeType,
      group: null,
      workId: null
    };
    let result = await callApi("GetExpenses", req).then(value => value.find(i => i.code === o.code));
    return result;
  })).then(async function (results) {
    let filterIcd10 = filter(results, "diag");
    let filterIcd9 = filter(results, "proced");
    if (filterIcd10?.length || filterIcd9?.length) {
      let req = {
        clinicId: clinicId
      };
      let res = await callApi("GetDiagsAndProcedures", req);
      let listIcdProcedure = uniqBy(res, "icdP");
      let listIcdDiag = uniqBy(res, "icdD");
      if (filterIcd9?.length) {
        let mappingFilterIcd9 = map(filterIcd9, o => {
          return {
            ...o,
            icdP: o.proced
          };
        });
        mappingFilterIcd9 = uniqBy(mappingFilterIcd9, "icdP");
        let icd9ForAuto = differenceBy(mappingFilterIcd9, listIcdProcedure, "icdP");
        if (icd9ForAuto?.length) {
          let req = map(icd9ForAuto, o => {
            return {
              seq: null,
              procedureId: null,
              clinicId: clinicId,
              serviceId: serviceId,
              patientId: patientId,
              runHn: runHn,
              yearHn: yearHn,
              hn: hn,
              workId: fromWork,
              procedure: o.procedure,
              procedType: null,
              procedSide: null,
              icd: o.proced,
              doctor: null,
              startDate: null,
              finishedDate: null,
              userCreated: userCreated,
              dateCreated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
              userModified: null,
              dateModified: null,
              userAudit: null,
              dateAudit: null,
              price: o.minRate,
              extension: null
            };
          });
          let res = await callApi("InsOpdProcedures", req);
          if (res?.isSuccess) document.getElementById("reload-opd-procedures")?.click()
        }
      }
      if (filterIcd10?.length) {
        let mappingFilterIcd10 = map(filterIcd10, o => {
          return {
            ...o,
            icdD: o.diag
          };
        });
        mappingFilterIcd10 = uniqBy(mappingFilterIcd10, "icdD");
        let icd10ForAuto = differenceBy(mappingFilterIcd10, listIcdDiag, "icdD");
        if (icd10ForAuto?.length) {
          let req = map(icd10ForAuto, o => {
            return {
              clinicId: clinicId,
              serviceId: serviceId,
              patientId: patientId,
              runHn: runHn,
              yearHn: yearHn,
              hn: hn,
              workId: fromWork,
              diagnosis: o.diagnosis,
              diagType: null,
              diagSide: null,
              diagOrgan: null,
              icd: o.diag,
              doctor: null,
              userCreated: userCreated,
              mapping1: null,
              dateCreated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
              userModified: null,
              dateModified: null,
              userAudit: null,
              dateAudit: null,
              remark: null,
              diagDeadStatus: null
            };
          });
          let res = await callApi("InsOpdDiags", req);
          if (res?.isSuccess) document.getElementById("reload-opd-diags")?.click()
        }
      }
    }
    return "AutoIcd";
  });
  return res;
};

const callApi = async (name, param) => {
  let api = listApi.find(o => o.name === name);
  if (!api) return;
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/${api.url}${api?.sendRequest ? "" : param || ""}`,
    method: api?.method,
    data: api?.sendRequest ? {
      requestData: param
    } : undefined
  }).then(res => {
    if (api?.return === "data") return res?.data || null;
    if (api?.return === "responseData") return res?.data?.responseData || null;
  }).catch(error => {
    return error;
  });
  return res;
};

const listApi = [{
  name: "GetExpenses",
  url: "OpdExamination/GetExpenses",
  method: "POST",
  return: "responseData",
  sendRequest: true
}, {
  name: "GetDiagsAndProcedures",
  url: "OpdClinics/GetHistoryClinicsDetail",
  method: "POST",
  return: "responseData",
  sendRequest: true
}, {
  name: "InsOpdDiags",
  url: "OpdDiag/InsListOpdDiags",
  method: "POST",
  return: "data",
  sendRequest: true
}, {
  name: "InsOpdProcedures",
  url: "OpdProcedures/InsListOpdProcedures",
  method: "POST",
  return: "data",
  sendRequest: true
}];