---
title: 'Building your app on Hudson with Multiple Grails versions'
date: 2010-05-03T06:35:00+0100
tags: hudson
alias: post/42902915689/building-your-app-on-hudson-with-multiple-grails/
---

For my Grails plugins I generally write a test project (or more than one). I thought it would be useful to be able to run these against multiple versions of Grails on my build server so I can spot any incompatibilities with the versions the plugin is supposed to support.

Using [Hudson][1] this turned out to be pretty straightforward.

<!-- more -->

You will need all the Grails versions you want to test against installed on your Hudson box. I put them in `/opt` so replace that with wherever you have them in the steps below. Also, if you want the builds to run in parallel and will be running any functional tests you'll need the [Hudson Port Allocator plugin][2].

* Start by creating a new job in Hudson and choosing _"Build multi-configuration project"_.
* The configuration dialog has an extra section _"Configuration Matrix"_ where you can set up the different config combinations that will run. We're just interested in varying the Grails version so check the _"Axes"_ and create a new axis named _"GRAILS_VERSION"_ with the different versions you want in the _"values"_ box, e.g. "`1.2.0 1.2.1 1.2.2 1.3.0.RC2`"
* Set up your source code repository and build triggers as you would for any other project.
* If you want to run the builds in parallel and are running any functional tests you will need to make sure that Grails starts up on a unique port. In the _"Build environment"_ section add a new _"Plain TCP port"_ named _"GRAILS_PORT"_. If you're running anything else that needs a port such as a Selenium server you'll need one for that as well.
* Add an _"Execute shell"_ build step. Unfortunately the Hudson Grails plugin does not allow you to use a variable to specify the Grails version so you'll have to go old-school:

    export GRAILS_HOME=/opt/grails-$GRAILS_VERSION
    export PATH=$GRAILS_HOME/bin:$PATH
    # assign Grails a unique port (you can skip this if you're only running unit/integration tests)
    export JAVA_OPTS="$JAVA_OPTS -Dserver.port=$GRAILS_PORT"
    grails clean
    grails upgrade --non-interactive
    grails test-app --non-interactive

* Check _"Publish JUnit test result report"_ in the _"Post-build Actions"_ section and specify `target/test-reports/*.xml` as the _"Test report XMLs"_

When you run the Hudson job you should see it kick off one sub-job for each Grails version. Each will check out the project, upgrade it to the relevant Grails version and run the tests.

I have my plugin test projects triggered by the plugin build and have them grab the plugin zip itself from the archived artefacts in the plugin's Hudson job. So I've added this before the `grails test-app` step:

    grails install-plugin http://my.hudson.server/hudson/job/my-plugin/lastSuccessfulBuild/artifact/my-plugin-1.0.zip --non-interactive

There's a [bug][3] in Grails 1.3.0.RC2 that means you will need to split this into a `wget` followed by installing the zip from a file path rather than a URL. This is fixed in trunk so won't be a problem in Grails 1.3 final.

If you're using SVN I think you may need to revert any changes the `grails upgrade` has made to `application.properties`, etc. otherwise you'll get merge conflicts on the next run. This does not seem to be a problem with Git.

[1]: http://hudson-ci.org/
[2]: http://wiki.hudson-ci.org/display/HUDSON/Port+Allocator+Plugin
[3]: http://jira.codehaus.org/browse/GRAILS-6223

