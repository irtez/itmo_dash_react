import { Routes, Route } from 'react-router-dom'
import NotFound from '../sections/404/NotFound';
import Dashboard from '../sections/Dashboard/Dashboard';
// import { AppContext } from './AppContext.js'
// import { useContext } from 'react'
import { observer } from 'mobx-react-lite';


const publicRoutes = [
    {path: '/', Component: Dashboard}
]


const AppRouter = observer(() => {
    // const {user} = useContext(AppContext)
    return (
        
        <Routes>
            {publicRoutes.map(({path, Component}) =>
                <Route key={path} path={path} element={<Component/>} />
            )}
            <Route path='/*' element={<NotFound/>} />
        </Routes>
    )
})

export default AppRouter;