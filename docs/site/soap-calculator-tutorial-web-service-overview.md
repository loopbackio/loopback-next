---
lang: en
title: 'Soap Web Service Overview'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/soap-calculator-tutorial-web-service-overview.html
---

### Overview

The calculator is a web service using the **SOAP** protocol and reside in this
[server](https://calculator-webservice.mybluemix.net/calculator?wsdl),
exclusively used by this **LB4** tutorial, it is exposing four end points that
resembles the operation of a basic calculator as follows:

1. **add**
2. **subtract**
3. **divide**
4. **multiply**

### SOAP Calculator Payloads

It expects two **integer** parameters named **`intA`** and **`intB`** in the
request for all the four exposed methods.

#### SOAP WS Request

The SOAP Web Service is expecting the following payload on a request, notice the
two properties named **intA** and **intB** respectively. The following is just a
sample for the Add method.

```xml
<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:wsdl=\"http://wsdl.example.org/\">
   <soapenv:Header/>
   <soapenv:Body>
      <wsdl:Add>
         <intA>50</intA>
         <intB>5</intB>
      </wsdl:Add>
   </soapenv:Body>
</soapenv:Envelope>
```

#### SOAP WS Response

The SOAP Web Service will respond to **LB4** with the following xml result,
based on the corresponding successfully invoked method, in this case the sample
is just for the Add method.

```xml
<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ns1=\"http://wsdl.example.org/\">
   <SOAP-ENV:Body>
      <ns1:addResponse>
         <value>55</value>
      </ns1:addResponse>
   </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
```

### Objective

To _integrate_ this **SOAP** Web Service in our **LB4** application in order to
make it available to any front-end client requiring **REST** Services.

In real life, you can have several legacy SOAP Web Services integrated by
**LB4** in a single application or in several micro services, the scenario will
depend upon your designed architecture and not **LB4**.

#### Integration Outcome

**LB4** will make it very simple for any client application to access this SOAP
Web Service through the REST API endpoints exposed by **LB4**, as a developer
this SOAP protocol and the XML->JSON->XML transformation works transparently.

##### REST API Request

Any **REST** API client will just need to send `/add/50/5` to the Add operation
end point and our application will handle all the details.

##### REST API Response

**LB4** will process the XML payload sent by the remote SOAP Web Service and
convert it to JSON format before sending it back to the client application.

```ts
result: {
  value: 55;
}
```

### Navigation

Previous step: [Tutorial overview](soap-calculator-tutorial.md)

Next step:
[Create your app scaffolding](soap-calculator-tutorial-scaffolding.md)
