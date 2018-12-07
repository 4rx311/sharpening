USE PeonDB
GO

SELECT * 
FROM Users
ORDER BY Name;
GO

-- 1) Написать скрипт для изменения бонуса сотрудника с ID=10, новый бонус – 10 000.
UPDATE PeonBonus
SET Bonus = 10000
WHERE UserID = 10;
SELECT * FROM PeonBonus
WHERE UserID = 10;
GO

-- 2) Написать скрипт для удаления бонуса сотрудника с ID=2
DELETE PeonBonus
WHERE ID = 2;
SELECT * FROM PeonBonus;
GO

-- 3) Вывести данные о сотрудниках, получивших бонус, в виде таблицы с колонками:
--	  ФИО сотрудника, Название подразделения, Бонус
--	  Сделать двумя способами через  оператор join и подзапрос.
-- способ А:
SELECT u.Name, d.Name, b.Bonus FROM Users u
INNER JOIN Departments d ON u.DepartmentID = d.ID
INNER JOIN PeonBonus b ON b.UserID = u.ID
WHERE b.Bonus IS NOT NULL;
GO

-- способ Б:
SELECT u.Name,
(SELECT d.Name FROM Departments d WHERE u.DepartmentID = d.ID) as Department,
(SELECT b.Bonus FROM PeonBonus b WHERE b.UserID = u.DepartmentID) as Bonus
FROM Users u


-- 4) Вывести названия подразделений, у которых сумма бонусов по сотрудникам больше 10 000.
SELECT d.Name, SUM(Bonus) FROM Departments d
JOIN Users u ON u.DepartmentID = d.ID
JOIN PeonBonus b ON u.ID = b.UserID
GROUP BY d.Name
HAVING SUM(Bonus) > 10000
GO

-- 5) Вывести ФИО сотрудников и уровень бонуса в сравнении со средним бонусом по компании
--  <!> задание 5 - средний бонус должно считаться автоматически, а не вручную вводится в скрипт
DECLARE @average int
SET @average = (SELECT AVG(Bonus) FROM PeonBonus);
SELECT Name, Bonus,
	CASE
		WHEN Bonus > 10000 THEN 'above average'
		WHEN Bonus = 10000 THEN 'average'
		WHEN Bonus < 10000 THEN 'below average'
		ELSE 'NULL'
	END stat
FROM Users u
JOIN PeonBonus b ON u.ID = b.UserID
ORDER BY b.Bonus;
GO

-- 6) Написать функцию, которая выведет сумму всех бонусов сотрудников по Id подразделения.
DROP FUNCTION DepartmentBonuses;
GO

CREATE FUNCTION DepartmentBonuses (@id int)
RETURNS int
WITH EXECUTE AS CALLER
AS
BEGIN
	DECLARE @sum int = (
	SELECT SUM(Bonus) FROM Departments d
	JOIN Users u ON u.DepartmentID = d.ID
	JOIN PeonBonus b ON u.ID = b.UserID
	WHERE d.ID = @id
	GROUP BY d.ID
	)
	
RETURN @sum;
END;
GO

PRINT dbo.DepartmentBonuses(3);
GO

-- 7) В таблицу с бонусами добавить колонку BonusUSD. Написать триггер, который будет заполнять данную колонку BonusUSD.
-- <!> задание 7 - должно быть только одно изменение строчки с бонусом, другие не трогаем
ALTER TABLE PeonBonus
ADD BonusUSD int NULL;
GO

DROP TRIGGER ToDollar;
GO

CREATE TRIGGER ToDollar 
	ON PeonBonus
	FOR INSERT, UPDATE
AS
	IF @@ROWCOUNT = 0
		RETURN
	--IF EXISTS
	--(
	--	SELECT * FROM Inserted as i
	--	WHERE Bonus IS NOT NULL
	--)
BEGIN
	UPDATE PeonBonus
	SET BonusUSD = Bonus/70
END

SELECT * FROM PeonBonus;
GO

-- 8) Написать хранимую процедуру, которая удалит из  таблицы  Bonus все бонусы, которые были в прошлом году.
-- <!> задание 8 - использовать функцию Year. год должен считаться автоматически от текущей даты
DROP PROC Clean;
GO

UPDATE PeonBonus
SET Date = '01/01/2017'
WHERE UserID = 3;
SELECT * FROM PeonBonus
WHERE UserID = 3;
GO

--CREATE PROC Clean
--AS
--	DELETE FROM PeonBonus
--	WHERE CONVERT(DATETIME, Date, 120) < '01/01/2018';
--GO

CREATE PROC Clean
AS
	DELETE FROM PeonBonus
	WHERE YEAR(Date) = YEAR(Date) - 1

EXEC Clean;
GO









-- EXPERIMENTAL


	SELECT d.Name, SUM(Total) as Total FROM Departments d
	JOIN Users u ON u.DepartmentID = d.ID
	JOIN 
	(	SELECT b.UserID as id, SUM(b.Bonus) as Total
			FROM PeonBonus b
			GROUP BY UserID	) as BonusSum 
	ON BonusSum.id = u.ID
	GROUP BY d.Name
GO;
