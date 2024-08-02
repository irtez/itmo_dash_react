import axios from 'axios'

const guestInstance = axios.create({
    baseURL: 'http://85.159.231.202/api'
})

const authInstance = axios.create({
    baseURL: 'http://85.159.231.202/api'
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