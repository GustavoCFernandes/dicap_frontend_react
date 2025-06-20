import { useNavigate } from 'react-router-dom';

const ButtonExitTeacherLogin = (props) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token-teacher-login');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('app-store');
    navigate('/login/professor');
  };

  return (
    <div id="btn-exit-content" className="d-flex justify-content-end p-3">
            <button
              onClick={handleLogout}
              className="text-center btn btn-sm text-uppercase dropdown-item"
            >
              <span>Sair</span>
            </button>
    </div>
  );
};

export default ButtonExitTeacherLogin;
