import { useEffect, useState, useRef } from "react"
import Hub from "./Hub"
import { GetHub } from '../GetHub'

const useHub = (path) => {
    const [signalrHub, setSignalrHub] = useState(new Hub(null))
    const signalrHubRef = useRef()

    const connectSignalr = async () => {
        const newVitalSignHub = await GetHub(path)
        signalrHubRef.current = newVitalSignHub
        setSignalrHub(newVitalSignHub)
    }

    useEffect(() => {
        if (path) {
            connectSignalr()
        }
        return () => {
            console.log(signalrHubRef.current?.connection?.connectionState)
            if (signalrHubRef.current?.connection?.connectionState === 'Connected') {
                console.log(signalrHubRef.current?.connection?.connectionState)
                signalrHubRef.current?.stop()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path])

    return signalrHub
}

export default useHub