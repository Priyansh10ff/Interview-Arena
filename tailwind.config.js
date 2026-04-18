export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        g: {
          950:'#000000', 900:'#080808', 800:'#101010',
          700:'#181818', 600:'#222222', 500:'#2c2c2c',
          border:'#2a2a2a', hi:'#404040',
        },
        lime: { DEFAULT:'#a8ff3e', dim:'#78b82c', dark:'#2a3d10' },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"','monospace'],
      },
      animation: {
        'slide-up':'slideUp 0.22s ease forwards',
        'fade-in':'fadeIn 0.18s ease forwards',
        'blink':'blink 1s step-end infinite',
        'scan':'scan 3s linear infinite',
        'pulse-lime':'pulseLime 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp:{ from:{opacity:0,transform:'translateY(14px)'}, to:{opacity:1,transform:'translateY(0)'} },
        fadeIn:{ from:{opacity:0}, to:{opacity:1} },
        blink:{ '0%,100%':{opacity:1},'50%':{opacity:0} },
        scan:{ '0%':{top:'-4px'},'100%':{top:'100%'} },
        pulseLime:{ '0%,100%':{opacity:1},'50%':{opacity:.5} },
      },
    },
  },
  plugins:[],
}
