# Commander Spellbook Website

## About Commander's Spellbook

The Commander Spellbook project is a search engine for Commander/EDH combos and to make them easily available across all modern digital platforms.
This community driven project is used to power [EDHREC's Combo Feature](https://edhrec.com/combos)

The database and the source code for the website are [completely free and open source under the MIT license](https://opensource.org/licenses/MIT).
We encourage you to copy this data so it lives on!

[Combo Database Backend on Google Sheets](https://docs.google.com/spreadsheets/d/1KqyDRZRCgy8YgMFnY0tHSw_3jC99Z0zFvJrPbfm66vA/)

**Sincerely, the Community Admins:**

* [Lapper](https://twitter.com/lappermedic)
* [Goldshot20](https://www.moxfield.com/users/goldshot20)
* [AppleSaws](https://www.moxfield.com/users/AppleSaws)
* [Jaelyn Rosenquist](https://twitter.com/rosequartz_26)
* [Senior Edificer (Emeritus)](https://www.moxfield.com/users/SeniorEdificer)

## Installation Requirements

Install [Node v14](https://nodejs.org/). This will also install the `npm` command line tool.

If you are already using the [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) tool, you can run `nvm install` in the directory to get the correct version of node.

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## Updating Featured Combos on Home Page

To update what combos are designated as featured, update the script at [./scripts/download-data/is-featured.ts](./scripts/download-data/is-featured.ts). This will typically be the set codes for whatever the most recent sets are.

In addition, go to the Home page component and update the button text to be relevant for whatever combos are being featured.
