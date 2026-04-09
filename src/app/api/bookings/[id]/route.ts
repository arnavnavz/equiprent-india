import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { machine: true },
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const isOwner = booking.machine.ownerId === user.id;
    const isRenter = booking.renterId === user.id;

    if (status === "confirmed" && !isOwner) {
      return NextResponse.json({ error: "Only owners can confirm bookings" }, { status: 403 });
    }
    if (status === "cancelled" && !isOwner && !isRenter) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    if (status === "completed" && !isOwner) {
      return NextResponse.json({ error: "Only owners can mark complete" }, { status: 403 });
    }
    if (status === "active" && !isOwner) {
      return NextResponse.json({ error: "Only owners can start bookings" }, { status: 403 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("Booking PATCH error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
