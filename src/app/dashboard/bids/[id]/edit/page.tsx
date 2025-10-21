"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";

export default function EditBidPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bid, setBid] = useState<any>(null);

  useEffect(() => {
    const fetchBid = async () => {
      const res = await fetch(`/api/bids/${id}`);
      const data = await res.json();
      setBid(data);
      setLoading(false);
    };
    fetchBid();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/bids", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bid),
    });
    if (res.ok) {
      alert("Bid updated!");
      router.push("/dashboard/bids");
    } else {
      alert("Error updating bid");
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box component={Paper} sx={{ p: 3, maxWidth: 800, mx: "auto", mt: 4 }}>
      <Typography variant="h5" mb={2}>Edit Bid</Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={bid.title}
          onChange={(e) => setBid({ ...bid, title: e.target.value })}
        />
        <TextField
          label="Description"
          fullWidth
          margin="normal"
          multiline
          rows={3}
          value={bid.description}
          onChange={(e) => setBid({ ...bid, description: e.target.value })}
        />
        <TextField
          label="Customer Name"
          fullWidth
          margin="normal"
          value={bid.customerName}
          onChange={(e) => setBid({ ...bid, customerName: e.target.value })}
        />
        <Button type="submit" variant="contained" sx={{ mt: 3 }}>
          Save Changes
        </Button>
      </form>
    </Box>
  );
}
