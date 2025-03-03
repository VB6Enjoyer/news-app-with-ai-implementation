import React, { useState } from "react";
import translateText from "../utilities/deeplApi";
import { batchAnimateText } from "../utilities/animateText";
import './Translator.css';

// TODO Translation should stop when the user makes a search.
// TODO When the user makes a search, English should be set back to the default activeButton (since searches return results in English)
// TODO Alternatively, translate headlines before returning them
const Translator = () => {
    const [activeButton, setActiveButton] = useState("EN"); // Sets the button currently pressed
    const [loading, setLoading] = useState(false); // Checks whether the headlines are being translated

    // Translate all headlines using the DeepL API
    const translate = async (lang) => {
        try {
            setLoading(true); // Translating, show a "..." next to the language flag
            setActiveButton(lang); // Sets the button pressed as the active button

            // Get all headlines from each box in the news container
            const newsArr = Array.from(document.getElementById("news-container").children);

            let translations = [];
            let elements = [];

            if (newsArr.length > 0) {
                for (const news of newsArr) {
                    const headline = news.firstChild.textContent;
                    const translation = await translateText(headline, lang); // Translate the headline

                    elements.push(news.firstChild);
                    translations.push(translation);

                    if (translation !== "Translation failed.") {
                        await batchAnimateText({ // Make the translated text be typed in real-time into the boxes
                            elements: [news.firstChild],
                            texts: [translation],
                            speed: 10,  // Delay between letters typed 
                            randomness: 0.25,  // Randomness added to the delay
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Translation error:", error);
        } finally {
            setLoading(false); // No longer translating, remove the "..." next to the flag
        }
    }

    // List of objects with language codes (used by the API) and flags (for visuals)
    const languages = [
        { code: "EN", label: "🇺🇸" },
        { code: "ES", label: "🇪🇸" },
        { code: "FR", label: "🇫🇷" },
        { code: "DE", label: "🇩🇪" },
        { code: "IT", label: "🇮🇹" },
        { code: "PT", label: "🇵🇹" },
        { code: "NL", label: "🇳🇱" },
        { code: "PL", label: "🇵🇱" },
        { code: "RU", label: "🇷🇺" },
        { code: "JA", label: "🇯🇵" },
        { code: "ZH", label: "🇨🇳" },
        { code: "KO", label: "🇰🇷" },
        { code: "AR", label: "🇸🇦" },
        { code: "TR", label: "🇹🇷" },
        { code: "CS", label: "🇨🇿" },
        { code: "DA", label: "🇩🇰" },
        { code: "EL", label: "🇬🇷" },
        { code: "FI", label: "🇫🇮" },
        { code: "SV", label: "🇸🇪" },
    ];

    return (
        <div id="translator-container">
            <div id="translator-buttons">
                {/* Create a button for each language in the array above */}
                {languages.map(({ code, label }) => (
                    <button className="translator-button" key={code} type="button" onClick={() => translate(code)} disabled={loading || activeButton === code}>
                        {loading && activeButton === code ? `${label}...` : label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Translator;