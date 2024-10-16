import React, { useState, useEffect } from 'react';
import { Box, Typography, Drawer, Divider, IconButton } from '@mui/material';
import { grey, red } from '@mui/material/colors';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getWorkouts } from '../../api/WorkoutsApi';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import CloseIcon from '@mui/icons-material/Close';
dayjs.extend(isSameOrAfter);

interface DrawerProps {
  showDrawer: () => void;
  onClose: () => void;
  open: boolean;
}

const CalendarModal: React.FC<DrawerProps> = ({ showDrawer, onClose, open }) => {
  interface Event {
    name: string;
    date: string;
    duration: number;
    calories: number;
  }

  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs(),
    dayjs(),
  ]);
  const [loading, setLoading] = useState(false);

  const today = dayjs();

  const handleDateChange = async (dates: [Dayjs | null, Dayjs | null]) => {
    const [start, end] = dates;
    setDateRange([start, end]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      const workouts = await getWorkouts(
        token,
        start ? start.format('YYYY-MM-DD') : undefined,
        end ? end.format('YYYY-MM-DD') : undefined
      );

      const filteredEvents = workouts.map((workout: any) => ({
        name: workout.training.name,
        date: workout.date,
        duration: workout.duration,
        calories: workout.total_calories,
      }));

      const sortedEvents: Event[] = filteredEvents.sort((a: Event, b: Event) =>
        dayjs(b.date).diff(dayjs(a.date))
      );

      setSelectedEvents(sortedEvents);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setSelectedEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      handleDateChange(dateRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 400,
          padding: 2,
          backgroundColor: grey[900],
          color: grey[50],
          height: '100%',
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            left: 8, // Position at top left
            color: grey[50],
          }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            marginTop: 4,
            marginBottom: 2,
            color: grey[50],
            textAlign: 'center',
          }}
        >
          Selected Events
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DatePicker
              label="Start Date"
              value={dateRange[0]}
              onChange={(newValue) => handleDateChange([newValue, dateRange[1]])}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                  sx: {
                    backgroundColor: grey[800],
                    color: grey[50],
                    borderRadius: '8px',
                    label: { color: grey[400], fontWeight: 'bold' },
                    input: { color: '#fff' },
                  },
                },
              }}
            />
            <DatePicker
              label="End Date"
              value={dateRange[1]}
              onChange={(newValue) => handleDateChange([dateRange[0], newValue])}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                  sx: {
                    backgroundColor: grey[800],
                    color: grey[50],
                    borderRadius: '8px',
                    label: { color: grey[400], fontWeight: 'bold' },
                    input: { color: '#fff' },
                  },
                },
              }}
            />
          </Box>
        </LocalizationProvider>

        <Divider sx={{ marginY: 2, backgroundColor: grey[700] }} />

        <Box sx={{ maxHeight: '85vh', overflowY: 'auto' }}>
          {loading ? (
            <Typography sx={{ color: grey[400], textAlign: 'center' }}>
              Loading events...
            </Typography>
          ) : selectedEvents.length > 0 ? (
            <>
              <Divider sx={{ marginY: 2, backgroundColor: grey[600] }}>
                <Typography sx={{ color: grey[50], textAlign: 'center' }}>
                  Planned Workouts
                </Typography>
              </Divider>
              {selectedEvents
                .filter((event) => dayjs(event.date).isSameOrAfter(today))
                .map((event: Event) => (
                  <Box
                    key={event.date}
                    sx={{
                      marginBottom: 2,
                      backgroundColor: grey[800],
                      padding: 2,
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: 1, // Bright for future dates
                    }}
                  >
                    <Box>
                      <Typography sx={{ color: '#81d8d0', fontWeight: 'bold' }}>
                        {`${event.name} - ${dayjs(event.date).format('DD/MM/YYYY')}`}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#44f814' }}>
                        {`Duration: ${event.duration} min`}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        color: red[400],
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                      }}
                    >
                      {`${event.calories} kcal`}
                    </Typography>
                  </Box>
                ))}

              <Divider sx={{ marginY: 2, backgroundColor: grey[600] }}>
                <Typography sx={{ color: grey[50], textAlign: 'center' }}>
                  Past Workouts
                </Typography>
              </Divider>

              {selectedEvents
                .filter((event) => dayjs(event.date).isBefore(today))
                .map((event: Event) => (
                  <Box
                    key={event.date}
                    sx={{
                      marginBottom: 2,
                      backgroundColor: grey[800],
                      padding: 2,
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: 0.5,
                    }}
                  >
                    <Box>
                      <Typography sx={{ color: '#81d8d0', fontWeight: 'bold' }}>
                        {`${event.name} - ${dayjs(event.date).format('DD/MM/YYYY')}`}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#44f814' }}>
                        {`Duration: ${event.duration} min`}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        color: red[400],
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                      }}
                    >
                      {`${event.calories} kcal`}
                    </Typography>
                  </Box>
                ))}
            </>
          ) : (
            <Typography sx={{ color: grey[400], textAlign: 'center' }}>
              No events for the selected date range
            </Typography>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default CalendarModal;