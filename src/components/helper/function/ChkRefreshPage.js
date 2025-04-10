export const chkRefreshPage = (param) => {
    let { intervalIdRef, fieldFlag, fieldHour, doing } = param;
        clearInterval(intervalIdRef.current);
        let isRefreshFlag = JSON.parse(localStorage.getItem("hos_param"))[fieldFlag];
        let refreshMin = JSON.parse(localStorage.getItem("hos_param"))[fieldHour];
        if(isRefreshFlag==="Y"){
            intervalIdRef.current  = setInterval(() => {
                doing();
            }, refreshMin);
        }
}