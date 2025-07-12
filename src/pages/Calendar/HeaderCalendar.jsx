import { convertPointsToHours } from '../../utils/convertPointsToHours.ts';
import { useStore } from '../../stores/index';

const HeaderCalendar = (props) => {
  const user = useStore((state) => state.user);

  return (
    <div
      id='btn-back-choice-techaer-content'
      className='d-flex justify-content-between mt-1 p-2 w-75 flex-wrap'
    >
      <div className='text-white mt-2 text-hide-sm'>
        <span className='px-2'>Horas restantes para agendamento:</span>
        <strong>{convertPointsToHours(user.points)}</strong>
      </div>
    </div>
  );
};

export default HeaderCalendar;
