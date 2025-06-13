import {DataGrid, type GridColDef} from '@mui/x-data-grid';
import {Box, Typography, Chip, Link, CircularProgress, Alert} from '@mui/material';
import {useFundingCalls} from '../hooks/useFundingCalls';

export default function CallGrid() {
  const {calls, loading, error} = useFundingCalls();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <CircularProgress/>
        <Typography variant="h6" sx={{ml: 2}}>
          Lade Fördermittelausschreibungen...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{m: 2}}>
        Fehler beim Laden der Daten: {error}
      </Alert>
    );
  }

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Titel',
      width: 300,
      renderCell: (params) => (
        <Link href={params.row.url} target="_blank" rel="noopener">
          {params.value}
        </Link>
      ),
    },
    {
      field: 'source',
      headerName: 'Quelle',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined"/>
      ),
    },
    {
      field: 'funding_body',
      headerName: 'Fördergeber',
      width: 200,
      valueGetter: (_, row) => row.extra_data?.funding_body || 'Unbekannt',
    },
    {
      field: 'deadline',
      headerName: 'Frist',
      width: 120,
      valueGetter: (_, row) => {
        const deadline = row.extra_data?.deadline;
        if (!deadline) return 'Keine Angabe';
        return new Date(deadline).toLocaleDateString('de-DE');
      },
    },
    {
      field: 'amount_range',
      headerName: 'Fördersumme',
      width: 150,
      valueGetter: (_, row) => {
        const min = row.extra_data?.min_amount;
        const max = row.extra_data?.max_amount;
        const currency = row.extra_data?.currency || 'EUR';

        if (min && max) {
          return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
        } else if (max) {
          return `bis ${max.toLocaleString()} ${currency}`;
        }
        return 'Keine Angabe';
      },
    },
    {
      field: 'target_groups',
      headerName: 'Zielgruppen',
      width: 200,
      renderCell: (params) => {
        const groups = params.row.extra_data?.target_groups || [];
        return (
          <Box>
            {groups.slice(0, 2).map((group: string, index: number) => (
              <Chip
                key={index}
                label={group}
                size="small"
                sx={{mr: 0.5, mb: 0.5}}
              />
            ))}
            {groups.length > 2 && (
              <Typography variant="caption" color="text.secondary">
                +{groups.length - 2} weitere
              </Typography>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{height: 600, width: '100%', p: 2}}>
      <Typography variant="h4" gutterBottom>
        Fördermittelausschreibungen
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
        {calls.length} Ausschreibungen gefunden
      </Typography>
      <DataGrid
        rows={calls}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {page: 0, pageSize: 10},
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell': {
            padding: '8px',
          },
        }}
      />
    </Box>
  );
}