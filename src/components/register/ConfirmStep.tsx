import { Box, Typography } from "@mui/material";

export default function ConfirmStep({ formData }: any) {
  return (
    <Box>
      <Typography variant="h6">Review Your Information:</Typography>
      <Typography>Company: {formData.companyName}</Typography>
      <Typography>
        Admin: {formData.firstName} {formData.lastName}
      </Typography>
      <Typography>Email: {formData.email}</Typography>
    </Box>
  );
}
