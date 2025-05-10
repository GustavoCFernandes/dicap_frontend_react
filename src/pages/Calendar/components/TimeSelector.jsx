import { DateTime } from 'luxon';

const TimeSelector = ({
  selectedDate,
  onChange,
  label,
  isShowData = false,
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 30];

  const currentValue = DateTime.fromISO(selectedDate);

  return (
    <div className='d-flex flex-column align-items-start my-4'>
      <label className='mb-1 mx-auto'>{label}</label>

      {isShowData && (
        <div className='mx-auto my-1'>
          <input
            type='date'
            value={currentValue.toFormat('yyyy-MM-dd')}
            onChange={(e) => {
              const newDate = DateTime.fromISO(e.target.value).set({
                hour: currentValue.hour,
                minute: currentValue.minute,
              });
              onChange(newDate.toFormat("yyyy-MM-dd'T'HH:mm"));
            }}
            className='form-control'
          />
        </div>
      )}

      <div className='d-flex mx-auto gap-2 mt-2'>
        <select
          value={currentValue.hour}
          onChange={(e) => {
            const newDate = currentValue.set({
              hour: parseInt(e.target.value),
            });
            onChange(newDate.toFormat("yyyy-MM-dd'T'HH:mm"));
          }}
          className='form-select'
        >
          {hours.map((hour) => (
            <option key={hour} value={hour}>
              {hour.toString().padStart(2, '0')}
            </option>
          ))}
        </select>

        <select
          value={currentValue.minute}
          onChange={(e) => {
            const newDate = currentValue.set({
              minute: parseInt(e.target.value),
            });
            onChange(newDate.toFormat("yyyy-MM-dd'T'HH:mm"));
          }}
          className='form-select'
        >
          {minutes.map((minute) => (
            <option key={minute} value={minute}>
              {minute.toString().padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TimeSelector;
