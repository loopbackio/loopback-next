---
lang: en
title: 'Deploying with pm2 and nginx'
keywords: LoopBack, pm2, nginx
sidebar: lb4_sidebar
permalink: /doc/en/lb4/deploying-with-pm2-and-nginx.html
---

This is a basic guide for deploying a LoopBack 4 (LB4) app using
[pm2](https://www.npmjs.com/package/pm2) behind nginx reverse proxy.

`pm2` is a Production Runtime and Process Manager for Node.js applications with
a built-in Load Balancer. It allows you to keep applications alive forever, to
reload them without downtime and facilitate common Devops tasks.

NGINX is open source software for web serving, reverse proxying, caching, load
balancing, media streaming, and more. It started out as a web server designed
for maximum performance and stability. In addition to its HTTP server
capabilities, NGINX can also function as a proxy server for email (IMAP, POP3,
and SMTP) and a reverse proxy and load balancer for HTTP, TCP, and UDP servers.

**NOTE**: Production deployment is a detailed topic and explained with clarity
in their respective documentations. Please refer [pm2 docs](https://pm2.io/doc/)
and
[nginx docs](https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/)
for detailed setup instructions. This guide assumes you have nginx setup
already.

## First steps

### Loopback app

Before we start with deployment, let's get our app ready. If you have Loopback
cli installed, run the following command to create a new app:

```sh
$ lb4 app
```

Refer to
[getting started](https://loopback.io/doc/en/lb4/Getting-started.html#create-a-new-project)
section of documentation for detailed instructions.

### pm2 setup

> You might find yourself in a situation in which you do not have access to the
> CLI to start your Node.js applications. In such a situation, `pm2` must be
> added as a dependency and must be called with the start script.

1. Generate an ecosystem.config.js template with:

   ```sh
   $ pm2 init
   ```

2. Modify the generated file to match Loopback requirements:

   {% include code-caption.html content="/ecosystem.config.js" %}

   ```javascript
   module.exports = {
     apps: [
       {
         name: 'MyAPI',
         script: 'index.js',
         instances: 1,
         autorestart: true,
         watch: false,
         max_memory_restart: '1G',
         env: {
           NODE_ENV: 'development',
         },
         env_production: {
           NODE_ENV: 'production',
         },
       },
     ],
   };
   ```

3. Add `pm2` as a dependency to your project using the following command

   ```sh
   $ npm install pm2 --save
   ```

4. Modify your `start` and add a `stop` script in `package.json` to look like
   this

   ```javascript
       {
         "scripts": {
           "start": "pm2 start ecosystem.config.js --env production"
           "stop": "pm2 stop ecosystem.config.js --env production"
         }
       }
   ```

## Deployment

1. Register and start your application with `pm2` using the following command at
   the app root directory:

   ```sh
   $ npm start
   ```

   This creates a dist folder which contains the transpiled code. Use `index.js`
   at your app's root level for starting the server using `pm2`.

   Now you can visit [http://127.0.0.1:3000/](http://127.0.0.1:3000/) to check
   your newly deployed API.

2. Configure nginx reverse proxy by adding following rule to your `nginx.conf`
   file. If you are not using the default config file, adjust accordingly.

   ```sh
   location /fooapi {
     proxy_pass http://localhost:3000;
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection 'upgrade';
     proxy_set_header Host $host;
     proxy_cache_bypass $http_upgrade;
   }
   ```

3. All set! Now you can hit your localhost at `http://localhost:3000/fooapi`
   (assuming nginx is listening to port 80) and your requests will be passed on
   to `pm2` process running your Loopback application.

**NOTE**: This is one of the many ways to expose your APIs. If you notice, there
are three main components to this recipe. A node application, a process manager
and a reverse proxy server. Since Loopback is the node application in our
context, this will be a constant thing. You can choose any process manager for
node and any server instead of `pm2` and `nginx`.
