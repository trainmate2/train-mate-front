import React, { useEffect, useState, useRef } from 'react';
import { Button, Card, CardContent, CardHeader, Typography, TextField, InputLabel, Box, Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, MenuItem, Select, FormControl, CircularProgress,} from '@mui/material';
import { Add as PlusIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowLeftIcon, ExpandMore as ExpandMoreIcon, BorderColor,} from '@mui/icons-material';
import {FitnessCenter as DumbbellIcon, 
  SportsSoccer as BallIcon, 
  SportsBasketball as BasketballIcon, 
  SportsTennis as TennisIcon, 
  SportsKabaddi as FightIcon,
  SportsMartialArts as MartialIcon,
  SportsMma as MmaIcon,
  SportsMotorsports as MotorsportsIcon,
  Hiking as HikingIcon,
  Sailing as SailingIcon,
  DownhillSkiing as SkiingIcon,
  Pool as PoolIcon,
  Skateboarding as SkateIcon,
  SportsRugby as RugbyIcon,
  SportsVolleyball as VolleyballIcon, 
  Favorite as HeartIcon} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { grey } from '@mui/material/colors';
import { deleteCategory, editCategory, getCategories, saveCategory } from '../../api/CategoryApi';
import { deleteExercise, editExercise, getExerciseFromCategory, saveExercise } from '../../api/ExerciseApi';
import TopMiddleAlert from '../../personalizedComponents/TopMiddleAlert';
import handleCategoryIcon from '../../personalizedComponents/handleCategoryIcon';

interface CategoryWithExercises {
  category_id: string;
  icon: string,
  name: string;
  owner: string;
  isCustom: boolean;
  exercises: Exercise[];
}

interface Category {
  category_id: string;
  icon: string,
  name: string;
  owner: string;
  isCustom: boolean;
}

interface Exercise {
  exercise_id: string;
  calories_per_hour: number | string;
  category_id: string;
  name: string;
  owner: string;
  public: boolean;
}

interface NewCategory {
  name: string;
  icon: string;
}

interface NewExercise {
  calories_per_hour: number | string;
  category_id: string;
  name: string;
}

export default function CategoriesPage() {

  const navigate = useNavigate();
  const effectRan = useRef(false);
  const [loading, setLoading] = useState(true);

  const [categoryWithExercises, setCategoryWithExercises] = useState<CategoryWithExercises[]>([]);

  const [newCategory, setNewCategory] = useState<NewCategory | null>(null);
  const [newExercise, setNewExercise] = useState<NewExercise | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [addExerciseDialogOpen, setAddExerciseDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [editExerciseDialogOpen, setEditExerciseDialogOpen] = useState(false);

  const handleOpenAddCategoryDialog = () => setAddCategoryDialogOpen(true);
  const handleCloseAddCategoryDialog = () => setAddCategoryDialogOpen(false);

  const [alertCategoryAddedOpen, setAlertCategoryAddedOpen] = useState(false);
  const [alertExerciseAddedOpen, setAlertExerciseAddedOpen] = useState(false);
  const [alertCategoryEditedOpen, setAlertCategoryEditedOpen] = useState(false);
  const [alertExerciseEditedOpen, setAlertExerciseEditedOpen] = useState(false);
  const [alertCategoryDeletedOpen, setAlertCategoryDeletedOpen] = useState(false);
  const [alertExerciseDeletedOpen, setAlertExerciseDeletedOpen] = useState(false);


  const getAllCategories = async () => {
    try {
      const categories = await getCategories();
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      console.error('Error al obtener todas las categorías:', error);
      return [];
    }
  };

  useEffect(() => {
    // El effectRan lo utilizo para que el useEffect se ejecute solo una vez, ya que por default se ejecuta dos veces
    if (!effectRan.current) {
      const fetchCategories = async () => {
        try {
          setLoading(true);
          const categories = await getAllCategories();
          for (const category of categories) {
            await getExercisesFromCategory(category);
          }
        } catch (error) {
          console.error('Error al obtener las categorías:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchCategories();
      effectRan.current = true;
    }
  }, []);

  // Pensar quizás en optimizar esta funcionalidad, ya que se hace una llamada a la API por cada categoría, lo cual puede ser ineficiente
  // Podríamos hacer una unica llamada, mandando todas las categorías y que nos devuelva listas de todas las categorías con todos sus ejercicios
  const getExercisesFromCategory = async (category: Category) => {
    try {
      const exercises = await getExerciseFromCategory(category.category_id);
      console.log("Setting category with exercises", category, exercises);
      setCategoryWithExercises((prev) => [
        ...prev,
        { ...category, exercises }
      ]);
    } catch (error) {
      console.error('Error al obtener todas las categorías:', error);
    }
  };

  const handleOpenAddExerciseDialog = (categoryId: string) => {
    setNewExercise({ ...newExercise, category_id: categoryId, calories_per_hour: newExercise?.calories_per_hour || 0, name: newExercise?.name || '' });
    setAddExerciseDialogOpen(true);
  };
  const handleCloseAddExerciseDialog = () => {
    setAddExerciseDialogOpen(false);
    setNewExercise(null);
  };

  const handleOpenEditCategoryDialog = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryDialogOpen(true);
  };
  const handleCloseEditCategoryDialog = () => {
    setEditCategoryDialogOpen(false);
    setEditingCategory(null);
  };

  const handleOpenEditExerciseDialog = (Exercise: Exercise) => {
    setEditingExercise(Exercise);
    setEditExerciseDialogOpen(true);
  };
  const handleCloseEditExerciseDialog = () => {
    setEditExerciseDialogOpen(false);
    setEditingExercise(null);
  };

  const handleAddCategory = async () => {
    if (newCategory && newCategory.name && newCategory.icon) {
      // Para evitar recargar la pagina de vuelta, hago un save en el front, mientras igualmente se guarda en el back. Esto es para evitar recarga lenta
      // y que se muestre inmediatamente la nueva categoría agregada
      try {
        const category = await saveCategory(newCategory);
        setNewCategory({ name: '', icon: '' });
        setCategoryWithExercises((prev) => [
          ...prev,
          { ...category, exercises: [] }
        ]);
        setAlertCategoryAddedOpen(true);
      } catch (error) {
        console.error('Error al guardar la categoría:', error)
      }
      handleCloseAddCategoryDialog();
    }
  };

  const handleAddExercise = async () => {
    if (newExercise && newExercise.name) {
      try {
        const exercise = await saveExercise(newExercise);
        setCategoryWithExercises(
          categoryWithExercises.map((category) => {
            if (category.category_id === newExercise.category_id) {
              return {
                ...category,
                exercises: [
                  ...category.exercises,
                  exercise
                ],
              };
            }
            return category;
          })
        );
        setNewExercise(null);
        setAlertExerciseAddedOpen(true);
      } catch (error) {
        console.error('Error al guardar el ejercicio:', error);
      }
      handleCloseAddExerciseDialog();
    }
  };

  const handleEditCategory = async () => {
    if (editingCategory) {
      try {
        await editCategory({ name: editingCategory.name, icon: editingCategory.icon }, editingCategory.category_id);
        setCategoryWithExercises(
          categoryWithExercises.map((category) =>
            category.category_id === editingCategory.category_id ? { ...editingCategory, exercises: category.exercises } : category
          )
        );
        setAlertCategoryEditedOpen(true);
      } catch (error) {
        console.error('Error al editar la categoría:', error);
      }
      setEditingCategory(null);
      handleCloseEditCategoryDialog();
    }
  };

  const handleEditExercise = async () => {
    if (editingExercise) {
      try {
        await editExercise({ name: editingExercise.name, calories_per_hour: editingExercise.calories_per_hour }, editingExercise.exercise_id);
        setCategoryWithExercises(
          categoryWithExercises.map((category) => {
            if (category.category_id === editingExercise.category_id) {
              return {
                ...category,
                exercises: category.exercises.map((exercise) =>
                  exercise.exercise_id === editingExercise.exercise_id ? editingExercise : exercise
                ),
              };
            }
            return category;
          })
        );
        setAlertExerciseEditedOpen(true);
      } catch (error) {
        console.error('Error al editar el ejercicio:', error);
      }
      setEditingExercise(null);
      handleCloseEditExerciseDialog();
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      setCategoryWithExercises(categoryWithExercises.filter((category) => category.category_id !== categoryId));
      setAlertCategoryDeletedOpen(true);
    } catch (error) {
      console.error('Error al eliminar la categoría:', error);
    }
  };

  const handleDeleteExercise = async (exerciseId: string, categoryId: string) => {
    try {
      await deleteExercise(exerciseId);
      setCategoryWithExercises(
        categoryWithExercises.map((category) => {
          if (category.category_id === categoryId) {
            return {
              ...category,
              exercises: category.exercises.filter((exercise) => exercise.exercise_id !== exerciseId),
            };
          }
          return category;
        })
      );
      setAlertExerciseDeletedOpen(true);
    } catch (error) {
      console.error('Error al eliminar el ejercicio:', error);
    }
  };

  const handleBackToHome = () => {
    navigate('/homepage');
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1a202c, #2d3748)', color: 'white', p: 4 }}>
      <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
          <IconButton component="a" sx={{ color: 'white' }} onClick={handleBackToHome}>
            <ArrowLeftIcon />
          </IconButton>
        <Typography variant="h4">Categories & Exercises</Typography>
        <Box sx={{ width: 6 }}></Box>
      </Box>

      <TopMiddleAlert alertText='Added category successfully' open={alertCategoryAddedOpen} onClose={() => setAlertCategoryAddedOpen(false)} />
      <TopMiddleAlert alertText='Added exercise successfully' open={alertExerciseAddedOpen} onClose={() => setAlertExerciseAddedOpen(false)} />
      <TopMiddleAlert alertText='Edited category successfully' open={alertCategoryEditedOpen} onClose={() => setAlertCategoryEditedOpen(false)} />
      <TopMiddleAlert alertText='Edited exercise successfully' open={alertExerciseEditedOpen} onClose={() => setAlertExerciseEditedOpen(false)} />
      <TopMiddleAlert alertText='Deleted category successfully' open={alertCategoryDeletedOpen} onClose={() => setAlertCategoryDeletedOpen(false)} />
      <TopMiddleAlert alertText='Deleted exercise successfully' open={alertExerciseDeletedOpen} onClose={() => setAlertExerciseDeletedOpen(false)} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
      <Card sx={{ backgroundColor: '#333', color: '#fff', height: 'calc(100vh - 200px)' }}>
        <CardHeader
          title="Categories"
          action={
            <IconButton aria-label="add" onClick={handleOpenAddCategoryDialog}>
              <PlusIcon sx={{ color: grey[50], fontSize: 25 }}/>
              <div>
                <p className='p-1 text-white text-lg'>Add New Category</p>
              </div>
            </IconButton>
          }
        />
        <CardContent>
          <Box sx={{ height: 'calc(100vh - 300px)', overflowY: 'auto' }}>
            {categoryWithExercises.map((category) => (
              <Accordion key={category.category_id} sx={{ backgroundColor: grey[800], color: 'white' }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                  aria-controls={`panel-${category.category_id}-content`}
                  id={`panel-${category.category_id}-header`}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {handleCategoryIcon(category.icon)}
                    <Typography sx={{ ml: 1, fontWeight: 'bold', fontSize: '1.2rem' }}>{category.name}</Typography>
                  </Box>
                  {category.isCustom && (
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" color="inherit" onClick={() => handleOpenEditCategoryDialog(category)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="inherit" onClick={() => handleDeleteCategory(category.category_id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ pl: 4 }}>
                    {category.exercises.map((exercise) => (
                      <Box key={exercise.exercise_id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <Typography>{exercise.name}</Typography>
                            <Typography sx={{ fontSize: '0.7rem', marginLeft: 3 }}>({exercise.calories_per_hour} kcal/h)</Typography>
                        </Box>
                        {!exercise.public && (
                          <Box>
                            <IconButton size="small" color="inherit" onClick={() => handleOpenEditExerciseDialog(exercise)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" color="inherit" onClick={() => handleDeleteExercise(exercise.exercise_id, category.category_id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PlusIcon />}
                      sx={{ mt: 2 }}
                      onClick={() => handleOpenAddExerciseDialog(category.category_id)}
                    >
                      Add Custom Exercise
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </CardContent>
      </Card>
      )}

      {/* Add Category Dialog */}
      <Dialog open={addCategoryDialogOpen} onClose={handleCloseAddCategoryDialog} fullWidth={true} maxWidth={'xs'} 
        PaperProps={{
          sx: {
            backgroundColor: grey[800],
            color: '#fff',
            borderRadius: '8px',
            padding: 2,
          },
        }}>
        <DialogTitle sx={{ color: '#fff', textAlign: 'center' }}>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="category-name"
            label="Name"
            InputLabelProps={{
              style: { color: '#b0b0b0' },
            }}
            type="text"
            fullWidth
            variant="standard"
            value={newCategory?.name || ''}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value, icon: newCategory?.icon || '' })}
            sx={{ mb: 3 }}
          />
          <FormControl fullWidth margin="dense">
          <InputLabel id="icon-label">Icon</InputLabel>
              <Select
                labelId="icon-label"
                id="icon"
                label="Icon"
                value={newCategory?.icon || ''}
                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value, name: newCategory?.name || '' })}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      /* display: 'flex',
                      flexWrap: 'wrap',
                      maxWidth: 300,
                      padding: 1, */
                      backgroundColor: '#444',
                      color: '#fff',
                    },
                  },
                }}
              >
              <MenuItem value="">
                <em>Select an icon</em>
              </MenuItem>
                <MenuItem value="Dumbbell"><DumbbellIcon/></MenuItem>
                <MenuItem value="Ball"><BallIcon/></MenuItem>
                <MenuItem value="Heart"><HeartIcon/></MenuItem>
                <MenuItem value="Basketball"><BasketballIcon/></MenuItem>
                <MenuItem value="Tennis"><TennisIcon/></MenuItem>
                <MenuItem value="Fight"><FightIcon/></MenuItem>
                <MenuItem value="Martial"><MartialIcon/></MenuItem>
                <MenuItem value="Mma"><MmaIcon/></MenuItem>
                <MenuItem value="Motorsports"><MotorsportsIcon/></MenuItem>
                <MenuItem value="Hiking"><HikingIcon/></MenuItem>
                <MenuItem value="Sailing"><SailingIcon/></MenuItem>
                <MenuItem value="Skiing"><SkiingIcon/></MenuItem>
                <MenuItem value="Pool"><PoolIcon/></MenuItem>
                <MenuItem value="Skate"><SkateIcon/></MenuItem>
                <MenuItem value="Rugby"><RugbyIcon/></MenuItem>
                <MenuItem value="Volleyball"><VolleyballIcon/></MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddCategoryDialog}>Cancel</Button>
          <Button onClick={handleAddCategory}>Add Category</Button>
        </DialogActions>
      </Dialog>

      {/* Add Exercise Dialog */}
      <Dialog open={addExerciseDialogOpen} onClose={handleCloseAddExerciseDialog} fullWidth={true} maxWidth={'xs'}
        PaperProps={{
          sx: {
            backgroundColor: grey[800],
            color: '#fff',
            borderRadius: '8px',
            padding: 2,
          },
        }}>
        <DialogTitle>Add New Exercise</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="exercise-name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            value={newExercise?.name || ''}
            onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value, calories_per_hour: newExercise?.calories_per_hour || 1, category_id: newExercise?.category_id || '' })}
          />
          <TextField
            margin="dense"
            id="exercise-calories"
            label="Kcal per Hour"
            type="number"
            fullWidth
            variant="standard"
            value={newExercise?.calories_per_hour ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                setNewExercise({ 
                  ...newExercise, 
                  calories_per_hour: "", 
                  name: newExercise?.name || '', 
                  category_id: newExercise?.category_id || '' 
                });
              } else {
                const numericValue = parseInt(value, 10);
                if (numericValue >= 1 && numericValue <= 4000) {
                  setNewExercise({ 
                    ...newExercise, 
                    calories_per_hour: numericValue, 
                    name: newExercise?.name || '', 
                    category_id: newExercise?.category_id || '' 
                  });
                } else if (numericValue < 1) {
                  setNewExercise({ 
                    ...newExercise, 
                    calories_per_hour: 1, 
                    name: newExercise?.name || '', 
                    category_id: newExercise?.category_id || '' 
                  });
                } else if (numericValue > 4000) {
                  setNewExercise({ 
                    ...newExercise, 
                    calories_per_hour: 4000, 
                    name: newExercise?.name || '', 
                    category_id: newExercise?.category_id || '' 
                  });
                }
              }
            }}
            placeholder="Kcal per Hour"
            slotProps={{
              htmlInput: { min: 1, max: 4000 }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddExerciseDialog}>Cancel</Button>
          <Button onClick={handleAddExercise}>Add Exercise</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editCategoryDialogOpen} onClose={handleCloseEditCategoryDialog} fullWidth={true} maxWidth={'xs'}
        PaperProps={{
          sx: {
            backgroundColor: grey[800],
            color: '#fff',
            borderRadius: '8px',
            padding: 2,
          },
        }}>
        <DialogTitle>Edit Category</DialogTitle>
        {editingCategory && (
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="edit-category-name"
              label="Name"
              type="text"
              fullWidth
              variant="standard"
              value={editingCategory.name}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              sx={{ mb: 3 }}
            />
            <FormControl fullWidth margin="dense">
            <InputLabel id="icon-label">Icon</InputLabel>
            <Select
              labelId="icon-label"
              id="icon"
              label="Icon"
              value={editingCategory.icon}
              onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#444',
                    color: '#fff',
                  },
                },
              }}
            >
              <MenuItem value="Dumbbell"><DumbbellIcon/></MenuItem>
              <MenuItem value="Ball"><BallIcon/></MenuItem>
              <MenuItem value="Heart"><HeartIcon/></MenuItem>
              <MenuItem value="Basketball"><BasketballIcon/></MenuItem>
              <MenuItem value="Tennis"><TennisIcon/></MenuItem>
              <MenuItem value="Fight"><FightIcon/></MenuItem>
              <MenuItem value="Martial"><MartialIcon/></MenuItem>
              <MenuItem value="Mma"><MmaIcon/></MenuItem>
              <MenuItem value="Motorsports"><MotorsportsIcon/></MenuItem>
              <MenuItem value="Hiking"><HikingIcon/></MenuItem>
              <MenuItem value="Sailing"><SailingIcon/></MenuItem>
              <MenuItem value="Skiing"><SkiingIcon/></MenuItem>
              <MenuItem value="Pool"><PoolIcon/></MenuItem>
              <MenuItem value="Skate"><SkateIcon/></MenuItem>
              <MenuItem value="Rugby"><RugbyIcon/></MenuItem>
              <MenuItem value="Volleyball"><VolleyballIcon/></MenuItem>
            </Select>
            </FormControl>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleCloseEditCategoryDialog}>Cancel</Button>
          <Button onClick={handleEditCategory}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Exercise Dialog */}
      <Dialog open={editExerciseDialogOpen} onClose={handleCloseEditExerciseDialog} fullWidth={true} maxWidth={'xs'}
        PaperProps={{
          sx: {
            backgroundColor: grey[800],
            color: '#fff',
            borderRadius: '8px',
            padding: 2,
          },
        }}>
        <DialogTitle>Edit Exercise</DialogTitle>
        {editingExercise && (
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="edit-exercise-name"
              label="Name"
              type="text"
              fullWidth
              variant="standard"
              value={editingExercise.name}
              onChange={(e) => setEditingExercise({ ...editingExercise, name: e.target.value })}
            />
            <TextField
              margin="dense"
              id="edit-exercise-calories"
              label="KCal Per Hour"
              type="number"
              fullWidth
              variant="standard"
              value={editingExercise.calories_per_hour ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setEditingExercise({ 
                    ...editingExercise, 
                    calories_per_hour: "" 
                  });
                } else {
                  const numericValue = parseInt(value, 10);
                  if (numericValue >= 1 && numericValue <= 4000) {
                    setEditingExercise({ 
                      ...editingExercise, 
                      calories_per_hour: numericValue 
                    });
                  } else if (numericValue < 1) {
                    setEditingExercise({ 
                      ...editingExercise, 
                      calories_per_hour: 1 
                    });
                  } else if (numericValue > 4000) {
                    setEditingExercise({ 
                      ...editingExercise, 
                      calories_per_hour: 4000 
                    });
                  }
                }
              }}
              placeholder="KCal Per Hour"
              slotProps={{
                htmlInput: { min: 1, max: 4000 }
              }}
            />
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleCloseEditExerciseDialog}>Cancel</Button>
          <Button onClick={handleEditExercise}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}