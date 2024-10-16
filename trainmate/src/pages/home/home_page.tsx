import React, { useEffect, useMemo, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { grey } from '@mui/material/colors';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Brush, Rectangle } from 'recharts';
import Typography from '@mui/material/Typography';
import ScrollArea from '@mui/material/Box';
import { getWorkouts, saveWorkout, getWorkoutsCalories } from '../../api/WorkoutsApi';
import { calculate_calories_and_duration_per_day } from '../../functions/calculations';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import TopMiddleAlert from '../../personalizedComponents/TopMiddleAlert';
import { getCategories } from '../../api/CategoryApi';
import { getExerciseFromCategory } from '../../api/ExerciseApi';
import { getCoaches } from '../../api/CoachesApi_external';
import CalendarModal from '../calendar/CalendarPage';
import { FilterTrainingDialog } from './filter_training';
import { FilterExerciseDialog } from './filter_exercise';
import handleCategoryIcon from '../../personalizedComponents/handleCategoryIcon';
import { Divider } from '@mui/material';
import { top_exercises_done } from '../../functions/top_exercises_done';
import DynamicBarChart from './bars_graph';
import { getTrainings } from '../../api/TrainingApi';
import { FilterCoachDialog } from './filter_coach';
import WaterIntakeCard from './water_intake';
import ResponsiveMenu from './menu_responsive';

interface Workout {
  id: number;
  duration: number;
  date: string;
  total_calories: number;
  coach: string;
  training: Training;
  training_id: string;
}

interface Training {
  calories_per_hour_mean: number;
  exercises: Exercise[];
  name: string;
  owner: string;
}

interface Category {
  id: string;
  icon: string;
  name: string;
  owner: string;
  isCustom: boolean;
}

interface Exercise {
  id: string;
  calories_per_hour: number;
  category_id: string;
  name: string;
  owner: string;
  public: boolean;
  training_muscle: string;
}

interface CategoryWithExercises {
  id: string;
  icon: string,
  name: string;
  owner: string;
  isCustom: boolean;
  exercises: Exercise[];
}

interface ExerciseCount {
  exerciseId: string;
  name: string;
  count: number;
}

interface topCategoriesWithExercises {
  categoryId: string;
  categoryName: string;
  totalCount: number;
  exercises: ExerciseCount[];
}

interface Trainings {
  id: string;
  name: string;
  owner: string;
  calories_per_hour_mean: number;
  exercises: Exercise[];
}

export default function HomePage() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('month');
  const [open, setOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [workoutList, setWorkoutList] = useState<Workout[]>([]);
  const [caloriesPerDay, setCaloriesPerDay] = useState<{ [date: string]: [number, number] }>({});
  const [loading, setLoading] = useState(true);
  const [workoutsCount, setWorkoutsCount] = useState(0);
  const [openWorkoutAdding, setOpenWorkoutAdding] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [coaches, setCoaches] = useState([]);
  const [coachSelected, setCoachSelected] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDateOpen, setFilterDateOpen] = useState(false);
  const [filterTrainingOpen, setFilterTrainingOpen] = useState(false);
  const [filterCoachOpen, setFilterCoachOpen] = useState(false);
  const [filterExerciseOpen, setFilterExerciseOpen] = useState(false);
  const [selectedTrainingInFilter, setSelectedTrainingInFilter] = useState<Trainings | null>(null);
  const [selectedCoachInFilter, setSelectedCoachInFilter] = useState<string>('');
  const [selectedExerciseInFilter, setSelectedExerciseInFilter] = useState<Workout | null>(null);
  const [categoryWithExercises, setCategoryWithExercises] = useState<CategoryWithExercises[]>([]);
  const [topExercisesDone, setTopExercisesDone] = useState<topCategoriesWithExercises[]>([]);
  const [trainings, setTrainings] = useState<Trainings[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<Trainings | null>(null);

  const handleAvatarClick = () => {
    navigate('/profile');
  };

  const handleCategoriesClick = () => {
    navigate('/categories');
  }

  const getAllWorkouts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado');

      // Obtén la fecha actual (hoy) en formato YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      // Llama a getWorkouts solo con el endDate como hoy
      const workouts = await getWorkouts(token, undefined, today);
      return Array.isArray(workouts) ? workouts : [];
    } catch (error) {
      console.error('Error al obtener todos los entrenamientos:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const workouts_from_local_storage = JSON.parse(localStorage.getItem('workouts') || '[]');
        const calories_duration_per_day_from_local_storage = JSON.parse(localStorage.getItem('calories_duration_per_day') || '{}');
        if (workouts_from_local_storage.length > 0 && Object.keys(calories_duration_per_day_from_local_storage).length > 0) {
          console.log("Este es el largo:", workouts_from_local_storage.length);
          console.log("Este es el largo:", Object.keys(calories_duration_per_day_from_local_storage).length);
          setWorkoutList(workouts_from_local_storage);
          setCaloriesPerDay(calories_duration_per_day_from_local_storage);
          console.log('Workouts and calories per day loaded from local storage');
        }
        else {
          var workouts = await getAllWorkouts();
          // if (selectedCategoryInFilter) {
          //   const exercises = await getExerciseFromCategory(selectedCategoryInFilter.category_id);
          //   workouts = workouts.filter((workout) => exercises.find((exercise: Exercise) => exercise.exercise_id === workout.exercise_id));
          // }
          // if (selectedExerciseInFilter) {
          //   workouts = workouts.filter((workout) => workout.exercise === selectedExerciseInFilter.exercise);
          // }
          const validWorkouts = workouts.filter((workout: Workout) =>
            workout.duration && workout.date && workout.total_calories && workout.coach
          );
          // Sort the workouts by date (we convert the string to a Date object)
          const sortedWorkouts = validWorkouts.sort((a: Workout, b: Workout) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setWorkoutList(sortedWorkouts);
          const calories_duration_per_day = calculate_calories_and_duration_per_day(sortedWorkouts);
          setCaloriesPerDay(calories_duration_per_day);
          localStorage.setItem('workouts', JSON.stringify(sortedWorkouts));
          localStorage.setItem('calories_duration_per_day', JSON.stringify(calories_duration_per_day));
        }
      } catch (error) {
        console.error('Error al obtener los entrenamientos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [workoutsCount]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const formatDataForChart = () => {
    return Object.keys(caloriesPerDay)
      .map((date) => ({
        date: formatDate(date),
        timestamp: new Date(date).getTime(),
        Calories: caloriesPerDay[date][0],
        Minutes: caloriesPerDay[date][1],
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  const dataForChart = useMemo(() => formatDataForChart(), [caloriesPerDay]);

  const [newWorkout, setNewWorkout] = useState({
    training_id: '',
    duration: '',
    coach: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFilterOpen = () => {
    setFilterOpen(true);
  }

  const handleFilterClose = () => {
    setFilterOpen(false);
  }

  const handleFilterDateOpen = () => {
    setFilterDateOpen(true);
  }

  const handleFilterTrainingOpen = () => {
    setFilterTrainingOpen(true);
  }

  const handleFilterExerciseOpen = () => {
    setFilterExerciseOpen(true);
  }

  const handleFilterDateClose = () => {
    setFilterDateOpen(false);
  }


  const handleFilterTrainingClose = (selectedTraining: { id: string }) => {
    setFilterTrainingOpen(false);
    
    if (selectedTraining) {
      let allWorkoutsList = JSON.parse(localStorage.getItem('workouts') || '[]');

      if (selectedCoachInFilter) {
        allWorkoutsList = allWorkoutsList.filter((workout: Workout) => workout.coach === selectedCoachInFilter);
      }

      const filteredWorkouts = allWorkoutsList.filter((workout: Workout) => workout.training_id === selectedTraining?.id);
      
      if (filteredWorkouts.length === 0) {
        setWorkoutList([]);
        setCaloriesPerDay({});
      } else {
        const calories_duration_per_dayFiltered = calculate_calories_and_duration_per_day(filteredWorkouts);
        setWorkoutList(filteredWorkouts);
        setCaloriesPerDay(calories_duration_per_dayFiltered);
      }
    }
  };

  const handleFilterCoachClose = (selectedCoach: string) => {
    setFilterCoachOpen(false);

    if (selectedCoach) {
      let allWorkoutsList = JSON.parse(localStorage.getItem('workouts') || '[]');

      if (selectedTrainingInFilter) {
        allWorkoutsList = allWorkoutsList.filter((workout: Workout) => workout.training_id === selectedTrainingInFilter.id);
      }

      const filteredWorkouts = allWorkoutsList.filter((workout: Workout) => workout.coach === selectedCoach);

      if (filteredWorkouts.length === 0) {
        setWorkoutList([]);
        setCaloriesPerDay({});
      } else {
        const calories_duration_per_dayFiltered = calculate_calories_and_duration_per_day(filteredWorkouts);
        setWorkoutList(filteredWorkouts);
        setCaloriesPerDay(calories_duration_per_dayFiltered);
      }
    }
  };

  const handleCloseOfTrainingFilterLabel = () => {
    setSelectedTrainingInFilter(null);
    let allWorkoutsList = JSON.parse(localStorage.getItem('workouts') || '[]');

    if (selectedCoachInFilter) {
      const filteredWorkouts = allWorkoutsList.filter((workout: Workout) => workout.coach === selectedCoachInFilter);
      
      if (filteredWorkouts.length === 0) {
        setWorkoutList([]);
        setCaloriesPerDay({});
      } else {
        const calories_duration_per_dayFiltered = calculate_calories_and_duration_per_day(filteredWorkouts);
        setWorkoutList(filteredWorkouts);
        setCaloriesPerDay(calories_duration_per_dayFiltered);
      }
    } else {
      const calories_duration_per_dayList = JSON.parse(localStorage.getItem('calories_duration_per_day') || '{}');
      setWorkoutList(allWorkoutsList);
      setCaloriesPerDay(calories_duration_per_dayList);
    }
  };

  const handleCloseOfCoachFilterLabel = () => {
    setSelectedCoachInFilter('');
    let allWorkoutsList = JSON.parse(localStorage.getItem('workouts') || '[]');

    if (selectedTrainingInFilter) {
      const filteredWorkouts = allWorkoutsList.filter((workout: Workout) => workout.training_id === selectedTrainingInFilter.id);
      
      if (filteredWorkouts.length === 0) {
        setWorkoutList([]);
        setCaloriesPerDay({});
      } else {
        const calories_duration_per_dayFiltered = calculate_calories_and_duration_per_day(filteredWorkouts);
        setWorkoutList(filteredWorkouts);
        setCaloriesPerDay(calories_duration_per_dayFiltered);
      }
    } else {
      const calories_duration_per_dayList = JSON.parse(localStorage.getItem('calories_duration_per_day') || '{}');
      setWorkoutList(allWorkoutsList);
      setCaloriesPerDay(calories_duration_per_dayList);
    }
  };

  const handleFilterExerciseClose = () => {
    setFilterExerciseOpen(false);
  }

  const handleOpenWorkoutAdding = () => {
    setOpenWorkoutAdding(true);
    setOpen(false);
  }

  const handleCloseWorkoutAdding = () => {
    setOpenWorkoutAdding(false);
    setOpen(true);
    setSelectedCategory(null);
    setExercises([]);
    setCoachSelected('');
    setSelectedTraining(null);
    setNewWorkout({
      training_id: '',
      duration: '',
      coach: '',
      date: new Date().toISOString().split('T')[0],
    });
  }

  const handleAddWorkout = async () => {
    if (newWorkout.training_id && newWorkout.duration && newWorkout.date) {

      setNewWorkout({
        training_id: '',
        coach: '',
        duration: '',
        date: new Date().toISOString().split('T')[0],
      });

      try {
        const token = localStorage.getItem('token');
        if (token) {
          await saveWorkout(token, {
            training_id: newWorkout.training_id,
            coach: newWorkout.coach,
            duration: parseInt(newWorkout.duration, 10),
            date: newWorkout.date,
          });
          console.log('Workout saved successfully');
          setWorkoutsCount((prevCount) => prevCount + 1);
          setAlertOpen(true);
        } else {
          console.error('No token found, unable to save workout');
        }
      } catch (error) {
        console.error('Error saving workout:', error);
      }

      handleCloseWorkoutAdding();
      handleClose();
      localStorage.removeItem('workouts');
      localStorage.removeItem('calories_duration_per_day');
      localStorage.removeItem('categories_with_exercises');
      localStorage.removeItem('categories');
    }
  };

  const getAllCategories = async () => {
    try {
      const categories = await getCategories();
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      console.error('Error al obtener todas las categorías:', error);
      return [];
    }
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories_from_local_storage = JSON.parse(localStorage.getItem('categories') || '[]');
        const exercises_from_local_storage = JSON.parse(localStorage.getItem('categories_with_exercises') || '[]');
        if (categories_from_local_storage.length > 0 && exercises_from_local_storage.length > 0) {
          setCategories(categories_from_local_storage);
          setCategoryWithExercises(exercises_from_local_storage);
          console.log('Workouts and calories per day loaded from local storage');
        }
        else {
          const categories = await getAllCategories();
          var categories_with_exercises: CategoryWithExercises[] = [];
          for (const category of categories) {
            const exercises = await getExerciseFromCategory(category.id);
            categories_with_exercises = [...categories_with_exercises, { ...category, exercises }];
          }
          setCategories(categories);
          localStorage.setItem('categories_with_exercises', JSON.stringify(categories_with_exercises));
          localStorage.setItem('categories', JSON.stringify(categories));
        }
      } catch (error) {
        console.error('Error al obtener las categorías:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const top_exercises_done_for_graph = top_exercises_done(workoutList, categoryWithExercises);
    console.log(top_exercises_done_for_graph);
    setTopExercisesDone(top_exercises_done_for_graph.topCategoriesWithExercises);
  },[workoutList, categoryWithExercises]);

  const getAllTrainings = async () => {
    try {
      const trainings = await getTrainings();
      console.log('Trainings:', trainings);
      return Array.isArray(trainings) ? trainings : [];
    } catch (error) {
      console.error('Error al obtener los entrenamientos:', error);
    }
  };

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const coaches_from_local_storage = JSON.parse(localStorage.getItem('coaches') || '[]');
        if (coaches_from_local_storage.length > 0) {
          setCoaches(coaches_from_local_storage);
          console.log('Coaches loaded from local storage');
        }
        else {
          const coaches = await getCoaches();
          setCoaches(coaches);
          localStorage.setItem('coaches', JSON.stringify(coaches));
        }
      } catch (error) {
        console.error('Error al obtener los profesores:', error);
      }
    };
    fetchCoaches();
  }, []);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const trainings = await getAllTrainings();
          if (trainings) {
            setTrainings(trainings);
            console.log(trainings);
          }
      } catch (error) {
        console.error('Error al obtener entrenamientos:', error);
      }
    };
    fetchTrainings();
  }, []);

  return (
    <div className="min-h-screen bg-black from-gray-900 to-gray-800 text-white">
      <header className="p-4 flex justify-between items-center">
        <Avatar alt="User" src={require('../../images/profile_pic_2.jpg')} onClick={handleAvatarClick} style={{ cursor: 'pointer' }} />
        <ResponsiveMenu handleFilterOpen={handleFilterOpen} handleClickOpen={handleClickOpen}/>
      </header>
      <TopMiddleAlert alertText='Added workout successfully' open={alertOpen} onClose={() => setAlertOpen(false)} />

      {/* FILTER PRINCIPAL */}
      <Dialog open={filterOpen} onClose={handleFilterClose}
        PaperProps={{
          sx: {
            backgroundColor: grey[800],
            color: '#fff',
            borderRadius: '8px',
            padding: 2,
          },
        }}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Filter By</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="space-around" alignItems="center" mt={2} >
            <Box textAlign="center" mx={3}>
              <Button sx={{ backgroundColor: grey[700], borderColor: grey[900]}} onClick={() => setFilterTrainingOpen(true)} variant="contained">Training</Button>
            </Box>
            <Box textAlign="center" mx={3}>
              <Button sx={{ backgroundColor: grey[700], borderColor: grey[900]}} onClick={() => setFilterCoachOpen(true)} variant="contained">Coach</Button>
            </Box>
            {/* <Box textAlign="center" mx={3}>
              <Button sx={{ backgroundColor: grey[700], borderColor: grey[900]}} onClick={() => setFilterExerciseOpen(true)} variant="contained">Exercise</Button>
            </Box> */}
          </Box>
        </DialogContent>
      </Dialog>

      <FilterTrainingDialog filterTrainingOpen={filterTrainingOpen} handleFilterTrainingClose={handleFilterTrainingClose} selectedTrainingInFilter={selectedTrainingInFilter} 
      setSelectedTrainingInFilter={setSelectedTrainingInFilter} trainings={trainings} handleFilterClose={handleFilterClose}/>

      <FilterCoachDialog filterCoachOpen={filterCoachOpen} handleFilterCoachClose={handleFilterCoachClose} selectedCoachInFilter={selectedCoachInFilter} 
      setSelectedCoachInFilter={setSelectedCoachInFilter} coaches={coaches} handleFilterClose={handleFilterClose}/>

      {/* <FilterExerciseDialog filterExerciseOpen={filterExerciseOpen} handleFilterExerciseClose={handleFilterExerciseClose} selectedExerciseInFilter={selectedExerciseInFilter}
      setSelectedExerciseInFilter={setSelectedExerciseInFilter} handleFilterClose={handleFilterClose} workoutList={workoutList}/> */}

      <Dialog open={open} onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: grey[800],
            color: '#fff',
            borderRadius: '8px',
            padding: 2,
            maxWidth: '30vw',
            width: '100%',
            height: 'auto',
            '@media (max-width: 1024px)': {
              padding: 1,
              maxWidth: '60vw',
            },
            '@media (max-width: 600px)': {
              padding: 1,
              maxWidth: '100vw',
            },
          },
        }}
      >
        <DialogActions>
          <IconButton aria-label="add" onClick={handleClose}>
            <CloseIcon sx={{ color: grey[900], fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' } }} className="h-8 w-8" />
          </IconButton>
        </DialogActions>
        
        <DialogTitle sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          mt: -6,
          fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' },
        }}>
          What do you want to add?
        </DialogTitle>
        
        <DialogContent>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mt={2} px={2}>
            <Box textAlign="center" mx={2} my={{ xs: 2, sm: 0 }}>
              <IconButton onClick={handleCategoriesClick}>
                <Avatar
                  style={{ border: '2px solid black' }}
                  alt="New Categories"
                  src={require('../../images/Sports2.png')}
                  sx={{
                    width: { xs: 120, sm: 150, md: 170 },
                    height: { xs: 120, sm: 150, md: 170 },
                  }}
                />
              </IconButton>
              <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                New Category, Exercise or Training
              </Typography>
            </Box>

            <Box textAlign="center" mx={2} my={{ xs: 2, sm: 0 }}>
              <IconButton onClick={handleOpenWorkoutAdding}>
                <Avatar
                  style={{ border: '2px solid black' }}
                  alt="New Workout"
                  src={require('../../images/Exercise2.png')}
                  sx={{
                    width: { xs: 120, sm: 150, md: 170 },
                    height: { xs: 120, sm: 150, md: 170 },
                  }}
                />
              </IconButton>
              <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold', fontSize: { xs: '0.9rem', sm: '1rem' }, mb: 3 }}>
                New Workout
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={openWorkoutAdding} onClose={handleCloseWorkoutAdding}
        PaperProps={{
          sx: {
            backgroundColor: grey[800],
            color: '#fff',
            borderRadius: '8px',
            padding: 2,
          },
        }}>
        <DialogTitle sx={{ color: '#fff', textAlign: 'center' }}>Add New Workout</DialogTitle>
        <DialogContent>

          <Select
            fullWidth
            value={selectedTraining?.id || ""}
            onChange={(e) => { setSelectedTraining(trainings.find((training) => training.id === e.target.value) || null); setNewWorkout({ ...newWorkout, training_id: e.target.value || '' }) }}
            displayEmpty
            sx={{ marginBottom: 1 }}
            MenuProps={{
              PaperProps: {
                sx: {
                  display: 'flex',
                  flexWrap: 'wrap',
                  maxWidth: 300,
                  padding: 1,
                  backgroundColor: '#444',
                  color: '#fff',
                },
              },
            }}
          >
            <MenuItem value="" disabled>
              Select Training
            </MenuItem>
            {trainings.map((training) => (
              <MenuItem key={training.id} value={training.id}>
                {training.name}
              </MenuItem>
            ))}
          </Select>

          <Select
            fullWidth
            value={coachSelected}
            onChange={(e) => {setCoachSelected(e.target.value); setNewWorkout({ ...newWorkout, coach: e.target.value })}}
            displayEmpty
            MenuProps={{
              PaperProps: {
                sx: {
                  display: 'flex',
                  flexWrap: 'wrap',
                  maxWidth: 300,
                  padding: 1,
                  backgroundColor: '#444',
                  color: '#fff',
                },
              },
            }}
          >
            <MenuItem value="" disabled>
              Select Coach
            </MenuItem>
            {coaches.map((coach: any) => (
              <MenuItem key={coach.fullName} value={coach.fullName}>
                {coach.fullName}
              </MenuItem>
            ))}
          </Select>

          <TextField
            fullWidth
            margin="dense"
            label="Duration"
            value={newWorkout.duration}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                setNewWorkout({ ...newWorkout, duration: "" });
              } else {
                const numericValue = parseInt(value, 10);
                if (numericValue >= 1 && numericValue <= 1000) {
                  setNewWorkout({ ...newWorkout, duration: value });
                } else if (numericValue < 1) {
                  setNewWorkout({ ...newWorkout, duration: "1" });
                } else if (numericValue > 1000) {
                  setNewWorkout({ ...newWorkout, duration: "1000" });
                }
              }
            }}
            placeholder="In minutes"
            type="number"
            slotProps={{
              htmlInput: { min: 1, max: 1000 }
            }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Date"
            type="date"
            value={newWorkout.date}
            onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWorkoutAdding}>Cancel</Button>
          <Button onClick={handleAddWorkout}>Add Workout</Button>
        </DialogActions>
      </Dialog>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <main className="p-4 space-y-6">
          <Card sx={{ backgroundColor: '#161616', color: '#fff' }} className='border border-gray-600' >
            <CardHeader
              title="Progress"
            />
            <CardContent>

              {(selectedTrainingInFilter && selectedTrainingInFilter.name) ? (
                <Box 
                  sx={{ 
                  display: 'inline-flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  backgroundColor: grey[700], 
                  borderRadius: '8px', 
                  padding: 2, 
                  marginBottom: 2,
                  height: 50,
                  width: 'auto',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  marginRight: 2
                  }}
                >
                  <Typography variant="h6" noWrap>{selectedTrainingInFilter?.name}</Typography>
                  <IconButton aria-label="add" onClick={() => handleCloseOfTrainingFilterLabel()}>
                    <CloseIcon sx={{ color: grey[900], fontSize: 20 }} className="h-12 w-12" />
                  </IconButton>
                </Box>
              ) : (
                <Box></Box>
              )}

              {(selectedCoachInFilter) ? (
                <Box 
                  sx={{ 
                  display: 'inline-flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  backgroundColor: grey[700], 
                  borderRadius: '8px', 
                  padding: 2, 
                  marginBottom: 2,
                  height: 50,
                  width: 'auto',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  }}
                >
                  <Typography variant="h6" noWrap>{selectedCoachInFilter}</Typography>
                  <IconButton aria-label="add" onClick={() => handleCloseOfCoachFilterLabel()}>
                    <CloseIcon sx={{ color: grey[900], fontSize: 20 }} className="h-12 w-12" />
                  </IconButton>
                </Box>
              ) : (
                <Box></Box>
              )}

              {/* {(selectedExerciseInFilter) ? (
                <Box 
                  sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  backgroundColor: grey[700], 
                  borderRadius: '8px', 
                  padding: 2, 
                  marginBottom: 2,
                  height: 50,
                  width: 130
                  }}
                >
                  <Typography variant="h6">{selectedExerciseInFilter?.exercise}</Typography>
                  <IconButton aria-label="add" onClick={() => setSelectedExerciseInFilter(null)}>
                    <CloseIcon sx={{ color: grey[900], fontSize: 20 }} className="h-12 w-12" />
                  </IconButton>
                </Box>
              ) : (
                <Box></Box>
              )} */}

              <ResponsiveContainer width="100%" height={340} >
                {Array.isArray(workoutList) && workoutList.length > 0 ? (
                  <LineChart data={dataForChart} margin={{ top: 10, right: 0, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#fff" tick={{ dy: 13 }} />
                    <YAxis stroke="#E43654" yAxisId="left" tick={{ fontWeight: 'bold' }}/>
                    <YAxis stroke="#44f814" orientation="right" yAxisId="right" tick={{ fontWeight: 'bold' }}/>
                    <Tooltip />
                    <Line type="monotone" dataKey="Calories" stroke="#E43654" activeDot={{ r: 10 }} yAxisId="left" />
                    <Line type="monotone" dataKey="Minutes" stroke="#44f814" activeDot={{ r: 10 }} yAxisId="right" />
                    <Brush dataKey="date" height={30} stroke="#00000" y={300} fill="#00000" travellerWidth={10}
                    traveller={(props) => {
                      const { x, y, width, height } = props;
                      return (
                        <g>
                          {/* Traveller rectangle */}
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            fill="#fff"
                            stroke="none"
                            style={{ outline: 'none' }}
                            tabIndex={-1}
                          />
                          {/* First horizontal line */}
                          <line
                            x1={x + 2}
                            y1={y + height / 2 - 1}
                            x2={x + width - 2}
                            y2={y + height / 2 - 1}
                            stroke="#808080"
                            strokeWidth={1}
                            style={{ outline: 'none' }}
                            tabIndex={-1}
                          />
                          {/* Second horizontal line */}
                          <line
                            x1={x + 2}
                            y1={y + height / 2 + 1}
                            x2={x + width - 2}
                            y2={y + height / 2 + 1}
                            stroke="#808080"
                            strokeWidth={1}
                            style={{ outline: 'none' }}
                            tabIndex={-1}
                          />
                        </g>
                      );
                    }}/>
                    <text x="50%" y={320} fill="#ffffff" textAnchor="middle" fontSize="12px" >Filter date</text>
                  </LineChart>
                ) : (
                  <div>
                    <Typography variant="body2" color="gray">No progress available</Typography>
                    <a href="#" className="underline" onClick={handleClickOpen}>
                      <Typography sx={{ marginTop: 4 }} variant="body2" color="gray">Add new workout</Typography>
                    </a>

                  </div>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Box sx={{ display: 'flex', height: '100%', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Card sx={{ flex: 1, backgroundColor: '#161616', color: '#fff', width: '100%' }} className='border border-gray-600'>
              <CardHeader title="Workouts" />
              <CardContent>
                <ScrollArea sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {Array.isArray(workoutList) && workoutList.length > 0 ? (
                    workoutList.map((workout: any) => (
                      <div key={workout.id} className="flex items-center space-x-4 mb-4">
                        <div className="flex-1">
                          <Divider sx={{ backgroundColor: 'gray', marginY: 1 }} />
                          <Box sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'row' }, justifyContent: 'space-between', width: '100%', marginBottom: 1 }}>
                            <Typography variant="h6" color="#81d8d0" sx={{ flex: 1 }}>{workout.training.name}</Typography>
                            <Typography variant="h6" color='#44f814' sx={{ flex: 1, textAlign: 'left' }}>{workout.duration} min</Typography>
                            <Typography variant="h6" color='#E43654' sx={{ flex: 1, textAlign: 'left' }}>{workout.total_calories} kcal</Typography>
                            <Typography variant="subtitle1" color='gray' sx={{ flex: 1, textAlign: 'right' }}>{formatDate(workout.date)} </Typography>
                          </Box>
                          <Typography variant="body2">
                            {workout.training.exercises.map((exercise: any, index: number) => (
                            <span key={exercise.id}>
                              {exercise.name}
                              {index < workout.training.exercises.length - 1 && ' - '}
                            </span>
                            ))}
                          </Typography>
                          <Typography variant="body2" color="gray">Coach: {workout.coach}</Typography>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Typography variant="body2" color="gray">No workouts available</Typography>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, backgroundColor: '#161616', color: '#fff', width: '100%' }} className='border border-gray-600'>
              <CardHeader title="Top Categories & Exercises done" />
              <CardContent>
              {Array.isArray(topExercisesDone) && topExercisesDone.length > 0 ? (
                <DynamicBarChart topExercisesDone={topExercisesDone}/>
              ) : (
                <Typography variant="body2" color="gray">No workouts available</Typography>
              )}
              </CardContent>
            </Card>

            <WaterIntakeCard/>
          </Box>
        </main>
      )}
    </div>
  );
}

