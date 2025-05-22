import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import ImageUpload from './components/ImageUpload'
import FeedbackTable from './components/FeedbackTable'
import './App.css'

// Create a theme instance with saffron/white color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF7722', // Saffron color
      light: '#FF9955',
      dark: '#CC5500',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FAFAFA',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
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
        <Toaster position="top-right" />
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <h1 style={{ 
              textAlign: 'center', 
              color: theme.palette.primary.main,
              marginBottom: '2rem'
            }}>
              Art of Living Feedback Dashboard
            </h1>
            <ImageUpload onUploadSuccess={handleUploadSuccess} />
            <FeedbackTable refreshKey={refreshKey} />
          </Box>
        </Container>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
