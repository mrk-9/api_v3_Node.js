---
to: src/schemas/<%=h.inflection.camelize(name)%>/<%=h.inflection.camelize(name)%>Edge.graphql
---
type <%=h.inflection.camelize(name)%>Edge {
  # Cursor for use in pagination
  cursor: String!
  # The <%=h.inflection.camelize(name)%>
  node: <%=h.inflection.camelize(name)%>
}
