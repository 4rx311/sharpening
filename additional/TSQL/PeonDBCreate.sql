CREATE DATABASE PeonDB
ON
(
	NAME = 'PeonDB',
	FILENAME = 'C:\PeonDB.mdf',
	SIZE = 10MB,
	MAXSIZE = 100MB,
	FILEGROWTH = 10MB
)
LOG ON
(
	NAME = 'LogPeonDB',
	FILENAME = 'C:\PeonDB.ldf',
	SIZE = 5MB,
	MAXSIZE = 50MB,
	FILEGROWTH = 5MB
)
COLLATE Cyrillic_General_CI_AS
EXECUTE sp_helpdb PeonDB;

USE PeonDB
GO

DROP TABLE Users
CREATE TABLE Users
(
	ID int IDENTITY NOT NULL,
	Name nvarchar(256) NOT NULL,
	DepartmentID int NOT NULL,
)

TRUNCATE TABLE Users;
INSERT INTO Users
(Name, DepartmentID)
VALUES
('Alex Sokolov', 3),
('Oleg Zadorozny', 4),
('Artyom Podolyanov', 2),
('Anastasia Shevchenko', 3),
('Oksana Merger', 3),
('Sergey Molotov', 1),
('Anna Chapman', 1),
('Alex Zlobin', 3),
('Pavel Morozov', 5),
('Egor Rasputnyi', 5);
GO

DROP TABLE Departments
CREATE TABLE Departments
(
	ID int IDENTITY NOT NULL,
	Name nvarchar(256) NOT NULL
)

TRUNCATE TABLE Departments;
INSERT INTO Departments
(Name)
VALUES
('Management'),
('Accountment'),
('Development'),
('Janitor'),
('Design');
GO

DROP TABLE PeonBonus
CREATE TABLE PeonBonus
(
	ID int IDENTITY NOT NULL,
	UserID int NOT NULL,
	Bonus int NULL,
	Date date NULL
)

TRUNCATE TABLE PeonBonus;
INSERT INTO PeonBonus
(UserID, Bonus, Date)
VALUES
(1, 10000, '01/03/2018'),
(2, 10000, '01/03/2018'),
(3, NULL, NULL),
(4, 15000, '07/10/2018'),
(5, NULL, NULL),
(6, 5000, '05/10/2018'),
(7, NULL, NULL),
(8, 9000, '03/01/2018'),
(9, 200, '01/01/2018'),
(10, 300, '03/01/2018');
GO


	