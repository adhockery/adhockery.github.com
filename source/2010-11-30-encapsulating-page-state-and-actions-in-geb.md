---
title: 'Encapsulating page state and actions in Geb'
date: 2010-11-30T13:47:00+0000
tags: geb, testing
alias: ["post/42903120929/encapsulating-page-state-and-actions-in-geb/"]
---

Geb _Page_ and _Module_ classes are just regular Groovy classes. In addition to the _content_ DSL you can declare methods just as you would in any other class. Those methods can use content properties directly. This is really useful for encapsulating state and actions in a reusable way.

In this post I want to run through a couple of simple examples of re-usable _Module_ classes that are enhanced with methods. Although the examples deal with _Module_ classes everything here is equally applicable to _Page_ classes.

<!-- more -->

Page object methods tend to fall into two categories:

Observers
: report on some aspect of page state (e.g. whether a user is logged in or not).
: have non-_void_ return types (I prefer explicit return types on methods but `def` would work too).
: can be used for making assertions.

Actions
: perform an action such as clicking a link or button.
: will typically be _void_ (note that it's not necessary to return a _Page_ instance or class from a navigation method in _Geb_).
: throw _IllegalStateException_ if the action is invalid in the current page state.

First let's consider an authentication module that can be used across every page in a site. The markup of the module can be completely different depending on whether a user is logged in or not. When not logged in a username/password form is shown:

    #!html
    <aside id="auth">
        <fieldset>
            <legend>Log In</legend>
            <form action="/auth/login" method="post" >
                <label>Username: <input name="username"/></label>
                <label>Password: <input type="password" name="password"></label>
                <button name="login" type="submit">Log In</button>
            </form>
        </fieldset>
    </aside>

When logged in, a welcome message is shown:

    #!html
    <aside id="auth">
        Welcome back <span class="username">blackbeard</span>
        <a href="/auth/logout">Log Out]</a>
    </aside>

To model this I'll create a Geb _Module_ like this:

    #!groovy
    class AuthModule extends Module {
        static base = { $("aside#auth") }

        static content = {
            username(required: false) { $(".username").text() }
            logoutButton(required: false, to: HomePage) { $("a[name=logout]") }
            form(required: false) { $("form") }
            loginButton(required: false, to: HomePage) { $("button[name=login]") }
        }
    }

The `required: false` declaration is used to declare content properties that may or may not be on the page. The `username` and `logoutButton` properties are only present in the logged-in state and the `form` and `loginButton` properties are only present in the logged-out state.

I can use the module in some tests like this:

    #!groovy
    def "user can log in"() {
        when:
        authModule.form.username = "blackbeard"
        authModule.form.password = "yohoho!"
        authModule.loginButton.click()

        then:
        at HomePage
        authModule.username == "blackbeard"
    }

    def "user can log out"() {
        when:
        authModule.logoutButton.click()

        then:
        at HomePage
        authModule.username == null
    }

This is a good start but there are several assumptions and bits of page detail creeping into the test. The test is using the presence or absence of the _username_ to determine if someone is logged in or not. That doesn't lead to a very meaningful assertion in the test and is assuming things about the page detail. Likewise the login step is quite long-winded and likely to be repeated in a lot of tests. Not only that but it won't work if a user is already logged in as the form fields won't be present on the page.

To encapsulate the module's state and actions better I'll add the following methods:

    #!groovy
    boolean isLoggedIn() { username }

    void login(String username, String password = "password") {
        if (loggedIn) throw new IllegalStateException("already logged in")
        form.username = username
        form.password = password
        loginButton.click()
    }

    void logout() {
        if (!loggedIn) throw new IllegalStateException("already logged out")
        logoutButton.click()
    }

The methods declared by the module abstract some detail away very effectively. The `isLoggedIn` method means I can change the login detection mechanism later and just change the module's method rather than a bunch of tests. The `login` and `logout` methods abstract away the _how_ of logging in and out so the test can just deal with the _what_. I've used _IllegalStateException_ for cases where a method is called when the module is not in the correct state. The tests now look much clearer:

    #!groovy
    def "user can log in"() {
        when:
        authModule.login "blackbeard"

        then:
        at HomePage
        authModule.username == "blackbeard"
    }

    def "user can log out"() {
        when:
        authModule.logout()

        then:
        at HomePage
        !authModule.loggedIn
    }

Another good example of encapsulating state and behaviour like this is a typical pagination module that would appear on a list or search results page. The markup would look something like this (I've omitted the link `href` attributes for clarity):

    #!html
    <nav class="pagination">
        <a class="prevLink">Previous</a>
        <a class="step">1</a>
        <span class="currentStep">2</span>
        <a class="step">3</a>
        <a class="nextLink">Next</a>
    </nav>

The _previous_ and _next_ links will only appear when there is a previous or next page and no links will be present at all if there is only a single page. The following _Module_ class models the state and actions of this component:

    #!groovy
    class Pagination extends Module {
        static content = {
            links(required: false) { $("a") }
            currentPage(required: false) { $(".currentStep")?.text()?.toInteger() ?: 1 }
            nextLink(required: false) { links.filter(".nextLink") }
            previousLink(required: false) { links.filter(".prevLink") }
        }

        boolean isFirstPage() {
            previousLink.empty
        }

        boolean isLastPage() {
            nextLink.empty
        }

        void toPage(int pageNumber) {
            def link = links.filter(text: "$pageNumber")
            if (!link) throw new IllegalArgumentException("Page number $pageNumber not present in pagination")
            link.click()
        }

        void nextPage() {
            if (lastPage) throw new IllegalStateException("Already on the last page")
            nextLink.click()
        }

        void previousPage() {
            if (firstPage) throw new IllegalStateException("Already on the first page")
            previousLink.click()
        }
    }

Breaking the _Module_ down in detail:

* The `currentPage` property returns the current page number as an `int` and defaults to `1` if there is no pagination present in the page.
* The `isFirstPage` and `isLastPage` observer methods use the absence of the previous and next links respectively to determine if the current page is the first or last one.
* The `toPage` method finds a numbered link and clicks it, throwing _IllegalArgumentException_ if no such link is present.
* The `nextPage` and `previousPage` action methods throw _IllegalStateException_ if the relevant link is not on the page.

The _Pagination_ class now neatly encapsulates the detail of the pagination elements and presents a higher-level fa&ccedil;ade to the tests.

Fuller versions of the examples in this post can be found [on GitHub][1].

[1]: https://github.com/robfletcher/geb-examples "geb-examples project on GitHub"

