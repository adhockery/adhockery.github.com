---
title: 'Persisting DateTime with zone information'
date: 2009-03-03T13:31:00+0000
tags: hibernate, gorm, joda time
alias: post/42902330676/persisting-datetime-with-zone-information
---

I was stuck a while ago trying to figure out how to map [`PersistentDateTimeTZ`][1] in a GORM class. It's an implementation of Hibernate's [`UserType`][2] interface that persists a Joda [`DateTime`][3] value using 2 columns - one for the actual timestamp and one for the time zone. The `DateTime` class contains time zone information but a SQL timestamp column is time zone agnostic so you can lose data when the value is saved (the same exact problem exists when persisting `java.util.Date` values).

<!-- more -->

I could never figure out how to map the user type to my domain class property correctly. Just doing:

    static mapping = {
        dateTimeProperty type: PersistentDateTimeTZ
    }

Failed with:

    org.hibernate.MappingException: property mapping has wrong number of columns.

I seem to remember someone on the Grails mailing list suggesting I tried treating the value as an [embedded type][4]. That also didn't work as [GORM embedded types have to be Groovy classes in `grails-app/domain`][5] and `PersistentDateTimeTZ` is written in Java and lives in a library jar.

I finally found the solution in the [2nd Edition of The Definitive Guide to Grails][6] (which I can't recommend enough, by the way). The trick is to pass a closure specifying the two columns to the property definition in the mapping builder. The working code looks like this:

    static mapping = {
        dateTimeProperty type: PersistentDateTimeTZ, {
            column name: "date_time_property_timestamp"
            column name: "date_time_property_zone"
        }
    }

The order of the columns corresponds to the order of the values returned by [the `sqlTypes()` method][7] of whatever `UserType` implementation you're using.

[1]: http://joda-time.sourceforge.net/contrib/hibernate/apidocs/org/joda/time/contrib/hibernate/PersistentDateTimeTZ.html
[2]: http://www.hibernate.org/hib_docs/v3/api/org/hibernate/usertype/UserType.html
[3]: http://joda-time.sourceforge.net/api-release/org/joda/time/DateTime.html
[4]: http://grails.org/doc/1.1.x/guide/single.html#5.2.2%20Composition%20in%20GORM
[5]: http://jira.codehaus.org/browse/GRAILS-3328
[6]: http://www.amazon.co.uk/Definitive-Guide-Grails-Experts-Development/dp/1590599950
[7]: http://www.hibernate.org/hib_docs/v3/api/org/hibernate/usertype/UserType.html#sqlTypes()
