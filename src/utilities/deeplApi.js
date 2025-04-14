const API_KEY = import.meta.env.VITE_DEEPL_API_TOKEN // Token taken from the .env.local file in root folder
const API_URL = "https://deepl-proxy.vercel.app/api/translate"; // Free DeepL API

/*const translateText = async (text, targetLang) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                auth_key: API_KEY,
                text: text,
                target_lang: targetLang.toUpperCase(), // Should be two uppercase letters, such as "EN", "ES", or "FR"
            }),
        });

        if (!response.ok) throw new Error("Translation request failed");

        const data = await response.json();

        return data.translations[0].text;
    } catch (error) {
        console.error("Translation Error:", error);
        return "Translation failed.";
    }
};*/

const translateText = async (text, targetLang) => {
    try {
        const response = await fetch("https://deepl-api-service.vercel.app/api/translate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text, target_lang: targetLang }),
        });

        if (!response.ok) throw new Error("Translation request failed");

        const data = await response.json();
        return data.translations[0].text;
    } catch (error) {
        console.error("Translation Error:", error);
        return "Translation failed.";
    }
};

export default translateText;
