# Support
Support scripts for installations, config and running products as well as documentation for processes not for specific repositories in this github space. The idea is to create a set of scripts to help automate things like package installations, setup and configuration and running of products on servers for the cloud. Further to this script files for maintenance will follow.

Note: This is a work in progress.

##Prepairing Ubuntu server for github
Logon to the server via putty or your preferred ssh client and do the following:
```sh
sudo apt-get update
sudo apt-get install git
```

##ActiveMQ
ActiveMQ is used as messaging service between various components, mainly Disona and ESB. It exposes MQTT and JMS as message protocols.
###Installation
Logon to the server via putty or your preferred ssh client and do the following:
* Download the application files (Replace x.x.x with the version nunmber required. Latest is 5.11.1) See http://activemq.apache.org/download.html
```sh
mkdir ActiveMQ
cd ActiveMQ
wget http://apache.saix.net/activemq/x.x.x/apache-activemq-x.x.x-bin.tar.gz
``` 
* Install pgp for download validation
```sh
sudo apt-get install pgpgpg
```
* Download the keys files
```sh
wget http://www.apache.org/dist/activemq/KEYS
wget https://www.apache.org/dist/activemq/5.11.1/apache-activemq-5.11.1-bin.tar.gz.asc
```
* Verify the file
```sh
 pgp -ka KEYS
 pgp apache-activemq-x.x.x-bin.tar.gz.asc
```
* Extract the project
```sh
tar zxvf apache-activemq-x.x.x-bin.tar.gz
```

###Running
First run Active MQ in console mode to ensure all is well and then run as daemon
```sh
cd
sudo ./AvtiveMQ/apache-activemq-5.11.1/bin/activemq console
sudo ./AvtiveMQ/apache-activemq-5.11.1/bin/activemq start
...
sudo ./AvtiveMQ/apache-activemq-5.11.1/bin/activemq stop
```

The management console can be found at:
http://bam01.ushauri.co.za:8161/admin/
* username: admin
* password: admin

##MongoDB
Used as state and cache service for Disona

###Installation
Used as state and cache service for Disona

* Import public key
```sh
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
```
* Create list file
```sh
echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
```
* Update package database
```sh
sudo apt-get update
```
* Install
```sh
sudo apt-get install -y mongodb-org
```

### Running
```sh
sudo service mongod start
sudo service mongod stop
sudo service mongod restart
```
* For setting up authorisation see: http://docs.mongodb.org/manual/tutorial/add-user-administrator/
* Users
  * Database: admin -> userAdmin : passw0rd
  * Database: disona -> disonaOwner : passw0rd
* Using the terminal tool
```sh
mongo [db] -u [username] -p [password]
mongo disona -u disonaOwnder -p passw0rd
```
* Connectionstring
```
mongodb://disonaOwner:passw0rd@bam01.ushauri.co.za:27017/disona
```
