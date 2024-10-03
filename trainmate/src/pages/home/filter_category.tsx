import { Box, Button, Dialog, DialogContent, DialogTitle, MenuItem, Select } from "@mui/material";
import { grey } from "@mui/material/colors";

export const FilterCategoryDialog = ({ filterCategoryOpen, handleFilterCategoryClose, selectedCategoryInFilter, setSelectedCategoryInFilter, categories, handleFilterClose }: 
    { filterCategoryOpen: any; handleFilterCategoryClose: any; selectedCategoryInFilter: any; setSelectedCategoryInFilter: any; categories: any; handleFilterClose: any }) => {
    return (
        <Dialog open={filterCategoryOpen} onClose={() => handleFilterCategoryClose()}
        PaperProps={{
          sx: {
            backgroundColor: grey[800],
            color: '#fff',
            borderRadius: '8px',
            padding: 2,
          },
        }}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Filter By Category</DialogTitle>
        <DialogContent>
        <Select
            fullWidth
            value={selectedCategoryInFilter?.category_id || ""}
            onChange={(e) => { setSelectedCategoryInFilter(categories.find((category: { category_id: string }) => category.category_id === e.target.value) || null); handleFilterCategoryClose(); handleFilterClose() }}
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
              Select Category
            </MenuItem>
            {categories.map((category: { category_id: string; name: string }) => (
              <MenuItem key={category.category_id} value={category.category_id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
      </Dialog>
    );
  };