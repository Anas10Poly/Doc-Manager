import axiosInstance from './axiosInstance';
import { Document } from '../types/Document';

export const fetchDocuments = async (): Promise<Document[]> => {
  const response = await axiosInstance.get('/documents');
  return response.data;
};

export const fetchDocumentById = async (id: number): Promise<Document> => {
  const response = await axiosInstance.get(`/documents/${id}`);
  return response.data;
};

export const deleteDocument = async (id: number): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axiosInstance.delete(`/documents/${id}`);
    return { 
      success: true,
      message: response.data?.message || 'Document supprimé avec succès'
    };
  } catch (error: any) {
    console.error('Erreur API:', error.response?.data);
    return {
      success: false,
      message: error.response?.data?.message || 
               error.message || 
               'Échec de la suppression du document'
    };
  }
};

// Récupérer les noms des documents du backend pour les afficher quand on télécharge un document
export const downloadDocument = async (id: number): Promise<void> => {
  try {
    const response = await axiosInstance.get(`/documents/download/${id}`, {
      responseType: 'blob',
    });
    
    // Récupérer le nom du fichier depuis les headers de réponse
    const contentDisposition = response.headers['content-disposition'];
    let filename = `document_${id}`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
    
    // Récupérer le Content-Type de la réponse
    const contentType = response.headers['content-type'];
    
    // Créer un blob avec le bon type MIME
    const blob = new Blob([response.data], { 
      type: contentType || 'application/octet-stream' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Ajouter des attributs pour forcer le téléchargement
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    
    document.body.appendChild(link);
    link.click();
    
    // Nettoyer après un court délai
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
    
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    throw new Error('Erreur lors du téléchargement du document');
  }
};

export const addDocument = async (formData: FormData): Promise<void> => {
  await axiosInstance.post('/documents/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
};

export const updateDocument = async (id: number, formData: FormData): Promise<void> => {
  await axiosInstance.put(`/documents/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Fonction alternative pour téléchargement (gardée pour compatibilité)
export const fetchDocumentDownload = async (id: number, filename: string = `document_${id}`): Promise<void> => {
  await downloadDocument(id);
};

export const generateDescription = async (fileName: string, fileType: string, userPrompt?: string): Promise<string> => {
  const params = new URLSearchParams();
  params.append('fileName', fileName);
  params.append('fileType', fileType);
  if (userPrompt) params.append('userPrompt', userPrompt);

  const response = await axiosInstance.post('/documents/generate-description', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  });

  return response.data;
};