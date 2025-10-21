import { TextField, Box } from "@mui/material";

export default function AdminStep({ formData, onChange }: any) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="First Name"
        value={formData.firstName}
        onChange={(e) => onChange("firstName", e.target.value)}
      />
      <TextField
        label="Last Name"
        value={formData.lastName}
        onChange={(e) => onChange("lastName", e.target.value)}
      />
      <TextField
        label="Email"
        value={formData.email}
        onChange={(e) => onChange("email", e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => onChange("password", e.target.value)}
      />
    </Box>
  );
}
