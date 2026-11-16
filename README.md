# Microsoft IQ presenter - v01

A single, self-contained presenter app starting with a Microsoft IQ overview,
then Work IQ, Fabric IQ, Foundry IQ and Web IQ, followed by Security & governance
and an Agent 365 finale. The 38 subsections
advance at the presenter's pace.
Ambient 3D animations continue while the narrative remains on the selected step.
The four original standalone presentations are preserved outside this folder.

## Public website

Present online at https://lestermarch.github.io/visual-microsoft-iq/.

The GitHub Pages workflow tests and builds pull requests. Pushes to `main`
also publish only the generated `dist/` site; development files and source
archives are not part of the deployed artifact. The repository and website
are public. The workflow can also be started manually from the Actions tab.

## Present

Open `dist\index.html` in a modern WebGL-enabled browser. The production build
includes all seven presentations and works offline, with no server, accounts,
fonts, images or external APIs required.

- **Next / Previous** move through every subsection, including IQ boundaries.
- **Space, Right or Page Down** advance; **Left, Page Up or Shift+Space** go back.
- **Home** restarts at the overview; **End** jumps to Agent 365's complete picture.
- **F** toggles fullscreen. **Reduce motion** freezes ambient animation.
- **Dark mode / Light mode** switches the complete deck's palette without moving
  the selected subsection. Light remains the default; `?clawpilotTheme=dark`
  opens directly in dark mode. The choice stays in effect while the app is open.
- The top menu jumps to the overview, any IQ, Security or Agent 365.
- Chapter cards inside a presentation remain clickable and update the global
  navigation. Foundry's query and Web's grounding example also stay available.

Navigation never wraps silently: Previous is disabled at the first step, and
Next is disabled at the final step. Restart explicitly returns to the beginning.
Keyboard shortcuts also work after focusing the embedded presentation.
Only one presentation and WebGL scene are loaded at a time.

Page boundaries use a soft fade out and in; chapter changes retain their
existing highlights. Reduced motion disables these fades. Rapid navigation
replaces pending page changes with the latest destination. Changing the palette
rebuilds only the current scene so both HTML and Three.js colours use the selected
theme, preserving the subsection and reduced-motion setting. This also resets
the current scene's ambient animation and interactive examples.

## Develop

Use Node.js 22.12 or later.

```powershell
npm ci
npm run dev
npm test
npm run build
npm run preview
```

`npm run dev` first compiles the seven presentation documents. After editing a
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
| `.github/workflows/pages.yml` | Tests, builds and deploys the static site to GitHub Pages |
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
The build order is explicit and derives presentation IDs from the catalog,
so adding a page does not require maintaining a second build list.

## Microsoft IQ opening overview

The opening page follows the supplied "Your people. Your agents. Your IQ."
slide. Three raised source foundations sit below an IQ layer: collaboration,
business data and curated knowledge. Animated paths connect them through the
layer to people and agents above an interactive-to-autonomous continuum.
Five chapters introduce the recipients, each foundation, then the complete IQ
picture before Next moves into Work IQ. Labels stay stationary for readability.

The layer is conceptual, not a new common data store or a promise that every IQ
uses every source. The final chapter introduces the four IQs without collapsing
their distinct roles. Original SVG symbols replace the reference's portrait and
product artwork. The opening retains a two-minute standalone playback option;
the combined presenter advances manually.

## Security & governance page

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

## Agent 365 finale

The final page expands the previous security picture into a seven-agent network.
Each illustrated agent has faint inner IQ and outer security/governance point
spheres, reusing the previous security page's sphere construction; one larger
example labels the layers. A wider Agent 365 envelope
encompasses the fleet. The six chapters cover the layered agent, agents at scale,
Observe, Govern, Secure, then the complete picture. The selected control receives
thin animated signal paths, distinguished from intra-agent links by brightness
rather than thickness.
In the complete picture, the envelope becomes a three-dimensional point sphere:
the detailed layers fade and interconnected agent atoms float inside it.
Returning to an earlier chapter restores the labelled layers. Both colour modes,
reduced motion, page fades and manual navigation remain available.

This is a conceptual recap, not live telemetry, a mandatory network topology or
a claim that every agent uses every IQ. Agent 365 extends existing administration,
identity, security and compliance capabilities; it does not replace them or
automatically guarantee protection. Microsoft and third-party agents have
different registration and integration paths, and features depend on supported
integrations, configuration and licensing. The network uses original illustrative
symbols, not vendor logos or claims about specific partner integrations.

Product descriptions were grounded in:
- https://learn.microsoft.com/office365/servicedescriptions/microsoft-agent-365/microsoft-agent-365
- https://learn.microsoft.com/microsoft-agent-365/connect-existing-agents
