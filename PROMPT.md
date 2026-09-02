FINAL FIX — COPY THE EXISTING SURFACE DEFORMATION BULGE FOR EACH NODE

I have uploaded a recording showing the current result.

The current node visualization is WRONG because it appears as a small thin red/yellow patch and disappears or becomes very thin when I rotate the camera.

I want the node visualization to use the EXACT SAME 3D BULGE + GRADIENT EFFECT that is already used by the LARGE SURFACE DEFORMATION at the top of my scene.

DO NOT DESIGN A NEW HEATMAP.

REUSE / CLONE THE EXISTING SURFACE DEFORMATION BULGE IMPLEMENTATION.

==================================================
WHAT I WANT
==================================================

The existing large deformation at the top of the scene looks like:

        YELLOW
    ───────────────
       ORANGE
     ─────────────
        RED
       ╲____╱

It is a FILLED 3D curved deformation surface with a smooth:

GREEN/YELLOW → ORANGE → RED

gradient.

I want FIVE SMALL VERSIONS OF THAT SAME EFFECT.

One for each underground node:

NODE-01
NODE-02
NODE-03
NODE-04
NODE-05

==================================================
NODE RISK BULGE
==================================================

For each node:

                    YELLOW
             ╭────────────────╮
          ╭──╯                ╰──╮
        ╭─╯      ORANGE            ╰─╮
       ╱            RED                ╲
      ╱              ●                  ╲
     ╰──────────────────────────────────╯
                      │
                    NODE

The colored area must be a REAL 3D BULGED SURFACE.

It must NOT be:

- a flat circle
- a flat ellipse
- a thin plane
- a red disc
- a sphere
- a blob
- wireframe rings
- semicircular rings
- contour outlines
- a small flat patch

==================================================
MOST IMPORTANT: REUSE EXISTING BULGE
==================================================

Find the code/component/material/geometry currently responsible for the large surface deformation bulge.

DO NOT recreate it from scratch with a different visual style.

Reuse its:

- geometry/deformation technique
- vertex displacement
- color gradient
- material
- transparency
- smooth interpolation
- red/orange/yellow gradient

Then create a smaller localized version for each underground node.

Conceptually:

Existing:

<SurfaceDeformation />

New:

<NodeRiskBulge node={node} risk={node.risk} />

But NodeRiskBulge should visually use the SAME implementation/style as SurfaceDeformation.

==================================================
POSITION
==================================================

The center of each bulge must be directly above its underground node.

For example:

                 RED
              ORANGE
           YELLOW
              │
              │
           NODE-02
        underground

The bulge must use the exact X/Z coordinates of the node.

Do NOT place it using a global/fixed scene position.

Do NOT place it on the surface.

Do NOT place it at the top of the scene.

Do NOT place it somewhere based on the camera.

==================================================
FULL 3D BULGE
==================================================

The entire deformation field must be visible.

I do NOT want only the top half or a thin strip.

It should have substantial width AND depth:

                 FRONT
        ╭──────────────────╮
      ╭──────────────────────╮
     │      ORANGE / RED      │
     │          NODE          │
      ╰──────────────────────╯
        ╰──────────────────╯
                 BACK

It should be a complete 3D surface around the node.

==================================================
CAMERA ROTATION MUST NOT BREAK IT
==================================================

This is VERY IMPORTANT.

Currently, when I rotate the camera, the node heatmap becomes very thin/disappears.

FIX THIS.

The node bulge must remain clearly visible when I:

- rotate left/right
- rotate above/below
- zoom in/out
- orbit around the mine

Do NOT use a camera-facing billboard.

Do NOT rotate the heatmap to face the camera.

It must remain a REAL 3D deformation surface.

Instead:

- use sufficiently wide/deep geometry
- use enough subdivisions
- make the bulge have real 3D depth
- use DoubleSide material
- prevent back-face culling
- use appropriate transparent rendering
- use renderOrder/depth settings if required
- ensure the tunnel does not completely occlude it

The visualization should remain recognizable from different camera angles.

==================================================
GRADIENT
==================================================

The gradient must behave like the EXISTING LARGE SURFACE DEFORMATION.

For a critical node:

OUTER REGION
YELLOW

        ↓

ORANGE

        ↓

RED
MAXIMUM RISK / CENTER

Example:

        YELLOW YELLOW YELLOW
      YELLOW YELLOW ORANGE ORANGE
    YELLOW ORANGE ORANGE RED RED
   YELLOW ORANGE RED RED RED ORANGE
    YELLOW ORANGE ORANGE RED RED
      YELLOW YELLOW ORANGE
        YELLOW YELLOW YELLOW

This must be a SMOOTH GRADIENT across the actual 3D surface.

Do NOT make separate colored rings.

Do NOT use hard boundaries.

==================================================
NODE MUST NOT CHANGE COLOR
==================================================

Keep the physical monitoring node exactly as it currently looks.

Do NOT turn the node itself red.

The RED/ORANGE/YELLOW color belongs to the deformation field ABOVE/AROUND the node.

==================================================
RISK CONTROLS THE BULGE
==================================================

Use the existing node risk value.

For example:

20%:
small + mostly yellow

40%:
larger + yellow/orange

65%:
larger orange region + some red

92%:
strong 3D bulge
large orange region
strong red center

Risk controls:

1. bulge/deformation magnitude
2. size of affected area
3. gradient intensity

==================================================
EACH NODE IS INDEPENDENT
==================================================

Create one localized bulge per underground node.

NODE-01 → own bulge → node risk 01
NODE-02 → own bulge → node risk 02
NODE-03 → own bulge → node risk 03
NODE-04 → own bulge → node risk 04
NODE-05 → own bulge → node risk 05

Do NOT create one giant underground bulge.

==================================================
IMPORTANT VISUAL RELATIONSHIP
==================================================

The final scene should have:

LARGE SURFACE BULGE
        ↓
represents overall surface subsidence

SMALL NODE BULGES
        ↓
represent localized underground risk around individual monitoring nodes

They should look like the SAME visualization family.

The node bulges are simply smaller/localized versions of the existing large deformation bulge.

==================================================
DO NOT TOUCH ANYTHING ELSE
==================================================

Do NOT change:

- UI
- navbar
- Layers
- telemetry
- camera controls
- camera views
- simulation
- tunnels
- mining structures
- underground node models
- node positions
- GNSS
- InSAR
- existing large surface deformation
- graphs
- sensor panels

ONLY fix the underground node risk visualization.

==================================================
FINAL TEST
==================================================

After implementation, test NODE-02 at 92% risk.

From the default camera:

I should clearly see a substantial filled 3D deformation bulge above NODE-02 with:

YELLOW → ORANGE → RED

and RED concentrated around the highest-risk center.

Then rotate the camera 45°, 90°, and from a higher/lower angle.

The COMPLETE bulge should still be visible and recognizable.

If it becomes a thin line, disappears, or turns into a flat patch, the implementation is NOT correct.

FINAL REQUIREMENT:

DO NOT CREATE A NEW HEATMAP DESIGN.

TAKE THE EXISTING LARGE SURFACE DEFORMATION BULGE THAT ALREADY LOOKS CORRECT, REUSE ITS EXACT 3D GRADIENT + DEFORMATION TECHNIQUE, SCALE IT DOWN, AND ATTACH ONE FULL LOCALIZED COPY DIRECTLY ABOVE EACH UNDERGROUND NODE.