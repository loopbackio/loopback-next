--
-- Current Database: `TESTDB`
--

/*!40000 DROP DATABASE IF EXISTS `TESTDB`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `TESTDB` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `TESTDB`;

--
-- Table structure for table `NOTE`
--

DROP TABLE IF EXISTS `NOTE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `NOTE` (
  `ID` int(11) NOT NULL  AUTO_INCREMENT,
  `TITLE` varchar(64) DEFAULT NULL,
  `CONTENT` text DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;


