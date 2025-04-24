import React from 'react';
import { useNavigate } from 'react-router-dom';
import BtnExit from '../components/BtnExit';
import { useStore } from '../stores/index';
import { listTeachers } from '../services/teachers';
import { useEffect, useState } from 'react';

const ChoiceTeacher = () => {
  const navigate = useNavigate();
  const { setLoading, setTeacherId } = useStore();
  const [teachers, setTeachers] = useState([]);

  const handleCardClick = (teacherId) => {
    setTeacherId(teacherId);
    navigate('/agenda');
    setLoading(true);
  };

  useEffect(() => {
    setLoading(false);

    const fetchTeachers = async () => {
      try {
        const list = await listTeachers();
        setTeachers(list.data);
      } catch (error) {
        console.error('Erro ao buscar professores:', error);
      }
    };

    fetchTeachers();
  }, [setLoading]);

  return (
    <div>
      <div>
        <BtnExit />
      </div>
      <div id='card-teacher-content'>
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            class='card'
            style={{ width: '200px', height: '250px' }}
          >
            <div
              className='cursor-pointer'
              onClick={() => handleCardClick(teacher.id)}
              style={{ cursor: 'pointer' }}
            >
              <div class='card-body'>
                <div className='p-3'>
                  <img
                    src='/imgs/icons_teachers/ensino.png'
                    class='card-img-top'
                    alt='Icone'
                    style={{ width: '90px', height: '90px' }}
                  ></img>
                </div>
                <small className='pb-3'>agendar aula com professor(a):</small>
                <h5>{teacher.name}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChoiceTeacher;
