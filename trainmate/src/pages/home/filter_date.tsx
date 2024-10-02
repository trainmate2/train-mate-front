import { Box, Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { grey } from "@mui/material/colors";

export const FilterDateDialog = ({ filterDateOpen, setFilterDateOpen }: { filterDateOpen: any; setFilterDateOpen: any; }) => {
    return (
        <Dialog open={filterDateOpen} onClose={() => setFilterDateOpen(false)}
            PaperProps={{
            sx: {
                backgroundColor: grey[800],
                color: '#fff',
                borderRadius: '8px',
                padding: 2,
            },
            }}>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Filter By Date</DialogTitle>
            <DialogContent>
            <Box display="flex" justifyContent="space-around" alignItems="center" mt={2}>
                <Box textAlign="center" mx={3}>
                <Button sx={{ backgroundColor: grey[700], borderColor: grey[900]}} variant="contained">Start Date</Button>
                </Box>
                <Box textAlign="center" mx={3}>
                <Button sx={{ backgroundColor: grey[700], borderColor: grey[900]}} variant="contained">End Date</Button>
                </Box>
            </Box>
            </DialogContent>
        </Dialog>
    );
  };
  