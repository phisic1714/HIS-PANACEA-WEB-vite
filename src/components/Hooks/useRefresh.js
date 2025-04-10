import  { useEffect, useRef, useCallback } from 'react'

// import { chkRefreshPage } from 'components/helper/function/ChkRefreshPage'

const useRefresh = ({ fieldFlag, fieldHour, doing=()=>{} }) => {
    const intervalIdRef = useRef();

    const chkRefreshPage = useCallback((param) => {
        clearInterval(intervalIdRef.current);
        // let isRefreshFlag = JSON.parse(localStorage.getItem("hos_param"))[fieldFlag];
        // let refreshMin = JSON.parse(localStorage.getItem("hos_param"))[fieldHour];
        let isRefreshFlag = "Y"
        let refreshMin = 20000
        if(isRefreshFlag==="Y"){
            intervalIdRef.current  = setInterval(() => {
                doing();
            }, refreshMin);
        }
    }, [doing])
    
    useEffect(() => {
        chkRefreshPage({setFieldTime: true});
        return () => {
            clearInterval(intervalIdRef.current);
        }
    }, [chkRefreshPage])
}

export default useRefresh