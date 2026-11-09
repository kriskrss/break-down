# Task Breakdown App - Design Spec

Version 0.1, Nov 3, 2026. Based on the 3 screens Sai shared from Little Things, plus its App Store page.
Goal: match the calm look of the source screens, in our own build. Do not copy its art or icon files.

## Look in one line

White, quiet, and mostly text. One orange accent. Serif headings, light list text, and a lot of empty space.

## Colour

- Background: white, #FFFFFF.
- Main text: black, #111111.
- Second text: mid grey, #8A8A8A. Used for dates, repeat notes, counts, and hints.
- Faint lines and pill borders: light grey, #E5E5E5.
- Chip and bar fill at rest: light grey, #F0F0F0.
- Selected chip: black fill, white text.
- Accent: orange, used in one place only in v1. The Today title fills with orange as steps get done. No other orange buttons or links.
- No red anywhere. Nothing is overdue in this app.
- No gradients, no shadows on cards. One soft shadow only, under the floating Break down button.

### Amendment, Nov 8, 2026: Things token system

The values above are superseded by the Things DESIGN.md system (GradientDeck library), applied in styles.css. The look and rules in this spec stay: white, quiet, serif headings, one orange accent in the Today fill only.

- Canvas behind the app column: Mist #F2F5F7. The column itself stays Paper white.
- Main text: Ink #303336. Second text: Fog #838B96. Quiet icons and remove marks: Silver #9299A4 and Ash #55606E.
- Lines and borders: Hairline #DFE3E8. Chip and banner fill at rest: Mist #F2F5F7.
- Cards and banners: 18 px radius, 16 px padding. Inputs: 6 px radius. Body text: weight 400, 15 px, line height 1.6.
- Orange #E8762C keeps its one job, the Today fill, and also marks a focused input border. Nothing else turns orange.

## Type

- Headings: a serif font. On Apple devices use the system serif. On web and Android use Georgia as the fallback serif.
  - Screen title: 28 to 32 pt, regular weight, black.
  - Up Next step name: 24 pt serif, black.
  - Timer numbers: large serif, 64 pt or more.
- Body and lists: system sans font, light to regular weight.
  - Task and step names: 16 to 17 pt, black, line height about 1.35.
  - Small notes under a task: 12 pt, grey.
- Section labels: 11 pt sans, all caps, letter spacing wide, grey. Examples: UP NEXT, SMALL, MEDIUM, BIG.
- Links: 14 pt, grey, underlined. Example: "All breakdowns" at the bottom of the Breakdown screen.

## Layout rules

- Side margin: 20 to 24 px on phone.
- Top area: toolbar sits at the top right. Back button, when present, sits at the top left.
- Lists start under the title with about 16 px of space. Rows have 12 to 14 px of space above and below.
- One main action per screen, at the bottom right.
- On web at wide width, the app column stays at phone width, about 420 px, centred, on a white page. It does not stretch into a desktop dashboard.
- Empty screens stay mostly empty. Do not fill space with tips, cards, or art.

## Common parts

### Toolbar pill
- One pill outline at the top right holds 2 or 3 icons: search, sort (up and down arrows), share, or settings gear.
- Pill: white fill, light grey border, full round ends, about 36 px high.
- Icons: black, simple line style, about 18 px.
- On screens with no search or sort, the settings gear sits alone in a small circle with the same border.

### To do / Breakdown toggle
- Two serif words side by side at title size: "To do" and "Breakdown".
- The current view is black. The other view is light grey.
- Tapping the grey word switches the view. No underline, no pill, no animation beyond a short fade.

### Checkbox
- Empty rounded square, about 22 px, corner radius about 6 px, thin black border.
- It sits left of the text, aligned with the first line of the text.
- Done state: box fills black, tick is white, text turns grey. In the source screens all boxes are empty, so keep the done style quiet.

### Add row
- Dashed circle, same size as a checkbox, grey dashed border.
- Text next to it: "Add an item", grey, 15 pt.

### Folder chips
- Row of pills that can scroll sideways.
- Chip: light grey fill, dark text, 14 pt, with a small icon before the name. Home uses a house icon. Personal uses a heart icon. Work uses a briefcase icon. All uses an inbox icon.
- A shared folder chip also shows a small people icon after the name.
- Selected chip: black fill, white text and white icon.

### Floating Break down button
- Pill at the bottom right, above the screen edge by about 20 px.
- White fill, light grey border, soft shadow.
- Text: "+ Break down", 15 pt, black. The plus is part of the label.

### Section divider
- Section label on the left, then a thin light grey line that runs to the right edge.

### Breakdown row (All breakdowns list)
- Left: small grey circle with the folder icon inside.
- Middle: breakdown name at 16 pt black, then a second line at 13 pt grey: steps done, then the next step. Example: "0 of 6 - Next: Wipe dinner table".
- Right: small bar shape icon in light grey. Three to five tiny vertical bars of mixed heights stand for the small, medium, and big mix.
- A thin light grey line sits above and below the row group.

### Shared bar (later, shown in source screen 3)
- Light grey rounded bar under the chips.
- Left: people icon, the word "Shared", and a grey line under it that shows the share state, for example "Checking who's in it...".
- Right: "Manage" link, underlined, and a bell icon for mute.
- This bar is later work. It is in the spec so v1 layout leaves room for it.

## Screen 1: To do

Source screen: phone at 6:22, title toggle, date Tue, Oct 20.

- Toolbar pill, top right: search, sort, settings.
- Toggle: "To do" black, "Breakdown" grey.
- Date under the toggle: 13 pt grey, for example "Tue, Oct 20".
- Task rows: checkbox, then task name. A task name can wrap to two lines.
- Repeat note under the name when the task repeats: small repeat icon plus text, 12 pt grey. Examples: "Every day", "Weekdays".
- After the last task: the add row.
- End note, below the add row with extra space: small repeat icon plus grey text, for example "1 repeat comes back Sun".
- The rest of the screen stays empty white.

## Screen 2: Breakdown

Source screen: clean up breakdown, same date.

- Settings gear alone, top right, in a bordered circle.
- Toggle: "To do" grey, "Breakdown" black.
- Sub line under the toggle: date, a dot, the breakdown name in lower case, and a small down arrow. Example: "Tue, Oct 20 - clean up".
- UP NEXT block:
  - Label "UP NEXT" in small caps grey.
  - Checkbox, then the step name in 24 pt serif. Example: "Clean the counters".
  - Under the name, indented to line up with the name: size and source task, 13 pt grey. Example: "Small - from clean up".
- SMALL group, then MEDIUM group, then BIG group. Each group starts with a section divider.
- Step rows in a group: checkbox plus step name at 16 pt sans. No size text in the rows. Size comes from the group heading.
- Counts in the source screen: SMALL has 5 steps when the Up Next step is counted in, MEDIUM has 3, BIG has 1. That is the 5-3-1 shape.
- Bottom row: "All breakdowns" link on the left, floating Break down button on the right.

## Screen 3: All breakdowns

Source screen: 1 task in Home, Home chip selected.

- Top left: back arrow in a bordered circle, same style as the gear circle.
- Top right: toolbar pill with share, search, and sort icons.
- Title: "All breakdowns", 30 pt serif, black.
- Count under the title: 13 pt grey, for example "1 task in Home".
- Folder chips row, as set out above. The row can run past the right edge and scroll.
- Shared bar, under the chips. Later work, see above.
- Breakdown rows, as set out above.
- Floating Break down button, bottom right.
- No other content. One task gets one row and the rest of the screen is white.

## Timer screen rules (no source screen, follow the post text)

- Timer numbers in large serif, centred.
- One tick mark per minute around the numbers, light grey, with done minutes in black.
- Controls under the numbers: pause or resume, and mark done. Text buttons, not bright buttons.
- While the timer runs, a "Working on" banner sits at the top of the To do and Breakdown screens: task name and next step, 14 pt, on a light grey bar.

## Motion

- Short and quiet. Fades of about 150 ms when views switch.
- The one lively motion in the source app is the cheer pop with "Sent!". Cheers are later work. In v1, ticking a step can use a small scale pop on the checkbox, and nothing more.
- Respect reduced motion settings: turn the pop and fades off when the system asks for less motion.

## What not to do

- No bottom tab bar in these screens. Move between views with the toggle, links, and the floating button.
- No bright colour buttons, no gradients, and no stock photos.
- No cards with shadows around tasks. Lists sit flat on white with thin lines only where the source uses them.
- No badges, counts in red, streak flames, or progress rings.
