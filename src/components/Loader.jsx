import '../styles/loader.css';

const Loader = (props) => {
  return (
    <div className='content-loader'>
      <div className='loader-text'>
        <div className='loader'></div>
        <p>
          <strong>Carregando informações, aguarde um momento...</strong>
        </p>
      </div>
    </div>
  );
};

export default Loader;
