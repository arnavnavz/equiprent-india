import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookingId, rating, ownerRating, comment } = await req.json();

    if (!bookingId || !rating || !ownerRating) {
      return NextResponse.json({ error: "Booking ID, machine rating, and owner rating are required" }, { status: 400 });
    }

    if (rating < 1 || rating > 5 || ownerRating < 1 || ownerRating > 5) {
      return NextResponse.json({ error: "Ratings must be between 1 and 5" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { machine: true, review: true },
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.renterId !== user.id) return NextResponse.json({ error: "Only the renter can review" }, { status: 403 });
    if (booking.status !== "completed") return NextResponse.json({ error: "Can only review completed bookings" }, { status: 400 });
    if (booking.review) return NextResponse.json({ error: "Already reviewed" }, { status: 400 });

    const review = await prisma.review.create({
      data: {
        bookingId,
        machineId: booking.machineId,
        userId: user.id,
        rating: Number(rating),
        ownerRating: Number(ownerRating),
        comment: comment || "",
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Review POST error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
