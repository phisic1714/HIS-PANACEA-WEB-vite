
import axios from "axios";
import { useEffect } from "react";
import { env } from "../../env";

export const ThaiD = () => {
    const searchParams = new URLSearchParams(location.search);
    const queryCode = searchParams.get("code");
    const queryState = searchParams.get("state");

    const callbackThaiD = async (code, state) => {
        try {
            const res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/user/thaid-callback?code=${code}&state=${state}`)
            window.location.replace(res.data)
        } catch (err) {
            console.log(err)
            window.location.replace("/")
        }
    }

    useEffect(() => {
        if (queryCode && queryState) {
            callbackThaiD(queryCode, queryState)
        } else {
            window.location.replace("/")
        }
    }, [queryCode, queryState])

    return <>
    </>
}