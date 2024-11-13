import prisma from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const entity = await prisma.entity.findMany();
    return NextResponse.json(entity)
}

export async function POST(req:NextRequest) {
    const data = await req.json()
    const entity = await prisma.entity.create({data})
    return NextResponse.json({
        entity,
    })
}
