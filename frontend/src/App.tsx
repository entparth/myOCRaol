import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ImageUpload from './components/ImageUpload'
import FeedbackTable from './components/FeedbackTable'
import './App.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#d67e00', // Orange/Gold color
      light: '#f7d9a0',
      dark: '#b96a00',
    },
    background: {
      default: '#fff8f0',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#4a4a4a',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '1.8rem',
      fontWeight: 700,
      color: '#d67e00',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.2rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#4a4a4a',
          boxShadow: '0 2px 8px rgba(214, 126, 0, 0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '10px',
          padding: '10px 20px',
        },
        contained: {
          '&:hover': {
            backgroundColor: '#b96a00',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(214, 126, 0, 0.2)',
        },
      },
    },
  },
})

const queryClient = new QueryClient()

function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#d67e00',
              color: '#fff',
              fontWeight: 600,
              borderRadius: '12px',
              padding: '14px 24px',
            },
          }}
        />
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main' }}>
              Art of Living Feedback
            </Typography>
            <Button color="inherit">Dashboard</Button>
            <Button color="inherit">Upload Forms</Button>
            <Button color="inherit">Help</Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ my: 4 }}>
            <Typography variant="h1" align="center" gutterBottom>
              Art of Living Feedback Dashboard
            </Typography>
            <ImageUpload onUploadSuccess={handleUploadSuccess} />
            <FeedbackTable refreshKey={refreshKey} />
          </Box>
        </Container>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
