import React from 'react';
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { AppContext } from '../../routes/AppContext';
import { useNavigate } from 'react-router-dom'
import { logout } from '../../http/metricAPI';
//import './Header.css'
import classes from './Header.module.css'

const Header = observer((props) => {
    const {user} = useContext(AppContext)
    const navigate = useNavigate()
    const handleLogOut = (event) => {
        logout()
        user.logout()
        navigate('/login', {replace: true})
    }
    return(
            <header>
                <div className={classes['header-title']}>
                    <Link to='/' className={classes['header-logo']}></Link>
                    <Link to='/' className={classes['header-title-text']}>Семантический поиск нормативных документов РФ</Link>
                </div>
                <div className={classes['header-search-auth']}>
                    <div className={classes['header-search']}>
                        {
                            user.isAdmin ? (
                                <>
                                <Link to='/admin'>Админ-панель</Link>
                                </>
                            ) : (
                                <>
                                </>
                            )
                        }
                        <Link to='/'>Поиск</Link>
                    </div>
                    
                    <div className={classes['header-auth']}>
                        {user.isAuth ? (
                            <>
                            <Link className={classes['header-auth-myprofile']} to='/user'>Личный кабинет</Link>
                            <Link className={classes['header-auth-logout']} to='/login' onClick={handleLogOut}>Выйти</Link>
                            </>
                            
                        ) : (
                            <>
                            <Link className={classes['header-auth-login']} to='/login'>Войти</Link>
                            <Link className={classes['header-auth-register']} to='/register'>Зарегистрироваться</Link>
                            </>
                        )}
                    </div>
                </div>
            </header>
            
            
    
    );
})

// <div>
//     <div className="header-dark">
//         <nav className="navbar navbar-dark navbar-expand-lg">
//             <div className="container">
//                 <Link className="navbar-brand" to='/'>German Autopoint</Link>
//                 <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navcol-1">
//                     <span className="navbar-toggler-icon"></span>
//                 </button>
//                 <div className="collapse navbar-collapse" id="navcol-1">
//                     <div className="nav navbar-nav">
//                         <li className="nav-item" role="presentation"><Link className="nav-link" to='/cars'>Автомобили</Link></li>
//                         <li className="nav-item" role="presentation"><Link className="nav-link" to='/service'>Сервис</Link></li>
//                         <li className="nav-item" role="presentation"><Link className="nav-link" to='/about'>Контакты</Link></li>
//                         {user.isAdmin ? (
//                             <li className="nav-item-abs" role="presentation"><Link className="nav-link" to='/admin'>Админ-панель</Link></li>
//                         ) : ("")}
//                         </div>
//                     <form className="form-inline mr-auto" target="_self">
//                         {/* <div className="form-group">
//                             <label htmlFor="search-field"></label>
//                             <input className="form-control search-field" type="search" name="search" id="search-field"/>
//                         </div> */}
//                         </form>
//                         {user.isAuth ? (
//                             <>
//                             <span className="navbar-text"><Link className='login' to='/user'>Мой профиль</Link></span>
//                             <Link className="btn btn-light action-button" to='/login' onClick={handleLogOut}>Выйти</Link>
//                             </>
                            
//                         ) : (
//                             <>
//                             <span className="navbar-text"><Link className='login' to='/login'>Войти</Link></span>
//                             <Link className="btn btn-light action-button" to='/register'>Зарегистрироваться</Link>
//                             </>
//                         )}
                        
//                 </div>
//             </div>
//         </nav>
        
//     </div>

//     </div>




// const UpperDiv = observer(() => {
//     const {user} = useContext(AppContext)
//     const navigate = useNavigate()
//     const handleLogOut = (event) => {
//         logout()
//         user.logout()
//         navigate('/login', {replace: true})
//     }
//     return (
//         <div className={classes.headerblock}>
//             <div className={classes.addresscontainer}>
//                 <div className={classes.namecontainer}>
//                     <p className={classes.ofname}>German Autopoint</p>
//                     <p>Дилерский центр</p>
//                 </div>
//                 <div className={classes.addresswrapper}>
//                     <p>г. Москва, проспект Вернадского, 78</p>
//                 </div>
//             </div>
//             <div className={classes.contactinfo}>
//                 <p className={classes.phonetext}><a href="tel:+79871234567"><b>+7 (987) 123-45-67</b></a></p>
//                 <p>Ежедневно с 7.30 до 21.00</p>
//             </div>
//             <div className={classes.logincontainer}>
//                 <CheckAuth>
//                     <div className={classes.loginbutton}>
//                         {user.isAuth ? (
//                             <>
//                             <Link to='/user'>Мой профиль</Link>
//                             <button onClick={handleLogOut}>Выйти</button>
//                             </>
//                         ) : (
//                             <Link to='/login'>Войти</Link>
//                         )}
//                     </div>
//                 </CheckAuth>
//             </div>
//         </div>
//     )
// })

// const Nav = observer((props) => {
//     const {user} = useContext(AppContext)
//     let data = props.nav;   
//     const listItem = data.map( item => <Link to={item.link}>{item.text}</Link> )
//     return(
//         <nav>
//             {listItem}
//             {user.isAdmin && (
//                 <Link to='/admin'>Админ-панель</Link>
//             )}
//         </nav>
//     )
// })

/*const Button = observer(() =>  {
    return (
        <section id={classes.main}>
            <p><input type="checkbox" id={classes.confirm} onChange={() => confirm.change()}></input>I have read and understand the agreement.</p>
            <button disabled={!confirm.confirmed} onClick={() => alert('text')}>Continue</button>
        </section>
    );
})*/





export default Header;