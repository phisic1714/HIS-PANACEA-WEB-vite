import { useEffect, useState, useRef } from "react"
import { GetSignalrHub } from './GetSignalrHub'

const useSignalrHub = (path, accessToken = null) => {
    const [signalrHub, setSignalrHub] = useState(null)
    const signalrHubRef = useRef()

    const connectSignalr = async () => {
        const newVitalSignHub = await GetSignalrHub(path, accessToken)
        signalrHubRef.current = newVitalSignHub
        setSignalrHub(newVitalSignHub)
    }

    useEffect(() => {
        if (path) {
            connectSignalr()
        }

        return () => {
            if (signalrHubRef.current?.connection?.connectionState === 'Connected') {
                signalrHubRef.current?.stop()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path])

    return signalrHub
}

export default useSignalrHub