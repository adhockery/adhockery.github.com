---
title: 'When is a Pirate not a Pirate? When it''s a HibernateProxy'
date: 2009-04-15T02:49:00+0100
tags: gorm, hibernate
alias: ["post/42902409632/when-is-a-pirate-not-a-pirate-when-its-a/"]
---

At work we're in the middle of upgrading [the][1] [Sky][2] [Entertainment][3] [sites][4] from Grails 1.0.3 to Grails 1.1 - a long blog post will follow with a tale of our woes! One of the changes in Grails 1.1 is that one-to-one domain associations are now lazy by default. This raised an interesting problem for us as it meant we were now sometimes dealing with [HibernateProxy][5] instances where before we weren't.

<!-- more -->

For example, let's imagine we have a _Pet_ domain class that is has an owner that is a _Person_ and there exists another domain class, _Pirate_ that is a specialisation of _Person_:

#### Pet.groovy

    class Pet {
        String type
        String name
        Person owner
    }

#### Person.groovy

    class Person {

        String name

        boolean equals(Object o) {
            if (this.is(o)) return true
            if (o == null) return false
            if (!(o instanceof Person)) return false
            return name == o.name
        }

        // hashCode and toString ommitted
    }

#### Pirate.groovy

    class Pirate extends Person {

        String nickname

        boolean equals(Object o) {
            if (!super.equals(o)) return false
            if (!(o instanceof Pirate)) return false
            return nickname == o.nickname
        }

        // hashCode and toString ommitted
    }

We want to test that either a regular _Person_ or a _Pirate_ can own a _Pet_. To do so we write an integration test like this:

    void testAssignPersonAsPetOwner() {
        Person terry = new Person(name: 'Terry Elbow')
        Pet rex = new Pet(type: 'Dog', name: 'Rex', owner: terry)
        Pet.withSession {session ->
            assert terry.save(flush: true)
            assert rex.save(flush: true)
            session.clear()
        }
        assertEquals(terry, Pet.findByName('Rex').owner)
    }

    void testAssignPirateAsPetOwner() {
        Person longJohn = new Pirate(name: 'John Silver', nickname: 'Long John')
        Pet capnFlint = new Pet(type: 'Parrot', name: "Cap'n Flint", owner: longJohn)
        Pet.withSession {session ->
            assert longJohn.save(flush: true)
            assert capnFlint.save(flush: true)
            session.clear()
        }
        assertEquals(longJohn, Pet.findByName("Cap'n Flint").owner)
    }

Simple enough. In both cases we just create a _Pet_ and its owner, ensure they save properly, then assert that the owner is correct when we read the _Pet_ back from the database. However the second test, where we assign a _Pirate_ as the owner, fails. The final assertion fails with the message:

    expected:<Pirate[Long John]> but was:<Pirate[Long John]>

Great... what?

When we read the _Pet_ instance back from the database the _owner_ association is set to lazy load so `Pet.findByName("Cap'n Flint").owner` is a _HibernateProxy_. The failure is caused by the fact that as _owner_ is declared as being of type _Person_ the proxy generated extends _Person_ and therefore the instanceof check in _Pirate_'s equals method fails...

    if (!(o instanceof Pirate)) return false

In our case _o_ is an instance of _Person_ and an instance of _HibernateProxy_ which if loaded would yield an instance of _Pirate_ but is not itself an instance of _Pirate_.

Our options at this point seem to be...

1. Set _owner_ to eager fetch.
2. Remove the instanceof check from the _equals_ implementation in _Pirate_
3. Initialise the _HibernateProxy_ so _equals_ is working with the real object

The first option is just admitting defeat! Loading objects from the database when it's not necessary is wasteful and we don't want to go creating that kind of tech debt just to get our test working. The second option is not acceptable as it would mean the _equals_ implementation on _Pirate_ would violate the [general contract of _equals_][6] as `aPerson == aPirate` would return _false_ but `aPirate == aPerson` would throw _MissingPropertyException_ when it tried to execute the line:

    return nickname == o.nickname

This leaves us with figuring out a way to initialise the proxy so we're always dealing with real objects. You may think it's an undesirable side-effect of the _equals_ implementation to potentially force a database read but consider that it will do so anyway to perform the comparison of the _nickname_ property.

There is a convenience [_initialize_][7] method in _org.hibernate.Hibernate_ that can force a proxy to load, but it is _void_ so our _equals_ method would still have a reference to the _HibernateProxy_ that is not actually an instance of _Pirate_. What we need to do is:

    if (o instanceof org.hibernate.proxy.HibernateProxy) {
        o = o.hibernateLazyInitializer.implementation
    }
    if (!(o instanceof Pirate)) return false

As it turns out we can't do this directly in the _equals_ implementation. It appears that [_getAt(String)_][8] is overridden in _HibernateProxy_'s meta class so we get the error:

    No such property: hibernateLazyInitializer for class: Person_$$_javassist_0

As luck would have it Grails has a utility method for doing exactly what we want and as it's written in Java no amount of meta class trickery will hide the _hibernateLazyInitializer_ property from it. Our final, working _equals_ implementation for _Pirate_ looks like:

    boolean equals(Object o) {
        if (!super.equals(o)) return false
        if (o instanceof HibernateProxy) {
            o = GrailsHibernateUtil.unwrapProxy(o)
        }
        if (!(o instanceof Pirate)) return false
        return nickname == o.nickname
    }

**Note:** this is a simple example so we'll gloss over the fact that _Pirate_'s _equals_ isn't symmetric as

    new Person(name: 'X') == new Pirate(name: 'X', nickname: 'Y')

returns _true_ while flipping the operands causes it to return _false_. The problem and the solution apply any time inheritance and lazy-loading run up against class checking whether via instanceof, [_Class.isAssignableFrom_][9], switch statements using a Class as a case, etc.

[1]: http://showbiz.sky.com/
[2]: http://tv.sky.com/
[3]: http://movies.sky.com/
[4]: http://sky1.sky.com/
[5]: http://www.hibernate.org/hib_docs/v3/api/org/hibernate/proxy/HibernateProxy.html
[6]: http://java.sun.com/javase/6/docs/api/java/lang/Object.html#equals(java.lang.Object)
[7]: http://www.hibernate.org/hib_docs/v3/api/org/hibernate/Hibernate.html#initialize(java.lang.Object)
[8]: http://groovy.codehaus.org/groovy-jdk/java/lang/Object.html#getAt(java.lang.String%20property)
[9]: http://java.sun.com/javase/6/docs/api/java/lang/Class.html#isAssignableFrom(java.lang.Class)

