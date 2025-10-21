// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { Box, Button, Step, StepLabel, Stepper, Typography } from "@mui/material";
import CompanyStep from "@/components/register/CompanyStep";
import AdminStep from "@/components/register/AdminStep";
import ConfirmStep from "@/components/register/ConfirmStep";

const steps = ["Company Info", "Admin Info", "Confirm & Create"];

export default function RegisterPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("Account created successfully!");
      // optionally redirect to login
    } else {
      alert("Error creating account");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 6, p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Create Your Company Account
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <CompanyStep formData={formData} onChange={handleChange} />
      )}
      {activeStep === 1 && (
        <AdminStep formData={formData} onChange={handleChange} />
      )}
      {activeStep === 2 && (
        <ConfirmStep formData={formData} />
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Create Account
          </Button>
        )}
      </Box>
    </Box>
  );
}
