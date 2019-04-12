---
title: "Connecting to SOAP web services"
toc: false
layout: page
keywords: LoopBack
tags:
sidebar: lb3_sidebar
permalink: /doc/en/lb3/Connecting-to-SOAP.html
summary: The LoopBack CLI enables you to easily create models based on a SOAP web service.
---
{% include navgroups/soap.md %}
{% include toc.html %}

## Overview

Web services enable applications to communicate with each other independent
of platform and language. A web service is a software interface that describes a collection
of operations that can be invoked over the network through standardized XML messaging using
Simple Object Access Protocol ([SOAP](https://www.w3.org/TR/soap/)). Web Services Description Language ([WSDL](https://www.w3.org/TR/wsdl20/)) is an
XML document that describes web service endpoints, bindings, operations and schema.

{% include image.html file="loopback-soap-integration.png" alt="LoopBack SOAP integration" %}

Web services are still important in many enterprises, and the way to access them is via SOAP.
SOAP is fairly heavy-weight, and working with XML-based SOAP
payloads in Node.js is not easy.  It’s much easier to use JSON and to wrap or mediate a SOAP
service and expose it as a REST API.

To support the "API design first" approach, the [SOAP generator](SOAP-generator.html) creates LoopBack models and REST APIs for WSDL/SOAP operations to enable a LoopBack app to invoke a web service without the need to write code.

## Example

This example demonstrates using the [SOAP generator](SOAP-generator.html) to
connect a LoopBack application to a SOAP data source to:

- Generate models and remote methods to invoke SOAP operations.
- Play with the live APIs served by LoopBack using the API Explorer.
- Invoke the web service through your REST API.

### Create a LoopBack application

The first step is to create a new LoopBack application. For example:

```sh
$ lb app soap-demo
```

When prompted, select either LoopBack 3.x or 2.x and `empty-server` application.

### Generate SOAP data source

Next, create a data source for the SOAP web service.  
This example will use the publicly-available [Periodic table web service](http://www.webservicex.net/New/Home/ServiceDetail/19).

Create a new data source using the [data source generator](Data-source-gnerator.html):

```
$ cd soap-demo
$ lb datasource
```

When prompted, respond as follows:

- Enter the data-source name, for example "periodicSoapDS".
- Select "Soap Webservices (supported by StrongLoop)" from the list of connectors.
- Enter http://www.webservicex.net/periodictable.asmx for "URL to the SOAP web service endpoint" prompt.
- Enter http://www.webservicex.net/periodictable.asmx?WSDL for "HTTP URL or local fie system path to WSDL file" prompt.
- Enter "y" to Expose operations as REST APIs.
- Leave blank to "Maps WSDL binding operations to Node.js methods".
- Select "y" to "Install "loopback-connector-soap" prompt.  This runs `npm install -s loopback-connector-soap`.

For more information on SOAP datasource properties, see [SOAP data source properties](http://loopback.io/doc/en/lb3/SOAP-connector.html).

### Generate APIs from the SOAP data source

Now use the [SOAP generator](SOAP-generator.html) to generate models from the SOAP data source.

```sh
$ lb soap
```

This command lists the SOAP data sources defined for this application;
for this example, it will list the one you just created.

```
? Select the datasource for SOAP discovery
❯ periodicSoapDS
```

The generator loads the WSDL for the selected SOAP data source and discovers
services that the WSDL defines.  
It then prompts you to select the service from a list (in this example, there is only one).

```
? Select the service: periodictable
```

After you choose a service, the tool discovers and lists the bindings in the selected service
(in this example, there are two: `periodictableSoap` and `periodictableSoap12`).  
Select the `periodictableSoap` binding.

```
? Select the binding: periodictableSoap
```

After you choose a binding, the tool discovers and lists SOAP operations that the selected binding defines.  Press the space bar to select all of the listed SOAP operations.

```
◉ GetAtoms
◉ GetAtomicWeight
◉ GetAtomicNumber
❯◉ GetElementSymbol
```

After you choose one more more operations, the tool generates remote methods and a REST API that can
invoke the web service at `http://www.webservicex.net/periodictable.asmx`.

#### Generated and modified files

The tool modifies `server/model-config.json` with configuration for all models derived
from the SOAP service.

The tool generates the following model definition files in the `server/models` directory:

- `get-atomic-number-response.json` / `.js`: GetAtomicNumberResponse definition / extension.
- `get-atomic-weight-response.json` / `.js`: GetAtomicWeightResponse definition / extension.
- `get-atoms-response.json` / `.js`: GetAtomsResponse definition / extension.
- `get-atoms.json` / `.js`: Getatoms definition / extension.
- `get-element-symbol-response.json` / `.js`: GetelementsymbolResponse definition / extension.
- `get-element-symbol.json` / `.js`: Getelementsymbol definition / extension.
- `get-atomic-number.json`: GetAtomicNumber definition.
- `get-atomic-number.js`: GetAtomicNumber extension.
- `get-atomic-weight.json`: GetAtomicWeight model definition.
- `get-atomic-weight.js`: GetAtomicWeight model extension.
- `soap-periodictable-soap.json`: Model to host all APIs.
- `soap-periodictable-soap.js`: Methods that invoke web service operations.

### Run the application

To run the application:
```sh
node .
```

Open your browser to http://localhost:3000/explorer.

{% include image.html file="soap-api-explorer.png" alt="API Explorer for SOAP demo app" %}

As you see, SOAP operations defined in the WSDL document are now available.

Let's give a try:

- Click on 'GetAtomicNumber' API.
- Under 'Parameters' click on 'Example Value' text box. This will fill in 'GetAtomicNumber' value text box.
- Fill in the 'ElementName' as 'Copper' or 'Iron' or any element name from the periodic table.
- Click on 'Try it out' button.

{% include image.html file="invoke-api-webservice.png" alt="Invoking SOAP service via API Explorer" %}

This will invoke the REST API which is generated in `soap-periodictable-soap.js`. This REST API in turn  
invokes the periodic table Web Service hosted at `http://www.webservicex.net/periodictable.asmx` returning SOAP result back to the API explorer.

{% include image.html file="api-webservice-result.png" alt="Response from SOAP service in API Explorer" %}
