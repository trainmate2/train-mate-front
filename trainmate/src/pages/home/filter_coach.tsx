import { Box, Button, Dialog, DialogContent, DialogTitle, MenuItem, Select } from "@mui/material";
import { grey } from "@mui/material/colors";

export const FilterCoachDialog = ({ filterCoachOpen, handleFilterCoachClose, selectedCoachInFilter, setSelectedCoachInFilter, handleFilterClose, coaches }: 
    { filterCoachOpen: any; handleFilterCoachClose: any; selectedCoachInFilter: any, setSelectedCoachInFilter: any, handleFilterClose: any, coaches: any }) => {
        return (
        <Dialog open={filterCoachOpen} onClose={() => handleFilterCoachClose()}
        PaperProps={{
            sx: {
              backgroundColor: grey[800],
              color: '#fff',
              borderRadius: '8px',
              padding: 2,
            },
          }}>
          <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Filter By Coach</DialogTitle>
          <DialogContent>
          <Select
              fullWidth
              value={selectedCoachInFilter || ""}
              onChange={(e) => { 
                const selectedCoach = e.target.value;
                setSelectedCoachInFilter(selectedCoach); 
                console.log(selectedCoach);
                handleFilterCoachClose(selectedCoach); 
                handleFilterClose() }}
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
                Select Coach
              </MenuItem>
              {coaches.map((coach: { fullName: string }) => (
                <MenuItem key={coach.fullName} value={coach.fullName}>
                  {coach.fullName}
                </MenuItem>
              ))}
            </Select>
          </DialogContent>
      </Dialog>
    );
  };