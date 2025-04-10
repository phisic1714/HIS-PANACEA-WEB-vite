import { useEffect, useState, useRef } from "react"
import Hub from "./Hub"
import { GetHub } from './GetHub'

const useHub = (path) => {
    const [signalrHub, setSignalrHub] = useState(new Hub(null))
    const signalrHubRef = useRef()
    // console.log('signalrHubRef', signalrHubRef.current)
    const connectSignalr = async () => {
        const newHub = await GetHub(path)
        signalrHubRef.current = newHub
        setSignalrHub(newHub)
    }

    useEffect(() => {
        if (path) {
            connectSignalr()
        }
        return () => {
            // console.log("connectionState =>", signalrHubRef.current?.connection?.connectionState)
            if (signalrHubRef.current?.connection?.connectionState === 'Connected') {
                // console.log("connectionState =>", signalrHubRef.current?.connection?.connectionState)
                signalrHubRef.current?.stop()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path])

    return signalrHub
}

export default useHub