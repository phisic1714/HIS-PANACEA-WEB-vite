import VitalSignHub from './VitalSignHub'

export const GetSignalrHub = async (pathName, accessToken = null) => {
    try {
        const connectionHub = new VitalSignHub(pathName, accessToken)
        return connectionHub
    } catch (error) {
        return null
    }
}