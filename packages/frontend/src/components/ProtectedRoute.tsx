import { type ReactNode } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import LoginPage from "./LoginPage";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Component that protects routes by requiring authentication
 * Shows loading spinner while checking auth state
 * Redirects to login if not authenticated
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication state
  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Authentifizierung wird geprüft...
        </Typography>
      </Box>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // User is authenticated, show protected content
  return <>{children}</>;
}
