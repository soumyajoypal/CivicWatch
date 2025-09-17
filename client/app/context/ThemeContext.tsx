import { createContext, ReactNode, useState } from "react";

export type ThemeContextType={
    currentTheme:string;
    toggleTheme: (newTheme:string)=>void;
}

export const ThemeContext=createContext<ThemeContextType>({
    currentTheme:'light',
    toggleTheme:()=>{

    }
});
// themeContext.tsx

export const colors = {
  light: {
    // Base
    background: "#FAFAFF",       // soft off-white (page background)
    surface: "#FFFFFF",          // surface / card base
    primary: "#273469",          // deep indigo (buttons, active)
    secondary: "#1E2749",        // navy (strong text / headings)
    accent: "#E4D9FF",           // lavender (accent / soft highlights)
    accentDark: "#C9BFFF",       // slightly stronger lavender
    contrast: "#30343F",         // charcoal (icons, borders)

    // Text
    textPrimary: "#1E2749",      // headings (strong)
    textSecondary: "#30343F",    // body text (normal)
    textMuted: "#6B6F7A",        // captions, small text

    // Icons
    icon: "#30343F",             // default icon color
    highlightIcon: "#273469",    // icon color for highlighted state

    // Card / surface
    cardBackground: "#FFFFFF",                         // card background
    cardBorder: "rgba(39,52,105,0.06)",                // subtle indigo-tinted border
    cardShadow: "rgba(39,52,105,0.12)",                // soft indigo shadow color
    cardElevation: 2,                                  // android elevation suggestion

    // Highlights
    highlightBackground: "rgba(228,217,255,0.40)",    // soft lavender pill / badge bg
    highlightText: "#1E2749",                         // text shown on highlight bg

    // Borders & shadows
    border: "#EDECF7",                                 // very light border
    shadowSoft: "rgba(39,52,105,0.08)",
    shadowMedium: "rgba(39,52,105,0.16)",
    shadowStrong: "rgba(39,52,105,0.24)",

    // Pagination / dots
    pagination: {
      active: "#273469",       // active dot (indigo)
      inactive: "rgba(226,217,255,0.45)", // inactive dot (faded lavender)
    },
  },

  dark: {
    // Base
    background: "#1E2749",      // deep navy midnight (page bg)
    surface: "#30343F",         // charcoal surface for cards
    primary: "#E4D9FF",         // lavender used as primary accent on dark
    secondary: "#273469",       // indigo (supporting accent)
    accent: "#FAFAFF",          // bright white-ish accent text/icons
    contrast: "#FAFAFF",        // white for icons / strong contrast

    // Text
    textPrimary: "#FAFAFF",     // headings (bright)
    textSecondary: "#C9C9D6",   // normal copy (soft white/gray)
    textMuted: "#9DA1B2",       // muted text

    // Icons
    icon: "#FAFAFF",            // default icon for dark
    highlightIcon: "#E4D9FF",   // lavender highlight for icons

    // Card / surface
    cardBackground: "#273469",                      // indigo card bg
    cardBorder: "rgba(48,52,63,0.35)",              // subtle charcoal border
    cardShadow: "rgba(0,0,0,0.6)",                  // darker shadow on dark
    cardElevation: 6,                               // android elevation suggestion

    // Highlights
    highlightBackground: "rgba(228,217,255,0.12)",  // pale translucent lavender
    highlightText: "#1E2749",                       // navy text placed on highlight bg (or use white)
                                                     // (use whichever has proper contrast per component)

    // Borders & shadows
    border: "#30343F",
    shadowSoft: "rgba(0,0,0,0.35)",
    shadowMedium: "rgba(0,0,0,0.5)",
    shadowStrong: "rgba(0,0,0,0.7)",

    // Pagination / dots
    pagination: {
      active: "#E4D9FF",       // lavender dot stands out on dark bg
      inactive: "rgba(255,255,255,0.14)", // faded white dot
    },
  },
}


const ThemeProvider=({children} : {children:ReactNode})=>{
    const [theme,setTheme]=useState<string>('light');
    const toggleTheme=(newTheme:string)=>{
        setTheme(newTheme);
    }
    return(
        <ThemeContext.Provider value={{currentTheme:theme,toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    )
}
export default ThemeProvider;