USE DBF_Content
GO

SELECT * FROM DBUsers
where [��� ������������] = N'��������� �����' OR [��� ������������] = N'������� ����';
GO

select [ID], [��������], [������������ ��������] from list_dms_contracts__WSSC_Stages_118
WHERE [��������] = N'������������';
GO

-- ������� �: ����� ������ �� Contracts � ������� ������ ��������� � ����� �����������
SELECT DISTINCT contr.ID, [���������], [�����], [����], [�����������], [��������������� �����] FROM [list_dms_contracts__Contracts_120] contr
INNER JOIN  [DBF_Content].[dbo].[list_dms_contracts__Contracts_120_AgreementPersons__LookupMulti] agr ON agr.LookupID = contr.[�����������]
INNER JOIN [DBUsers] us ON contr.[���������] = us.[ID]
--WHERE [�����] > 100 AND [����] = 6 
--AND [���������] = 6 
--AND [�����������] = 8
WHERE agr.[LookupID] = 8 AND us.[ID]=5
GO

-- ������� �: ����� ������ �� ������� AgreementPersons � ���������� � ������� �� Contracts
SELECT agr.[ItemID], contr.[��������������� �����], contr.[�����] FROM [DBF_Content].[dbo].[list_dms_contracts__Contracts_120_AgreementPersons__LookupMulti] agr
JOIN [list_dms_contracts__Contracts_120] contr ON agr.LookupID = contr.[�����������]
WHERE agr.[LookupID] = 8
GO









-- ######################## TEST ########################

-- 23, 59, 63, 69, 25, 42 - ItemsID
select * from [DBF_Content].[dbo].[list_dms_contracts__Contracts_120_AgreementPersons__LookupMulti]
where [LookupID] = 8

select * from [DBF_Content].[dbo].[list_dms_contracts__Contracts_120__LookupMulti]
select [������ �� ��� ����������] from [list_dms_contracts__Contracts_120] where [������ �� ��� ����������] IS NOT NULL;

select * from list_dms_contracts__Agreements_121


select * from [DBF_Content].[dbo].[list_dms_contracts__Contracts_120__LookupMulti]
where [ID] = 23


SELECT * FROM [DBF_Content].[dbo].[list_dms_contracts__Contracts_120_AgreementPersons__LookupMulti]
