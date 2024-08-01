import React from 'react'
import UserStore from '../store/UserStore'

const AppContext = React.createContext()

const context = {
    user: new UserStore()
}

const AppContextProvider = (props) => {
    return (
        <AppContext.Provider value={context}>
            {props.children}
        </AppContext.Provider>
    );
}

export {AppContext, AppContextProvider}