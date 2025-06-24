import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Paper, Typography, Box, Chip, Link } from "@mui/material";
import {
  useFundingCalls,
  type NormalizedFundingCall,
} from "../hooks/useFundingCalls";

export default function FundingCallsGrid() {
  const { fundingCalls, loading, error, usingMockData } = useFundingCalls();

  // Custom renderer for relevance as colored chip
  const renderRelevance = (params: { row: NormalizedFundingCall }) => {
    const { isRelevant } = params.row.relevanceInfo;

    return (
      <Chip
        label={isRelevant ? "Relevant" : "Prüfen"}
        color={isRelevant ? "success" : "default"}
        size="small"
        variant={isRelevant ? "filled" : "outlined"}
      />
    );
  };

  // Custom renderer for deadline with urgency indication
  const renderDeadline = (params: { row: NormalizedFundingCall }) => {
    const deadline = params.row.displayDeadline;

    if (!deadline) return "-";

    // Parse deadline - handle different formats
    let deadlineDate: Date;
    try {
      // Try to parse German format first (from sample data)
      if (
        deadline.includes("Januar") ||
        deadline.includes("Dezember") ||
        deadline.includes("Februar")
      ) {
        // Handle German month names - simplified for PoC
        const months: { [key: string]: number } = {
          Januar: 0,
          Februar: 1,
          März: 2,
          April: 3,
          Mai: 4,
          Juni: 5,
          Juli: 6,
          August: 7,
          September: 8,
          Oktober: 9,
          November: 10,
          Dezember: 11,
        };

        const match = deadline.match(/(\d{1,2})\.\s*(\w+)\s*(\d{4})/);
        if (match) {
          const [, day, month, year] = match;
          deadlineDate = new Date(parseInt(year), months[month], parseInt(day));
        } else {
          deadlineDate = new Date(deadline);
        }
      } else {
        deadlineDate = new Date(deadline);
      }
    } catch {
      return deadline; // Fallback: just show raw string
    }

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
          variant="caption"
          color={`${getUrgencyColor(daysUntil)}.main`}
        >
          {daysUntil > 0 ? `${daysUntil} Tage` : "Abgelaufen"}
        </Typography>
      </Box>
    );
  };

  // Custom renderer for title with link
  const renderTitle = (params: { row: NormalizedFundingCall }) => {
    const { row } = params;
    const url = row.source_url;

    if (!url) {
      return (
        <Typography variant="body2" fontWeight={500}>
          {row.title}
        </Typography>
      );
    }

    return (
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        sx={{
          color: "text.primary",
          fontWeight: 500,
          "&:hover": { color: "primary.main" },
        }}
      >
        {row.title}
      </Link>
    );
  };

  // Column definitions for DataGrid
  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Name der Förderung",
      flex: 2,
      minWidth: 300,
      renderCell: (params: { row: NormalizedFundingCall }) => {
        const url = params.row.source_url;

        const titleElement = (
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{
              mb: 0.5,
              color: url ? "primary.main" : "text.primary",
              cursor: url ? "pointer" : "default",
              "&:hover": url ? { textDecoration: "underline" } : {},
            }}
          >
            {params.row.title}
          </Typography>
        );

        return (
          <Box>
            {url ? (
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                sx={{ color: "inherit" }}
              >
                {titleElement}
              </Link>
            ) : (
              titleElement
            )}
            {params.row.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.2,
                }}
              >
                {params.row.description}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: "relevance",
      headerName: "Relevanz",
      flex: 0.5,
      minWidth: 100,
      renderCell: renderRelevance,
    },
    {
      field: "deadline",
      headerName: "Antragsfrist",
      flex: 1,
      minWidth: 120,
      renderCell: renderDeadline,
    },
    {
      field: "funding_amount",
      headerName: "Fördersumme",
      flex: 1,
      minWidth: 150,
      renderCell: (params: { row: NormalizedFundingCall }) => {
        const amount = params.row.fundingAmount;
        return amount ? <Typography variant="body2">{amount}</Typography> : "-";
      },
    },
    {
      field: "duration",
      headerName: "Laufzeit",
      flex: 1,
      minWidth: 120,
      renderCell: (params: { row: NormalizedFundingCall }) => {
        const duration = params.row.duration;
        return duration || "-";
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
          {usingMockData && (
            <Chip
              label="Mock-Daten"
              size="small"
              color="warning"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          )}
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
        getRowHeight={() => "auto"}
        sx={{
          border: 0,
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "flex-start", // Changed from center to flex-start for better text layout
            lineHeight: "unset !important",
            maxHeight: "none !important",
            whiteSpace: "normal",
            paddingTop: "12px", // Increased padding for better readability
            paddingBottom: "12px",
          },
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-row": {
            minHeight: "80px !important", // Minimum row height for description text
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "action.hover",
          },
          "& .MuiDataGrid-renderingZone": {
            maxHeight: "none !important",
          },
          "& .MuiDataGrid-cell .MuiDataGrid-cellContent": {
            maxHeight: "none",
            whiteSpace: "normal",
            lineHeight: "1.2",
            width: "100%", // Ensure full width usage
          },
        }}
      />
    </Paper>
  );
}
