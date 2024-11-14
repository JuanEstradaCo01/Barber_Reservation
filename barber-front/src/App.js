import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainView from "./components/mainView/MainView.jsx"
import RegisterView from './components/registerView/RegisterView.jsx';
import Header from "./components/navBar/Header.jsx"
import UserProfile from './components/userProfile/UserProfile.jsx';
import NotFoundPage from './components/404/NotFoundPage.jsx';
import { Userprovider } from "./components/context/Context.jsx"
import RecoveryView from './components/recoveryView/RecoveryView.jsx';
import RecoveryPassword from './components/recoveryView/RecoveryPassword.jsx';
import Reserve from './components/reserve/Reserve.jsx';
import ReSchedule from './components/reSchedule/ReSchedule.jsx';

function App() {
    return (
        <>
            <Userprovider>
                <BrowserRouter>
                    <Header></Header>
                    <Routes>
                        <Route path="/" element={<MainView />} />
                        <Route path='/registro' element={<RegisterView />} />
                        <Route path='/usuario/:uid' element={<UserProfile />} />
                        <Route path='/recovery' element={<RecoveryView />} />
                        <Route path='/restablecer/:uid' element={<RecoveryPassword />} />
                        <Route path='/reservar/:uid' element={<Reserve />} />
                        <Route path='/reagendarturno/:uid' element={<ReSchedule />} />
                        <Route path='*' element={<NotFoundPage />} />
                    </Routes>
                </BrowserRouter>
            </Userprovider>
        </>
    );
}

export default App;