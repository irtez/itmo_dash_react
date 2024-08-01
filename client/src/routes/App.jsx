import './App.css';
import {BrowserRouter} from "react-router-dom";
import Layout from '../subcomponents/Layout';
import AppRouter from './AppRouter';
import { AppContextProvider } from './AppContext.js';



function App() {
  return (
    <BrowserRouter>
      <AppContextProvider>
          <Layout>
              <AppRouter/>
          </Layout>
      </AppContextProvider>
    </BrowserRouter>
          
  );
}




export default App;
