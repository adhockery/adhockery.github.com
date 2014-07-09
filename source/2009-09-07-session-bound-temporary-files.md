---
title: 'Session Bound Temporary Files'
date: 2009-09-07T06:04:00+0100
tags: grails plugins, webflow
alias: ["post/42902559948/session-bound-temporary-files/"]
---

I've just released [Session Temp Files][1], a very simple plugin for managing a temporary file storage space bound to the HTTP session. I'm working on something where a user uploads a file at the start of a webflow conversation, the flow then validates the file and may require the user to enter extra information before finally the file is saved and an associated record is added to the database. The uploaded files needed to be stored somewhere between the initial upload phase and the successful outcome of the flow where they will be copied in to a permanent storage space. The file is really too big to keep in memory in the flow scope. It's easy enough to create a temp file and delete it at the end of the flow (even if the user cancels out of the flow) however users can also do things like close the browser, suddenly decide to do something different and type in a new URL, etc. The webflow then gets abandoned in an intermediate state. The flow itself will be destroyed when the HTTP session ends but the temp files I created will hang around until the OS decides to sweep the temp directory.

The plugin simply allows you to create a directory within the normal temp directory - `System.properties."java.io.tmpdir"` - that will get deleted when the HTTP session expires. It binds two new methods on to [HTTPSession][2]: `getTempDir()` returns the session's temp directory, creating it if it doesn't exist and `createTempFile(prefix,suffix)` works like `[File.createTempFile][3]` except that the file is created inside the directory returned by `getTempDir`.

The [code is up on GitHub][4] and the plugin is available from the [standard Grails plugin repository][5] via `grails install-plugin session-temp-files`.

[1]: http://grails.org/plugin/session-temp-files
[2]: http://java.sun.com/javaee/5/docs/api/javax/servlet/http/HttpSession.html
[3]: http://java.sun.com/javase/6/docs/api/java/io/File.html#createTempFile(java.lang.String,%20java.lang.String)
[4]: http://github.com/robfletcher/grails-session-temp-files/
[5]: https://svn.codehaus.org/grails-plugins/grails-session-temp-files/

