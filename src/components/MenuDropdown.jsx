import { useNavigate } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";

const MenuDropdown = (props) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('app-store');
    navigate('/');
  };

  return (
    <div id="btn-exit-content" className="d-flex justify-content-end p-3">
      <div className="dropdown">
        <button
          className="btn btn-first dropdown-toggle"
          type="button"
          id="dropdownMenuButton1"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <CgProfile style={{width: 50, height: 35, padding: '0.5rem'}} />
          <span className='px-1'>Menu</span>
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
          <li>
            <a className="dropdown-item text-center" href="/atualizar/senha">Atualizar senha</a>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="text-center btn btn-sm text-uppercase dropdown-item"
            >
              <span>Sair</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MenuDropdown;
