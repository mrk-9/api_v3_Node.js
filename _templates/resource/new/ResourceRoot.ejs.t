---
to: src/schemas/<%=h.inflection.camelize(name)%>/<%=h.inflection.camelize(name)%>Root.graphql
---
extend type Query {
  # Look up a <%=h.inflection.camelize(name)%> by its ID
  <%=h.inflection.camelize(name, true)%>(id: ID!): <%=h.inflection.camelize(name)%>
  # Look up <%=h.inflection.pluralize(h.inflection.camelize(name))%>
  <%=h.inflection.pluralize(h.inflection.camelize(name, true))%>(
    # Returns the first n <%=h.inflection.pluralize(h.inflection.camelize(name))%> from the list. Must be within 1-100
    first: Int = 100,
    # Returns the <%=h.inflection.pluralize(h.inflection.camelize(name))%> that come after the given <%=h.inflection.camelize(name)%>Edge.cursor.
    after: String
  ): <%=h.inflection.camelize(name)%>Connection!
}

extend type Mutation {
  # Creates a <%=h.inflection.camelize(name)%>
  create<%=h.inflection.camelize(name)%>(input: Add<%=h.inflection.camelize(name)%>Input): <%=h.inflection.camelize(name)%>
  # Deletes a <%=h.inflection.camelize(name)%>
  delete<%=h.inflection.camelize(name)%>(
    # The <%=h.inflection.camelize(name)%> ID to delete
    id: ID!
  ): <%=h.inflection.camelize(name)%>
  # Updates a <%=h.inflection.camelize(name)%>
  update<%=h.inflection.camelize(name)%>(
    # The <%=h.inflection.camelize(name)%> ID to update
    id: ID!,
    input: Update<%=h.inflection.camelize(name)%>Input
  ): <%=h.inflection.camelize(name)%>
}

input Add<%=h.inflection.camelize(name)%>Input {
}

input Update<%=h.inflection.camelize(name)%>Input {
}
