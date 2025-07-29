module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}", // all React files in src folder
    "./public/index.html"               // if you have a static HTML
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'], // ✅ Add this line
        playfair: ['Playfair Display', 'serif'],
         playwrite: ['Playwrite HR Lijeva', 'sans-serif'],
      },
      colors: {
        instagram: {
          blue: '#0095f6',
          red: '#ed4956',
          gray: '#8e8e93',
          lightGray: '#ffffff',
          border: '#dbdbdb',
          text: '#262626',
          secondary: '#737373',
        },
        gradient: {
          instagram: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
        }
      },
      animation: {
        'like-pulse': 'likePulse 0.3s ease-in-out',
        'loading': 'loading 1.5s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        likePulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        loading: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        }
      },
      boxShadow: {
        'instagram': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'instagram-lg': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      backgroundImage: {
        'instagram-gradient': 'linear-gradient(45deg, #ed4956 0%, #dc2743 25%, #cc2366 50%, #bc1888 75%, #a01774 100%)',
      }
    },
  },
  plugins: [],
};
