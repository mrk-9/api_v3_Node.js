---
to: src/schemas/<%=h.inflection.camelize(name)%>/<%=h.inflection.camelize(name)%>.graphql
---
type <%=h.inflection.camelize(name)%> {
  # <%=h.inflection.camelize(name)%> UUID
  id: ID!
  # The date and time when the <%=h.inflection.camelize(name)%> was created
  createdAt: DateTime
  # The date and time when the <%=h.inflection.camelize(name)%> was last updated
  updatedAt: DateTime
}

