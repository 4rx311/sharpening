DROP DATABASE WSSC_Test
CREATE DATABASE WSSC_Test
ON
(
	NAME = 'WSSC_Test',
	FILENAME = 'C:\Program Files\Microsoft SQL Server\MSSQL12.MSSQLSERVER\MSSQL\DATA\WSSC_Test.mdf',
	SIZE = 10MB,
	MAXSIZE = 100MB,
	FILEGROWTH = 10MB
)
LOG ON
(
	NAME = 'Log_WSSC_Test',
	FILENAME = 'C:\Program Files\Microsoft SQL Server\MSSQL12.MSSQLSERVER\MSSQL\DATA\WSSC_Test.ldf',
	SIZE = 5MB,
	MAXSIZE = 50MB,
	FILEGROWTH = 5MB
)
COLLATE Cyrillic_General_CI_AS
GO

USE WSSC_Test
GO

DROP TABLE Companies
CREATE TABLE Companies
(
	ID int IDENTITY NOT NULL,
	Name nvarchar(100) NOT NULL,
	Address ntext NULL,
	INN varchar(12) NULL,
	Description nvarchar(500) NULL
)

TRUNCATE TABLE Companies;
INSERT INTO Companies
(Name, Address, INN, Description)
VALUES
(
	'акюцнбеыемхе', 
	'119049, ц лняйбю, чцн-бнярнвмши юдлхмхярпюрхбмши нйпсц, пюинм кчакхмн, ск люпьюкю аюцпюлъмю, д 1',
	'7727045021',
	'упхярхюмяйюъ акюцнрбнпхрекэмюъ жепйнбэ' 
),
(
	'юцпн-ярпни',
	'109382, ц лняйбю, ск люпхсонкэяйюъ, д 6, нтхя 28',
	'7723747750',
	'наыеярбн я нцпюмхвеммни нрберярбеммнярэч'
),
(
	'яшв╗бш х юдбнйюрш',
	'109559, ц лняйбю, чцн-бнярнвмши юдлхмхярпюрхбмши нйпсц, пюинм кчакхмн, ск бепумхе онкъ, д 35, йнпо 5',
	'7727525243',
	 'мейнллепвеяйюъ нпцюмхгюжхъ юдбнйюряйне ачпн "яшв╗бш х юдбнйюрш" цнпндю лняйбш'
),
(
	'фекегмнднпнфмхй',
	'109382, ц лняйбю, ск йпюямндюпяйюъ, д 6',
	NULL,
	'мейнллепвеяйне оюпрмепярбн "деряйн-чмньеяйхи яонпрхбмн-йскэрспмши жемрп "фекегмнднпнфмхй"'
)
GO

SELECT * FROM Companies WHERE Name = 'акюцнбеыемхе';
GO