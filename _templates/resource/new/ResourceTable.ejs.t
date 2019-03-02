---
inject: true
to: template.yml
before: Outputs
skip_if: <%=h.inflection.camelize(name)%>Table
---
  <%=h.inflection.camelize(name)%>Table:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: <%=h.inflection.camelize(name)%>
      SSESpecification:
        SSEEnabled: true
      AttributeDefinitions:
        -
          AttributeName: "id"
          AttributeType: "S"
      KeySchema:
        -
          AttributeName: "id"
          KeyType: "HASH"
      ProvisionedThroughput:
        ReadCapacityUnits: "5"
        WriteCapacityUnits: "5"
