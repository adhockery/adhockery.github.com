---
title: 'Data-driven variation with Spock'
date: 2011-08-18T21:42:00+0100
tags: spock, css, progressive enhancement, resources, i18n, spring
alias: ["post/42903265561/data-driven-variation-with-spock/"]
---

Spock's `where:` block is commonly used with a [data table][1] but can also be driven by any `Iterable` data. It's worth bearing in mind that the data driving the `where:` block doesn't have to be hardcoded, it can be dynamic. For example, today we implemented a spec to ensure that every table in our database schema has a primary key (because it's required by [HA-JDBC][2] and not automatically added by GORM on join tables).

<!-- more -->

In this spec the `where:` block is driven by the list of table names read from the database metadata.

    import grails.plugin.spock.IntegrationSpec
    import java.sql.Connection
    import javax.sql.DataSource
    import spock.lang.*

    class DatabaseSchemaSpec extends IntegrationSpec {

        @Shared def dataSource
        @Shared List<string> tableNames

        def setupSpec() {
            DataSource.mixin(DataSourceCategory)

            tableNames = []
            dataSource.withConnection {connection ->
                def rs = connection.metaData.getTables(null, null, '%', ['TABLE'] as String[])
                while (rs.next()) {
                    tableNames << rs.getString(3)
                }
            }
        }

        @Unroll("the #table table has a primary key")
        void "all tables have a primary key"() {
            expect:
            dataSource.withConnection { Connection connection ->
                assert connection.metaData.getPrimaryKeys(null, null, table).next()
            }

            where:
            table << tableNames
        }
    }

    @Category(DataSource)
    class DataSourceCategory {
        static void withConnection(dataSource, Closure closure) {
            Connection connection = dataSource.connection
            try {
                closure(connection)
            } finally {
                connection?.close()
            }
        }
    }

_Get this code [as a Gist](https://gist.github.com/1154459.js?file=DatabaseSchemaSpec.groovy)._

Something like this could be done with JUnit, of course. A test could iterate over the table names and assert that each has a primary key. However, such a test would fail fast whereas with the power of Spock's `@Unroll` annotation the spec creates a separate test result for each database table and will run each individually regardless of whether any others pass or fail. The command line output from this spec will be enough to tell you which tables do not have primary keys as `@Unroll` puts the table name right in the test name.

The other great thing about this spec is that it doesn't require maintenance; as we add more domain classes to our app the spec will automatically check the associated tables.

[1]: https://github.com/robfletcher/grails-enhanced-scaffolding/blob/master/test/projects/scaffolding-example/test/functional/scaffolding/InputTypesSpec.groovy#L18
[2]: http://ha-jdbc.sourceforge.net/

