---
title: 'Export Selenium IDE scripts for Grails'
date: 2010-06-15T14:18:00+0100
tags: selenium, testing, firefox, grails plugins
alias: post/42902982709/export-selenium-ide-scripts-for-grails/
---

Thanks to the [documentation][1] provided on [Adam Goucher's blog][2] I've created a simple Firefox plugin that extends the [Selenium IDE][3] and adds formatters that allow you to export a script as a [Grails Selenium RC][4] test case. You have the option of JUnit 3 (extends _GroovyTestCase_, uses _assertEquals_) or JUnit 4 (doesn't extend anything, uses annotations and _assertThat_) formats.

<!-- more -->

I think everything is working. There are some things I'd still like to do:

* Custom commands are currently exported as commented out which they don't need to be given Grails Selenium RC test cases can call Javascript extension functions directly.
* I haven't yet figured out how to output a command such as

    selenium.waitForAlertPresent()

rather than

    selenium.waitFor {
        selenium.isAlertPresent()
    }

The Firefox plugin is available from [Selenium HQ][5]. You will need to have Selenium IDE installed for it to work, obviously. Once installed you should find options

* _Export Test Case As -> Grails Selenium RC (JUnit 3)_
* _Export Test Case As -> Grails Selenium RC (JUnit 4)_

have been added to Selenium IDE's _File_ menu.

Whilst I would certainly not leave the exported test case as is it's a quick way to get started. From the exported script you can easily refactor out some page objects or helper methods.

[1]: http://adam.goucher.ca/?p=1352
[2]: http://adam.goucher.ca/
[3]: http://seleniumhq.org/projects/ide/
[4]: http://robfletcher.github.com/grails-selenium-rc/docs/manual/index.html
[5]: http://bit.ly/daOJpD

