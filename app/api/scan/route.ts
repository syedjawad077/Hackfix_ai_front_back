import { NextRequest, NextResponse } from "next/server";
import { initialFindings, sampleScanLogs, defaultScanReport } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let targetUrl = "";
    let ownershipVerified = false;
    let zipFileName: string | undefined;
    let zipFileSize: number | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      targetUrl = (formData.get("target_url") as string) || "";
      ownershipVerified = formData.get("ownership_verified") === "true";
      const file = formData.get("source_zip") as File | null;
      if (file && file.name) {
        zipFileName = file.name;
        zipFileSize = file.size;
      }
    } else {
      const body = await req.json();
      targetUrl = body.target_url || body.targetUrl || "";
      ownershipVerified = Boolean(body.ownership_verified || body.ownershipVerified);
    }

    if (!targetUrl) {
      return NextResponse.json(
        { error: "Target URL is required" },
        { status: 400 }
      );
    }

    const scanId = `scan-${Date.now().toString(36)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const report = {
      ...defaultScanReport,
      id: scanId,
      targetUrl,
      hasSourceZip: Boolean(zipFileName),
      zipFileName,
      zipFileSize,
      ownershipVerified,
      createdAt: `Today, ${nowTime}`,
      verdict: "Your app has 3 serious problems to fix",
      findings: initialFindings,
    };

    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
