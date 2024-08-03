import axios from 'axios'

const serverUrl = 'https://itmodash.ru/api' // http://localhost:5555/api

const guestInstance = axios.create({
    baseURL: serverUrl 
})

const authInstance = axios.create({
    baseURL: serverUrl
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