import { NextRequest, NextResponse } from "next/server";

// Flower name mapping (Vietnamese → English for better AI prompt)
const flowerNameMap: Record<string, string> = {
    rose: "roses",
    tulip: "tulips",
    sunflower: "sunflowers",
    lily: "lilies",
    daisy: "daisies",
    orchid: "orchids",
    hydrangea: "hydrangeas",
    baby_breath: "baby's breath (gypsophila)",
};

const colorMap: Record<string, string> = {
    pink: "soft pastel pink",
    red: "deep romantic red",
    white: "pure elegant white",
    yellow: "warm sunny yellow",
    purple: "lavender purple",
    orange: "vibrant coral orange",
    mix: "mixed colorful (pink, yellow, purple, white)",
};

const styleMap: Record<string, string> = {
    round: "classic round hand-tied bouquet",
    long: "long-stemmed elegant bouquet wrapped vertically",
    cascade: "cascading waterfall-style bouquet with trailing greenery",
    basket: "flower arrangement in a woven basket",
    box: "luxury flower box arrangement (flowers arranged neatly in a square/round gift box)",
};

const wrappingMap: Record<string, string> = {
    kraft: "rustic brown kraft paper wrapping with twine bow",
    silk: "delicate silk tissue paper wrapping in matching soft tones",
    korean: "modern Korean-style wrapping paper with clean elegant folds",
    transparent: "minimalist clear cellophane wrapping with ribbon",
    newspaper: "trendy vintage newspaper-style wrapping paper",
};

const priceToSizeMap: Record<string, string> = {
    budget: "small to medium sized, simple but charming",
    mid: "medium sized, well-arranged with moderate fullness",
    premium: "large and lush, generously filled with flowers and foliage",
    luxury: "extra large, extravagant and luxurious with premium flowers and abundant greenery",
};

function buildPrompt(selections: {
    flowers: string[];
    color: string;
    style: string;
    wrapping: string;
    priceRange: string;
}): string {
    const flowers = selections.flowers
        .map((f) => flowerNameMap[f] || f)
        .join(", ");
    const color = colorMap[selections.color] || selections.color;
    const style = styleMap[selections.style] || selections.style;
    const wrapping = wrappingMap[selections.wrapping] || selections.wrapping;
    const size = priceToSizeMap[selections.priceRange] || "medium sized";

    return `Generate a stunning, photorealistic product photograph of a ${style} featuring ${flowers} in ${color} tones.

The bouquet should be ${size}, wrapped in ${wrapping}.

Photography requirements:
- Professional florist product photography style
- Soft, natural lighting with gentle shadows
- Clean white or very light pastel background
- Shot from a slight angle to show depth and dimension
- Sharp focus on the flowers with subtle bokeh in the background
- The arrangement should look fresh, vibrant, and professionally made
- Include natural green foliage and filler flowers for fullness
- The overall mood should be romantic, elegant, and premium

Do NOT include any text, watermarks, logos, human hands, or faces in the image.`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { flowers, color, style, wrapping, priceRange } = body;

        // Validate
        if (!flowers?.length || !color || !style || !wrapping || !priceRange) {
            return NextResponse.json(
                { error: "Vui lòng hoàn thành tất cả các bước trước khi tạo ảnh." },
                { status: 400 }
            );
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey || apiKey === "your_google_api_key_here") {
            return NextResponse.json(
                { error: "API key chưa được cấu hình. Vui lòng thêm GOOGLE_API_KEY vào file .env" },
                { status: 500 }
            );
        }

        const prompt = buildPrompt({ flowers, color, style, wrapping, priceRange });

        // Call Gemini Nano Banana (gemini-2.5-flash-image) for image generation
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }],
                        },
                    ],
                    generationConfig: {
                        responseModalities: ["IMAGE"],
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini Nano Banana error:", response.status, errorText);

            // Fallback: try Imagen 4
            const imagenResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        instances: [{ prompt }],
                        parameters: {
                            sampleCount: 1,
                            aspectRatio: "1:1",
                            safetyFilterLevel: "BLOCK_MEDIUM_AND_ABOVE",
                        },
                    }),
                }
            );

            if (!imagenResponse.ok) {
                const imagenError = await imagenResponse.text();
                console.error("Imagen 4 API error:", imagenResponse.status, imagenError);
                return NextResponse.json(
                    { error: "Không thể tạo ảnh. Vui lòng kiểm tra API key và thử lại." },
                    { status: 500 }
                );
            }

            const imagenData = await imagenResponse.json();
            const base64Image = imagenData?.predictions?.[0]?.bytesBase64Encoded;
            if (base64Image) {
                return NextResponse.json({
                    image: `data:image/png;base64,${base64Image}`,
                    prompt,
                });
            }

            return NextResponse.json(
                { error: "Không nhận được ảnh từ AI. Vui lòng thử lại." },
                { status: 500 }
            );
        }

        const data = await response.json();

        // Extract image from Gemini response
        const parts = data?.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData) {
                const { mimeType, data: base64 } = part.inlineData;
                return NextResponse.json({
                    image: `data:${mimeType};base64,${base64}`,
                    prompt,
                });
            }
        }

        return NextResponse.json(
            { error: "AI không tạo được ảnh. Vui lòng thử lại hoặc thay đổi lựa chọn." },
            { status: 500 }
        );
    } catch (error) {
        console.error("Generate bouquet error:", error);
        return NextResponse.json(
            { error: "Đã xảy ra lỗi. Vui lòng thử lại sau." },
            { status: 500 }
        );
    }
}
