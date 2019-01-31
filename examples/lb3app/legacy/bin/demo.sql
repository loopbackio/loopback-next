-- Drop `CoffeeShop` table if it exists
DROP TABLE IF EXISTS `CoffeeShop`;

-- Create a new `CoffeeShop` table
CREATE TABLE `CoffeeShop` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(512) DEFAULT NULL,
  `city` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- Insert values into the new `CoffeeShop` table
INSERT INTO `CoffeeShop` VALUES (1,'Bel Cafe','Vancouver'),(2,'Three Bees Coffee House','San Mateo'),(3,'Caffe Artigiano','Vancouver');
