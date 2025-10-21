"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Button,
} from "@mui/material";
import GenerateBidPdf from "@/components/GenerateBidPdf";

export default function BidDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [bid, setBid] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBid = async () => {
      try {
        const res = await fetch(`/api/bids/${id}`);
        if (!res.ok) throw new Error("Failed to fetch bid");
        const data = await res.json();
        setBid(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBid();
  }, [id]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );

  if (!bid)
    return (
      <Typography align="center" mt={5}>
        Bid not found.
      </Typography>
    );

  const total = bid.BidItem.reduce(
    (sum: number, item: any) => sum + item.quantity * item.unitPrice,
    0
  );

  return (
    <Box component={Paper} sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {bid.title}
      </Typography>

      <Typography variant="subtitle1" color="text.secondary">
        Status: {bid.status}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Created on: {new Date(bid.createdAt).toLocaleDateString()}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Customer Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography>
            <strong>Name:</strong> {bid.customerName}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>
            <strong>Email:</strong> {bid.customerEmail || "—"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>
            <strong>Phone:</strong> {bid.customerPhone || "—"}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>
            <strong>Address:</strong> {bid.address || "—"}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Bid Items
      </Typography>
      {bid.BidItem.length === 0 ? (
        <Typography>No items added to this bid.</Typography>
      ) : (
        <Box>
          {bid.BidItem.map((item: any) => (
            <Grid
              container
              spacing={2}
              key={item.id}
              sx={{
                borderBottom: "1px solid #e0e0e0",
                pb: 1,
                mb: 1,
              }}
            >
              <Grid item xs={12} sm={4}>
                <Typography>
                  <strong>{item.name}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.type}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Typography>Qty: {item.quantity}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography>Unit: ${item.unitPrice.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography>
                  Total: ${(item.quantity * item.unitPrice).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          ))}
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" align="right" gutterBottom>
        Grand Total: ${total.toFixed(2)}
      </Typography>

      <Box mt={3} display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={() => router.back()}>
          Back
        </Button>
        <GenerateBidPdf bid={{ ...bid, items: bid.BidItem }} />
      </Box>
    </Box>
  );
}
