/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import {
  callMsGraph,
  generetedAccessTokenGraphToBakend,
} from '../../services/graph';
import ProfileData from '../../components/ProfileData';
import '../../styles/App.css';
import { useStore } from '../../stores/index';
import Loader from '../../components/Loader';

const ProfileContent = () => {
  const [graphData, setGraphData] = useState(null);
  const { teacherId, setLoading } = useStore();

  function RequestProfileData() {
    setLoading(true);
    generetedAccessTokenGraphToBakend()
      .then((response) => {
        localStorage.setItem('accessToken', response.accessToken);
        callMsGraph(response.accessToken, teacherId).then((response) => {
          setGraphData(response);
          setLoading(false);
        });
      })
      .catch((error) => {
        console.error('Erro ao obter token:', error);
      });
  }

  useEffect(() => {
    RequestProfileData();
  }, []);

  return <>{graphData ? <ProfileData graphData={graphData} /> : <Loader />}</>;
};

export default ProfileContent;
