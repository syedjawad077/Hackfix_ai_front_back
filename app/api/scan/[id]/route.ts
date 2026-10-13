import { NextRequest, NextResponse } from "next/server";
import { defaultScanReport, samplePastScans } from "@/lib/mock-data";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const match = samplePastScans.find((s) => s.id === id);

  if (match) {
    return NextResponse.json(match.report);
  }

  return NextResponse.json({
    ...defaultScanReport,
    id,
  });
}
