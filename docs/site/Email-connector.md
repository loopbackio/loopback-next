---
title: "Email connector"
lang: en
layout: page
keywords: LoopBack
tags: connectors
sidebar: lb3_sidebar
permalink: /doc/en/lb3/Email-connector.html
summary: The built-in email connectors enables applications to send email.
---

The email connector is built in to LoopBack, so you don't need to install it.

{% include important.html title="Nodemailer: Where to Find Documentation" content="
The email connector is essentially a LoopBack-integrated interface to the [nodemailer](https://nodemailer.com/) library. This page gives a usage example; for full documentation of configuration options, **refer to the [nodemailer documention](https://github.com/nodemailer/nodemailer#setting-up)**.
" %}

## Creating an email data source

Create a new email data source with the [data source generator](Data-source-generator.html):

```shell
$ lb datasource
```

With API Connect v5 developer toolkit:

```shell
$ apic create --type datasource
```

When prompted, select **Email** as the connector. This creates an entry in `datasources.json` like this (for example):

{% include code-caption.html content="server/datasources.json" %}
```javascript
...
"myEmailDataSource": {
  "name": "myEmailDataSource",
  "connector": "mail"
}
...
```

## Configuring an email data source

Configure the email data source by editing `/server/datasources.json` (for example):

{% include code-caption.html content="server/datasources.json" %}
```javascript
{
  ...
  "myEmailDataSource": {
    "connector": "mail",
    "transports": [{
      "type": "smtp",
      "host": "smtp.private.com",
      "secure": false,
      "port": 587,
      "tls": {
        "rejectUnauthorized": false
      },
      "auth": {
        "user": "me@private.com",
        "pass": "password"
      }
    }]
  }
  ...
}
```

{% include note.html title="More Configuration Options" content="
For full documentation of configuration options, **refer to the [nodemailer documention](https://github.com/nodemailer/nodemailer#setting-up)**.
" %}

### Using GMail

{% include tip.html content="
With GMail, you may need to enable the \"access for less secure apps\" option.
See:

- [Nodemailer: Using GMail](https://github.com/andris9/Nodemailer#using-gmail)
- [Nodemailer: Authentication](https://github.com/andris9/nodemailer-smtp-transport#authentication) for more information.
" %}

For GMail, configure your email data source as follows:

{% include code-caption.html content="server/datasources.json" %}
```javascript
...
"Email": {
  "name": "mail",
  "connector": "mail",
  "transports": [{
    "type": "SMTP",
    "host": "smtp.gmail.com",
    "secure": true,
    "port": 465,
    "auth": {
      "user": "name@gmail.com",
      "pass": "pass"
    }
  }]
}
...
```

## Connecting a model to the email data source

Then, connect models to the data source in `/server/model-config.json` as follows (for example):

{% include code-caption.html content="server/model-config.json" %}
```javascript
{
  ...
  "Email": {
    "dataSource": "myEmailDataSource"
  },
  ...
}
```

## Sending email messages

The following example illustrates how to send emails from an app. Add the following code to a file in the `/models` directory:

{% include code-caption.html content="server/models/model.js" %}
```javascript
module.exports = function(MyModel) {
  // send an email
  MyModel.sendEmail = function(cb) {
    MyModel.app.models.Email.send({
      to: 'foo@bar.com',
      from: 'you@gmail.com',
      subject: 'my subject',
      text: 'my text',
      html: 'my <em>html</em>'
    }, function(err, mail) {
      console.log('email sent!');
      cb(err);
    });
  }
};
```

The default model definition file is [common/models/email.json](https://github.com/strongloop/loopback/blob/master/common/models/email.json) in the LoopBack repository. 

## Confirming email address

See [Verifying email addresses](Registering-users.html#verifying-email-addresses).
