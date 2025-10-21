"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper,
  IconButton,
  Grid,
  Divider,
} from "@mui/material";
import { AddCircle, RemoveCircle } from "@mui/icons-material";

type BidItem = {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  type: "MATERIAL" | "LABOR";
};

export default function CreateBidPage() {
  // Bid Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PENDING");

  // Customer Info
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");

  // Bid Items
  const [items, setItems] = useState<BidItem[]>([
    { name: "", quantity: 1, unitPrice: 0, type: "MATERIAL" },
  ]);

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const handleAddItem = () =>
    setItems([...items, { name: "", quantity: 1, unitPrice: 0, type: "MATERIAL" }]);

  const handleRemoveItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  const handleItemChange = (index: number, key: keyof BidItem, value: any) => {
    const updated = [...items];
    updated[index][key] = value;
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/bids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        status,
        customerName,
        customerEmail,
        customerPhone,
        address,
        items,
      }),
    });

    if (res.ok) {
      alert("Bid created successfully!");
      // reset form
      setTitle("");
      setDescription("");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setAddress("");
      setItems([{ name: "", quantity: 1, unitPrice: 0, type: "MATERIAL" }]);
    } else {
      alert("Error creating bid");
    }
  };

  return (
    <Box component={Paper} sx={{ p: 3, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" mb={2}>
        Create New Bid
      </Typography>

      <form onSubmit={handleSubmit}>
        {/* Bid Information */}
        <Typography variant="h6" mt={2}>
          Bid Information
        </Typography>

        <TextField
          label="Bid Title"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <TextField
          label="Description"
          fullWidth
          margin="normal"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <TextField
          label="Status"
          select
          fullWidth
          margin="normal"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="ACCEPTED">Accepted</MenuItem>
          <MenuItem value="REJECTED">Rejected</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
        </TextField>

        <Divider sx={{ my: 3 }} />

        {/* Customer Information */}
        <Typography variant="h6" mt={2}>
          Customer Information
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Customer Name"
              fullWidth
              margin="normal"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Customer Email"
              type="email"
              fullWidth
              margin="normal"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Customer Phone"
              fullWidth
              margin="normal"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Address"
              fullWidth
              margin="normal"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Bid Items */}
        <Typography variant="h6" mt={2}>
          Bid Items
        </Typography>

        {items.map((item, index) => (
          <Grid
            container
            spacing={2}
            alignItems="center"
            key={index}
            sx={{ mt: 1 }}
          >
            <Grid item xs={12} sm={3}>
              <TextField
                label="Item Name"
                fullWidth
                value={item.name}
                onChange={(e) => handleItemChange(index, "name", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Qty"
                type="number"
                fullWidth
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, "quantity", parseInt(e.target.value))
                }
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Unit Price"
                type="number"
                fullWidth
                value={item.unitPrice}
                onChange={(e) =>
                  handleItemChange(index, "unitPrice", parseFloat(e.target.value))
                }
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Type"
                select
                fullWidth
                value={item.type}
                onChange={(e) =>
                  handleItemChange(index, "type", e.target.value as "MATERIAL" | "LABOR")
                }
              >
                <MenuItem value="MATERIAL">Material</MenuItem>
                <MenuItem value="LABOR">Labor</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <IconButton color="error" onClick={() => handleRemoveItem(index)}>
                <RemoveCircle />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Button
          startIcon={<AddCircle />}
          sx={{ mt: 2 }}
          onClick={handleAddItem}
        >
          Add Item
        </Button>

        <Typography variant="h6" align="right" mt={3}>
          Total: ${total.toFixed(2)}
        </Typography>

        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
          Create Bid
        </Button>
      </form>
    </Box>
  );
}
