/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./contexts/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#060B1F",       // fundo principal (quase preto azulado)
          navy: "#0A1440",      // azul marinho profundo do logo
          navy2: "#101B54",
          blue: "#1E6FEB",      // azul vivo do logo
          blueLight: "#3FA0FF",
          paper: "#F5F7FB"
        }
      },
      fontFamily: {
        display: ["'Sora'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"]
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #0A1440 0%, #1E6FEB 100%)"
      }
    }
  },
  plugins: []
};
