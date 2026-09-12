import type { Config } from 'tailwindcss'
const config:Config={content:['./app/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}'],theme:{extend:{colors:{gold:{900:'#8A6E3F',700:'#B79861',500:'#D5B270',400:'#DFC276',300:'#E8D37A',200:'#F5E681',100:'#FFF488'},ink:'#0A0A0A',cream:'#F7F7F5'},fontFamily:{sans:['var(--font-jakarta)'],display:['var(--font-fraunces)']},boxShadow:{luxury:'0 18px 60px rgba(10,10,10,.10)'}}},plugins:[]}
export default config
