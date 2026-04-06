"use server"

export async function predict (formData : FormData): Promise<string> {
  try {
    const rawBody = Object.fromEntries(
      formData.entries()
    ) as Record<string, FormDataEntryValue>;
    const body: Record<string, number | null> = {};

    for (const [key, value] of Object.entries(rawBody)) {
        body[key] = value === "" ? null : Number(value);
    }

    const response = await fetch(process.env.EXOPLANET_API!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return "Prediction unavailable";
    }

    const pred = await response.json();
    return pred.prediction ?? "Prediction unavailable";
  } catch (err) {
    console.error(err);
    return "Prediction unavailable";
  }
}
