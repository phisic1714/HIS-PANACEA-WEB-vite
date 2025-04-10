import { env } from '../../../env.js';
import axios from "axios";

const CancelToken = axios.CancelToken;
const source = CancelToken.source();


export const cancelToken = (api, param) => {
  console.log('api', api)
  console.log('param', param)
  // axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/${api.url}${api?.sendRequest ? "" : param || ""}`, {
  //   cancelToken: source.token
  // }).catch(function (thrown) {
  //   if (axios.isCancel(thrown)) {
  //     console.log('Request canceled', thrown.message);
  //   } else {
  //     // handle error
  //   }
  // });
  let cancel;
  axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/${api.url}${api?.sendRequest ? "" : param || ""}`, {
    cancelToken: new CancelToken(function executor(c) {
      // An executor function receives a cancel function as a parameter
      cancel = c;
    })
  });

  // cancel the request
  cancel();
}
export const callApi = async (listApi, name, param) => {
  const api = listApi.find(o => o.name === name);
  if (!api) return;
  const res = await axios({
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

export const callApiObject = async (listApi, name, param) => {
  const api = listApi[name]
  if (!api) return;
  const res = await axios({
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
export const callApis = async (api, param) => {
  if (!api) return;
  const res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/${api.url}${api?.sendRequest ? "" : param || ""}`,
    method: api?.method,
    data: api?.sendRequest ? {
      requestData: param
    } : undefined,
    // signal: AbortSignal.timeout(1000)
  }).then(res => {
    if (api?.return === "res") return res || null;
    if (api?.return === "data") return res?.data || null;
    if (api?.return === "responseData") return res?.data?.responseData || null;
  }).catch(error => {
    return error;
  });
  return res;
};