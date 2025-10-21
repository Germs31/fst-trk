import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bid = await prisma.bid.findUnique({
      where: { id: params.id },
      include: {
        BidItem: true,
        user: true,
        company: true,
      },
    });

    if (!bid || bid.companyId !== session.user.companyId) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    return NextResponse.json(bid);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch bid" },
      { status: 500 }
    );
  }
}
