import * as React from 'react';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface CalendarProps {
    value: dayjs.Dayjs;
    onChange: (date: dayjs.Dayjs | null) => void;
}

const Calendar: React.FC<CalendarProps> = ({ value, onChange }) => {
    const dayjsValue = dayjs(value);
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker', 'DatePicker']}>
                <DatePicker
                    value={dayjsValue}
                    onChange={onChange}
                    sx={{
                        fontFamily: 'Quicksand, sans-serif',
                        '.MuiPickersToolbar-root': {
                            color: '#E5EBDF',  // Cambia el color de la barra superior
                            backgroundColor: '#8ba020',  // Fondo de la barra superior
                            fontFamily: 'Quicksand, sans-serif',
                        },
                        '.MuiInputBase-root': {
                            fontFamily: 'Quicksand, sans-serif',  // Fuente para el campo de texto
                            color: '#333333',  // Color del texto en el input
                            borderColor: '#8ba020',
                        },
                        '.MuiInputBase-input': {
                            color: '#333333',  // Color del texto en el campo (negro)
                        },
                        '.MuiSvgIcon-root': {
                            color: '#8ba020',  // Cambia el color del ícono del calendario
                        },
                        zIndex: 0,
                    }}
                    slotProps={{
                        day: {
                            sx: {
                                '&.Mui-selected': {
                                    backgroundColor: '#8ba020',  // Cambia el color del círculo seleccionado a verde
                                    color: '#FFFFFF',  // Cambia el color del texto en la fecha seleccionada
                                    '&:hover': {
                                        backgroundColor: '#7da019',  // Color hover sobre la fecha seleccionada
                                    }
                                },
                                '&:hover': {
                                    backgroundColor: '#8ba020',  // Color verde al hacer hover sobre la fecha no seleccionada
                                }
                            },
                        },
                        textField: {
                            sx: {
                                '& .MuiInputBase-input': {
                                    color: '#333333', // Mantiene el texto del campo de fecha en negro
                                },
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#8ba020', // Mantiene el borde verde al enfocar el campo
                                }
                            }
                        },
                        actionBar: {
                            sx: {
                                '& .Mui-selected': {
                                    backgroundColor: '#8ba020', // Aplica el color verde a cualquier fecha seleccionada
                                    color: '#FFFFFF',  // Texto blanco para el día seleccionado
                                },
                                '&:hover .Mui-selected': {
                                    backgroundColor: '#7da019',  // Hover verde en fechas seleccionadas previamente
                                }
                            }
                        },
                    }}
                />
            </DemoContainer>
        </LocalizationProvider>
    );
}

export default Calendar;