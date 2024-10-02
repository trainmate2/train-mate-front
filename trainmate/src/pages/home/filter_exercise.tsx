import { Box, Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { grey } from "@mui/material/colors";

export const FilterExerciseDialog = ({ filterExerciseOpen, setFilterExerciseOpen }: { filterExerciseOpen: any; setFilterExerciseOpen: any; }) => {
    return (
        <Dialog open={filterExerciseOpen} onClose={() => setFilterExerciseOpen(false)}
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
          <Box display="flex" justifyContent="space-around" alignItems="center" mt={2}>
            <Box textAlign="center" mx={3}>
              <Button sx={{ backgroundColor: grey[700], borderColor: grey[900]}} variant="contained">Select Exercise</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    );
  };