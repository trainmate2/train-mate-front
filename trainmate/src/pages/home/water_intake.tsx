import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, IconButton, Button, Typography, CircularProgress, Box } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { BASE_URL } from '../../constants';
import LoadingButton from '../../personalizedComponents/buttons/LoadingButton';

const token = localStorage.getItem("token"); // Reemplaza con el token real

const formatDateToYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const WaterIntakeCard: React.FC = () => {
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<string>(formatDateToYYYYMMDD(new Date())); // Use formatted date
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingRemove, setLoadingRemove] = useState(false);
  const dailyGoal = 4000; // 4 litros en mililitros

  // Función para obtener la ingesta diaria de agua del backend
  const fetchDailyWaterIntake = async () => {
    try {
      const startDate = currentDate;
      const endDate = currentDate;

      const response = await fetch(`${BASE_URL}/api/water-intake/get-water-intake-history?start_date=${startDate}&end_date=${endDate}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data.water_intake_history.length > 0) {
        setWaterIntake(data.water_intake_history[0].quantity_in_militers || 0);
      } else {
        setWaterIntake(0); // Si no hay ingesta registrada para el día, se muestra 0
      }
    } catch (error) {
      console.error('Error al obtener la ingesta diaria de agua', error);
    }
  };

  const addWater = async () => {
    setLoadingAdd(true);
    try {
      const response = await fetch(`${BASE_URL}/api/water-intake/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity_in_militers: 150, date: currentDate })  // Send formatted date
      });
      if (response.ok) {
        setWaterIntake(prevIntake => prevIntake + 150);
      }
    } catch (error) {
      console.error('Error al agregar ingesta de agua', error);
    } finally {
      setLoadingAdd(false);
    }
  };

  // Función para remover ingesta de agua (150ml)
  const removeWater = async () => {
    setLoadingRemove(true);
    try {
      if (waterIntake >= 150) {
        const response = await fetch(`${BASE_URL}/api/water-intake/add`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ quantity_in_militers: -150, date: currentDate })  // Send formatted date
        });
        if (response.ok) {
          setWaterIntake(prevIntake => Math.max(prevIntake - 150, 0));
        }
      }
    } catch (error) {
      console.error('Error al remover ingesta de agua', error);
    } finally {
      setLoadingRemove(false);
    }
  };

  const handlePrevDay = () => {
    const [year, month, day] = currentDate.split('-').map(Number);
    const prevDate = new Date(year, month - 1, day - 1); // JavaScript months are 0-indexed
    setCurrentDate(formatDateToYYYYMMDD(prevDate)); // Update with formatted date
  };

  // Navigate to next day
  const handleNextDay = () => {
    const [year, month, day] = currentDate.split('-').map(Number);
    const nextDate = new Date(year, month - 1, day + 1); // JavaScript months are 0-indexed
    setCurrentDate(formatDateToYYYYMMDD(nextDate)); // Update with formatted date
  };

  // Fetch water intake when the date changes
  useEffect(() => {
    fetchDailyWaterIntake();
  }, [currentDate]);

  const intakePercentage = Math.min((waterIntake / dailyGoal) * 100, 100); // porcentaje para la barra de progreso

  return (
    <Card sx={{ flex: 1, backgroundColor: '#161616', color: '#fff', width: '100%' }} className='border border-gray-600'>
      <CardHeader title="Water Tracker" />
      <CardContent className="flex flex-col gap-6">
        <div className="flex justify-between items-center mb-4">
          <IconButton onClick={handlePrevDay}>
            <ArrowBackIcon style={{ color: '#fff' }} />
          </IconButton>
          <Typography variant="h6">
            {currentDate}
          </Typography>
          <IconButton onClick={handleNextDay}>
            <ArrowForwardIcon style={{ color: '#fff' }} />
          </IconButton>
        </div>

        <Box className="flex justify-center mb-4">
          <Box position="relative" display="inline-flex">
            <CircularProgress
              variant="determinate"
              value={intakePercentage}
              size={150}
              thickness={4}
              style={{ color: '#0E87CC' }}
            />
            <Box
              top={0}
              left={0}
              bottom={0}
              right={0}
              position="absolute"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="h6" component="div" color="textPrimary">
                {Math.round(intakePercentage)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {waterIntake}ml
              </Typography>
            </Box>
          </Box>
        </Box>

        <div className="flex justify-center space-x-4">
          {/* Button with loading spinner */}
          <LoadingButton
            isLoading={loadingRemove}
            onClick={removeWater}
            label="Remove 150ml"
            icon={<RemoveIcon />}
            borderColor="border-red-600"
            borderWidth="border"
            bgColor="bg-transparent"
            color="text-red-500"
          />
         <LoadingButton
            isLoading={loadingAdd}
            onClick={addWater}
            label="Add 150ml"
            icon={<AddIcon />}
            borderColor="border-green-600"
            borderWidth="border"
            bgColor="bg-transparent"
            color="text-green-500"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterIntakeCard;
