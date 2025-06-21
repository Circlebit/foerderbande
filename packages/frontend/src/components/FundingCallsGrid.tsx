import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Paper, Typography, Box, Chip } from "@mui/material";
import { useFundingCalls } from "../hooks/useFundingCalls";

export default function FundingCallsGrid() {
  const { fundingCalls, loading, error } = useFundingCalls();

  // Custom renderer for relevance score as colored chip
  const renderRelevanceScore = (score: number) => {
    const getColor = (score: number) => {
      if (score >= 0.8) return "success";
      if (score >= 0.6) return "warning";
      return "default";
    };

    return (
      <Chip
        label={`${(score * 100).toFixed(0)}%`}
        color={getColor(score)}
        size="small"
        variant="outlined"
      />
    );
  };

  // Custom renderer for funding body from JSONB details
  const renderFundingBody = (details: Record<string, any>) => {
    const fundingBody = details?.funding_body || "Unbekannt";
    return (
      <Typography variant="body2" color="text.secondary">
        {fundingBody}
      </Typography>
    );
  };

  // Custom renderer for deadline with urgency indication
  const renderDeadline = (deadline: string | null) => {
    if (!deadline) return "-";

    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntil = Math.ceil(
      (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const getUrgencyColor = (days: number) => {
      if (days <= 7) return "error";
      if (days <= 30) return "warning";
      return "default";
    };

    return (
      <Box>
        <Typography variant="body2">
          {deadlineDate.toLocaleDateString("de-DE")}
        </Typography>
        <Typography
          variant="subtitle2"
          color={`${getUrgencyColor(daysUntil)}.main`}
        >
          {daysUntil > 0 ? `${daysUntil} Tage` : "Abgelaufen"}
        </Typography>
      </Box>
    );
  };

  // Column definitions for DataGrid
  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Titel",
      flex: 2,
      minWidth: 200,
    },
    {
      field: "funding_body",
      headerName: "Fördergeber",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => renderFundingBody(params.row.details),
    },
    {
      field: "deadline",
      headerName: "Frist",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => renderDeadline(params.value),
    },
    {
      field: "relevance_score",
      headerName: "Relevanz",
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => renderRelevanceScore(params.value),
    },
    {
      field: "max_amount",
      headerName: "Max. Förderung",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => {
        const amount = params.row.details?.max_amount;
        return amount ? `${amount.toLocaleString("de-DE")} €` : "-";
      },
    },
  ];

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="error">
          Fehler beim Laden der Daten: {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: "100%", height: 600 }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" component="h2">
          Fördermittelausschreibungen
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {fundingCalls.length} Ausschreibungen gefunden
        </Typography>
      </Box>

      <DataGrid
        rows={fundingCalls}
        columns={columns}
        loading={loading}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
        disableRowSelectionOnClick
        sx={{
          border: 0,
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "action.hover",
          },
        }}
      />
    </Paper>
  );
}
