"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
  IconButton,
  Button,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import GenerateBidPdf from "@/components/GenerateBidPdf"; // your PDF component
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";

type Bid = {
  id: string;
  title: string;
  customerName: string;
  amount: number;
  status: string;
  createdAt: string;
  BidItem: {
    name: string;
    quantity: number;
    unitPrice: number;
    type: "MATERIAL" | "LABOR";
  }[];
};

export default function BidsPage() {
  const router = useRouter();
  
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await fetch("/api/bids");
        const data = await res.json();
        setBids(data);
      } catch (err) {
        console.error("Error fetching bids", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bid?")) return;
    const res = await fetch("/api/bids", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      alert("Bid deleted successfully!");
      router.refresh(); // re-fetch data
    } else {
      alert("Error deleting bid.");
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box component={Paper} sx={{ p: 3, maxWidth: 1000, mx: "auto", mt: 4 }}>
      <Typography variant="h5" mb={3}>
        All Bids
      </Typography>

      {bids.length === 0 ? (
        <Typography>No bids created yet.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bids.map((bid) => (
              <TableRow key={bid.id} hover>
                <TableCell>{bid.title}</TableCell>
                <TableCell>{bid.customerName}</TableCell>
                <TableCell>{bid.status}</TableCell>
                <TableCell align="right">${bid.amount.toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(bid.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  <GenerateBidPdf
                    bid={{
                      ...bid,
                      items: bid.BidItem, // map Prisma relation name to what the PDF expects
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={() =>
                      router.push(`/dashboard/bids/${bid.id}/edit`)
                    }
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(bid.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Box textAlign="right" mt={3}>
        <Button href="/dashboard/bids/new" variant="contained">
          + New Bid
        </Button>
      </Box>
    </Box>
  );
}
