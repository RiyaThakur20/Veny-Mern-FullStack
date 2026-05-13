import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Ye block ensures ki pura app sirf ek hi React instance use kare
    // Isse 'Invalid Hook Call' aur 'useState is null' wali errors resolve ho jati hain
    dedupe: ['react', 'react-dom', 'react-leaflet', 'leaflet'],
  },
  optimizeDeps: {
    // Leaflet ko force-include karna kabhi-kabhi Vite v6/v7 mein zaroori hota hai
    include: ['react-leaflet', 'leaflet'],
  },
})