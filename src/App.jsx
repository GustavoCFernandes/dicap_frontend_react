import React from 'react';
import './styles/App.css';
import PageLayout from './components/PageLayout';
import ChoiceTeacher from './components/ChoiceTeacher';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import ProfileContent from './components/ProfileContent/ProfileContent';
import { ProtectedRoute } from './components/ProtectedRoute';
import Loader from './components/Loader';
//import SignGenerateToken from './components/SignAdmin/SignGenereteToken';
import { useStore } from './stores/index';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Login />} />

      {/* Rotas protegidas */}
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
