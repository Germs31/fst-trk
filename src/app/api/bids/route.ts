import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// Zod schema matching the form & Prisma model
const bidSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"]).default("PENDING"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  address: z.string().optional(),
  items: z.array(
    z.object({
      name: z.string().min(1, "Item name required"),
      description: z.string().optional(),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      unitPrice: z.number().min(0, "Unit price must be >= 0"),
      type: z.enum(["MATERIAL", "LABOR"]),
    })
  ).min(1, "At least one bid item is required"),
});
// GET
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bids = await prisma.bid.findMany({
      where: { companyId: session.user.companyId },
      include: {
        BidItem: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bids, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch bids" },
      { status: 500 }
    );
  }
}

// ADD 
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();

    // Validate request body
    const data = bidSchema.parse(json);
    console.log(data, '<-----')
    const session = await getServerSession(authOptions);
    console.log(session, '<00000')
    if (!session?.user?.id || !session.user.companyId) {
      return NextResponse.json({ error: "Unauthorized or company not found" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const companyId = session.user.companyId;

    // Calculate total amount from items
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    // Create bid with nested bid items
    const bid = await prisma.bid.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        address: data.address,
        amount: totalAmount,
        company: { connect: { id: companyId } },
        user: { connect: { id: userId } },
        BidItem: {
          create: data.items.map((item) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            type: item.type,
          })),
        },
      },
    });

    return NextResponse.json(bid, { status: 201 });
  } catch (err: any) {
    console.error(err);

    // Return Zod validation errors
    if (err instanceof z.ZodError) {
      return NextResponse.json({ errors: err }, { status: 400 });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// PATCH
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, description, status, customerName, customerEmail, customerPhone, address } =
      await req.json();

    const bid = await prisma.bid.update({
      where: { id },
      data: {
        title,
        description,
        status,
        customerName,
        customerEmail,
        customerPhone,
        address,
      },
    });

    return NextResponse.json(bid, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update bid" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    // Cascade delete: remove related BidItems first
    await prisma.bidItem.deleteMany({ where: { bidId: id } });
    await prisma.note.deleteMany({ where: { bidId: id } });

    await prisma.bid.delete({ where: { id } });

    return NextResponse.json({ message: "Bid deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete bid" }, { status: 500 });
  }
}

