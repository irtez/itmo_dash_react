import React from 'react';
// import Header from './header/Header';
// import Footer from './footer/Footer';

// const headerData = {
//     nav : [
//         {'link' : "/cars", 'text' : "Автомобили в наличии"},
//         {'link' : "/service", 'text' : "Сервис"},
//         {'link' : "/about", 'text' : "Наши контакты"}
//     ]
//   };

const Layout = ({ children }) => {
  return (
    <>
      {/* <Header data={headerData}/> */}
      {/* <Header/> */}
          {children}
      {/* <Footer /> */}
      
    </>
  );
};

export default Layout;