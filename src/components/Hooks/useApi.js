import { env } from '../../env.js';

import axios from "axios";
import { useState, useEffect } from "react";
export const getHttpCancelTokenSource = () => {
  const CancelToken = axios.CancelToken;
  return CancelToken.source();
};
const URL_API = `${env.REACT_APP_PANACEACHS_SERVER}/api/`;
function getToken() {
  return JSON.parse(JSON.stringify(localStorage.getItem('token')));
}
export { URL_API, getToken, axios };
export const useApi = ({
  url = "",
  method = "get",
  params = {},
  data = null,
  token = false,
  // eslint-disable-next-line no-unused-vars
  cancelToken = null,
  onSuccess = null,
  initialLoad = true
}, dependencies = []) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);
  const [error, setError] = useState(null);
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  const reload = () => {
    setIsLoading(true);
    setError(null);
    axios({
      url,
      method: method.toLowerCase(),
      params,
      data,
      headers: token ? {
        Authorization: "Bearer " + getToken()
      } : null,
      cancelToken: source.token
    }).then(({
      data
    }) => {
      setIsLoading(false);
      if (data.isSuccess) {
        if (onSuccess) {
          setFetchedData(onSuccess(data.responseData));
        } else {
          setFetchedData(data.responseData);
        }
      } else {
        setFetchedData(null);
      }
    }).catch(error => {
      if (axios.isCancel(error)) {
        setError(error.message);
      } else {
        setError(error && error.response ? error.response.data.message : error.message);
      }
    }).finally(() => {
      setIsLoading(false);
    });
  };
  useEffect(() => {
    if (initialLoad) {
      reload();
    }
    return () => {
      source.cancel("Operation canceled by the user.");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  return [isLoading, fetchedData, error, reload];
};

// How to use
// const [loading, data, error, reload] = useApi(
//   {
//     method: "post",
//     url: `${URL_API}RightCheck/GetRights`,
//     token: true,
//     data: {
//       requestData: {
//           code: null,
//           name: null
//       },
//   },
//   },
//   []
// );