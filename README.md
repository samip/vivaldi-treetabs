This was an expirement to implement Firefox's Tree Style Tab, which provives hierarchical tabs view where tabs are shown below their opener tab. 

The issue is that Chrome extension API does not allow modifying browser interface, hence the repo consists of Javascript user scripts that hook into browser.html and regular browser extension made with Typescript. Chrome's internal messaing API is used to communicate between the two parts.

This extension worked for a brief moment in history with Vivaldi version released around 2020(?), before changes to Vivaldi's internal DOM broke it and I gave up.

# Installing

## Extension
* Go to extension page `vivaldi://extensions` (shortcut ctrl+shift+e)
* Enable Developer mode (top right corner)
* Load unpacked -> select `dist/extension`

## Userscript
Userscript is installed by copying `dist/treetabs.js` into `$vivaldi_install_dir/resources/vivaldi` and editing `browser.html` in the same folder to have
`<script src="treetabs.js"></script>` before `</body>` tag.

There's also an install script for Linux/Mac users.
`./installUserscript.sh /opt/path/to/vivaldi/`

Sudo will be required if `/opt/path/to/vivaldi/resources/vivaldi/browser.html` is not writable by current user.

On Windows Vivaldi is installed in %appdata% by default.

## Required Vivaldi settings
- Tab bar position has to be: Left
- New Tab Position: After active tab


# Development

## Building extension
`nvm use 11`

`npm install typescript` or `npm link typescript` if you have it installed globally.

`npm install`

`npm run-script build`

Tested to work with Gulp v.3.9.0

## Userscript
`gulp userscript` concatenates `userscript/*.js` files into `dist/treetabs.js`

## Other

https://www.cleanpng.com/png-digital-data-digitale-nachhaltigkeit-sustainabilit-5304786/
