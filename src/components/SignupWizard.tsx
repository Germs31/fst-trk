// components/SignupWizard.tsx
"use client";

import React, { useState } from "react";
import { Box, Button, Step, StepLabel, Stepper, TextField } from "@mui/material";

const steps = ["Company Info", "Admin Info", "Complete"];

export default function SignupWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleNext = async () => {
    if (activeStep === 0) {
      // Call API to create company
      await fetch("/api/company", {
        method: "POST",
        body: JSON.stringify({ name: companyName }),
        headers: { "Content-Type": "application/json" },
      });
    } else if (activeStep === 1) {
      // Call API to create user tied to company
      await fetch("/api/user", {
        method: "POST",
        body: JSON.stringify({ firstName, lastName, email, password }),
        headers: { "Content-Type": "application/json" },
      });
    }
    setActiveStep(prev => prev + 1);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 400, mx: "auto", mt: 5 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Company Name"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
          />
          <Button sx={{ mt: 2 }} variant="contained" fullWidth onClick={handleNext}>
            Next
          </Button>
        </Box>
      )}

      {activeStep === 1 && (
        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" fullWidth onClick={handleNext}>
            Next
          </Button>
        </Box>
      )}

      {activeStep === 2 && (
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <h2>Welcome, {firstName}!</h2>
          <p>Registration complete. Redirecting to your dashboard...</p>
        </Box>
      )}
    </Box>
  );
}
