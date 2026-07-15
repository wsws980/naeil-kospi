import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getAds, updateAd } from "@/lib/db";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { AdSlotData } from "@/lib/types";

const VALID_IDS: AdSlotData["id"][] = ["ad1", "ad2", "ad3"];
const UPLOAD_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function GET() {
  const ads = await getAds();
  return NextResponse.json(ads);
}

/**
 * multipart/form-data 로 받습니다.
 * fields: id (ad1|ad2|ad3), linkUrl, enabled, image(file, optional)
 * 이미지가 없으면 기존 이미지를 유지합니다. imageUrl="" 을 명시적으로 보내면 이미지를 제거합니다.
 */
export async function PUT(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const formData = await request.formData();
  const id = formData.get("id") as AdSlotData["id"] | null;
  const linkUrl = formData.get("linkUrl") as string | null;
  const enabledRaw = formData.get("enabled") as string | null;
  const clearImage = formData.get("clearImage") === "true";
  const file = formData.get("image") as File | null;

  if (!id || !VALID_IDS.includes(id)) {
    return NextResponse.json({ error: "올바르지 않은 광고 슬롯입니다." }, { status: 400 });
  }

  const updateData: Partial<Pick<AdSlotData, "imageUrl" | "linkUrl" | "enabled">> = {};

  if (linkUrl !== null) updateData.linkUrl = linkUrl.trim() || null;
  if (enabledRaw !== null) updateData.enabled = enabledRaw === "true";

  if (clearImage) {
    updateData.imageUrl = null;
  } else if (file && file.size > 0) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "PNG, JPEG, WEBP, GIF 이미지만 업로드할 수 있습니다." },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "이미지 용량은 2MB 이하여야 합니다." },
        { status: 400 }
      );
    }
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const fileName = `${id}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOAD_DIR, fileName), buffer);
    updateData.imageUrl = `/uploads/${fileName}`;
  }

  const updated = await updateAd(id, updateData);
  return NextResponse.json(updated);
}
