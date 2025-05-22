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
  Typography
} from '@mui/material';
import axios from 'axios';

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
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
    { id: 'Program', label: 'Program' },
    { id: 'Program Date', label: 'Date' },
    { id: 'Name', label: 'Participant' },
    { id: 'Room No', label: 'Room' },
    { id: 'Program Experience.How satisfied are you?', label: 'Satisfaction' },
    { id: 'imageUrl', label: 'Form Image' },
  ];

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  return (
    <Paper elevation={3}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow hover key={row.uid}>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {column.id === 'imageUrl' ? (
                        <Link href={row[column.id]} target="_blank" rel="noopener">
                          View Form
                        </Link>
                      ) : (
                        getNestedValue(row, column.id) || 'N/A'
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data?.length || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default FeedbackTable; 