// eslint-disable-next-line
import { guestInstance, authInstance } from './axios'

export const getMetrics = async () => {
    try {
        const response = await guestInstance.get('api/metrics')
        return response.data
    } catch (e) {
        alert(e.response.data.message)
        return false
    }
}
