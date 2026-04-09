import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let bookings;

    if (user.role === "owner") {
      bookings = await prisma.booking.findMany({
        where: { machine: { ownerId: user.id } },
        include: {
          machine: { select: { id: true, name: true, type: true, imageUrl: true } },
          renter: { select: { name: true, phone: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      bookings = await prisma.booking.findMany({
        where: { renterId: user.id },
        include: {
          machine: {
            select: { id: true, name: true, type: true, imageUrl: true, city: true, state: true },
            include: { owner: { select: { name: true, phone: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Bookings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { machineId, startDate, endDate, projectName, projectAddress, notes } = await req.json();

    const machine = await prisma.machine.findUnique({ where: { id: machineId } });
    if (!machine) return NextResponse.json({ error: "Machine not found" }, { status: 404 });
    if (!machine.available) return NextResponse.json({ error: "Machine not available" }, { status: 400 });

    if (machine.ownerId === user.id) {
      return NextResponse.json({ error: "Cannot book your own machine" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    if (totalDays < machine.minBookingDays) {
      return NextResponse.json(
        { error: `Minimum booking is ${machine.minBookingDays} day(s)` },
        { status: 400 }
      );
    }

    const conflicting = await prisma.booking.findFirst({
      where: {
        machineId,
        status: { in: ["confirmed", "active"] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
    });

    if (conflicting) {
      return NextResponse.json({ error: "Machine is already booked for these dates" }, { status: 400 });
    }

    const totalAmount = totalDays * machine.dailyRate;

    const booking = await prisma.booking.create({
      data: {
        machineId,
        renterId: user.id,
        startDate: start,
        endDate: end,
        totalDays,
        totalAmount,
        projectName: projectName || "",
        projectAddress: projectAddress || "",
        notes: notes || "",
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("Booking POST error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
