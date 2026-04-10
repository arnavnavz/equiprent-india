import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const minRate = searchParams.get("minRate");
    const maxRate = searchParams.get("maxRate");
    const search = searchParams.get("search");
    const userCity = searchParams.get("userCity");
    const userState = searchParams.get("userState");

    const where: Record<string, unknown> = { available: true };

    if (type && type !== "all") where.type = type;
    if (city) where.city = { contains: city };
    if (state) where.state = { contains: state };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
        { city: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (minRate || maxRate) {
      where.dailyRate = {};
      if (minRate) (where.dailyRate as Record<string, number>).gte = Number(minRate);
      if (maxRate) (where.dailyRate as Record<string, number>).lte = Number(maxRate);
    }

    const machines = await prisma.machine.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true, name: true, phone: true, city: true,
            machines: {
              select: { reviews: { select: { ownerRating: true } } },
            },
          },
        },
        reviews: { select: { rating: true, ownerRating: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const machinesWithRating = machines.map((m) => {
      const allOwnerReviews = m.owner.machines.flatMap((om) => om.reviews);
      const ownerAvgRating = allOwnerReviews.length > 0
        ? allOwnerReviews.reduce((sum, r) => sum + r.ownerRating, 0) / allOwnerReviews.length
        : 0;
      const ownerReviewCount = allOwnerReviews.filter((r) => r.ownerRating > 0).length;

      return {
        ...m,
        owner: {
          id: m.owner.id,
          name: m.owner.name,
          phone: m.owner.phone,
          city: m.owner.city,
          ownerAvgRating,
          ownerReviewCount,
        },
        avgRating: m.reviews.length > 0
          ? m.reviews.reduce((sum, r) => sum + r.rating, 0) / m.reviews.length
          : 0,
        reviewCount: m.reviews.length,
      };
    });

    if (userCity || userState) {
      const lc = (s: string) => s.toLowerCase().trim();
      const uc = userCity ? lc(userCity) : "";
      const us = userState ? lc(userState) : "";

      machinesWithRating.sort((a, b) => {
        const aCity = lc(a.city) === uc ? 0 : 1;
        const bCity = lc(b.city) === uc ? 0 : 1;
        if (aCity !== bCity) return aCity - bCity;

        const aState = lc(a.state) === us ? 0 : 1;
        const bState = lc(b.state) === us ? 0 : 1;
        if (aState !== bState) return aState - bState;

        return 0;
      });
    }

    return NextResponse.json({ machines: machinesWithRating });
  } catch (error) {
    console.error("Machines GET error:", error);
    return NextResponse.json({ error: "Failed to fetch machines" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Only owners can list machines" }, { status: 403 });
    }

    const data = await req.json();
    const machine = await prisma.machine.create({
      data: {
        ownerId: user.id,
        name: data.name,
        type: data.type,
        brand: data.brand,
        model: data.model,
        year: Number(data.year),
        description: data.description,
        imageUrl: data.imageUrl || "/machines/default.jpg",
        dailyRate: Number(data.dailyRate),
        hourlyRate: Number(data.hourlyRate) || 0,
        minBookingDays: Number(data.minBookingDays) || 1,
        city: data.city,
        state: data.state,
        pincode: data.pincode || "",
        operatorIncluded: data.operatorIncluded ?? true,
        fuelIncluded: data.fuelIncluded ?? false,
        capacity: data.capacity || "",
        specifications: data.specifications || "",
      },
    });

    return NextResponse.json({ machine }, { status: 201 });
  } catch (error) {
    console.error("Machine POST error:", error);
    return NextResponse.json({ error: "Failed to create machine listing" }, { status: 500 });
  }
}
