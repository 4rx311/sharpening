USE DBF_Content
GO

SELECT * FROM DBUsers
where [Имя пользователя] = N'Кижапкина Елена' OR [Имя пользователя] = N'Екрапов Олег';
GO

select [ID], [Название], [Отображаемое название] from list_dms_contracts__WSSC_Stages_118
WHERE [Название] = N'Согласование';
GO

-- Вариант А: Берет данные из Contracts и смотрит данные связанные с полем Согласующие
SELECT DISTINCT contr.ID, [Инициатор], [Сумма], [Этап], [Согласующие], [Регистрационный номер] FROM [list_dms_contracts__Contracts_120] contr
INNER JOIN  [DBF_Content].[dbo].[list_dms_contracts__Contracts_120_AgreementPersons__LookupMulti] agr ON agr.LookupID = contr.[Согласующие]
INNER JOIN [DBUsers] us ON contr.[Инициатор] = us.[ID]
--WHERE [Сумма] > 100 AND [Этап] = 6 
--AND [Инициатор] = 6 
--AND [Согласующие] = 8
WHERE agr.[LookupID] = 8 AND us.[ID]=5
GO

-- Вариант Б: Берет данные из таблицы AgreementPersons и сравнивает с данными из Contracts
SELECT agr.[ItemID], contr.[Регистрационный номер], contr.[Сумма] FROM [DBF_Content].[dbo].[list_dms_contracts__Contracts_120_AgreementPersons__LookupMulti] agr
JOIN [list_dms_contracts__Contracts_120] contr ON agr.LookupID = contr.[Согласующие]
WHERE agr.[LookupID] = 8
GO









-- ######################## TEST ########################

-- 23, 59, 63, 69, 25, 42 - ItemsID
select * from [DBF_Content].[dbo].[list_dms_contracts__Contracts_120_AgreementPersons__LookupMulti]
where [LookupID] = 8

select * from [DBF_Content].[dbo].[list_dms_contracts__Contracts_120__LookupMulti]
select [Ссылки на доп соглашения] from [list_dms_contracts__Contracts_120] where [Ссылки на доп соглашения] IS NOT NULL;

select * from list_dms_contracts__Agreements_121


select * from [DBF_Content].[dbo].[list_dms_contracts__Contracts_120__LookupMulti]
where [ID] = 23


SELECT * FROM [DBF_Content].[dbo].[list_dms_contracts__Contracts_120_AgreementPersons__LookupMulti]
