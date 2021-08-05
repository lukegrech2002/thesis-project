-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.17-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             11.2.0.6213
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table web_conference_db.account
CREATE TABLE IF NOT EXISTS `account` (
  `account_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `first_name` text NOT NULL,
  `last_name` text NOT NULL,
  `email_address` varchar(50) NOT NULL,
  `school` varchar(50) NOT NULL,
  `password` varchar(60) NOT NULL,
  `profile_picture` varchar(50) NOT NULL,
  `teacher_account` tinytext NOT NULL,
  `status` text NOT NULL DEFAULT 'offline',
  PRIMARY KEY (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table web_conference_db.groups
CREATE TABLE IF NOT EXISTS `groups` (
  `group_id` int(11) NOT NULL AUTO_INCREMENT,
  `group_name` text NOT NULL,
  `group_password` varchar(50) NOT NULL,
  `administrator` varchar(50) NOT NULL,
  PRIMARY KEY (`group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table web_conference_db.group_chat
CREATE TABLE IF NOT EXISTS `group_chat` (
  `group_id` int(11) NOT NULL AUTO_INCREMENT,
  `group_name` text NOT NULL,
  `username` varchar(50) NOT NULL,
  `message` longtext NOT NULL,
  PRIMARY KEY (`group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table web_conference_db.lecture
CREATE TABLE IF NOT EXISTS `lecture` (
  `lecture_id` int(11) NOT NULL AUTO_INCREMENT,
  `school` text NOT NULL,
  `location` text NOT NULL,
  `class` varchar(50) NOT NULL,
  `subject` varchar(50) NOT NULL,
  `teacher_name` text NOT NULL,
  `teacher_email` varchar(50) NOT NULL,
  `start_time` varchar(50) NOT NULL,
  `end_time` varchar(50) NOT NULL,
  `date` varchar(50) NOT NULL,
  `room_uuid` varchar(50) NOT NULL,
  `room_password` varchar(50) NOT NULL,
  `additional_notes` longtext NOT NULL,
  PRIMARY KEY (`lecture_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table web_conference_db.room
CREATE TABLE IF NOT EXISTS `room` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `message` longtext NOT NULL,
  PRIMARY KEY (`message_id`),
  KEY `room_id` (`room_id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table web_conference_db.school
CREATE TABLE IF NOT EXISTS `school` (
  `school_id` int(11) NOT NULL AUTO_INCREMENT,
  `school_name` text NOT NULL,
  `school_enrollment_password` varchar(50) NOT NULL,
  PRIMARY KEY (`school_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table web_conference_db.sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table web_conference_db.symptom_form_response
CREATE TABLE IF NOT EXISTS `symptom_form_response` (
  `response_id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` text NOT NULL,
  `email_address` varchar(50) NOT NULL,
  `date` varchar(50) NOT NULL,
  `invited_to_classroom` tinytext NOT NULL,
  `headache` tinytext NOT NULL,
  `dry_cough` tinytext NOT NULL,
  `unusually_tired` tinytext NOT NULL,
  `sore_throat` tinytext NOT NULL,
  `fever` tinytext NOT NULL,
  `body_aches` tinytext NOT NULL,
  `loss_taste_smell` tinytext NOT NULL,
  `chest_pain_pressure` tinytext NOT NULL,
  `loss_speech_movement` tinytext NOT NULL,
  `diarrhea` tinytext NOT NULL,
  `skin_rashes` tinytext NOT NULL,
  `discolouration` tinytext NOT NULL,
  `difficulty_breathing` tinytext NOT NULL,
  `conjunctivitis` tinytext NOT NULL,
  `conjestion_runny_nose` tinytext NOT NULL,
  `nausea_vomiting` tinytext NOT NULL,
  `other_symptoms` tinytext NOT NULL,
  `contact_symptoms` tinytext NOT NULL,
  `contact_2weeks` tinytext NOT NULL,
  `travelled_2weeks` tinytext NOT NULL,
  PRIMARY KEY (`response_id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
