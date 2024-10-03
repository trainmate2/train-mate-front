import { Box, Button, Dialog, DialogContent, DialogTitle, MenuItem, Select } from "@mui/material";
import { grey } from "@mui/material/colors";

export const FilterExerciseDialog = ({ filterExerciseOpen, handleFilterExerciseClose, selectedExerciseInFilter, setSelectedExerciseInFilter, handleFilterClose, workoutList }: 
    { filterExerciseOpen: any; handleFilterExerciseClose: any; selectedExerciseInFilter: any, setSelectedExerciseInFilter: any, handleFilterClose: any, workoutList: any }) => {
        return (
        <Dialog open={filterExerciseOpen} onClose={() => handleFilterExerciseClose()}
        PaperProps={{
            sx: {
              backgroundColor: grey[800],
              color: '#fff',
              borderRadius: '8px',
              padding: 2,
            },
          }}>
          <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Filter By Exercise</DialogTitle>
          <DialogContent>
          <Select
              fullWidth
              value={selectedExerciseInFilter?.exercise_id || ""}
              onChange={(e) => { setSelectedExerciseInFilter(workoutList.find((workout: { exercise_id: string }) => workout.exercise_id === e.target.value) || null); handleFilterExerciseClose(); handleFilterClose() }}
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
                Select Exercise
              </MenuItem>
              {workoutList.map((exercise: { exercise_id: string; exercise: string }) => (
                <MenuItem key={exercise.exercise_id} value={exercise.exercise_id}>
                  {exercise.exercise}
                </MenuItem>
              ))}
            </Select>
          </DialogContent>
      </Dialog>
    );
  };