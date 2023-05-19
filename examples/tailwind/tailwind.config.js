/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["index.html", "full.html"],
    theme: {
        extend: {}
    },
    plugins: [require("@tailwindcss/forms"), require("@tailwindcss/aspect-ratio")]
};
