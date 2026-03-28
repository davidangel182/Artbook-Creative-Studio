module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "OPENAI_API_KEY is missing" }));
    return;
  }

  try {
    const { image, context = {} } = req.body || {};
    if (!image) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Image is required" }));
      return;
    }

    const systemPrompt = "You create concise art practice briefs. Return strict JSON with keys title, publisher, objective, analyze, task. Keep each field short, practical, and action-oriented.";
    const userPrompt = [
      "Analyze the uploaded visual reference and generate a focused practice brief.",
      "Use the image content first. Use the optional context only when it helps.",
      `Book title context: ${context.bookTitle || ""}`,
      `Publisher context: ${context.publisher || ""}`,
      `Page context: ${context.page || ""}`,
      `Skill focus: ${context.skillFocus || ""}`,
      `Creation type: ${context.creationType || ""}`,
      `Medium/tool: ${context.tool || ""}`,
      `Piece type: ${context.pieceType || ""}`
    ].join("\n");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: systemPrompt }]
          },
          {
            role: "user",
            content: [
              { type: "input_text", text: userPrompt },
              { type: "input_image", image_url: image }
            ]
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "image_brief",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: { type: "string" },
                publisher: { type: "string" },
                objective: { type: "string" },
                analyze: { type: "string" },
                task: { type: "string" }
              },
              required: ["title", "publisher", "objective", "analyze", "task"]
            }
          }
        }
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      res.statusCode = response.status;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: detail || "OpenAI request failed" }));
      return;
    }

    const data = await response.json();
    const text = data.output_text || data.output?.[0]?.content?.[0]?.text || "{}";
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      parsed = {
        title: context.bookTitle || "Image-based practice",
        publisher: context.publisher || "Visual reference",
        objective: "Use the uploaded image to define a focused exercise.",
        analyze: "Look at the main visual choices that make the image effective.",
        task: "Create one concise study based on the reference image."
      };
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(parsed));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: error.message || "Unexpected server error" }));
  }
};
