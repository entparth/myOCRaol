import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Link,
  CircularProgress,
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import axios from 'axios';
import toast from 'react-hot-toast';

interface FeedbackTableProps {
  refreshKey: number;
}

interface FeedbackData {
  uid: string;
  Program: string;
  'Program Date': string;
  Name: string;
  'Room No': string;
  imageUrl: string;
  'Program Experience': {
    'How satisfied are you?': string;
    'How were you feeling before the program?': string;
    'How were you feeling after the program?': string;
    'How likely would you recommend this program?': string;
  };
  'Overall Ashram Experience': {
    'Housing?': string;
    'Hygiene and cleanliness?': string;
    'Dining Experience?': string;
    'Program arrangements?': string;
  };
}

const FeedbackTable: React.FC<FeedbackTableProps> = ({ refreshKey }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { data, isLoading, error } = useQuery(
    ['feedback', refreshKey],
    async () => {
      const response = await axios.get<FeedbackData[]>('http://localhost:3001/api/feedback');
      return response.data;
    }
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportCSV = () => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Define CSV headers
    const headers = [
      'Program Date',
      'Name',
      'Program',
      'Room No',
      'Program Experience - Satisfaction',
      'Program Experience - Feeling Before',
      'Program Experience - Feeling After',
      'Program Experience - Recommendation',
      'Suggestions',
      'Overall Experience - Housing',
      'Overall Experience - Hygiene',
      'Overall Experience - Dining',
      'Overall Experience - Arrangements',
      'Volunteer Preferences',
      'Contribution Interests',
      'Image URL'
    ];

    // Convert data to CSV rows
    const csvRows = data.map(row => [
      row['Program Date'] || '',
      row['Name'] || '',
      row['Program'] || '',
      row['Room No'] || '',
      row['Program Experience']?.['How satisfied are you?'] || '',
      row['Program Experience']?.['How were you feeling before the program?'] || '',
      row['Program Experience']?.['How were you feeling after the program?'] || '',
      row['Program Experience']?.['How likely would you recommend this program?'] || '',
      row['Suggestions'] || '',
      row['Overall Ashram Experience']?.['Housing?'] || '',
      row['Overall Ashram Experience']?.['Hygiene and cleanliness?'] || '',
      row['Overall Ashram Experience']?.['Dining Experience?'] || '',
      row['Overall Ashram Experience']?.['Program arrangements?'] || '',
      row['Volunteer Preferences'] || '',
      row['Contribution Interests'] || '',
      row['imageUrl'] || ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV file downloaded successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Error loading feedback data. Please try again.</Typography>
      </Box>
    );
  }

  const columns = [
    { id: 'Program Date', label: 'Date' },
    { id: 'Name', label: 'Name' },
    { id: 'Program', label: 'Program' },
    { id: 'Program Experience.How satisfied are you?', label: 'Rating' },
    { id: 'Program Experience.How were you feeling after the program?', label: 'Comments' },
    { id: 'imageUrl', label: 'Image' },
  ];

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  return (
    <Paper 
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(214, 126, 0, 0.2)',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" color="primary.main">Feedback Entries</Typography>
        <Box>
          <Button
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCSV}
            sx={{ mr: 1 }}
            variant="outlined"
            color="primary"
          >
            Export to CSV
          </Button>
          <Button
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            variant="outlined"
            color="primary"
          >
            Print
          </Button>
        </Box>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sx={{
                    backgroundColor: 'primary.light',
                    color: 'text.primary',
                    fontWeight: 600,
                    borderBottom: '2px solid',
                    borderColor: 'primary.main',
                    whiteSpace: 'nowrap',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: 'text.secondary', fontStyle: 'italic' }}>
                  No feedback submitted yet.
                </TableCell>
              </TableRow>
            ) : (
              data
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow 
                    hover 
                    key={row.uid}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: 'primary.light + 10' }
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell 
                        key={column.id}
                        sx={{
                          border: '1px solid',
                          borderColor: 'primary.main',
                          whiteSpace: 'nowrap',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {column.id === 'imageUrl' ? (
                          <Tooltip title="View Form">
                            <IconButton
                              component={Link}
                              href={row[column.id]}
                              target="_blank"
                              rel="noopener"
                              size="small"
                              color="primary"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          getNestedValue(row, column.id) || 'N/A'
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, data?.length || 0)} of {data?.length || 0} entries
        </Typography>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </Paper>
  );
};

export default FeedbackTable; 