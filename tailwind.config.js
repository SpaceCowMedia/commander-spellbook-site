module.exports = {
  darkMode: false, // or 'media' or 'class'
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#C18AFF",
        secondary: "#FF9595",
        link: "#5b2499",
        dark: "#222222",
        light: "#DFDFDF",
        danger: "#C54329",
        warning: "#FFC580",
      },
      fontFamily: {
        title: "'Josefin Sans', sans-serif",
        body: "Roboto, sans-serif",
      },
    },
  },
  plugins: [],
};
