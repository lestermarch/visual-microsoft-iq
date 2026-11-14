# Microsoft IQ presenter - v01

A single, self-contained presenter app for Work IQ, Fabric IQ, Foundry IQ and
Web IQ, followed by a Security & governance closing page. The 27 subsections
advance at the presenter's pace.
Ambient 3D animations continue while the narrative remains on the selected step.
The four original standalone presentations are preserved outside this folder.

## Present

Open `dist\index.html` in a modern WebGL-enabled browser. The production build
includes all five presentations and works offline, with no server, accounts,
fonts, images or external APIs required.

- **Next / Previous** move through every subsection, including IQ boundaries.
- **Space, Right or Page Down** advance; **Left, Page Up or Shift+Space** go back.
- **Home** restarts at Work IQ; **End** jumps to the final Security subsection.
- **F** toggles fullscreen. **Reduce motion** freezes ambient animation.
- The top menu jumps to the first subsection of any IQ or the Security page.
- Chapter cards inside a presentation remain clickable and update the global
  navigation. Foundry's query and Web's grounding example also stay available.

Navigation never wraps silently: Previous is disabled at the first step, and
Next is disabled at the final step. Restart explicitly returns to the beginning.
Keyboard shortcuts also work after focusing the embedded presentation.
Only one presentation and WebGL scene are loaded at a time.

## Develop

Use Node.js 22.12 or later.

```powershell
npm install
npm run dev
npm test
npm run build
npm run preview
```

`npm run dev` first compiles the five presentation documents. After editing a
presentation's source or the shared bridge, run `npm run build:presentations`
again; the development server observes the generated documents. Shell changes
are handled directly by Vite. `npm run build` always rebuilds everything.

## Structure

| Path | Responsibility |
| --- | --- |
| `src/catalog.js` | Presentation order and subsection metadata, derived from the original timelines |
| `src/navigation.js` | Pure navigation and keyboard rules |
| `src/main.js` | Presenter controls, active-document lifecycle and state synchronisation |
| `src/presentation-bridge.js` | Small, explicit same-origin API between a presentation and the shell |
| `src/embedded.css` | Removes duplicate standalone controls in presenter mode only |
| `src/documents.js` | Imports the generated, self-contained HTML documents |
| `presentations/` | Editable original visuals, content and focused tests |
| `scripts/` | Builds the presentation documents, then the offline app |
| `tests/navigation.test.js` | Sequence, boundary, jump and keyboard behaviour |
| `.generated/` | Rebuildable presentation HTML, not hand-edited |
| `dist/index.html` | Finished offline app |

The original designs use different visual layouts, so they retain isolated
documents rather than sharing a global CSS scope. The shell uses the existing
Work IQ theme. Its iframe loads only these locally bundled, application-owned
documents, not arbitrary remote or user-supplied pages. A named public API and
events keep navigation independent of each visual's DOM structure.

Presenter mode pauses the original timed narrative and selects chapter start
positions. It does not remove standalone playback from the editable sources.
The original conceptual disclosures remain visible: retrieval and web examples
are simulations, not live API calls; licensing, permissions, availability and
preview qualifications still apply.

Comments are reserved for non-obvious intent. Navigation rules, rendering,
integration and build responsibilities are separated into named modules.

## Security & governance closing page

The centre agent is encompassed by Work IQ, Fabric IQ, Foundry IQ and Web IQ
within Microsoft IQ. An outer visual layer shows five existing, complementary
products, highlighted in this order: Entra, Purview, Defender, Sentinel, Intune.
The point spheres and orbital paths move gently; labels stay stationary for
readability. Side cards use short descriptions and original, illustrative
product symbols rather than downloaded logos.

The layers are conceptual, not an impermeable network perimeter. They do not
claim that every product automatically protects every agent or IQ workload.
Capabilities require supported integrations, configuration and appropriate
licensing. Intune manages devices and apps; it is not an agent runtime security
service. Defender is described as a family, with XDR's correlation role
distinguished from individual Defender services.

Product descriptions were grounded in the Microsoft security platform overview:
https://learn.microsoft.com/en-us/security/zero-trust/security-platform
