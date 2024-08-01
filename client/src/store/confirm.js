import { makeAutoObservable } from "mobx"

class Confirm {
    confirmed = false
    constructor () {
        makeAutoObservable(this)
    }

    change() {
        this.confirmed = !this.confirmed
    }
}

export default new Confirm()