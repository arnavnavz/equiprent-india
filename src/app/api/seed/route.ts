import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST() {
  try {
    await prisma.review.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.machine.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await hashPassword("password123");

    const owners = await Promise.all([
      prisma.user.create({ data: { name: "Rajesh Sharma", email: "rajesh@example.com", phone: "9876543210", passwordHash, role: "owner", city: "Mumbai", state: "Maharashtra" } }),
      prisma.user.create({ data: { name: "Suresh Patel", email: "suresh@example.com", phone: "9876543211", passwordHash, role: "owner", city: "Ahmedabad", state: "Gujarat" } }),
      prisma.user.create({ data: { name: "Arun Kumar", email: "arun@example.com", phone: "9876543212", passwordHash, role: "owner", city: "Delhi", state: "Delhi" } }),
      prisma.user.create({ data: { name: "Venkatesh Reddy", email: "venkatesh@example.com", phone: "9876543213", passwordHash, role: "owner", city: "Hyderabad", state: "Telangana" } }),
      prisma.user.create({ data: { name: "Krishnan Iyer", email: "krishnan@example.com", phone: "9876543214", passwordHash, role: "owner", city: "Chennai", state: "Tamil Nadu" } }),
    ]);

    await prisma.user.create({ data: { name: "Amit Singh", email: "amit@example.com", phone: "9988776655", passwordHash, role: "renter", city: "Pune", state: "Maharashtra" } });

    const machines = [
      { ownerId: owners[0].id, name: "JCB 3DX Backhoe Loader", type: "jcb", brand: "JCB", model: "3DX Super", year: 2022, description: "Well-maintained JCB 3DX Super backhoe loader, ideal for digging, trenching, and loading work. Recently serviced with new hydraulic hoses. Experienced operator available 7 days a week. Perfect for foundation work, drainage projects, and site leveling.", imageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=600&h=400&fit=crop", dailyRate: 8000, hourlyRate: 1200, minBookingDays: 1, city: "Mumbai", state: "Maharashtra", pincode: "400001", operatorIncluded: true, fuelIncluded: false, capacity: "76 HP, Bucket 0.27 cu.m", specifications: "Digging depth: 4.73m, Loading height: 3.51m" },
      { ownerId: owners[0].id, name: "TATA Hitachi EX200 Excavator", type: "excavator", brand: "TATA Hitachi", model: "EX200", year: 2021, description: "Powerful 20-ton excavator for heavy earthmoving, deep excavation, and demolition. Equipped with rock breaker. Operator has 12+ years experience in metro and highway projects.", imageUrl: "https://images.unsplash.com/photo-1580901368919-7738efb0f228?w=600&h=400&fit=crop", dailyRate: 15000, hourlyRate: 2200, minBookingDays: 3, city: "Mumbai", state: "Maharashtra", pincode: "400018", operatorIncluded: true, fuelIncluded: false, capacity: "20 Ton, 150 HP", specifications: "Digging depth: 6.7m, Bucket: 0.8 cu.m, Swing speed: 12 rpm" },
      { ownerId: owners[1].id, name: "ACE 14 Ton Mobile Crane", type: "crane", brand: "ACE", model: "ACE FX150", year: 2023, description: "Latest model ACE 14-ton mobile crane with telescopic boom. Perfect for steel erection, heavy lifting, and equipment placement. Certified operator with safety training.", imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop", dailyRate: 25000, hourlyRate: 3500, minBookingDays: 1, city: "Ahmedabad", state: "Gujarat", pincode: "380001", operatorIncluded: true, fuelIncluded: true, capacity: "14 Ton lifting capacity", specifications: "Boom length: 30m, Max lifting height: 32m" },
      { ownerId: owners[1].id, name: "Mahindra 575 DI Tractor", type: "tractor", brand: "Mahindra", model: "575 DI", year: 2022, description: "Versatile 45HP tractor with trolley, ideal for material transport, leveling, and agricultural work. Can be fitted with various attachments. Driver available for double shifts.", imageUrl: "https://images.unsplash.com/photo-1605338198618-2af781b67a40?w=600&h=400&fit=crop", dailyRate: 4500, hourlyRate: 700, minBookingDays: 1, city: "Surat", state: "Gujarat", pincode: "395001", operatorIncluded: true, fuelIncluded: false, capacity: "45 HP", specifications: "4WD, PTO: 540 RPM, Trolley capacity: 3 ton" },
      { ownerId: owners[2].id, name: "Ashok Leyland 16-Wheeler Tipper", type: "truck", brand: "Ashok Leyland", model: "2820 BS6", year: 2023, description: "Heavy-duty 16-wheeler tipper for sand, gravel, and debris transport. BS6 compliant. Experienced driver with all necessary permits and licenses.", imageUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&h=400&fit=crop", dailyRate: 12000, hourlyRate: 1800, minBookingDays: 1, city: "Delhi", state: "Delhi", pincode: "110001", operatorIncluded: true, fuelIncluded: false, capacity: "28 Ton payload", specifications: "280 HP, 10-speed gearbox, Air brake system" },
      { ownerId: owners[2].id, name: "Caterpillar D6 Bulldozer", type: "bulldozer", brand: "Caterpillar", model: "D6", year: 2020, description: "CAT D6 bulldozer for heavy-duty land clearing, grading, and push work. Ideal for highway projects, industrial site preparation, and mining operations.", imageUrl: "https://images.unsplash.com/photo-1621922688758-441698257e88?w=600&h=400&fit=crop", dailyRate: 20000, hourlyRate: 3000, minBookingDays: 5, city: "Gurgaon", state: "Haryana", pincode: "122001", operatorIncluded: true, fuelIncluded: false, capacity: "215 HP", specifications: "Blade width: 3.9m, Operating weight: 20 ton" },
      { ownerId: owners[3].id, name: "Schwing Stetter Transit Mixer", type: "concrete_mixer", brand: "Schwing Stetter", model: "AM 6 FHC+", year: 2023, description: "6 cubic meter transit mixer for ready-mix concrete delivery. GPS-tracked for real-time location monitoring. Available for long-term contracts.", imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop", dailyRate: 10000, hourlyRate: 1500, minBookingDays: 1, city: "Hyderabad", state: "Telangana", pincode: "500001", operatorIncluded: true, fuelIncluded: true, capacity: "6 Cubic Meters", specifications: "Drum speed: 0-14 rpm, Discharge: 3 min" },
      { ownerId: owners[3].id, name: "CASE 770 Road Roller", type: "roller", brand: "CASE", model: "770 EX", year: 2021, description: "8-ton vibratory road roller for soil and asphalt compaction. Excellent for road construction, site compaction, and paving work.", imageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=600&h=400&fit=crop", dailyRate: 9000, hourlyRate: 1400, minBookingDays: 2, city: "Hyderabad", state: "Telangana", pincode: "500034", operatorIncluded: true, fuelIncluded: false, capacity: "8 Ton", specifications: "Drum width: 2.13m, Centrifugal force: 155 kN" },
      { ownerId: owners[4].id, name: "JCB 205 Skid Steer Loader", type: "jcb", brand: "JCB", model: "205", year: 2023, description: "Compact and agile skid steer loader for tight-space operations. Multiple attachments available including bucket, forks, and auger.", imageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=600&h=400&fit=crop", dailyRate: 6500, hourlyRate: 1000, minBookingDays: 1, city: "Chennai", state: "Tamil Nadu", pincode: "600001", operatorIncluded: true, fuelIncluded: false, capacity: "60 HP, Bucket 0.4 cu.m", specifications: "Operating weight: 3.2 ton, Lift capacity: 900 kg" },
      { ownerId: owners[4].id, name: "Komatsu PC210 Excavator", type: "excavator", brand: "Komatsu", model: "PC210", year: 2022, description: "Heavy 21-ton excavator with excellent fuel efficiency. KOMTRAX satellite monitoring. Two operators available for 24-hour operations.", imageUrl: "https://images.unsplash.com/photo-1580901368919-7738efb0f228?w=600&h=400&fit=crop", dailyRate: 16000, hourlyRate: 2400, minBookingDays: 3, city: "Bangalore", state: "Karnataka", pincode: "560001", operatorIncluded: true, fuelIncluded: false, capacity: "21 Ton, 159 HP", specifications: "Digging depth: 6.89m, Bucket: 0.92 cu.m" },
      { ownerId: owners[2].id, name: "BharatBenz 1617R Tipper Truck", type: "truck", brand: "BharatBenz", model: "1617R", year: 2024, description: "Brand new BharatBenz tipper with 16-ton GVW. BS6 Phase II compliant with excellent mileage. Full insurance and permit coverage.", imageUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&h=400&fit=crop", dailyRate: 9500, hourlyRate: 1400, minBookingDays: 1, city: "Noida", state: "Uttar Pradesh", pincode: "201301", operatorIncluded: true, fuelIncluded: false, capacity: "10 Ton payload", specifications: "170 HP, 6-speed gearbox" },
      { ownerId: owners[0].id, name: "Escorts Hydra 12 Ton Crane", type: "crane", brand: "Escorts", model: "Hydra 1242", year: 2021, description: "Pick & carry hydraulic mobile crane for factories, construction sites, and warehouses. Compact turning radius allows operation in confined spaces.", imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop", dailyRate: 18000, hourlyRate: 2800, minBookingDays: 1, city: "Pune", state: "Maharashtra", pincode: "411001", operatorIncluded: true, fuelIncluded: false, capacity: "12 Ton lifting capacity", specifications: "Boom length: 9.14m, Max height: 10m" },
    ];

    for (const machine of machines) {
      await prisma.machine.create({ data: machine });
    }

    return NextResponse.json({
      message: `Seeded: ${owners.length} owners, 1 renter, ${machines.length} machines`,
      accounts: [
        { role: "owner", email: "rajesh@example.com", password: "password123" },
        { role: "owner", email: "suresh@example.com", password: "password123" },
        { role: "owner", email: "arun@example.com", password: "password123" },
        { role: "renter", email: "amit@example.com", password: "password123" },
      ],
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seeding failed" }, { status: 500 });
  }
}
