import Hub from './Hub'

export const GetHub = async (pathName) => {
    try {
        const connectionHub = new Hub(pathName)
        return connectionHub
    } catch (error) {
        return null
    }
}