# Break down - Product Requirements Document

Name decided Nov 3, 2026: Break down. GitHub repo: https://github.com/kriskrss/break-down
Version 0.2, Nov 3, 2026.
Solo v1 decision locked Nov 3, 2026: v1 is for one person only. Sharing comes later.

## Source and intent

This app takes inspiration from Little Things: Task Breakdown, by Everminimal Studio, shared on r/ProductivityApps and listed on the App Store for release on Nov 18, 2026.

Source links:
- Reddit post: https://www.reddit.com/r/ProductivityApps/comments/1xmrrpr/i_made_an_app_for_people_who_get_overwhelmed_by/
- App Store: https://apps.apple.com/us/app/little-things-task-breakdown/id6823573224

We do not copy its name, text, or art. We build our own version of the same idea, with the same calm look and the same core method.

## Problem

A long to do list is hard to look at. A big task is hard to start.
People put off big tasks because the first step is not clear and the whole task feels too large at once.

## Goal

Help one person start. Write a task down, break it into small steps, do the small steps first, and finish with the big step after a warm up.

Success in v1 is simple: the user opens the app, breaks down a real task, and works through its steps on the same day, without the list feeling heavy.

## User

One person, using the app for their own tasks at home and at work. No other users, no accounts, and no sharing in v1.

## Core method

Sizes:
- Small: 10 minutes or less.
- Medium: 10 to 30 minutes.
- Big: over 30 minutes.

Day shape:
- The day aims for 5 small, 3 medium, and 1 big step.
- This shape comes from the breakdown shape itself: a full breakdown holds 5 small, 3 medium, and 1 big step.
- The shape is a suggestion, not a cap. The user can keep adding steps while they have energy.
- Work order is small first, medium next, and big last.

## V1 features

### 1. To do list
- Add a task with one line of text. No required fields, tags, or dates.
- Tick a task done with one tap.
- Delete a task.
- A task can repeat: every day, on weekdays, or weekly. A repeat shows as small grey text under the task.
- An add row sits at the end of the list, shown with a dashed circle and the words "Add an item".
- A small note at the end of the list says when a repeat comes back, for example "1 repeat comes back Sun".

### 2. Break down a task
- A guided sheet turns one big task into steps.
- The user types steps one by one and picks a size for each step: small, medium, or big.
- The shape of the task builds as the user types, shown as 5 small, 3 medium, and 1 big slots filling up.
- If a step is still too big, the sheet offers "Too big? Break it down". That step then gets its own breakdown.
- Saved breakdowns open in the Breakdown view at once. Work starts on the new breakdown right away.

### 3. Breakdown view
- At the top, a toggle switches between To do and Breakdown.
- Under the date, the current breakdown name shows with a dropdown to switch breakdowns.
- UP NEXT shows one step, larger than all other steps. It shows the step size and which task it came from.
- Steps group under SMALL, MEDIUM, and BIG headings, in that order.
- Each step has a rounded square checkbox. Tap to tick it done.
- A link at the bottom opens All breakdowns. A floating button opens a new breakdown.

### 4. Today and Suggest my day
- Today holds steps picked from breakdowns, shaped as 5 small, 3 medium, and 1 big.
- The Today title fills with orange as steps get done. At zero steps done, the title is plain black.
- Suggest my day asks one question first: "How is your energy today?"
- Low energy builds a smaller day: 1 big slot is left out and the day uses fewer steps, in the source app a 1-1-3 day.
- Okay energy fits the day to the user's usual pace for that weekday.
- High energy fills every slot in the shape.
- After a long day before, Suggest my day starts the user at Low.
- A step that keeps getting sent back to later goes first in the next suggested day.
- After a break of three days or more, the app shows "Welcome back" and suggests a Low day.
- If a breakdown has left over steps at the end of a day, the app asks one question: do them today, or move them to later?

### 5. Folders and All breakdowns
- Folders group tasks and breakdowns. Default folders: Home, Personal, and Work.
- The All breakdowns screen lists every breakdown in the selected folder.
- Folder chips run across the top: All, then each folder. The selected chip is black with white text.
- Each breakdown row shows: a folder icon, the breakdown name, steps done out of total, and the next step. Example: "0 of 6 - Next: Wipe dinner table".
- A small bar shape at the right of the row shows the mix of small, medium, and big steps.
- The screen header shows how many tasks sit in the selected folder.

### 6. Focus timer
- Each step size maps to a time: small 10 minutes, medium 20 minutes.
- A big step gets two Pomodoro blocks. The default block is 25 minutes of work and 5 minutes of rest. The user can change those numbers in Settings.
- The timer shows big serif numbers, with one tick mark per minute around the number.
- Timer controls: start, pause, resume, and mark done.
- A "Working on" banner in the app shows the current task and its next step while a timer runs.

### 7. Calm rules
- Nothing in the app is ever overdue. There are no red dates, no overdue counts, and no streaks.
- One gentle nudge only. The user picks a time. If no step is done by that time, the app sends one notification with one small step to start. On days when the user has already started, it stays quiet.
- No badges on lists and no scores.

### 8. Data and privacy in v1
- No account and no sign in.
- All data lives on the device. On web, data lives in the browser storage for that device.
- No ads, no tracking, and no analytics that leave the device.
- The user can delete all data from Settings.

## Later, after v1

These come from the source app. They wait until the solo app works well.

- Shared folders. One folder can be shared with other people. Each person gets "Can make changes" or "View only".
- Credit only. A shared folder shows who did a step, for example "Sam ticked this". It never shows who has not done a step. There is no leaderboard.
- Cheers. People in a shared folder can send one star, clap, or muscle emoji per person per day on a task. A cheer pops on screen with "Sent!" and sends one notification to the task owner.
- Asked for nudges. A nudge goes out only on tasks where the owner turned on "Nudge me on this".
- Supporter link. One view only link lets a group of up to 100 people see a folder, cheer, and nudge. They cannot change tasks.
- Folder news. When someone finishes steps, adds tasks, or joins, the folder sends one bundled notification at most once an hour. The folder card shows "Since you last looked: ..." and a bell mutes the folder.
- Names for people come from the user's contacts, shown the way they are saved there.
- Leaving a shared folder, or stopping sharing, takes at most two taps.
- Home screen widget that shows just the next step, with a tick to finish it from the widget.
- Brain dump sizing. The user pastes a list of things on their mind, and the app sizes each line and offers step ideas as tappable bubbles. The source app does this on the device with Apple Intelligence, which React Native Web cannot use. This feature needs a provider decision before it can be built.
- Time learning. The app learns how long the user's steps really take and uses that to suggest sizes.

## Out of scope for all versions on this stack

These source features are Apple only and have no direct match in React Native Web:
- iCloud sharing and iCloud sync.
- Live Activity, Lock Screen controls, and Dynamic Island controls.
- Mark done from a locked phone with Face ID.
- Apple Intelligence on the device.

Web and Android replacements:
- Sharing and sync, when built, will use a small backend that we pick at that time. That is a later decision.
- The "Working on" banner in the app stands in for the Live Activity.

## Tech plan

- Stack: Expo, React Native, TypeScript, and React Native Web. One codebase runs on iPhone, Android, and web.
- Navigation: two main views, To do and Breakdown, plus All breakdowns, Today, a timer view, folders, and Settings.
- Storage in v1: local storage on each device. No server.
- Code host: GitHub, under the user's account kriskrss. Repo name waits for the name decision.
- Web deploy: GitHub Pages, built from the web build of the same codebase.
- Phone use: add the web build to the home screen, or run the Expo build on the phone. A store release is not part of v1.
- Public repo text stays generic. No personal details, no personal goals, and no self marketing copy in the repo.

## Screens in v1

1. To do
2. Breakdown
3. All breakdowns
4. Break down sheet (guided)
5. Today, with Suggest my day
6. Timer, with Working on banner
7. Settings (timer numbers, nudge time, delete all data)

Full visual detail for screens 1 to 3 sits in DESIGN-SPEC.md in this same folder. Screens 4 to 7 follow the same style rules.

## Decisions made

1. App name: Break down, decided Nov 3, 2026. Repo: https://github.com/kriskrss/break-down
   The alternative name Distill was checked and dropped: the App Store already has Distill by UNMS in Productivity, and Distill Web Monitor is an established product.
2. Initial version, built Nov 3, 2026: a static web app (HTML, CSS, JavaScript, no build step) in the same repo, deployed to GitHub Pages like the workout tracker: https://kriskrss.github.io/break-down/
   The Expo and React Native port reuses the same screens, data shape, and design spec when native features are needed.

## Open decisions
2. Scope cut for the first build: ship all 7 screens at once, or ship screens 1 to 3 first (list, breakdown, all breakdowns) and add Today and the timer in a second pass?
3. Nudge on web: a browser cannot send a timed push note in v1 without a server. First build can show the nudge inside the app only. Is that fine for v1?

## Acceptance checks for v1

- A user can add a task, break it into at least 9 sized steps, and see the shape fill.
- A user can tick steps in the Breakdown view, small group first, and the Up Next step changes at once.
- Today fills with orange in step with steps done.
- The timer starts with the right time for each step size.
- Data is still there after the app is closed and reopened.
- The web build loads on a phone browser and the layout matches the design spec at phone width.
