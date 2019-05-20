---
title: 'LoopBack considerations for GDPR readiness'
layout: page
keywords: LoopBack, GDPR
tags: gdpr
lang: en
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Deploy-for-GDPR-readiness.html
summary: LoopBack considerations for GDPR readiness.
---

## Notice:

This document is intended to help you in your preparations for GDPR readiness.
It provides information about features of LoopBack that you can configure, and
aspects of the product’s use, that you should consider to help your organization
with GDPR readiness. This information is not an exhaustive list, due to the many
ways that clients can choose and configure features, and the large variety of
ways that the product can be used in itself and with third-party applications
and systems.

**Clients are responsible for ensuring their own compliance with various laws
and regulations, including the European Union General Data Protection
Regulation. Clients are solely responsible for obtaining advice of competent
legal counsel as to the identification and interpretation of any relevant laws
and regulations that may affect the clients’ business and any actions the
clients may need to take to comply with such laws and regulations.**

**The products, services, and other capabilities described herein are not
suitable for all client situations and may have restricted availability. IBM
does not provide legal, accounting, or auditing advice or represent or warrant
that its services or products will ensure that clients are in compliance with
any law or regulation.**

---

### Table of Contents

1.  [GDPR](#GDPR)
2.  [Product Configuration for GDPR](#product-configuration---considerations-for-gdpr-readiness)
3.  [Data Life Cycle](#data-life-cycle)
4.  [Data Collection](#data-collection)
5.  [Data Storage](#data-storage)
6.  [Data Access](#data-access)
7.  [Data Processing](#data-processing)
8.  [Data Deletion](#data-deletion)
9.  [Data Monitoring](#data-monitoring)
10. [Responding to Data Subject Rights](#responding-to-data-subject-rights)

---

### GDPR

General Data Protection Regulation (GDPR) has been adopted by the European Union
(“EU”) and applies from May 25, 2018.

#### Why is GDPR important?

GDPR establishes a stronger data protection regulatory framework for processing
of personal data of individuals. GDPR brings:

- New and enhanced rights for individuals
- Widened definition of personal data
- New obligations for processors
- Potential for significant financial penalties for non-compliance
- Compulsory data breach notification

#### Read more about GDPR

- [EU GDPR Information Portal](https://www.eugdpr.org/)
- [ibm.com/GDPR website](http://ibm.com/GDPR)

---

### Product Configuration - considerations for GDPR Readiness

#### Offering Configuration

The following sections provide considerations for configuring LoopBack to help
your organization with GDPR readiness.

##### Configuration to support data handling requirements

The GDPR legislation requires that personal data is strictly controlled and that
the integrity of the data is maintained. This requires the data to be secured
against loss through system failure and also through unauthorized access or via
theft of computer equipment or storage media.

**LoopBack Overview**

_Please note that LoopBack 4 is in developer preview and not ready for
production. For production, use
[LoopBack 3](https://loopback.io/doc/en/lb3/index.html)._

LoopBack is an open source Node.js framework that allows you to create REST APIs
and connect to the backend resources, such as database and Web services.

- Users can download LoopBack anonymously and use LoopBack without creating any
  accounts.
- LoopBack itself is not runnable. The close analogy is Spring Framework or IBM
  Node.js SDK.
- Customers create applications using LoopBack tooling and runtime.
- Since LoopBack allows users to connect to backend resources that might require
  credentials to access, users can create a LoopBack application in such way
  that the credentials are stored in the configuration files as part of their
  LoopBack application.

It is important to note that it is developer's responsibility to design and
configure their LoopBack application using the
[GDPR Privacy By Design](https://www.eugdpr.org/more-resources-1.html) as
guidelines.

##### Configuration to support Data Privacy

It is developer's responsibility to design and configure their LoopBack
application using the
[GDPR Privacy By Design](https://www.eugdpr.org/more-resources-1.html) as
guidelines to support Data Privacy.

##### Configuration to support Data Security

It is developer's responsibility to design and configure their LoopBack
application using the
[GDPR Privacy By Design](https://www.eugdpr.org/more-resources-1.html) as
guidelines to support Data Security.

---

### Data Life Cycle

LoopBack is a development framework that does not collect any data nor does it
send any of it back to IBM. The LoopBack framework facilitates the connection to
backend resources, such as databases and Web services, where identity data is
stored. However, the framework itself does not store actual data.

_Important_: LoopBack 4 is in developer preview. How its application
configuration data reside and is being used may be subjected to change. More
information will be provided once the code has stablized.

##### Personal data used for online contact with IBM

LoopBack clients can submit online comments/feedback/requests to contact IBM
about LoopBack subjects.

Regarding getting support from IBM as open source community users or paid
customer support, LoopBack users might be asked to provide a sample application
and output/debug logs for problem reproduction and problem determination. It is
important to note that personal data is not needed for this purpose. If there is
personal data included in the application, they should be removed or
deidentified before sending it to IBM Support.

For supporting the community users through GitHub, please keep in mind that it
is a public platform and anyone who has access to World Wide Web is able to view
it. If there is personal data included in the application, it should be removed
or de-identified before sending it to IBM Support.

Typically, only the client name and email address are used, to enable personal
replies for the subject of the contact, and the use of personal data conforms to
the [IBM Online Privacy Statement](https://www.ibm.com/privacy/us/en/).

---

### Data Collection

LoopBack is a development framework that does not collect any data nor does it
send any of it back to IBM. It is the LoopBack developers/users'
responsibilities to ensure the data collection is GDPR compliant and protect
their own data.

For details, refer to the
[GDPR Privacy By Design](https://www.eugdpr.org/more-resources-1.html)
guidelines from the [GDPR official Web site](https://www.eugdpr.org).

---

### Data Storage

LoopBack is a development framework that does not collect any data nor does it
send any of it back to IBM. It is the LoopBack developers/users'
responsibilities to protect their own data.

See the references below for securing the data:

https://www.ibm.com/security/services/data-security

https://www.ibm.com/security/campaign/gdpr

---

### Data Access

LoopBack is a development framework that does not collect any data nor does it
send any of it back to IBM. It is the LoopBack developers/users'
responsibilities to determine the role and access rights to their own data.

For details, refer to the
[GDPR Privacy By Design](https://www.eugdpr.org/more-resources-1.html)
guidelines from the [GDPR official Web site](https://www.eugdpr.org).

---

### Data Processing

LoopBack is a development framework that does not collect any data nor does it
send any of it back to IBM. It is the LoopBack developers/users'
responsibilities to protect their own data.

See the references below for securing the data:

https://www.ibm.com/security/services/data-security

https://www.ibm.com/security/campaign/gdpr

---

### Data Deletion

The LoopBack framework does not store any data but act as a data processor. It
is the LoopBack developers/users' responsibilities to allow end-users of the
LoopBack application to request deletion of personal data, so that their
LoopBack application is GDPR compliant.

For details, refer to the
[GDPR Privacy By Design](https://www.eugdpr.org/more-resources-1.html)
guidelines from the [GDPR official Web site](https://www.eugdpr.org).

---

### Data Monitoring

The LoopBack framework does not monitor data. It is the LoopBack
developers/users' responsibilities to ensure the data monitoring is GDPR
compliant. For details, refer to the
[GDPR Privacy By Design](https://www.eugdpr.org/more-resources-1.html)
guidelines from the [GDPR official Web site](https://www.eugdpr.org).

---

### Responding to Data Subject Rights

LoopBack is a development framework that does not collect any data. It is the
LoopBack developers/users' responsibilities to meet data subject rights.

For details, refer to the
[GDPR Privacy By Design](https://www.eugdpr.org/more-resources-1.html)
guidelines from the [GDPR official Web site](https://www.eugdpr.org).
