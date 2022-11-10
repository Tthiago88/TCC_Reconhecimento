-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema sist_precenca
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema sist_precenca
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `sist_precenca` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin ;
USE `sist_precenca` ;

-- -----------------------------------------------------
-- Table `sist_precenca`.`Colaborador_tb`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sist_precenca`.`Colaborador_tb` (
  `idColaborador` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(45) NOT NULL,
  `senha` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idColaborador`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `sist_precenca`.`Aluno_tb`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sist_precenca`.`Aluno_tb` (
  `RA` VARCHAR(45) NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  `senha` VARCHAR(45) NOT NULL,
  `turma_aluno` VARCHAR(45) NOT NULL,
  `image_aluno` VARCHAR(100) NOT NULL,
  `Colaborador_tb_idColaborador` INT NOT NULL,
  PRIMARY KEY (`RA`, `Colaborador_tb_idColaborador`),
  INDEX `fk_Aluno_tb_Colaborador_tb1_idx` (`Colaborador_tb_idColaborador` ASC) VISIBLE,
  CONSTRAINT `fk_Aluno_tb_Colaborador_tb1`
    FOREIGN KEY (`Colaborador_tb_idColaborador`)
    REFERENCES `sist_precenca`.`Colaborador_tb` (`idColaborador`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `sist_precenca`.`disciplina`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sist_precenca`.`disciplina` (
  `idDisciplina` INT NOT NULL AUTO_INCREMENT,
  `nome_disciplina` VARCHAR(45) NULL,
  PRIMARY KEY (`idDisciplina`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `sist_precenca`.`Lista_chamada`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sist_precenca`.`Lista_chamada` (
  `idLista_chamada` INT NOT NULL AUTO_INCREMENT,
  `disciplina_idDisciplina` INT NOT NULL,
  `Aluno_tb_RA` VARCHAR(45) NOT NULL,
  `data` DATE NOT NULL,
  `hora` TIME NULL,
  `turma` VARCHAR(6) NOT NULL,
  `presenca` TINYINT NULL,
  PRIMARY KEY (`idLista_chamada`, `disciplina_idDisciplina`, `Aluno_tb_RA`),
  INDEX `fk_Lista_chamada_disciplina1_idx` (`disciplina_idDisciplina` ASC) VISIBLE,
  INDEX `fk_Lista_chamada_Aluno_tb1_idx` (`Aluno_tb_RA` ASC) VISIBLE,
  CONSTRAINT `fk_Lista_chamada_disciplina1`
    FOREIGN KEY (`disciplina_idDisciplina`)
    REFERENCES `sist_precenca`.`disciplina` (`idDisciplina`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Lista_chamada_Aluno_tb1`
    FOREIGN KEY (`Aluno_tb_RA`)
    REFERENCES `sist_precenca`.`Aluno_tb` (`RA`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `sist_precenca`.`Professores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sist_precenca`.`Professores` (
  `RA` VARCHAR(7) NOT NULL,
  `nome` VARCHAR(45) NOT NULL,
  `senha` VARCHAR(20) NOT NULL,
  `Colaborador_tb_idColaborador` INT NOT NULL,
  PRIMARY KEY (`RA`, `Colaborador_tb_idColaborador`),
  INDEX `fk_Professores_Colaborador_tb1_idx` (`Colaborador_tb_idColaborador` ASC) VISIBLE,
  CONSTRAINT `fk_Professores_Colaborador_tb1`
    FOREIGN KEY (`Colaborador_tb_idColaborador`)
    REFERENCES `sist_precenca`.`Colaborador_tb` (`idColaborador`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
