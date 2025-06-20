//import SignGenerateToken from './components/SignAdmin/SignGenereteToken';
import React from 'react';
import './styles/App.css';
import PageLayout from './components/PageLayout';
import UpdatePassword from './pages/UpdatePassword/UpdatePassword';
import ChoiceTeacher from './components/ChoiceTeacher';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import LoginTeachers from './pages/LoginTeachers/LoginTeachers';
import ProfileContent from './components/ProfileContent/ProfileContent';
import { ProtectedRoute } from './components/ProtectedRoute';
import Loader from './components/Loader';
import { useStore } from './stores/index';
import NotFound from './pages/NotFound';
import CalendarTeacher from './pages/CalendarTeacher/CalendarTeacher.tsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/login/professor' element={<LoginTeachers />} />
      <Route path='/agenda/professor/privado' element={<CalendarTeacher />} />
      <Route path='*' element={<NotFound />} />

      <Route
        path='/escolha/professor'
        element={
          <ProtectedRoute>
            <ChoiceTeacher />
          </ProtectedRoute>
        }
      />
      <Route
        path='/agenda'
        element={
          <ProtectedRoute>
            <ProfileContent />
          </ProtectedRoute>
        }
      />

      <Route
        path='/atualizar/senha'
        element={
          <ProtectedRoute>
            <UpdatePassword />
          </ProtectedRoute>
        }
      />

      <Route
        path='/atualizar/senha/email'
        element={
            <UpdatePassword toEmail="true" />
        }
      />
    </Routes>
  );
};

const MainContent = () => {
  const { isLoading } = useStore();

  return (
    <div className='App'>
      {isLoading && <Loader />}
      <AppRoutes />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <PageLayout>
        <MainContent />
      </PageLayout>
    </Router>
  );
}
