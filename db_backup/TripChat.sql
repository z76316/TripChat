-- MySQL dump 10.13  Distrib 8.0.12, for osx10.13 (x86_64)
--
-- Host: localhost    Database: TripChat
-- ------------------------------------------------------
-- Server version	8.0.12

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8mb4 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `accounts` (
  `account_id` int(11) NOT NULL AUTO_INCREMENT,
  `account_name` varchar(40) NOT NULL,
  `account_email` varchar(100) NOT NULL,
  `account_password` varchar(100) NOT NULL,
  `create_date` date DEFAULT NULL,
  `provider` varchar(40) NOT NULL,
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `account_email` (`account_email`,`provider`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,'Scott','z7631614@gmail.com','ec2server','2018-09-30','email'),(2,'Boss','boss@gmail.com','1qaz2wsx','2018-09-30','email'),(3,'AAA','aaa@gmail.com','1qaz2wsx','2018-09-30','email'),(4,'BBB','bbb@gmail.com','1qaz2wsx','2018-09-30','email'),(5,'YourDad','yourdad@gmail.com','1qaz2wsx','2018-09-30','email'),(6,'CCC','ccc@gmail.com','1qaz2wsx','2018-09-30','email'),(7,'session','session@gmail.com','1qaz2wsx','2018-10-03','email'),(8,'hey','hey@gmail.com','1qaz2wsx','2018-10-03','email'),(9,'GGG','aaa@gmail.com','1qaz2wsx','2018-10-04','FB'),(11,'DDD','ddd@gmail.com','1qaz2wsx','2018-10-10','email'),(12,'EEE','eee@gmail.com','1qaz2wsx','2018-10-10','email'),(13,'FFF','fff@gmail.com','1qaz2wsx','2018-10-10','email');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `markers`
--

DROP TABLE IF EXISTS `markers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `markers` (
  `marker_id` int(11) NOT NULL AUTO_INCREMENT,
  `trip_id` int(11) NOT NULL,
  `lat` double(20,15) DEFAULT NULL,
  `lng` double(20,15) DEFAULT NULL,
  `content` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`marker_id`),
  KEY `trip_id` (`trip_id`),
  CONSTRAINT `markers_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`trip_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `markers`
--

LOCK TABLES `markers` WRITE;
/*!40000 ALTER TABLE `markers` DISABLE KEYS */;
INSERT INTO `markers` VALUES (1,34,24.044112321162125,121.156282424926760,'瑞士花園( 94貴)'),(2,1,24.683209025495717,121.756668090820310,'落羽松'),(8,34,24.012969465470470,121.174399449690210,'對嘛！！'),(10,34,24.044326573108158,121.190192296369900,'寫下您的旅遊筆記~');
/*!40000 ALTER TABLE `markers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `trip_id` int(11) NOT NULL,
  `show_name` varchar(100) NOT NULL,
  `account_email` varchar(100) NOT NULL,
  `message` varchar(120) NOT NULL,
  PRIMARY KEY (`message_id`),
  KEY `trip_id` (`trip_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`trip_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,34,'Scott','z7631614@gmail.com','安安喔'),(2,34,'Scott','z7631614@gmail.com','測試中'),(3,34,'AAA','aaa@gmail.com','是齁'),(4,34,'AAA','aaa@gmail.com','怎麼搞這麼久啊'),(5,34,'Scott','z7631614@gmail.com','很嗆喔'),(6,34,'AAA','aaa@gmail.com','再混啊');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trip_to_account`
--

DROP TABLE IF EXISTS `trip_to_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `trip_to_account` (
  `trip_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  UNIQUE KEY `trip_id` (`trip_id`,`account_id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `trip_to_account_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`trip_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `trip_to_account_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trip_to_account`
--

LOCK TABLES `trip_to_account` WRITE;
/*!40000 ALTER TABLE `trip_to_account` DISABLE KEYS */;
INSERT INTO `trip_to_account` VALUES (1,1),(2,1),(34,1),(1,2),(1,3),(34,3),(2,4),(34,4),(2,5);
/*!40000 ALTER TABLE `trip_to_account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trips`
--

DROP TABLE IF EXISTS `trips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `trips` (
  `trip_id` int(11) NOT NULL AUTO_INCREMENT,
  `trip_title` varchar(20) NOT NULL,
  `trip_location` varchar(20) NOT NULL,
  `trip_date` bigint(20) NOT NULL DEFAULT '1539302400000',
  PRIMARY KEY (`trip_id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trips`
--

LOCK TABLES `trips` WRITE;
/*!40000 ALTER TABLE `trips` DISABLE KEYS */;
INSERT INTO `trips` VALUES (1,'清水斷崖獨木舟','宜蘭',1539302400000),(2,'草嶺古道驚魂記','宜蘭',1539302400000),(3,'司馬庫斯看星星','新竹',1539302400000),(34,'清境農場咩咩咩','清境農場',1539475200000);
/*!40000 ALTER TABLE `trips` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-10-14 21:59:14
