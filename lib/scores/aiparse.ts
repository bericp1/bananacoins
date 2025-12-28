import {
  GoogleGenAI,
  Type,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import * as FileType from "file-type";

export async function parseScoresFromAI<Players extends string>({
  image,
  players,
}: {
  image: Buffer;
  players: Players[];
}): Promise<{ [player in Players]: number }> {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const imageAsBlob = new Blob([Uint8Array.from(image)]);
  const fileType = await FileType.fileTypeFromBuffer(image);
  if (!fileType) {
    throw new Error("Could not determine file type");
  }
  const aiFile = await ai.files.upload({
    file: imageAsBlob,
    config: {
      displayName: `scores.${fileType.ext}`,
      mimeType: fileType.mime,
    },
  });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: players,
        properties: Object.fromEntries(
          players.map((player) => [
            player,
            {
              type: Type.INTEGER,
            },
          ]),
        ),
      },
    },
    contents: createUserContent([
      createPartFromUri(aiFile.uri!, aiFile.mimeType!),
      `Parse the user scores from this leaderboard image. The players are: ${players.join(", ")}. Return the scores in a JSON object with the players as the keys and the scores as the values.`,
    ]),
  });
  if (response.text) {
    return JSON.parse(response.text);
  }
  throw new Error("No response from AI");
}
