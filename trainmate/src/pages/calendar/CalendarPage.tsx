import React, { useState, useEffect } from 'react';
import { Button, Drawer, DatePicker, List, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { IconButton } from '@mui/material';
import { grey } from '@mui/material/colors';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { getWorkouts } from '../../api/WorkoutsApi';

const { RangePicker } = DatePicker;

const CalendarModal = () => {
  const [visible, setVisible] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([dayjs(), dayjs()]);
  const [loading, setLoading] = useState(false);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const handleDateChange = async (dates: any) => {
    if (dates) {
      const [start, end] = dates;
      setDateRange([start, end]);
      setLoading(true);

      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado');
        
        const workouts = await getWorkouts(
          token,
          start ? dayjs(start).format('YYYY-MM-DD') : undefined,
          end ? dayjs(end).format('YYYY-MM-DD') : undefined
        );

        const filteredEvents = workouts.map((workout: any) => ({
          name: workout.exercise,
          date: workout.date,
          duration: workout.duration,
        }));
        setSelectedEvents(filteredEvents);
      } catch (error) {
        console.error('Error fetching workouts:', error);
        setSelectedEvents([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSelectedEvents([]);
    }
  };

  useEffect(() => {
    // Si no se seleccionó ningún rango, usamos la fecha de hoy como predeterminado.
    if (!dateRange[0] || !dateRange[1]) {
      handleDateChange([dayjs(), dayjs()]);
    }
  }, [visible]);

  return (
    <>
      <IconButton aria-label="add" onClick={showDrawer}>
        <CalendarMonthIcon sx={{ color: grey[50], fontSize: 40 }} className="h-24 w-24" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p className='p-3 text-white'>See Agenda</p>
        </div>
      </IconButton>

      <Drawer
        title="Selected events"
        placement="right"
        onClose={onClose}
        visible={visible}
        width={400}
      >
        <RangePicker
          onChange={handleDateChange}
          format="DD-MM-YYYY"
          style={{ marginBottom: 20 }}
          value={dateRange}
        />

        {loading ? (
          <Typography.Text>Loading events...</Typography.Text>
        ) : (
          <List
            dataSource={selectedEvents}
            renderItem={(item: any) => (
              <List.Item>
                <Typography.Text>{`${item.name} - ${dayjs(item.date).format('DD-MM-YYYY')} - ${item.duration} min`}</Typography.Text>
              </List.Item>
            )}
          />
        )}

        {selectedEvents.length === 0 && !loading && (
          <Typography.Text type="secondary">There are no events for the date range selected</Typography.Text>
        )}
      </Drawer>
    </>
  );
};

export default CalendarModal;
