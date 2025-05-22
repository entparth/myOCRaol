import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Paper, Box, Button, Typography, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ImageUploadProps {
  onUploadSuccess: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      await axios.post('http://localhost:3001/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Image uploaded and processed successfully!');
      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 4,
        backgroundColor: 'background.paper',
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(214, 126, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2
      }}
    >
      <Box
        {...getRootProps()}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
          width: '100%',
          justifyContent: 'center'
        }}
      >
        <input {...getInputProps()} />
        <Button
          variant="contained"
          component="span"
          disabled={uploading}
          sx={{
            minWidth: '200px',
            backgroundColor: uploading ? 'primary.light' : 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark'
            }
          }}
        >
          {uploading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <>
              <CloudUploadIcon sx={{ mr: 1 }} />
              Select Image
            </>
          )}
        </Button>
        <Typography variant="body2" color="text.secondary">
          Supported formats: JPG, PNG
        </Typography>
      </Box>
    </Paper>
  );
};

export default ImageUpload; 