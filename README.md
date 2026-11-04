# Break down

A calm task breakdown app.

Break a big task into sized steps: small is 10 minutes or less, medium is 10 to 30 minutes, and big is over 30 minutes. Build a day of 5 small, 3 medium, and 1 big step. Work small first and big last, with a focus timer for each step. Nothing is ever overdue.

## Live app

https://kriskrss.github.io/break-down/

Open it on a phone and add it to the home screen. Data is saved in the browser on that device.

## Status

Initial version built and deployed to GitHub Pages, the same way as the workout tracker.
Screens: To do, Breakdown, All breakdowns, Today with Suggest my day, and a focus timer.
The break down sheet sizes steps and shows the 5, 3, 1 shape as you type.

- [PRD](PRD.md)
- [Design spec](DESIGN-SPEC.md)

## Stack

Initial version: one static web app (HTML, CSS, and JavaScript) with no build step, hosted on GitHub Pages.
The React Native port can reuse the same screens, data shape, and design spec when the app needs native features.
Data stays on the device in v1. No account.

## Plan

- V1 is for one person. Sharing comes later.
- Web build deploys to GitHub Pages.
