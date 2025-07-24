// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// LibreTranslate public API (use a self-hosted instance for production)
const LIBRE_TRANSLATE_API = "https://libretranslate.com/translate"; // Public instance (has rate limits)

// Custom backend to fetch translations dynamically
const dynamicBackend = {
  read(language, namespace, callback) {
    if (language === "en") {
      // Return English strings directly
      callback(null, {
        welcome: "Welcome to my app",
        description: "This is a dynamic React app",
        // Add all your English strings here
      });
    } else {
      // Translate English strings to the target language
      const englishStrings = {
        welcome: "Welcome to my app",
        description: "This is a dynamic React app",
        // Add all your English strings here
      };

      const keys = Object.keys(englishStrings);
      const texts = Object.values(englishStrings);

      // Batch translate all strings
      Promise.all(
        texts.map((text) =>
          fetch(LIBRE_TRANSLATE_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              q: text,
              source: "en",
              target: language,
            }),
          })
            .then((res) => res.json())
            .then((data) => data.translatedText)
        )
      )
        .then((translations) => {
          const translated = {};
          keys.forEach((key, index) => {
            translated[key] = translations[index];
          });
          callback(null, translated);
        })
        .catch((error) => callback(error));
    }
  },
};

i18n
  .use(dynamicBackend)
  .use(initReactI18next)
  .init({
    lng: "en", // Default language
    fallbackLng: "en", // Fallback language
    interpolation: {
      escapeValue: false, // React handles escaping
    },
  });

export default i18n;