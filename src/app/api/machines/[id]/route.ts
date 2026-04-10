import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser().catch(() => null);

    const machine = await prisma.machine.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true, name: true, phone: true, city: true, state: true,
            machines: {
              select: { reviews: { select: { ownerRating: true } } },
            },
          },
        },
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        bookings: {
          where: { status: { in: ["confirmed", "active"] } },
          select: { startDate: true, endDate: true },
        },
      },
    });

    if (!machine) {
      return NextResponse.json({ error: "Machine not found" }, { status: 404 });
    }

    const avgRating = machine.reviews.length > 0
      ? machine.reviews.reduce((sum, r) => sum + r.rating, 0) / machine.reviews.length
      : 0;

    const allOwnerReviews = machine.owner.machines.flatMap((om) => om.reviews);
    const ownerAvgRating = allOwnerReviews.length > 0
      ? allOwnerReviews.reduce((sum, r) => sum + r.ownerRating, 0) / allOwnerReviews.length
      : 0;
    const ownerReviewCount = allOwnerReviews.filter((r) => r.ownerRating > 0).length;

    let showPhone = false;
    if (currentUser) {
      if (currentUser.id === machine.owner.id) {
        showPhone = true;
      } else {
        const confirmedBooking = await prisma.booking.findFirst({
          where: {
            machineId: id,
            renterId: currentUser.id,
            status: { in: ["confirmed", "active"] },
          },
        });
        if (confirmedBooking) showPhone = true;
      }
    }

    return NextResponse.json({
      machine: {
        ...machine,
        avgRating,
        reviewCount: machine.reviews.length,
        owner: {
          id: machine.owner.id,
          name: machine.owner.name,
          phone: showPhone ? machine.owner.phone : null,
          city: machine.owner.city,
          state: machine.owner.state,
          ownerAvgRating,
          ownerReviewCount,
        },
      },
    });
  } catch (error) {
    console.error("Machine GET error:", error);
    return NextResponse.json({ error: "Failed to fetch machine" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const machine = await prisma.machine.findUnique({ where: { id } });
    if (!machine || machine.ownerId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const data = await req.json();
    const updated = await prisma.machine.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        brand: data.brand,
        model: data.model,
        year: data.year ? Number(data.year) : undefined,
        description: data.description,
        dailyRate: data.dailyRate ? Number(data.dailyRate) : undefined,
        hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
        city: data.city,
        state: data.state,
        available: data.available,
        operatorIncluded: data.operatorIncluded,
        fuelIncluded: data.fuelIncluded,
        capacity: data.capacity,
        specifications: data.specifications,
      },
    });

    return NextResponse.json({ machine: updated });
  } catch (error) {
    console.error("Machine PUT error:", error);
    return NextResponse.json({ error: "Failed to update machine" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const machine = await prisma.machine.findUnique({ where: { id } });
    if (!machine || machine.ownerId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.machine.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Machine DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete machine" }, { status: 500 });
  }
}
