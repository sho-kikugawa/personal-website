# Setting up the environment
----
## MongoDB
References: 
* https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
* https://www.digitalocean.com/community/tutorials/how-to-secure-mongodb-on-ubuntu-20-04
* https://stackoverflow.com/a/42929869
### Installing
Run the following commands
```
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

Commands to manage mongod
```
Manually start: sudo systemctl start mongod
 Start on boot: sudo systemctl enable mongod
       Restart: sudo systemctl restart mongod
    Get status: sudo systemctl status mongod
 Manually stop: sudo systemctl stop mongod
```

### Configuing MongoDB
1) Open the following:
    ```
    sudo nano /etc/mongod.conf
    ```

2)  Set the following then restart mongod
    ```
    security:
      authorization: enabled
    ```

2) Start MongoDB without access control.
    ```
    mongod --dbpath /data/db
    ```
3) Connect to the instance.
    ```
    mongo
    ```
4) Create the user administrator. The following creates a user administrator in the admin authentication database. The user is a dbOwner over the some_db database and NOT over the admin database, this is important to remember.
    ```
    use admin
    db.createUser({
      user: "myDbOwner",
      pwd: "abc123",
      roles: [ { role: "dbOwner", db: "some_db" } ]
    })
    ```
    Or if you want to create an admin which is admin over any database:

    ```
    use admin
    db.createUser({
      user: "myUserAdmin",
      pwd: "abc123",
      roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
    })
    ```
5) Stop the MongoDB instance and start it again with access control.

    ```
    mongod --auth --dbpath /data/db
    ```

6) Connect and authenticate as the user administrator towards the admin authentication database, NOT towards the some_db authentication database. The user administrator was created in the admin authentication database, the user does not exist in the some_db authentication database.
    ```
    use admin
    db.auth("myDbOwner", "abc123")
    ```
7) You are now authenticated as a dbOwner over the some_db database. So now if you wish to read/write/do stuff directly towards the some_db database you can change to it.
    ```
    use some_db
    //...do stuff like db.foo.insert({x:1})
    // remember that the user administrator had dbOwner rights so the user may write/read, if you create a user with userAdmin they will not be able to read/write for example.
    ```
More on roles: https://docs.mongodb.com/manual/reference/built-in-roles/

If you wish to make additional users which aren't user administrators and which are just normal users continue reading below.

1) Create a normal user. This user will be created in the some_db authentication database down below.
    ```
    use some_db
    db.createUser(
      {
        user: "myNormalUser",
        pwd: "xyz123",
        roles: [ { role: "readWrite", db: "some_db" },
                { role: "read", db: "some_other_db" } ]
      }
    )
    ```
2) Exit the mongo shell, re-connect, authenticate as the user.
    ```
    use some_db
    db.auth("myNormalUser", "xyz123")
    db.foo.insert({x:1})
    use some_other_db
    db.foo.find({})
    ```
----
## Redis
Reference: https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-20-04

### Installing
Run the following commands
```
sudo update
sudo apt install redis-server
```

### Configuring
Open the configuration file using:
```
sudo nano /etc/redis/redis.conf
```
Ensure the following lines are these values:

```
supervised systemd
bind 127.0.0.1 ::1
```

Make sure redis is only listening on localhost:
```
sudo netstat -lnp | grep redis
```

Create a password to access the database by finding this field, uncommenting it, and set another password. Make sure it's super long.
```
# requirepass foobared
```

Then rename commands if necessary, such as
```
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""
rename-command SHUTDOWN SHUTDOWN_MENOT
rename-command CONFIG ASC12_CONFIG
```

----
## Node.js
Reference: https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04

### Installing
Run the following commands
```
cd ~
curl -sL https://deb.nodesource.com/setup_16.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt install nodejs
node -v
```

### Additonal packages to install
These packages are not in the project's package.json file as they are not necessary to run the server, but are useful otherwise.

* jsdoc (in the development environment for creating/updating documentation)
* pm2 (in the production environment for server uptime reliability)