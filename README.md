# Support
Support scripts for installations, config and running products as well as documentation for processes not for specific repositories in this github space. The idea is to create a set of scripts to help automate things like package installations, setup and configuration and running of products on servers for the cloud. Further to this script files for maintenance will follow.

Note: This is a work in progress.

* <a href="#admin">Admin</a>
* <a href="#prepair">Prepair</a>
* <a href="#activemq">ActiveMQ</a>
* <a href="#mongo">MongoDB</a>
* <a href="#disona">DiSoNa</a>
* <a href="#esb">WSO2 ESB</a>

<a name="admin"></a>
##Admin links
| Product | URL | Username | Pwd |
| ---- | ---- | ---- | ---- |
| ActiveMQ | http://bam01.ushauri.co.za:8161/admin/ | admin | admin |
| WSO2 ESB | https://bam01.ushauri.co.za:9443/carbon | admin | admin |
| WSO2 BAM | https://bam01.ushauri.co.za:9444/carbon | admin | admin |
| MongoDB | | | |

<a name="prepair"></a>
##Prepairing Ubuntu server for github and nodejs
Logon to the server via putty or your preferred ssh client and do the following:
```sh
sudo apt-get update
sudo apt-get install git
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install nodejs
```

<a name="activemq"></a>
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

<a name="mongo"></a>
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

| Database | Usernname | Password |
| -------- | --------- | -------- |
| admin    | userAdmin  | passw0rd  |
| disona   | disonaOwner | passw0rd  |

* Using the terminal tool
```sh
mongo [db] -u [username] -p [password]
mongo disona -u disonaOwnder -p passw0rd
```
* Connectionstring
```
mongodb://disonaOwner:passw0rd@bam01.ushauri.co.za:27017/disona
```
<a name="disona"></a>
#DiSonA
See [https://github.com/ksstech/DiSoNa](Disona) for installation instructions

<a name="esb"></a>
## WSO2 ESB
### Installation
#### 1. Download from WSO2. Change the version numbers according spec. Latest `4.8.1`
```sh
wget --user-agent="testuser" --referer="http://connect.wso2.com/wso2/getform/reg/new_product_download" http://dist.wso2.org/products/enterprise-service-bus/4.8.1/wso2esb-4.8.1.zip
```
#### 2. If not already existing create directory `mkdir WSO2`
#### 3. Extract to that directory
```sh
unzip wso2esb-4.8.1.zip -d WSO2
```
#### 4. Configure for ActiveMQ
* See https://docs.wso2.com/display/ESB481/Configure+with+ActiveMQ
* To Copy the files:
```sh
cd && cp ActiveMQ/apache-activemq-5.11.1/lib/activemq-broker-5.11.1.jar WSO2/wso2esb-4.8.1/repository/components/lib && cp ActiveMQ/apache-activemq-5.11.1/lib/activemq-client-5.11.1.jar WSO2/wso2esb-4.8.1/repository/components/lib && cp ActiveMQ/apache-activemq-5.11.1/lib/geronimo-jms_1.1_spec-1.1.1.jar WSO2/wso2esb-4.8.1/repository/components/lib && cp ActiveMQ/apache-activemq-5.11.1/lib/geronimo-j2ee-management_1.1_spec-1.0.1.jar WSO2/wso2esb-4.8.1/repository/components/lib && cp ActiveMQ/apache-activemq-5.11.1/lib/hawtbuf-1.11.jar WSO2/wso2esb-4.8.1/repository/components/lib
```

* To configure the jms transports in file
```sh
cd && sudo vim WSO2/wso2esb-4.8.1/repository/conf/axis2/axis2.xml
```

* Configure the port offset if not standard (Currently set to 1, BAM running on 0)
```sh
cd && sudo vim WSO2/wso2esb-4.8.1/repository/conf/carbon.xml
```
###Running ESB
* In console for checking errors
```sh
cd && sh WSO2/wso2esb-4.8.1/bin/wso2server.sh
```
* As a service see https://docs.wso2.com/display/ESB481/Installing+as+a+Linux+Service
```sh
sh WSO2/wso2esb-4.8.1/bin/wso2server.sh start
sh WSO2/wso2esb-4.8.1/bin/wso2server.sh stop
sh WSO2/wso2esb-4.8.1/bin/wso2server.sh restart
```
* Management https://bam01.ushauri.co.za:9444/carbon
