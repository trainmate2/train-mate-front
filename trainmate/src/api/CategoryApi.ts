import { BASE_URL } from "../constants";
import { refreshAuthToken } from "../utils/AuthUtils";

const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
};

const handleResponse = async (response: Response) => {
if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error desconocido en la solicitud');
}
return response.json();
};

export const getCategories = async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Token no encontrado');
    
    try {
    const response = await fetch(`${BASE_URL}/api/category/get-categories`, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    });

    // Si la respuesta es 401, intentamos renovar el token
    if (response.status === 401) {
        console.log('Token expirado, intentando renovar...');
        const newToken = await refreshAuthToken(); // Renueva el token
        // Intentamos la solicitud de nuevo con el nuevo token
        const retryResponse = await fetch(`${BASE_URL}/api/category/get-categories`, {
          method: 'GET',
          headers: {
            'Authorization': token,
          },
        });
  
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json();
          throw new Error(errorData.error || 'Error al obtener las categorías');
        }
  
        const retryData = await retryResponse.json();
        return retryData.workouts;
      }
  
      // Si no es 401, seguimos con el flujo normal
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener las categorías');
      }
  
      const data = await response.json();
      return data.categories;
    } catch (error) {
      console.error('Error al obtener las categorías:', error);
      throw error;
    }
  };

  export const saveCategory = async (categoryData: { name: string, icon: string }) => {
    
    const token = getAuthToken();
    if (!token) throw new Error('Token no encontrado');
    
    const modifiedCategoryData = { ...categoryData, isCustom: true };

    try {
      const response = await fetch(`${BASE_URL}/api/category/save-category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(modifiedCategoryData),
      });
  
      // Si la respuesta es 401, intentamos renovar el token
      if (response.status === 401) {
        console.log('Token expirado, intentando renovar...');
        const newToken = await refreshAuthToken(); // Renueva el token
        // Intentamos la solicitud de nuevo con el nuevo token
        const retryResponse = await fetch(`${BASE_URL}/api/category/save-category`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
          body: JSON.stringify(modifiedCategoryData),
        });
  
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json();
          throw new Error(errorData.error || 'Error al guardar la categoría');
        }
  
        const retryData = await retryResponse.json();
        return retryData;
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la categoría');
      }
  
      const data = await response.json();
      return data.category;
    } catch (error) {
      console.error('Error al guardar la categoría:', error);
      throw error;
    }
  };