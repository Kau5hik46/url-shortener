# URL-SHORTENER

This repository contains code that serves HTTP requests that shortens provided URLS as encoded strings and redirects GET requests with shortened URLS to their respective URLs. There is a redis server that shall run along with it, which caches the results for 1 minute. 

## 
## Setup and Installation

Run the following commands to install the dependencies and start the server

### DB Server

Install PostgreSQL database

```brew install postgresql@15```

Create a database folder and initialize the database with the following commands:

```cd ~ && mkdir pgdatabase```

```initdb ~/pgdatabase```

Start the Postgres server

```    pg_ctl -D pgdatabase -l logfile start ```

Connect to the database server

``` psql postgres ```

To create the database for the specific project, run the following SQL statements on psql terminal:

``` CREATE DATABASE url_shortener; ```

