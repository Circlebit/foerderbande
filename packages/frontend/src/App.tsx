import { Box } from "@mui/material";
import FundingCallsGrid from "./components/FundingCallsGrid";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import SettingsPage from "./components/SettingsPage";
import { useNavigation } from "./hooks/useNavigation";

function App() {
  const { currentPage } = useNavigation();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "funding-calls":
        return <FundingCallsGrid />;
      case "settings":
        return <SettingsPage />;
      default:
        return <FundingCallsGrid />;
    }
  };

  return (
    <ProtectedRoute>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Navigation Bar */}
        <Navbar />

        {/* Main content area */}
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            // Different overflow behavior for different pages
            ...(currentPage === "settings" && {
              overflow: "auto", // Settings page needs scrolling
            }),
          }}
        >
          {renderCurrentPage()}
        </Box>
      </Box>
    </ProtectedRoute>
  );
}

export default App;
