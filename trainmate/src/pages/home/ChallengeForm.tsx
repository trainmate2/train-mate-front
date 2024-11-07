import React, { useState } from 'react';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';
import { grey } from '@mui/material/colors';
import { saveGoal } from '../../api/GoalsApi';
import dayjs from 'dayjs';

interface ChallengeFormProps {
  isOpen: boolean;
  onCancel: () => void;
  onSave?: (formData: { startDate: string; endDate: string; title: string; description: string }) => void; // Optional callback after saving
}

const ChallengeForm: React.FC<ChallengeFormProps> = ({ isOpen, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    title: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Handler for TextField changes
  const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const formattedData = {
        ...formData,
        startDate: dayjs(formData.startDate).format('YYYY-MM-DD'),
        endDate: dayjs(formData.endDate).format('YYYY-MM-DD'),
      };
      const savedGoal = await saveGoal(formattedData);
      if (onSave) onSave(savedGoal); // Call onSave callback if provided
      onCancel(); // Close the form
      setFormData({ startDate: '', endDate: '', title: '', description: '' }); // Clear form data
    } catch (error) {
      console.error('Error saving goal:', error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onClose={onCancel} PaperProps={{
      sx: {
        backgroundColor: grey[800],
        color: '#fff',
        padding: 2,
        maxWidth: '600px',
        minWidth: '300px',
      },
    }}>
      <DialogTitle sx={{ color: '#fff', textAlign: 'center', fontSize: '2rem' }}>Add New Goal</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Title"
          name="title"
          fullWidth
          variant="outlined"
          value={formData.title}
          onChange={handleTextFieldChange}
          InputLabelProps={{ style: { color: '#fff' } }}
          InputProps={{ style: { color: '#fff', backgroundColor: grey[800] } }}
          sx={{ mb: 3 }}
        />
        <TextField
          label="Description"
          name="description"
          fullWidth
          variant="outlined"
          multiline
          rows={4}
          value={formData.description}
          onChange={handleTextFieldChange}
          InputLabelProps={{ style: { color: '#fff' } }}
          InputProps={{ style: { color: '#fff', backgroundColor: grey[800] } }}
          sx={{ mb: 3 }}
        />
        <TextField
          label="Start Date"
          type="date"
          name="startDate"
          fullWidth
          variant="outlined"
          value={formData.startDate}
          onChange={handleTextFieldChange}
          InputLabelProps={{ shrink: true, style: { color: '#fff' } }} // Added shrink here
          InputProps={{ style: { color: '#fff', backgroundColor: grey[800] } }}
          sx={{ mb: 3 }}
        />
        <TextField
          label="End Date"
          type="date"
          name="endDate"
          fullWidth
          variant="outlined"
          value={formData.endDate}
          onChange={handleTextFieldChange}
          InputLabelProps={{ shrink: true, style: { color: '#fff' } }} // Added shrink here
          InputProps={{ style: { color: '#fff', backgroundColor: grey[800] } }}
          sx={{ mb: 3 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} sx={{ color: '#fff' }}>Close</Button>
        <Button onClick={handleSave} sx={{ color: '#fff' }} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Goal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChallengeForm;
