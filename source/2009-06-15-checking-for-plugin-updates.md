---
title: 'Checking for plugin updates'
date: 2009-06-15T11:24:00+0100
tags: grails scripts, grails plugins
alias: ["post/42902480686/checking-for-plugin-updates/"]
---

If you're anything like me you probably like to keep all your Grails plugins updated to the latest versions. It's quite easy to miss a release announcement and not realise there's a new version available. Although `grails list-plugins` will list out the available versions and what version you currently have installed it doesn't really highlight the plugins you could upgrade. I threw [this script][1] together this morning to do exactly that. It will simply check the plugin versions you have installed against all configured repositories and notify you of any that could be updated.

[1]: http://gist.github.com/130031

