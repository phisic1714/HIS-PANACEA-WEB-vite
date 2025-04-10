import axios from "axios";
import { env } from "../env";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    })

    failedQueue = [];
}


// export const refreshToken = async () => {
//     const accessToken = localStorage.getItem("token");
//     if (!accessToken) throw new Error("No access token found");

//     const response = await axios.post(
//         `${env.REACT_APP_PANACEACHS_SERVER}/api/User/refresh-token`,
//         {},
//         { headers: { Authorization: `Bearer ${accessToken}` } }
//     );

//     if (!response || response.data.isSuccess === false) {
//         throw new Error("Token refresh failed");
//     }

//     const newToken = response.data.responseData.token;
//     localStorage.setItem("token", newToken);
// }

function getRouteSegments(url) {
    const segments = url.split('/');

    const path = segments[1].charAt(0).toUpperCase() + segments[1].slice(1);
    const subPath = segments[2].toUpperCase().replace(/-/g, '_');

    return {
        path,
        subPath
    };
}

export function setupInterceptors(instance) {
    instance.interceptors.request.use(
        async (config) => {
            const accessToken = localStorage.getItem("token");

            config.headers['Access-Control-Allow-Origin'] = "*";
            config.headers['X-Forwarded-For'] = localStorage.getItem('ip_address')?.toString();

            if (accessToken) {
                config.headers["Authorization"] = `Bearer ${accessToken}`;
            }

            if ((config.method === 'post' || config.method === 'put') && config?.data) {
                const jsonString = JSON.stringify(config.data);
                const dataObject = JSON.parse(jsonString);

                if (!dataObject.requestData) return config;

                const currentUrl = window.location.pathname;
                const formatURL = getRouteSegments(currentUrl);

                const listMenu = JSON.parse(sessionStorage.getItem("userMenu"));

                if (!listMenu) return config;

                const foundMenu = listMenu.responseData.find((item) => item.eName === formatURL.path)?.children;

                if (foundMenu) {
                    const moduleId = foundMenu?.filter(found => found.code === formatURL.subPath).map(item => item.moduleId).join('');

                    const newConfig = {
                        ...config,
                        data: {
                            ...dataObject,
                            page: moduleId
                        }
                    };

                    return newConfig
                }
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );


    instance.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            const originalRequest = error.config;

            if (
                error.response &&
                error.response.status === 401 &&
                !originalRequest._retry && !originalRequest.url.includes('/refresh-token')
            ) {

                if (isRefreshing) {
                    return new Promise(function (resolve, reject) {
                        failedQueue.push({ resolve, reject })
                    }).then(token => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return axios(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    })
                }

                originalRequest._retry = true;
                isRefreshing = true;

                const accessToken = localStorage.getItem("token");

                if (!accessToken) return Promise.reject(error);

                return new Promise(function (resolve, reject) {
                    axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/User/refresh-token`, {})
                        .then(({ data }) => {
                            if (data.isSuccess === false) throw new Error("Token refresh failed");
                            const newToken = data.responseData.token;
                            localStorage.setItem("token", newToken);

                            axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
                            originalRequest.headers['Authorization'] = 'Bearer ' + data.token;
                            processQueue(null, data.token);
                            resolve(axios(originalRequest));
                        })
                        .catch((err) => {
                            localStorage.removeItem("ip_address");
                            localStorage.removeItem("token");
                            localStorage.removeItem("ipdFinancePlace");
                            localStorage.removeItem("opdFinancePlace");
                            localStorage.removeItem("laboratoryRoom");
                            localStorage.removeItem("selectWorkRoom");
                            localStorage.removeItem("doctorClinicRoom");
                            localStorage.removeItem("inventoryRoom");
                            localStorage.removeItem("wardRoom");
                            localStorage.removeItem("workRoomWard");
                            localStorage.removeItem("opdClinicRoom");
                            localStorage.removeItem("ipdPrescriptionRoom");
                            localStorage.removeItem("opdPrescriptionRoom");
                            localStorage.removeItem("dentalRoom");
                            localStorage.removeItem("selectPatient");
                            sessionStorage.removeItem("user");
                            sessionStorage.removeItem("userMenu");
                            sessionStorage.removeItem("reset");
                            sessionStorage.removeItem("topbar");
                            sessionStorage.removeItem("selectPatientemessage");
                            sessionStorage.removeItem("showemessage");
                            window.location.replace("/")
                            processQueue(err, null);
                            reject(err);

                        })
                        .finally(() => { isRefreshing = false })
                })

            }

            return Promise.reject(error);
        });

}
