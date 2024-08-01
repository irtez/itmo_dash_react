import axios from 'axios'

const guestInstance = axios.create({
    baseURL: 'http://dashitmo.ru/api'
})

const authInstance = axios.create({
    baseURL: 'http://dashitmo.ru/api'
})


const authInterceptor = (config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.authorization = 'Bearer ' + localStorage.getItem('token')
    }
    return config
}
authInstance.interceptors.request.use(authInterceptor)

export {
    guestInstance,
    authInstance
}