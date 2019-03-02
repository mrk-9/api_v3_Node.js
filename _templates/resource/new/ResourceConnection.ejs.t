---
to: src/schemas/<%=h.inflection.camelize(name)%>/<%=h.inflection.camelize(name)%>Connection.graphql
---
type <%=h.inflection.camelize(name)%>Connection {
  # A list of edges
  edges: [<%=h.inflection.camelize(name)%>Edge]
  # Pagination information
  pageInfo: PageInfo!
}
