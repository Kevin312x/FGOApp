-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema FGOApp
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema FGOApp
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `FGOApp` DEFAULT CHARACTER SET utf8 ;
USE `FGOApp` ;

-- -----------------------------------------------------
-- Table `FGOApp`.`classes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`classes` (
  `class_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `class_name` VARCHAR(15) NOT NULL,
  `atk_modifier` FLOAT(5,2) NOT NULL,
  PRIMARY KEY (`class_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`card types`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`card types` (
  `card_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `card_type` VARCHAR(45) NOT NULL,
  `first_card_bonus` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`card_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`noble phantasms`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`noble phantasms` (
  `np_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `card_id` INT UNSIGNED NULL,
  PRIMARY KEY (`np_id`),
  INDEX `NP_CARD_TYPE_FK_idx` (`card_id` ASC) VISIBLE,
  CONSTRAINT `NP_CARD_TYPE_FK`
    FOREIGN KEY (`card_id`)
    REFERENCES `FGOApp`.`card types` (`card_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`alignments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`alignments` (
  `alignment_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `alignment` VARCHAR(15) NULL,
  PRIMARY KEY (`alignment_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`attributes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`attributes` (
  `attribute_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `attribute` VARCHAR(15) NULL,
  PRIMARY KEY (`attribute_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`costs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`costs` (
  `cost_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cost` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`cost_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`servants`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`servants` (
  `servant_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(60) NOT NULL,
  `rarity` INT UNSIGNED NOT NULL,
  `min_hp` INT UNSIGNED NOT NULL,
  `min_atk` INT UNSIGNED NOT NULL,
  `max_hp` INT UNSIGNED NOT NULL,
  `max_atk` INT UNSIGNED NOT NULL,
  `np_id` INT UNSIGNED NULL,
  `cost_id` INT UNSIGNED NULL,
  `illustrator` VARCHAR(45) NOT NULL,
  `gender` VARCHAR(15) NOT NULL,
  `death_rate` FLOAT(5,2) NOT NULL,
  `attribute_id` INT UNSIGNED NULL,
  `star_weight` INT UNSIGNED NOT NULL,
  `alignment_id` INT UNSIGNED NOT NULL,
  `class_id` INT UNSIGNED NOT NULL,
  `np_gain_atk` FLOAT(5,2) NOT NULL,
  `status` ENUM('permanent', 'story', 'limited', 'event') NOT NULL,
  `voice_actor` VARCHAR(25) NULL,
  `np_gain_def` FLOAT(5,2) NOT NULL,
  `star_gen` FLOAT(5,2) NOT NULL,
  PRIMARY KEY (`servant_id`, `death_rate`),
  INDEX `SERVANT_CLASS_FK_idx` (`class_id` ASC) VISIBLE,
  INDEX `SERVANT_NP_FK_idx` (`np_id` ASC) VISIBLE,
  INDEX `SERVANT_ALIGNMENT_FK_idx` (`alignment_id` ASC) VISIBLE,
  INDEX `SERVANT_ATTRIBUTE_FK_idx` (`attribute_id` ASC) VISIBLE,
  INDEX `SERVANT_COST_FK_idx` (`cost_id` ASC) VISIBLE,
  CONSTRAINT `SERVANT_CLASS_FK`
    FOREIGN KEY (`class_id`)
    REFERENCES `FGOApp`.`classes` (`class_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `SERVANT_NP_FK`
    FOREIGN KEY (`np_id`)
    REFERENCES `FGOApp`.`noble phantasms` (`np_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `SERVANT_ALIGNMENT_FK`
    FOREIGN KEY (`alignment_id`)
    REFERENCES `FGOApp`.`alignments` (`alignment_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `SERVANT_ATTRIBUTE_FK`
    FOREIGN KEY (`attribute_id`)
    REFERENCES `FGOApp`.`attributes` (`attribute_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `SERVANT_COST_FK`
    FOREIGN KEY (`cost_id`)
    REFERENCES `FGOApp`.`costs` (`cost_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`classes weak`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`classes weak` (
  `class_id` INT UNSIGNED NOT NULL,
  `weak_against` INT UNSIGNED NOT NULL,
  `modifer` CHAR(3) NOT NULL,
  PRIMARY KEY (`class_id`, `weak_against`),
  INDEX `CLASSES_WEAK_FK_idx` (`weak_against` ASC) VISIBLE,
  CONSTRAINT `CLASS_ID_FK`
    FOREIGN KEY (`class_id`)
    REFERENCES `FGOApp`.`classes` (`class_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `CLASSES_WEAK_FK`
    FOREIGN KEY (`weak_against`)
    REFERENCES `FGOApp`.`classes` (`class_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`decks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`decks` (
  `servant_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `card_id` INT UNSIGNED NULL,
  PRIMARY KEY (`servant_id`),
  INDEX `DECK_CARD_FK_idx` (`card_id` ASC) VISIBLE,
  CONSTRAINT `SERVANT_DECK_FK`
    FOREIGN KEY (`servant_id`)
    REFERENCES `FGOApp`.`servants` (`servant_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `DECK_CARD_FK`
    FOREIGN KEY (`card_id`)
    REFERENCES `FGOApp`.`card types` (`card_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`traits`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`traits` (
  `trait_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `trait` VARCHAR(15) NOT NULL,
  PRIMARY KEY (`trait_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`servant traits`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`servant traits` (
  `servant_id` INT UNSIGNED NOT NULL,
  `trait_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`servant_id`, `trait_id`),
  INDEX `SERVANT_TRAITSID_FK_idx` (`trait_id` ASC) VISIBLE,
  CONSTRAINT `SERVANTID_TRAITS_FK`
    FOREIGN KEY (`servant_id`)
    REFERENCES `FGOApp`.`servants` (`servant_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `SERVANT_TRAITSID_FK`
    FOREIGN KEY (`trait_id`)
    REFERENCES `FGOApp`.`traits` (`trait_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`classes effective`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`classes effective` (
  `class_id` INT UNSIGNED NOT NULL,
  `effective_against` INT UNSIGNED NOT NULL,
  `modifier` CHAR(3) NOT NULL,
  PRIMARY KEY (`class_id`, `effective_against`),
  INDEX `CLASS_EFFEC_FK_idx` (`effective_against` ASC) VISIBLE,
  CONSTRAINT `CLASSEFF_ID_FK`
    FOREIGN KEY (`class_id`)
    REFERENCES `FGOApp`.`classes` (`class_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `CLASS_EFFEC_FK`
    FOREIGN KEY (`effective_against`)
    REFERENCES `FGOApp`.`classes` (`class_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`overcharges`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`overcharges` (
  `np_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `overcharge` INT UNSIGNED NOT NULL,
  `effect` VARCHAR(80) NOT NULL,
  PRIMARY KEY (`np_id`),
  CONSTRAINT `NP_ID_OVERCHARGE_FK`
    FOREIGN KEY (`np_id`)
    REFERENCES `FGOApp`.`noble phantasms` (`np_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`images` (
  `image_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `path` VARCHAR(30) NOT NULL,
  PRIMARY KEY (`image_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`skill images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`skill images` (
  `skill_image_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `image_id` INT UNSIGNED NULL,
  PRIMARY KEY (`skill_image_id`),
  INDEX `IMAGE_SKILL_FK_idx` (`image_id` ASC) VISIBLE,
  CONSTRAINT `IMAGE_SKILL_FK`
    FOREIGN KEY (`image_id`)
    REFERENCES `FGOApp`.`images` (`image_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`servant skills`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`servant skills` (
  `servant_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `skill_name` VARCHAR(35) NOT NULL,
  `skill_rank` VARCHAR(5) NOT NULL,
  `effect` VARCHAR(75) NOT NULL,
  `skill_number` FLOAT(2,1) UNSIGNED NOT NULL,
  `skill_image_id` INT UNSIGNED NULL,
  PRIMARY KEY (`servant_id`, `skill_number`),
  INDEX `SERVANT_SKILL_IMAGE_FK_idx` (`skill_image_id` ASC) VISIBLE,
  CONSTRAINT `SERVANT_ID_SKILLS_FK`
    FOREIGN KEY (`servant_id`)
    REFERENCES `FGOApp`.`servants` (`servant_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `SERVANT_SKILL_IMAGE_FK`
    FOREIGN KEY (`skill_image_id`)
    REFERENCES `FGOApp`.`skill images` (`skill_image_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`mystic codes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`mystic codes` (
  `mystic_code_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `mystic_code` VARCHAR(45) NOT NULL,
  `mc_image_id` INT UNSIGNED NULL,
  PRIMARY KEY (`mystic_code_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`mystic code skills`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`mystic code skills` (
  `mystic_code_id` INT UNSIGNED NOT NULL,
  `skill_name` VARCHAR(35) NOT NULL,
  `effect` VARCHAR(70) NOT NULL,
  `skill_rank` VARCHAR(5) NOT NULL,
  `skill_number` FLOAT(2,1) UNSIGNED NOT NULL,
  `skill_image_id` INT UNSIGNED NULL,
  PRIMARY KEY (`mystic_code_id`, `skill_number`),
  CONSTRAINT `MYSTIC_CODE_ID_SKILLS_FK`
    FOREIGN KEY (`mystic_code_id`)
    REFERENCES `FGOApp`.`mystic codes` (`mystic_code_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`ascension images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`ascension images` (
  `servant_id` INT UNSIGNED NOT NULL,
  `image_id` INT UNSIGNED NULL,
  `ascension` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`servant_id`),
  INDEX `SERVANT_IMAGE_ID_FK_idx` (`image_id` ASC) VISIBLE,
  CONSTRAINT `SERVANT_ID_IMAGE_FK`
    FOREIGN KEY (`servant_id`)
    REFERENCES `FGOApp`.`servants` (`servant_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `SERVANT_IMAGE_ID_FK`
    FOREIGN KEY (`image_id`)
    REFERENCES `FGOApp`.`images` (`image_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`craft essences`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`craft essences` (
  `ce_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `min_hp` INT UNSIGNED NOT NULL,
  `min_atk` INT UNSIGNED NOT NULL,
  `max_hp` INT UNSIGNED NOT NULL,
  `max_atk` INT UNSIGNED NOT NULL,
  `rarity` TINYINT UNSIGNED NOT NULL,
  `effect` VARCHAR(100) NOT NULL,
  `illustrator` VARCHAR(25) NULL,
  `mlb_effect` VARCHAR(100) NOT NULL,
  `description` VARCHAR(200) NOT NULL,
  `effect_stat` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`ce_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`ce_costs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`ce_costs` (
  `ce_id` INT UNSIGNED NOT NULL,
  `cost_id` INT UNSIGNED NULL,
  PRIMARY KEY (`ce_id`),
  INDEX `CE_COSTS_ID_FK_idx` (`cost_id` ASC) VISIBLE,
  CONSTRAINT `CE_ID_COSTS_FK`
    FOREIGN KEY (`ce_id`)
    REFERENCES `FGOApp`.`craft essences` (`ce_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `CE_COSTS_ID_FK`
    FOREIGN KEY (`cost_id`)
    REFERENCES `FGOApp`.`costs` (`cost_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`bond craft essences`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`bond craft essences` (
  `ce_id` INT UNSIGNED NOT NULL,
  `servant_id` INT UNSIGNED NULL,
  PRIMARY KEY (`ce_id`),
  INDEX `BOND_CE_SERVANT_FK_idx` (`servant_id` ASC) VISIBLE,
  CONSTRAINT `BOND_CE_ID_FK`
    FOREIGN KEY (`ce_id`)
    REFERENCES `FGOApp`.`craft essences` (`ce_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `BOND_CE_SERVANT_FK`
    FOREIGN KEY (`servant_id`)
    REFERENCES `FGOApp`.`servants` (`servant_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`command codes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`command codes` (
  `code_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `effect` VARCHAR(100) NOT NULL,
  `rarity` TINYINT UNSIGNED NOT NULL,
  `illustrator` VARCHAR(45) NULL,
  `description` VARCHAR(100) NULL,
  `effect_stat` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`code_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`command code images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`command code images` (
  `image_id` INT UNSIGNED NOT NULL,
  `code_id` INT UNSIGNED NULL,
  PRIMARY KEY (`image_id`),
  UNIQUE INDEX `image_id_UNIQUE` (`image_id` ASC, `code_id` ASC) VISIBLE,
  INDEX `CCODE_IMAGE_ID_FK_idx` (`code_id` ASC) VISIBLE,
  CONSTRAINT `CCODE_ID_IMAGE_FK`
    FOREIGN KEY (`image_id`)
    REFERENCES `FGOApp`.`images` (`image_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `CCODE_IMAGE_ID_FK`
    FOREIGN KEY (`code_id`)
    REFERENCES `FGOApp`.`command codes` (`code_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`passive skills`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`passive skills` (
  `servant_id` INT UNSIGNED NOT NULL,
  `skill_name` VARCHAR(35) NOT NULL,
  `skill_rank` VARCHAR(5) NOT NULL,
  `effect` VARCHAR(75) NOT NULL,
  PRIMARY KEY (`servant_id`),
  CONSTRAINT `SERVANT_PASSIVE_FK`
    FOREIGN KEY (`servant_id`)
    REFERENCES `FGOApp`.`servants` (`servant_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`bond dialogues`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`bond dialogues` (
  `servant_id` INT UNSIGNED NOT NULL,
  `bond_level` TINYINT UNSIGNED NOT NULL,
  `dialogue` VARCHAR(300) NULL,
  PRIMARY KEY (`servant_id`),
  CONSTRAINT `SERVANT_DIALOGUES_FK`
    FOREIGN KEY (`servant_id`)
    REFERENCES `FGOApp`.`servants` (`servant_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`servant stats`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`servant stats` (
  `servant_id` INT UNSIGNED NOT NULL,
  `strength` VARCHAR(5) NOT NULL,
  `endurance` VARCHAR(5) NOT NULL,
  `agility` VARCHAR(5) NOT NULL,
  `mana` VARCHAR(5) NOT NULL,
  `luck` VARCHAR(5) NOT NULL,
  `np` VARCHAR(5) NOT NULL,
  PRIMARY KEY (`servant_id`),
  CONSTRAINT `SERVANT_STATS_FK`
    FOREIGN KEY (`servant_id`)
    REFERENCES `FGOApp`.`servants` (`servant_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`servant skill levels`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`servant skill levels` (
  `servant_id` INT UNSIGNED NOT NULL,
  `skill_level` TINYINT UNSIGNED NOT NULL,
  `modifier` VARCHAR(20) NOT NULL,
  `cooldown` TINYINT UNSIGNED NOT NULL,
  `skill_number` FLOAT(2,1) UNSIGNED NOT NULL,
  PRIMARY KEY (`servant_id`, `skill_number`, `skill_level`),
  CONSTRAINT `SERVANT_SKILL_LEVELS_FK`
    FOREIGN KEY (`servant_id` , `skill_number`)
    REFERENCES `FGOApp`.`servant skills` (`servant_id` , `skill_number`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`mystic code skill levels`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`mystic code skill levels` (
  `mystic_code_id` INT UNSIGNED NOT NULL,
  `skill_level` TINYINT UNSIGNED NOT NULL,
  `modifier` VARCHAR(20) NOT NULL,
  `cooldown` TINYINT UNSIGNED NOT NULL,
  `skill_number` FLOAT(2,1) UNSIGNED NOT NULL,
  `skill_image_id` INT UNSIGNED NULL,
  PRIMARY KEY (`mystic_code_id`, `skill_number`, `skill_level`),
  INDEX `MYSTIC_CODE_SKILL_IMAGE_FK_idx` (`skill_image_id` ASC) VISIBLE,
  CONSTRAINT `MYSTIC_CODE_SKILL_LEVEL_FK`
    FOREIGN KEY (`mystic_code_id` , `skill_number`)
    REFERENCES `FGOApp`.`mystic code skills` (`mystic_code_id` , `skill_number`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `MYSTIC_CODE_SKILL_IMAGE_FK`
    FOREIGN KEY (`skill_image_id`)
    REFERENCES `FGOApp`.`skill images` (`skill_image_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`mystic code images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`mystic code images` (
  `mystic_code_id` INT UNSIGNED NOT NULL,
  `mc_image_id` INT UNSIGNED NULL,
  PRIMARY KEY (`mystic_code_id`),
  INDEX `MYSTIC_CODE_IMAGE_FK_idx` (`mc_image_id` ASC) VISIBLE,
  CONSTRAINT `MYSTIC_CODE_IMAGE_FK`
    FOREIGN KEY (`mc_image_id`)
    REFERENCES `FGOApp`.`images` (`image_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `IMAGE_MYSTIC_CODE_FK`
    FOREIGN KEY (`mystic_code_id`)
    REFERENCES `FGOApp`.`mystic codes` (`mystic_code_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`noble phantasm levels`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`noble phantasm levels` (
  `np_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `np_modifier` TINYINT UNSIGNED NOT NULL,
  `effect` VARCHAR(75) NOT NULL,
  PRIMARY KEY (`np_id`),
  CONSTRAINT `NP_LEVELS_FK`
    FOREIGN KEY (`np_id`)
    REFERENCES `FGOApp`.`noble phantasms` (`np_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
