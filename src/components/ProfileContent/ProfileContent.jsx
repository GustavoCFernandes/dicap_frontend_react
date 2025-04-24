/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import {
  callMsGraph,
  generetedAccessTokenGraphToBakend,
} from '../../services/graph';
import ProfileData from '../../components/ProfileData';
import '../../styles/App.css';

const ProfileContent = () => {
  const [graphData, setGraphData] = useState(null);

  function RequestProfileData() {
    generetedAccessTokenGraphToBakend()
      .then((response) => {
        localStorage.setItem('accessToken', response.accessToken);
        callMsGraph(
          response.accessToken,
          process.env.REACT_APP_TEACHER_ID_1
        ).then((response) => {
          setGraphData(response);
        });
      })
      .catch((error) => {
        console.error('Erro ao obter token:', error);
      });
  }

  useEffect(() => {
    RequestProfileData();
  }, []);

  return (
    <>
      {graphData ? (
        <ProfileData graphData={graphData} />
      ) : (
        <p>Carregando informações do Professor...</p>
      )}
    </>
  );
};

export default ProfileContent;
