import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    const existingCompany = await prisma.company.findFirst({ where: { name } });

    if (existingCompany) {
      return NextResponse.json({ error: "Company already exists" }, { status: 400 });
    }

    const company = await prisma.company.create({
      data: { name },
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error("Company creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
