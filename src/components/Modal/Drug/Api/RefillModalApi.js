import { env } from '../../../../env.js';
import axios from "axios";
import { getNewFinanceList } from "../../../../routes/OpdClinic/API/OpdDrugChargeApi";
import dayjs from "dayjs";
const userFromSession = JSON.parse(sessionStorage.getItem('user'));
let user = userFromSession.responseData.userId;
export const InsNewOrderListFinanceWithAppoint = async param => {
  let listFinanceRequest = param?.orderList.map(order => ({
    "listOrderRequest": {
      "listFinanceRequest": getNewFinanceList(order?.defalutData, param?.paramPatient).map((finance, index) => ({
        ...finance,
        drugLabelName: order?.defalutData[index]?.drugLabelName
      }))
    }
  }));
  console.log("requestData", listFinanceRequest);
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Finances/InsNewOrderListFinanceWithAppoint`,
    method: "POST",
    data: {
      requestData: listFinanceRequest
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const UpdateListFinanceAppointRefill = async param => {
  let listFinanceRequest = param?.orderList.map(order => ({
    "listOrderRequest": {
      "listFinanceRequest": getNewFinanceList(order?.defalutData, param?.paramPatient).map((finance, index) => ({
        ...finance,
        financeId: order?.defalutData[index]?.financeId,
        orderDate: order?.defalutData[index]?.orderDate,
        orderId: order?.defalutData[index]?.orderId,
        orderRemark: order?.defalutData[index]?.orderRemark,
        orderTime: order?.defalutData[index]?.orderTime,
        orderType: order?.defalutData[index]?.orderType,
        userCreated: order?.defalutData[index]?.userCreated,
        dateCreated: order?.defalutData[index]?.dateCreated,
        robotStatus: "3",
        // พี่เฟินบอก
        userModified: user,
        dateModified: dayjs().format("YYYY-MM-DD")
      }))
    }
  }));
  console.log("requestData", listFinanceRequest);
  // return;
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Finances/UpdateListFinanceAppointRefill`,
    method: "POST",
    data: {
      requestData: listFinanceRequest
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};