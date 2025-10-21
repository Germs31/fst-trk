import { TextField, Box } from "@mui/material";

export default function CompanyStep({ formData, onChange }: any) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="Company Name"
        value={formData.companyName}
        onChange={(e) => onChange("companyName", e.target.value)}
      />
    </Box>
  );
}
