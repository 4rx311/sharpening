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
	'������������', 
	'119049, � ������, ���-��������� ���������������� �����, ����� �������, �� ������� ���������, � 1',
	'7727045021',
	'������������ ����������������� �������' 
),
(
	'����-�����',
	'109382, � ������, �� �������������, � 6, ���� 28',
	'7723747750',
	'�������� � ������������ ����������������'
),
(
	'��ר�� � ��������',
	'109559, � ������, ���-��������� ���������������� �����, ����� �������, �� ������� ����, � 35, ���� 5',
	'7727525243',
	 '�������������� ����������� ����������� ���� "��ר�� � ��������" ������ ������'
),
(
	'���������������',
	'109382, � ������, �� �������������, � 6',
	NULL,
	'�������������� ����������� "������-��������� ���������-���������� ����� "���������������"'
)
GO

SELECT * FROM Companies WHERE Name = '������������';
GO