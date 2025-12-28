import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { parseScoresFromAI } from "@/lib/scores/aiparse";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const rawImage = formData.get("image");
  const rawPlayers = formData.get("players");

  if (!rawImage || !rawPlayers) {
    return NextResponse.json(
      { error: "Missing image or players" },
      { status: 400 },
    );
  }

  if (!(rawImage instanceof File)) {
    return NextResponse.json(
      { error: "Image must be a file" },
      { status: 400 },
    );
  }

  if (typeof rawPlayers !== "string") {
    return NextResponse.json(
      { error: "Players must be a string" },
      { status: 400 },
    );
  }

  let players: string[];
  try {
    const intermediatePlayers = JSON.parse(rawPlayers);
    if (!Array.isArray(intermediatePlayers)) {
      return NextResponse.json(
        { error: "Players must be an array" },
        { status: 400 },
      );
    }
    players = intermediatePlayers as string[];
  } catch {
    return NextResponse.json(
      { error: "Invalid players JSON" },
      { status: 400 },
    );
  }

  const image = Buffer.from(await rawImage.bytes());
  const scores = await parseScoresFromAI({ image, players });
  return NextResponse.json({ scores });
}
