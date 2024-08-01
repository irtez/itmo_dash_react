import { makeAutoObservable } from 'mobx'

class UserStore {
    id = null
    email = null
    isAuth = false
    isAdmin = false

    constructor() {
        makeAutoObservable(this)
    }

    login({id, email, roles}) {
        this.id = id
        this.email = email
        this.isAuth = true
        this.isAdmin = roles.indexOf('ADMIN') !== -1
    }

    logout() {
        this.id = null
        this.email = null
        this.isAuth = false
        this.isAdmin = false
    }
}

export default UserStore