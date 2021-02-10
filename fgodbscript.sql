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
  `atk_modifier` VARCHAR(5) NOT NULL,
  PRIMARY KEY (`class_id`),
  UNIQUE INDEX `class_name_UNIQUE` (`class_name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`alignments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`alignments` (
  `alignment_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `alignment` VARCHAR(75) NOT NULL,
  PRIMARY KEY (`alignment_id`),
  UNIQUE INDEX `alignment_UNIQUE` (`alignment` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`attributes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`attributes` (
  `attribute_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `attribute` VARCHAR(15) NOT NULL,
  PRIMARY KEY (`attribute_id`),
  UNIQUE INDEX `attribute_UNIQUE` (`attribute` ASC) VISIBLE)
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
  `min_hp` VARCHAR(10) NULL,
  `min_atk` VARCHAR(10) NULL,
  `max_hp` VARCHAR(10) NULL,
  `max_atk` VARCHAR(10) NULL,
  `cost_id` INT UNSIGNED NULL,
  `illustrator` VARCHAR(45) NOT NULL,
  `gender` VARCHAR(15) NOT NULL,
  `death_rate` VARCHAR(20) NOT NULL,
  `attribute_id` INT UNSIGNED NULL,
  `star_weight` VARCHAR(10) NOT NULL,
  `alignment_id` INT UNSIGNED NULL,
  `class_id` INT UNSIGNED NULL,
  `np_gain_atk` VARCHAR(15) NOT NULL,
  `status` ENUM('permanent', 'story', 'limited', 'event') NOT NULL,
  `voice_actor` VARCHAR(50) NULL,
  `np_gain_def` VARCHAR(15) NOT NULL,
  `star_gen` VARCHAR(15) NOT NULL,
  PRIMARY KEY (`servant_id`, `death_rate`),
  INDEX `SERVANT_CLASS_FK_idx` (`class_id` ASC) VISIBLE,
  INDEX `SERVANT_ALIGNMENT_FK_idx` (`alignment_id` ASC) VISIBLE,
  INDEX `SERVANT_ATTRIBUTE_FK_idx` (`attribute_id` ASC) VISIBLE,
  INDEX `SERVANT_COST_FK_idx` (`cost_id` ASC) VISIBLE,
  CONSTRAINT `SERVANT_CLASS_FK`
    FOREIGN KEY (`class_id`)
    REFERENCES `FGOApp`.`classes` (`class_id`)
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
  `modifier` VARCHAR(5) NOT NULL,
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
-- Table `FGOApp`.`card types`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`card types` (
  `card_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `card_type` VARCHAR(20) NOT NULL,
  `first_card_bonus` VARCHAR(120) NOT NULL,
  PRIMARY KEY (`card_id`),
  UNIQUE INDEX `card_type_UNIQUE` (`card_type` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`noble phantasms`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`noble phantasms` (
  `np_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `card_id` INT UNSIGNED NULL,
  `servant_id` INT UNSIGNED NOT NULL,
  `effect` VARCHAR(400) NOT NULL,
  `oc_effect` VARCHAR(250) NOT NULL,
  `classification` VARCHAR(45) NULL,
  `rank` VARCHAR(10) NULL,
  PRIMARY KEY (`np_id`),
  INDEX `NP_CARD_TYPE_FK_idx` (`card_id` ASC) VISIBLE,
  INDEX `SERVANT_NP_FK_idx` (`servant_id` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC, `servant_id` ASC, `rank` ASC) VISIBLE,
  CONSTRAINT `NP_CARD_TYPE_FK`
    FOREIGN KEY (`card_id`)
    REFERENCES `FGOApp`.`card types` (`card_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `SERVANT_NP_FK`
    FOREIGN KEY (`servant_id`)
    REFERENCES `FGOApp`.`servants` (`servant_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`decks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`decks` (
  `servant_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `card_id` INT UNSIGNED NULL,
  `card_number` INT UNSIGNED NOT NULL,
  INDEX `DECK_CARD_FK_idx` (`card_id` ASC) VISIBLE,
  UNIQUE INDEX `servant_id_UNIQUE` (`servant_id` ASC, `card_id` ASC, `card_number` ASC) INVISIBLE,
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
  `trait` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`trait_id`),
  UNIQUE INDEX `trait_UNIQUE` (`trait` ASC) VISIBLE)
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
  `modifier` VARCHAR(5) NOT NULL,
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
-- Table `FGOApp`.`images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`images` (
  `image_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `path` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`image_id`),
  UNIQUE INDEX `path_UNIQUE` (`path` ASC) VISIBLE)
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
  `servant_skill_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `servant_id` INT UNSIGNED NOT NULL,
  `skill_name` VARCHAR(135) NOT NULL,
  `skill_rank` VARCHAR(5) NOT NULL,
  `effect` VARCHAR(500) NOT NULL,
  `skill_number` FLOAT(2,1) UNSIGNED NOT NULL,
  `skill_image_id` INT UNSIGNED NULL,
  INDEX `SERVANT_SKILL_IMAGE_FK_idx` (`skill_image_id` ASC) VISIBLE,
  PRIMARY KEY (`servant_skill_id`),
  UNIQUE INDEX `servant_id_UNIQUE` (`servant_id` ASC, `skill_number` ASC) VISIBLE,
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
  `mystic_code` VARCHAR(70) NOT NULL,
  PRIMARY KEY (`mystic_code_id`),
  UNIQUE INDEX `mystic_code_UNIQUE` (`mystic_code` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`mystic code skills`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`mystic code skills` (
  `mystic_code_id` INT UNSIGNED NOT NULL,
  `mystic_code_skill_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `skill_name` VARCHAR(35) NOT NULL,
  `effect` VARCHAR(300) NOT NULL,
  `skill_number` FLOAT(2,1) UNSIGNED NOT NULL,
  `skill_image_id` INT UNSIGNED NULL,
  PRIMARY KEY (`mystic_code_id`, `skill_number`),
  INDEX `MYSTIC_CODE_SKILL_IMG_FK_idx` (`skill_image_id` ASC) VISIBLE,
  UNIQUE INDEX `mystic_code_skill_id_UNIQUE` (`mystic_code_skill_id` ASC) VISIBLE,
  CONSTRAINT `MYSTIC_CODE_ID_SKILLS_FK`
    FOREIGN KEY (`mystic_code_id`)
    REFERENCES `FGOApp`.`mystic codes` (`mystic_code_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `MYSTIC_CODE_SKILL_IMG_FK`
    FOREIGN KEY (`skill_image_id`)
    REFERENCES `FGOApp`.`skill images` (`skill_image_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`ascension images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`ascension images` (
  `servant_id` INT UNSIGNED NOT NULL,
  `image_id` INT UNSIGNED NULL,
  `ascension` VARCHAR(15) NOT NULL,
  PRIMARY KEY (`servant_id`, `ascension`),
  INDEX `SERVANT_IMAGE_ID_FK_idx` (`image_id` ASC) INVISIBLE,
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
  `name` VARCHAR(150) NOT NULL,
  `min_hp` VARCHAR(15) NOT NULL,
  `min_atk` VARCHAR(15) NOT NULL,
  `max_hp` VARCHAR(15) NOT NULL,
  `max_atk` VARCHAR(15) NOT NULL,
  `rarity` TINYINT UNSIGNED NOT NULL,
  `effect` VARCHAR(400) NOT NULL,
  `illustrator` VARCHAR(150) NULL,
  `mlb_effect` VARCHAR(400) NOT NULL,
  `description` VARCHAR(5000) NOT NULL,
  `cost_id` INT UNSIGNED NULL,
  PRIMARY KEY (`ce_id`),
  INDEX `CE_COST_ID_FK_idx` (`cost_id` ASC) VISIBLE,
  CONSTRAINT `CE_COST_ID_FK`
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
  `name` VARCHAR(100) NOT NULL,
  `effect` VARCHAR(300) NOT NULL,
  `rarity` TINYINT UNSIGNED NOT NULL,
  `illustrator` VARCHAR(45) NULL,
  `description` VARCHAR(1500) NULL,
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
-- Table `FGOApp`.`passives`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`passives` (
  `passive_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `passive` VARCHAR(75) NOT NULL,
  PRIMARY KEY (`passive_id`),
  UNIQUE INDEX `passive_UNIQUE` (`passive` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`passive skills`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`passive skills` (
  `servant_id` INT UNSIGNED NOT NULL,
  `passive_id` INT UNSIGNED NOT NULL,
  `rank` VARCHAR(7) NULL,
  INDEX `PASSIVE_SKILL_PASSIVE_FK_idx` (`passive_id` ASC) INVISIBLE,
  UNIQUE INDEX `servant_id_UNIQUE` (`servant_id` ASC, `passive_id` ASC, `rank` ASC) VISIBLE,
  CONSTRAINT `SERVANT_PASSIVE_FK`
    FOREIGN KEY (`servant_id`)
    REFERENCES `FGOApp`.`servants` (`servant_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `PASSIVE_SKILL_PASSIVE_FK`
    FOREIGN KEY (`passive_id`)
    REFERENCES `FGOApp`.`passives` (`passive_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`bond dialogues`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`bond dialogues` (
  `bond_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `servant_id` INT UNSIGNED NOT NULL,
  `bond_level` VARCHAR(25) NOT NULL,
  `dialogue` VARCHAR(2500) NULL,
  PRIMARY KEY (`bond_id`),
  UNIQUE INDEX `servant_id_UNIQUE` (`servant_id` ASC, `bond_level` ASC) VISIBLE,
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
  `servant_skill_levels_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `servant_skill_id` INT UNSIGNED NOT NULL,
  `skill_level` TINYINT UNSIGNED NOT NULL,
  `modifier` VARCHAR(20) NOT NULL,
  `cooldown` TINYINT UNSIGNED NOT NULL,
  `skill_up_effect` VARCHAR(75) NOT NULL,
  PRIMARY KEY (`servant_skill_levels_id`),
  INDEX `SSL_SERVANT_SKILL_ID_idx` (`servant_skill_id` ASC) VISIBLE,
  UNIQUE INDEX `servant_skill_id_UNIQUE` (`servant_skill_id` ASC, `skill_level` ASC, `skill_up_effect` ASC) VISIBLE,
  CONSTRAINT `SSL_SERVANT_SKILL_ID`
    FOREIGN KEY (`servant_skill_id`)
    REFERENCES `FGOApp`.`servant skills` (`servant_skill_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`mystic code skill levels`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`mystic code skill levels` (
  `mystic_code_id` INT UNSIGNED NOT NULL,
  `mystic_code_skill_id` INT UNSIGNED NOT NULL,
  `skill_level` TINYINT UNSIGNED NOT NULL,
  `modifier` VARCHAR(20) NULL,
  `cooldown` TINYINT UNSIGNED NOT NULL,
  `skill_number` FLOAT(2,1) UNSIGNED NOT NULL,
  `skill_up_effect` VARCHAR(75) NULL,
  INDEX `MYSTIC_CODE_SKILL_LEVELS_FK_idx` (`mystic_code_id` ASC, `skill_number` ASC) INVISIBLE,
  UNIQUE INDEX `mystic_code_id_UNIQUE` (`mystic_code_id` ASC, `skill_level` ASC, `skill_number` ASC, `skill_up_effect` ASC, `mystic_code_skill_id` ASC) VISIBLE,
  CONSTRAINT `MYSTIC_CODE_SKILL_LEVELS_FK`
    FOREIGN KEY (`mystic_code_id` , `skill_number`)
    REFERENCES `FGOApp`.`mystic code skills` (`mystic_code_id` , `skill_number`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `MYSTIC_CODE_SKILL_ID`
    FOREIGN KEY (`mystic_code_skill_id`)
    REFERENCES `FGOApp`.`mystic code skills` (`mystic_code_skill_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`mystic code images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`mystic code images` (
  `mystic_code_id` INT UNSIGNED NOT NULL,
  `mc_image_id` INT UNSIGNED NULL,
  `gender` CHAR(2) NOT NULL,
  PRIMARY KEY (`mystic_code_id`, `gender`),
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
  `np_id` INT UNSIGNED NOT NULL,
  `np_modifier` VARCHAR(7) NOT NULL,
  `np_effect_modifier` VARCHAR(25) NOT NULL,
  `level` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`np_id`, `level`, `np_effect_modifier`),
  CONSTRAINT `NP_LEVELS_FK`
    FOREIGN KEY (`np_id`)
    REFERENCES `FGOApp`.`noble phantasms` (`np_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`class images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`class images` (
  `image_id` INT UNSIGNED NOT NULL,
  `class_id` INT UNSIGNED NULL,
  UNIQUE INDEX `image_id_UNIQUE` (`image_id` ASC, `class_id` ASC),
  CONSTRAINT `CLASS_IMAGE_ID`
    FOREIGN KEY (`class_id`)
    REFERENCES `FGOApp`.`classes` (`class_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `IMAGE_CLASS_ID`
    FOREIGN KEY (`image_id`)
    REFERENCES `FGOApp`.`images` (`image_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`noble phantasm oc levels`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`noble phantasm oc levels` (
  `np_id` INT UNSIGNED NOT NULL,
  `oc_modifier` VARCHAR(7) NOT NULL,
  `oc_effect_modifier` VARCHAR(25) NOT NULL,
  `level` TINYINT NOT NULL,
  PRIMARY KEY (`np_id`, `level`, `oc_effect_modifier`),
  CONSTRAINT `NP_OC_LEVELS`
    FOREIGN KEY (`np_id`)
    REFERENCES `FGOApp`.`noble phantasms` (`np_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`craft essence images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`craft essence images` (
  `ce_id` INT UNSIGNED NOT NULL,
  `image_id` INT UNSIGNED NULL,
  PRIMARY KEY (`ce_id`),
  INDEX `IMAGE_ID_CE_FK_idx` (`image_id` ASC) VISIBLE,
  CONSTRAINT `CE_IMAGE_FK`
    FOREIGN KEY (`ce_id`)
    REFERENCES `FGOApp`.`craft essences` (`ce_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `IMAGE_ID_CE_FK`
    FOREIGN KEY (`image_id`)
    REFERENCES `FGOApp`.`images` (`image_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`passive effects`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`passive effects` (
  `passive` VARCHAR(75) NOT NULL,
  `rank` VARCHAR(7) NULL,
  `effect` VARCHAR(200) NOT NULL,
  UNIQUE INDEX `passive_UNIQUE` (`passive` ASC, `rank` ASC, `effect` ASC),
  CONSTRAINT `PASSIVE_EFFECT_FK`
    FOREIGN KEY (`passive`)
    REFERENCES `FGOApp`.`passives` (`passive`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`materials`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`materials` (
  `material_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `rarity` ENUM('bronze', 'silver', 'gold') NOT NULL,
  `image_id` INT UNSIGNED NULL,
  PRIMARY KEY (`material_id`),
  INDEX `MATERIALS_IMAGE_ID_idx` (`image_id` ASC) VISIBLE,
  CONSTRAINT `MATERIALS_IMAGE_ID`
    FOREIGN KEY (`image_id`)
    REFERENCES `FGOApp`.`images` (`image_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`servant ascension`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`servant ascension` (
  `ascension_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `servant_id` INT UNSIGNED NOT NULL,
  `ascension` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`ascension_id`),
  INDEX `SA_SERVANT_ID_idx` (`servant_id` ASC) VISIBLE,
  CONSTRAINT `SA_SERVANT_ID`
    FOREIGN KEY (`servant_id`)
    REFERENCES `FGOApp`.`servants` (`servant_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`servant ascension materials`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`servant ascension materials` (
  `ascension_id` INT UNSIGNED NOT NULL,
  `material_id` INT UNSIGNED NOT NULL,
  `amount` INT UNSIGNED NOT NULL,
  INDEX `SAM_ASCENSION_ID_idx` (`ascension_id` ASC) VISIBLE,
  INDEX `SAM_MATERIAL_ID_idx` (`material_id` ASC) VISIBLE,
  CONSTRAINT `SAM_ASCENSION_ID`
    FOREIGN KEY (`ascension_id`)
    REFERENCES `FGOApp`.`servant ascension` (`ascension_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `SAM_MATERIAL_ID`
    FOREIGN KEY (`material_id`)
    REFERENCES `FGOApp`.`materials` (`material_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `FGOApp`.`servant skill materials`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FGOApp`.`servant skill materials` (
  `servant_skill_levels_id` INT UNSIGNED NOT NULL,
  `material_id` INT UNSIGNED NOT NULL,
  `amount` INT UNSIGNED NOT NULL,
  INDEX `SSM_MATERIAL_ID_idx` (`material_id` ASC) VISIBLE,
  PRIMARY KEY (`servant_skill_levels_id`),
  CONSTRAINT `SSM_MATERIAL_ID`
    FOREIGN KEY (`material_id`)
    REFERENCES `FGOApp`.`materials` (`material_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `SSM_SERVANT_SKILL_LEVELS_ID`
    FOREIGN KEY (`servant_skill_levels_id`)
    REFERENCES `FGOApp`.`servant skill levels` (`servant_skill_levels_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
