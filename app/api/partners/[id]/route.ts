import prisma from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const partners = await prisma.partners.findMany({ where: { entity_id: id }, include: { partner_account_number: true } });
        return NextResponse.json(partners);
    } catch (error) {
        console.error("Error fetching partners:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req:NextRequest) {
    const data = await req.json()
    const entity = await prisma.entity.create({data})
    return NextResponse.json({
        entity,
    })
}
