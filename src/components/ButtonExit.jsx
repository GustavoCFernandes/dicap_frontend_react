import { useNavigate } from 'react-router-dom';

const ButtonExit = (props) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('app-store');
    navigate('/');
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

export default ButtonExit;
