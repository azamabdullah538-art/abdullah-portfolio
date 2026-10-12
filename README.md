# Abdullah Azam | Portfolio

A responsive, accessible personal portfolio built with plain HTML, CSS and JavaScript.
No build step, no dependencies, no `npm install`.

## Folder structure

```
abdullah-portfolio/
├── index.html                      All sections and content
├── README.md
├── css/
│   └── style.css                   Design tokens, components, layout, responsive rules
├── js/
│   └── main.js                     Mobile menu, active link, reveal animation, form validation
└── assets/
    ├── favicon.svg
    └── images/
        └── profile-placeholder.svg Replace with your photo
```

## Run locally in VS Code

**Option 1: Live Server (recommended)**
1. Open the `abdullah-portfolio` folder in VS Code (File > Open Folder).
2. Install the extension **Live Server** (by Ritwick Dey) from the Extensions panel.
3. Right-click `index.html` and choose **Open with Live Server**. The page opens in your browser and reloads when you save.

**Option 2: Python (already installed for Django)**
1. Open a terminal in the project folder (Terminal > New Terminal).
2. Run `python -m http.server 8000`
3. Visit http://localhost:8000

**Option 3:** double-click `index.html`. This works too, but Live Server is better for development.

## What to edit

Search for `TODO` in `index.html` to find every placeholder.

| What | Where |
| --- | --- |
| GitHub, LinkedIn, email | Hero, Contact section and footer (`your-username`, `your.email@example.com`) |
| Profile photo | `assets/images/profile-placeholder.svg`: replace the `<img src>` in the hero, keep `width` and `height`, and write real `alt` text |
| Project links, badges, tags | Each `project-card` in the Projects section. Make sure each badge matches the real status of the project |
| Figma designs | In the Design showcase, replace a `<div class="mock ...">` with `<img src="assets/images/your-design.png" alt="Describe the design" width="..." height="...">` |
| Figma profile link | `design-cta` link |
| Colours and fonts | Variables at the top of `css/style.css` |
| Domain and SEO | `<link rel="canonical">`, Open Graph tags and the JSON-LD block in `<head>` |

To add a project, copy one `<li class="card project-card reveal">` block and edit it.

## Contact form

The form validates input in the browser but **does not send anything**. To receive messages, connect a backend or service
(Django view, Formspree, EmailJS) and replace the placeholder in `js/main.js` (see the `BACKEND REQUIRED` comment).

## Deploy

Push the folder to a GitHub repository and enable **GitHub Pages**, or drag the folder into Netlify or Vercel. After deploying,
update the canonical URL in `index.html`.
