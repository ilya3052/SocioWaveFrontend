import {Navigate, Outlet, Route, Routes, useLocation} from 'react-router-dom';

import LoginForm from './features/auth/login/pages/Login.jsx';
import ProfileSection from './features/profile/pages/ProfileSection.jsx';
import RegistrationForm from "./features/auth/registration/pages/Registration.jsx";
import Header from "./components/header/Header.jsx";
import HeaderAdmin from "./components/headerAdmin/HeaderAdmin.jsx";
import Footer from "./components/footer/Footer.jsx";
import EmailActivation from "./features/auth/emailActivate/pages/EmailActivation.jsx";
import AddGroup from "./features/groups/pages/addGroup/addGroup.jsx";
import AdminPage from "./features/admin/pages/AdminPage.jsx";

import {useUser} from "./context/UserContext.jsx";
import AddAccountPage from "./features/serviceAccounts/pages/AddAccount/addAccount.jsx";
import ServiceAccounts from "./features/serviceAccounts/pages/ServiceAccounts/ServiceAccounts.jsx";
import SummaryInfo from "./features/groups/pages/summaryInfo/summary.jsx";
import DetailInfo from "./features/groups/pages/detailInfo/detailInfo.jsx";

import {useMemo} from "react";
import CompareGroups from "./features/groups/pages/compare/compareGroups.jsx";
import ReportsPage from "./features/reports/pages/reportsPage/ReportsPage.jsx";

// --- Auth hook ---
const useAuthData = () => {
    const {user, loading} = useUser();
    return useMemo(() => ({user, loading, isStaff: user?.is_staff || false}), [user, loading]);
};

// --- Guards ---

const ProtectedLayout = () => {
    const {user, loading} = useAuthData();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace/>;
    }

    return <Outlet/>;
};

const AdminRoute = () => {
    const {user, isStaff} = useAuthData();

    if (!isStaff) {
        return <Navigate to="/groups" replace/>;
    }

    return <Outlet/>;
};

const UserRoute = () => {
    const {isStaff} = useAuthData();

    if (isStaff) {
        return <Navigate to="/admin_panel" replace/>;
    }

    return <Outlet/>;
};

const RoleRedirect = () => {
    const {user, loading, isStaff} = useAuthData();

    if (loading) {
        return <div>Loading...</div>;
    }

    return isStaff
        ? <Navigate to="/admin_panel" replace/>
        : <Navigate to="/groups" replace/>;
};

const App = () => {
    const location = useLocation();
    const {user, loading, isStaff} = useAuthData();

    const isAuthPage =
        location.pathname === "/login" ||
        location.pathname === "/registration";

    return (
        <div className="app">
            {!isAuthPage && !loading && (isStaff ? <HeaderAdmin/> : <Header/>)}

            <main className="main">
                <Routes>

                    {/* Public */}
                    <Route path="/login" element={<LoginForm/>}/>
                    <Route path="/registration" element={<RegistrationForm/>}/>

                    {/* Protected */}
                    <Route element={<ProtectedLayout/>}>

                        <Route path="/" element={<RoleRedirect/>}/>

                        {/* USER ONLY */}
                        <Route element={<UserRoute/>}>
                            <Route path="/groups" element={<SummaryInfo/>}/>
                            <Route path="/groups/:slug" element={<DetailInfo/>}/>
                            <Route path="/profile" element={<ProfileSection/>}/>
                            <Route path="/profile/groups/add" element={<AddGroup/>}/>
                            <Route path="/compare" element={<CompareGroups/>}/>
                            <Route path="/reports" element={<ReportsPage/>}/>
                        </Route>

                        {/* ADMIN ONLY */}
                        <Route element={<AdminRoute/>}>
                            <Route path="/admin_panel" element={<AdminPage/>}/>
                            <Route path="/admin_panel/service_accounts" element={<ServiceAccounts/>}/>
                            <Route path="/admin_panel/service_accounts/add" element={<AddAccountPage/>}/>
                        </Route>

                        <Route path="/email/activate" element={<EmailActivation/>}/>

                    </Route>

                </Routes>
            </main>

            {!isAuthPage && <Footer/>}
        </div>
    );
};

export default App;