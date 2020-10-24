---
lang: en
title: 'Setting up MySQL in Docker'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Tutorial
sidebar: lb4_sidebar
permalink: /doc/en/lb4/todo-list-tutorial-docker-mysql.html
summary: LoopBack 4 TodoList Application Tutorial - Setting up MySQL in Docker
---

Here are the instructions for getting MySQL running in a docker container for
the purposes of running the TodoList example against a relational database.

### Install Docker

For downloading and installing docker, see
[Get Docker](https://docs.docker.com/get-docker/) for instructions on how to
install it on your respective operating system.

### Get MySQL docker image

For the purposes of this tutorial, we will use the MySQL 5.7.22 Docker image
since there are less setup steps.

To use MySQL 8.0, please see [Using MySQL 8.0](#using-mysql-8.0). It will
involve several extra steps, however.

```sh
docker pull mysql:5.7.22
```

### List MySQL docker image

To list the Docker image you just downloaded:

```sh
docker images
```

This will output:

```sh
REPOSITORY  TAG     IMAGE ID       CREATED       SIZE
mysql       5.7.22  6bb891430fb6   2 years ago   372MB
```

### Create a docker container based on the image, and set root password and port

We will give the docker container a name of `todo-mysql` and we will give the
`root` user a password of `my-secret-pw`. We will also assign port 3306 of your
machine to port 3306 of the container running MySQL.

```sh
docker run --name todo-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=my-secret-pw  -d mysql:5.7.22
```

outputs a UUID for the container:

```sh
191508fcbcfd3b683fea06bb3c8a2f1f252527a15891b58b124518cf2cb60249
```

If the operating system complains that your 3306 port is already being used on
your machine, you can remove the container, and try a different port number.

```sh
docker rm todo-mysql
docker run --name todo-mysql -p 3307:3306 -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:5.7.22
```

### View the status of your docker container on your machine

```sh
docker ps

OR

docker ps -a
```

The first lists running containers, and the second lists ALL containers (running
and stopped).

If it's up and running, the output should look like this:

```sh
CONTAINER ID        IMAGE                COMMAND                  CREATED             STATUS                   PORTS                               NAMES
a4a165534aeb        mysql:5.7.22        "docker-entrypoint.s…"   49 seconds ago      Up 48 seconds       0.0.0.0:3306->3306/tcp   todo-mysql
```

### View the container logs

To view the logs of the container:

```sh
docker logs todo-mysql
```

You should see output like this:

```sh
MySQL init process done. Ready for start up.

2020-11-08T20:03:22.405271Z 0 [Warning] TIMESTAMP with implicit DEFAULT value is deprecated. Please use --explicit_defaults_for_timestamp server option (see documentation for more details).
2020-11-08T20:03:22.406876Z 0 [Note] mysqld (mysqld 5.7.22) starting as process 1 ...
2020-11-08T20:03:22.410811Z 0 [Note] InnoDB: PUNCH HOLE support available
2020-11-08T20:03:22.410874Z 0 [Note] InnoDB: Mutexes and rw_locks use GCC atomic builtins
2020-11-08T20:03:22.410892Z 0 [Note] InnoDB: Uses event mutexes
2020-11-08T20:03:22.410908Z 0 [Note] InnoDB: GCC builtin __atomic_thread_fence() is used for memory barrier
2020-11-08T20:03:22.410920Z 0 [Note] InnoDB: Compressed tables use zlib 1.2.3
2020-11-08T20:03:22.410937Z 0 [Note] InnoDB: Using Linux native AIO
2020-11-08T20:03:22.411751Z 0 [Note] InnoDB: Number of pools: 1
2020-11-08T20:03:22.412150Z 0 [Note] InnoDB: Using CPU crc32 instructions
2020-11-08T20:03:22.413985Z 0 [Note] InnoDB: Initializing buffer pool, total size = 128M, instances = 1, chunk size = 128M
2020-11-08T20:03:22.424653Z 0 [Note] InnoDB: Completed initialization of buffer pool
2020-11-08T20:03:22.427403Z 0 [Note] InnoDB: If the mysqld execution user is authorized, page cleaner thread priority can be changed. See the man page of setpriority().
2020-11-08T20:03:22.440791Z 0 [Note] InnoDB: Highest supported file format is Barracuda.
2020-11-08T20:03:22.462753Z 0 [Note] InnoDB: Creating shared tablespace for temporary tables
2020-11-08T20:03:22.462850Z 0 [Note] InnoDB: Setting file './ibtmp1' size to 12 MB. Physically writing the file full; Please wait ...
2020-11-08T20:03:22.554593Z 0 [Note] InnoDB: File './ibtmp1' size is now 12 MB.
2020-11-08T20:03:22.556357Z 0 [Note] InnoDB: 96 redo rollback segment(s) found. 96 redo rollback segment(s) are active.
2020-11-08T20:03:22.556418Z 0 [Note] InnoDB: 32 non-redo rollback segment(s) are active.
2020-11-08T20:03:22.557084Z 0 [Note] InnoDB: Waiting for purge to start
2020-11-08T20:03:22.610359Z 0 [Note] InnoDB: 5.7.22 started; log sequence number 12359438
2020-11-08T20:03:22.611235Z 0 [Note] Plugin 'FEDERATED' is disabled.
2020-11-08T20:03:22.613201Z 0 [Note] InnoDB: Loading buffer pool(s) from /var/lib/mysql/ib_buffer_pool
2020-11-08T20:03:22.618156Z 0 [Note] InnoDB: Buffer pool(s) load completed at 201108 20:03:22
2020-11-08T20:03:22.618676Z 0 [Note] Found ca.pem, server-cert.pem and server-key.pem in data directory. Trying to enable SSL support using them.
2020-11-08T20:03:22.619054Z 0 [Warning] CA certificate ca.pem is self signed.
2020-11-08T20:03:22.621232Z 0 [Note] Server hostname (bind-address): '*'; port: 3306
2020-11-08T20:03:22.621327Z 0 [Note] IPv6 is available.
2020-11-08T20:03:22.621347Z 0 [Note]   - '::' resolves to '::';
2020-11-08T20:03:22.621379Z 0 [Note] Server socket created on IP: '::'.
2020-11-08T20:03:22.625628Z 0 [Warning] Insecure configuration for --pid-file: Location '/var/run/mysqld' in the path is accessible to all OS users. Consider choosing a different directory.
2020-11-08T20:03:22.627361Z 0 [Warning] 'user' entry 'root@localhost' ignored in --skip-name-resolve mode.
2020-11-08T20:03:22.627432Z 0 [Warning] 'user' entry 'mysql.session@localhost' ignored in --skip-name-resolve mode.
2020-11-08T20:03:22.627452Z 0 [Warning] 'user' entry 'mysql.sys@localhost' ignored in --skip-name-resolve mode.
2020-11-08T20:03:22.627481Z 0 [Warning] 'db' entry 'performance_schema mysql.session@localhost' ignored in --skip-name-resolve mode.
2020-11-08T20:03:22.627499Z 0 [Warning] 'db' entry 'sys mysql.sys@localhost' ignored in --skip-name-resolve mode.
2020-11-08T20:03:22.627523Z 0 [Warning] 'proxies_priv' entry '@ root@localhost' ignored in --skip-name-resolve mode.
2020-11-08T20:03:22.631228Z 0 [Warning] 'tables_priv' entry 'user mysql.session@localhost' ignored in --skip-name-resolve mode.
2020-11-08T20:03:22.631288Z 0 [Warning] 'tables_priv' entry 'sys_config mysql.sys@localhost' ignored in --skip-name-resolve mode.
2020-11-08T20:03:22.640099Z 0 [Note] Event Scheduler: Loaded 0 events
2020-11-08T20:03:22.640550Z 0 [Note] mysqld: ready for connections.
Version: '5.7.22'  socket: '/var/run/mysqld/mysqld.sock'  port: 3306  MySQL Community Server (GPL)
```

### IP Address and Port of the MySQL Docker container

For Mac and Linux users, the IP address of the docker container running on your
machine will be the IP address of your machine : `127.0.0.1` .

For Windows users, it isn't, and you can find the proper IP address by issuing
the command

```sh
docker-machine ip default
```

You need to know the proper IP address and port values of your MySQL database
when you set the `host` and `port` values in your `db.datasource.ts` file.
[Specifying the datasource properties](./todo-list-tutorial-sqldb.md#specifying-the-datasource-properties).

### Using MySQL 8.0

MySQL 8.0 uses a new authentication method named
[SHA-2 Pluggable Authentication](https://dev.mysql.com/doc/refman/8.0/en/caching-sha2-pluggable-authentication.html).

Because the `mysql` Node.js driver
[does not yet support](https://github.com/mysqljs/mysql/issues/2002) this form
of authentication, Node.js applications are forced to use the previous
authentication method named
[Native Pluggable Authentication](https://dev.mysql.com/doc/refman/8.0/en/native-pluggable-authentication.html).

If you wish to use MySQL 8.0 (or its Docker image mysql/mysql-server:latest) for
the purposes of this TodoList example application, we need to have MySQL 8.0
switch to the `native` authentication method.

In order to accomplish this, we need to delete the root user's definition, and
create the root user again but with a different definition.

{% include note.html content="These are some steps I found in various online forums to quickly get things up and running. Please consult with your database administrator to set this up appropriately for production environments.
" %}

If you already have MySQL 8.0 installed on your machine, you do not need to
perform the docker-related commands, but you will have to perform the
SQL-related commands.

#### Get the latest MySQL docker image

To get the latest Docker image:

```sh
docker pull mysql:latest
```

#### Create a docker container based on the latest image, and set root password and port

We will give the docker container a name of `todo-mysql` and we will give the
`root` user a password of `my-secret-pw`. We will also assign port 3306 of your
machine to port 3306 of the container running MySQL.

```sh
docker run --name todo-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=my-secret-pw  -d mysql:latest
```

#### Switching to Native Authentication

Open up a MySQL interactive prompt into the container

```sh
docker exec -it todo-mysql mysql -uroot -p
```

This opens the `mysql` interactive prompt. You will be prompted for the
password. Enter `my-secret-pw`.

Perform the following commands:

```sh
show databases;
use mysql;
SELECT user,host FROM user;
```

You should see the user `'root'@'localhost'` listed in the results

Continue with the following commands:

```sh
drop user 'root'@'localhost';
CREATE USER 'root'@'%' IDENTIFIED BY 'my-secret-pw';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

Type `exit` to get out of the interactive shell

Now stop and start the container.

```sh
docker stop todo-mysql
docker start todo-mysql
```

We need to go in again and change one more thing (we are not able to do it in
the same mysql session.)

Open the mysql prompt again:

```sh
docker exec -it todo-mysql mysql -uroot -p
```

You will be prompted for the password. Enter `my-secret-pw`.

Perform the following commands:

```sh
use mysql;
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'my-secret-pw';
FLUSH PRIVILEGES;
```

Type `exit` to get out of the interactive shell

Now stop and start the container.

```sh
docker stop todo-mysql
docker start todo-mysql
```

Check the logs of the container to see if everything is ok.

```sh
docker logs todo-mysql
```

You should see output like this:

```sh
[Entrypoint] MySQL Docker Image 8.0.21-1.1.17
[Entrypoint] Initializing database
2020-10-10T20:08:22.809376Z 0 [System] [MY-013169] [Server] /usr/sbin/mysqld (mysqld 8.0.21) initializing of server in progress as process 20
2020-10-10T20:08:22.823401Z 1 [System] [MY-013576] [InnoDB] InnoDB initialization has started.
2020-10-10T20:08:39.810201Z 1 [System] [MY-013577] [InnoDB] InnoDB initialization has ended.
2020-10-10T20:09:12.821296Z 6 [Warning] [MY-010453] [Server] root@localhost is created with an empty password ! Please consider switching off the --initialize-insecure option.
[Entrypoint] Database initialized
2020-10-10T20:10:23.747797Z 0 [System] [MY-010116] [Server] /usr/sbin/mysqld (mysqld 8.0.21) starting as process 81
2020-10-10T20:10:24.523215Z 1 [System] [MY-013576] [InnoDB] InnoDB initialization has started.
2020-10-10T20:10:26.282045Z 1 [System] [MY-013577] [InnoDB] InnoDB initialization has ended.
2020-10-10T20:10:27.294389Z 0 [System] [MY-011323] [Server] X Plugin ready for connections. Socket: /var/run/mysqld/mysqlx.sock
2020-10-10T20:10:28.316478Z 0 [Warning] [MY-010068] [Server] CA certificate ca.pem is self signed.
2020-10-10T20:10:28.317986Z 0 [System] [MY-013602] [Server] Channel mysql_main configured to support TLS. Encrypted connections are now supported for this channel.
2020-10-10T20:10:28.436967Z 0 [System] [MY-010931] [Server] /usr/sbin/mysqld: ready for connections. Version: '8.0.21'  socket: '/var/lib/mysql/mysql.sock'  port: 0  MySQL Community Server - GPL.
Warning: Unable to load '/usr/share/zoneinfo/iso3166.tab' as time zone. Skipping it.
Warning: Unable to load '/usr/share/zoneinfo/leapseconds' as time zone. Skipping it.
Warning: Unable to load '/usr/share/zoneinfo/tzdata.zi' as time zone. Skipping it.
Warning: Unable to load '/usr/share/zoneinfo/zone.tab' as time zone. Skipping it.
Warning: Unable to load '/usr/share/zoneinfo/zone1970.tab' as time zone. Skipping it.

[Entrypoint] ignoring /docker-entrypoint-initdb.d/*

2020-10-10T20:10:35.615148Z 10 [System] [MY-013172] [Server] Received SHUTDOWN from user root. Shutting down mysqld (Version: 8.0.21).
2020-10-10T20:11:10.605086Z 0 [System] [MY-010910] [Server] /usr/sbin/mysqld: Shutdown complete (mysqld 8.0.21)  MySQL Community Server - GPL.
[Entrypoint] Server shut down

[Entrypoint] MySQL init process done. Ready for start up.

[Entrypoint] Starting MySQL 8.0.21-1.1.17
2020-10-10T20:11:11.060362Z 0 [System] [MY-010116] [Server] /usr/sbin/mysqld (mysqld 8.0.21) starting as process 151
2020-10-10T20:11:11.515963Z 1 [System] [MY-013576] [InnoDB] InnoDB initialization has started.
2020-10-10T20:11:14.533342Z 1 [System] [MY-013577] [InnoDB] InnoDB initialization has ended.
2020-10-10T20:11:14.833765Z 0 [System] [MY-011323] [Server] X Plugin ready for connections. Bind-address: '::' port: 33060, socket: /var/run/mysqld/mysqlx.sock
2020-10-10T20:11:15.385223Z 0 [Warning] [MY-010068] [Server] CA certificate ca.pem is self signed.
2020-10-10T20:11:15.385694Z 0 [System] [MY-013602] [Server] Channel mysql_main configured to support TLS. Encrypted connections are now supported for this channel.
2020-10-10T20:11:15.482368Z 0 [System] [MY-010931] [Server] /usr/sbin/mysqld: ready for connections. Version: '8.0.21'  socket: '/var/lib/mysql/mysql.sock'  port: 3306  MySQL Community Server
- GPL.
[Entrypoint] MySQL Docker Image 8.0.21-1.1.17
[Entrypoint] Starting MySQL 8.0.21-1.1.17
2020-10-10T20:47:36.825667Z 0 [System] [MY-010116] [Server] /usr/sbin/mysqld (mysqld 8.0.21) starting as process 22
2020-10-10T20:47:36.871574Z 1 [System] [MY-013576] [InnoDB] InnoDB initialization has started.
2020-10-10T20:47:38.685523Z 1 [System] [MY-013577] [InnoDB] InnoDB initialization has ended.
2020-10-10T20:47:38.954109Z 0 [System] [MY-011323] [Server] X Plugin ready for connections. Bind-address: '::' port: 33060, socket: /var/run/mysqld/mysqlx.sock
2020-10-10T20:47:39.109335Z 0 [System] [MY-010229] [Server] Starting XA crash recovery...
2020-10-10T20:47:39.121060Z 0 [System] [MY-010232] [Server] XA crash recovery finished.
2020-10-10T20:47:40.488010Z 0 [Warning] [MY-010068] [Server] CA certificate ca.pem is self signed.
2020-10-10T20:47:40.488446Z 0 [System] [MY-013602] [Server] Channel mysql_main configured to support TLS. Encrypted connections are now supported for this channel.
2020-10-10T20:47:40.663988Z 0 [System] [MY-010931] [Server] /usr/sbin/mysqld: ready for connections. Version: '8.0.21'  socket: '/var/lib/mysql/mysql.sock'  port: 3306  MySQL Community Server
- GPL.
```
