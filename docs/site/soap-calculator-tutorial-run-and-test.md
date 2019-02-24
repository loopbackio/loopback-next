---
lang: en
title: 'Run and Test it'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/soap-calculator-tutorial-run-and-test.html
---

### Run and Test the Application

**Congratulations!** you are now ready to run and test your application.

#### Running the Application

```sh
npm start
```

You will see the following output:

```sh
Server is running at http://127.0.0.1:3000
Try http://127.0.0.1:3000/ping
```

#### Test the Application

You can use your browser or any **http** client such as curl.

**Warning:** Make sure you are connected to the internet, since the SOAP web
service is external.

```sh
curl http://localhost:3000/add/50/50
```

You will see the two properties in the response payload. The result property in
JSON format and the envelope property in XML format.

The XML response is useful if you want to process the response in this format.
However, if you are programming only in JSON format, focus only on the result
property. Your client application will have access to result value using the
normal convention `result.value` and get the `100`.

```sh
{"result":{"value":100},"envelope":"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ns1=\"http://wsdl.example.org/\"><SOAP-ENV:Body><ns1:AddResponse><AddResult>100</AddResult></ns1:AddResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>
```

### Changing the listening URL and PORT number

Sometimes you want to restrict the IP address to which your application will be
bind and its port number. You can use Object.assign in the `src/application.ts`
constructor before the `super(options);` statement as follows:

```ts
options = Object.assign(
  {},
  {
    rest: {
      url: '127.0.0.1',
      port: 3000,
    },
  },
  options,
);
```

### Navigation

Previous step: [Add a Controller](soap-calculator-tutorial-add-controller.md)
