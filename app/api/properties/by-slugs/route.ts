import { NextRequest, NextResponse } from "next/server";
import { getPropertiesBySlugs } from "@/lib/properties";

export async function POST(req: NextRequest) {
  const { slugs } = await req.json();
  if (!Array.isArray(slugs)) {
    return NextResponse.json({ properties: [] }, { status: 400 });
  }
  const properties = await getPropertiesBySlugs(slugs);
  return NextResponse.json({ properties });
}
