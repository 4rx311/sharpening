using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using WSSC.V4.DMS.OMK.Reports.RepairsAgreementReport.Data;
using WSSC.V4.SYS.DBFramework;

using Consts = WSSC.V4.DMS.OMK._Consts.Reports.RepairsAgreementReport;

namespace WSSC.V4.DMS.OMK.Reports.RepairsAgreementReport.Settings
{
	/// <summary>
	/// Класс настроек построения отчёта.
	/// </summary>
	internal class ReportSettings
	{
		// DB-сайт.
		private DBSite Site { get; set; }

		/// <summary>
		/// Конструктор.
		/// </summary>
		/// <param name="site">DB-сайт.</param>
		internal ReportSettings(DBSite site)
		{
			if (site == null) throw new ArgumentNullException("site");
			this.Site = site;
		}

		private bool __init_SystemConstant;
		private XElement _SystemConstant;
		/// <summary>
		/// Системная константа.
		/// </summary>
		private XElement SystemConstant
		{
			get
			{
				if (!__init_SystemConstant)
				{
					XDocument constant = this.Site.ConfigParams.GetXDocument(Consts.ConstantName);
					_SystemConstant = constant.Root;
					if (_SystemConstant == null)
						throw new Exception(string.Format("Не найдена системная константа [{0}] для сайта {1}", Consts.ConstantName, this.Site));
					__init_SystemConstant = true;
				}
				return _SystemConstant;
			}
		}

		private bool __init_DepartmentsNode;
		private XElement _DepartmentsNode;
		/// <summary>
		/// XML-узел "Departments".
		/// </summary>
		private XElement DepartmentsNode
		{
			get
			{
				if (!__init_DepartmentsNode)
				{
					_DepartmentsNode = this.GetXElement(this.SystemConstant, "Departments");
					__init_DepartmentsNode = true;
				}
				return _DepartmentsNode;
			}
		}

		private bool __init_SolutionsNode;
		private XElement _SolutionsNode;
		/// <summary>
		/// XML-узел "Solutions".
		/// </summary>
		private XElement SolutionsNode
		{
			get
			{
				if (!__init_SolutionsNode)
				{
					_SolutionsNode = this.GetXElement(this.SystemConstant, "Solutions");
					__init_SolutionsNode = true;
				}
				return _SolutionsNode;
			}
		}

		private bool __init_AgreementSolutionsNode;
		private XElement _AgreementSolutionsNode;
		/// <summary>
		/// XML-узел "AgreementSolutions".
		/// </summary>
		private XElement AgreementSolutionsNode
		{
			get
			{
				if (!__init_AgreementSolutionsNode)
				{
					_AgreementSolutionsNode = this.GetXElement(this.SolutionsNode, "AgreementSolutions");
					__init_AgreementSolutionsNode = true;
				}
				return _AgreementSolutionsNode;
			}
		}

		private bool __init_WorkflowSolutionsNode;
		private XElement _WorkflowSolutionsNode;
		/// <summary>
		/// XML-узел "WorkflowSolutions".
		/// </summary>
		private XElement WorkflowSolutionsNode
		{
			get
			{
				if (!__init_WorkflowSolutionsNode)
				{
					_WorkflowSolutionsNode = this.GetXElement(this.SolutionsNode, "WorkflowSolutions");
					__init_WorkflowSolutionsNode = true;
				}
				return _WorkflowSolutionsNode;
			}
		}

		private bool __init_DpRId;
		private int _DpRId;
		/// <summary>__init_DpRId
		/// ID подразделения "Дирекция по ремонтам".
		/// </summary>
		internal int DpRId
		{
			get
			{
				if (!__init_DpRId)
				{
					_DpRId = this.GetDepartmentId(Consts.RepairsDirectorate);
					__init_DpRId = true;
				}
				return _DpRId;
			}
		}

		private bool __init_DeId;
		private int _DeId;
		/// <summary>
		/// ID подразделения "Дирекция по экономике".
		/// </summary>
		internal int DeId
		{
			get
			{
				if (!__init_DeId)
				{
					_DeId = this.GetDepartmentId(Consts.EconomicsDirectorate);
					__init_DeId = true;
				}
				return _DeId;
			}
		}

		private bool __init_DmtoId;
		private int _DmtoId;
		/// <summary>
		/// ID подразделения "ДМТО".
		/// </summary>
		internal int DmtoId
		{
			get
			{
				if (!__init_DmtoId)
				{
					_DmtoId = this.GetDepartmentId(Consts.DMTO);
					__init_DmtoId = true;
				}
				return _DmtoId;
			}
		}

		private bool __init_SolutionNames;
		private List<string> _SolutionNames;
		/// <summary>
		/// Коллекция системных названий решений, которые учитываются при построении отчёта.
		/// </summary>
		internal List<string> SolutionNames
		{
			get
			{
				if (!__init_SolutionNames)
				{
					_SolutionNames = new List<string>();
					IEnumerable<XElement> solutionNameNodes = this.AgreementSolutionsNode.Elements();
					foreach (XElement solutionNameNode in solutionNameNodes)
					{
						string solutionName = this.GetStringXmlAttrValue(solutionNameNode, "Name");
						_SolutionNames.Add(solutionName);
					}
					__init_SolutionNames = true;
				}
				return _SolutionNames;
			}
		}

		private bool __init_SendToAgreementSolutionData;
		private WorkflowSolutionData _SendToAgreementSolutionData;
		/// <summary>
		/// Информация по решению, которое отправляет документ на согласование.
		/// </summary>
		internal WorkflowSolutionData SendToAgreementSolutionData
		{
			get
			{
				if (!__init_SendToAgreementSolutionData)
				{
					XElement sendToAgreementSolutionElement = this.GetXElement(this.WorkflowSolutionsNode, "SendToAgreementSolution");
					string role = this.GetStringXmlAttrValue(sendToAgreementSolutionElement, "Role");
					string solutionName = this.GetStringXmlAttrValue(sendToAgreementSolutionElement, "Name");
					_SendToAgreementSolutionData = new WorkflowSolutionData(role, solutionName);
					__init_SendToAgreementSolutionData = true;
				}
				return _SendToAgreementSolutionData;
			}
		}

		private bool __init_SigningSolutionData;
		private WorkflowSolutionData _SigningSolutionData;
		/// <summary>
		/// Информация по решению, которое регистрирует документ.
		/// </summary>
		internal WorkflowSolutionData SigningSolutionData
		{
			get
			{
				if (!__init_SigningSolutionData)
				{
					XElement signingSolutionElement = this.GetXElement(this.WorkflowSolutionsNode, "SigningSolution");
					string role = this.GetStringXmlAttrValue(signingSolutionElement, "Role");
					string solutionName = this.GetStringXmlAttrValue(signingSolutionElement, "Name");
					_SigningSolutionData = new WorkflowSolutionData(role, solutionName);
					__init_SigningSolutionData = true;
				}
				return _SigningSolutionData;
			}
		}

		/// <summary>
		/// Получает название Xml-узла.
		/// </summary>
		/// <param name="parent">Родительский xml-узел.</param>
		/// <param name="elementName">Имя xml-узла для поиска.</param>
		/// <returns></returns>
		private XElement GetXElement(XContainer parent, string elementName)
		{
			if (string.IsNullOrEmpty(elementName)) throw new ArgumentException("elementName is null or empty.", "elementName");

			XElement xElement = parent.Element(elementName);
			if (xElement == null)
				throw new Exception(string.Format("В системной константе [{0}] не найден обязательный узел [{1}]", this.SystemConstant.Name, elementName));
			return xElement;
		}

		/// <summary>
		/// Получает текстовое значение атрибута.
		/// </summary>
		/// <param name="element">Родительский элемент.</param>
		/// <param name="attrName">Имя атрибута.</param>
		/// <returns>Текстовое значение атрибута.</returns>
		private string GetStringXmlAttrValue(XElement element, string attrName)
		{
			if (element == null) throw new ArgumentNullException("element", "element is null.");
			if (string.IsNullOrEmpty(attrName)) throw new ArgumentException("attrName is null or empty.", "attrName");

			XAttribute nameAttr = element.Attribute(attrName);
			if (nameAttr == null)
				throw new Exception(string.Format("В элементе [{0}] не найден атрибут [{1}]", element.Name, attrName));
			string value = nameAttr.Value;
			if (string.IsNullOrEmpty(value))
				throw new Exception(string.Format("В элементе [{0}] не задано значение атрибута [{1}]", element.Name, attrName));

			return value;
		}

		/// <summary>
		/// Получает целочисленное значение атрибута.
		/// </summary>
		/// <param name="element">Родительский элемент.</param>
		/// <param name="attrName">Имя атрибута.</param>
		/// <returns>Целочисленное значение атрибута.</returns>
		private int GetIntegerXmlAttrValue(XElement element, string attrName)
		{
			if (element == null) throw new ArgumentNullException("element");
			if (string.IsNullOrEmpty(attrName)) throw new ArgumentException("attrName is null or empty.", "attrName");

			XAttribute nameAttr = element.Attribute(attrName);
			if (nameAttr == null)
				throw new Exception(string.Format("В элементе [{0}] не найден атрибут [{1}]", element.Name, attrName));
			string value = nameAttr.Value;
			if (string.IsNullOrEmpty(value))
				throw new Exception(string.Format("В элементе [{0}] не задано значение атрибута [{1}]", element.Name, attrName));

			int result;
			bool parsed = int.TryParse(value, out result);

			if (!parsed)
				throw new Exception(string.Format("В элементе [{0}] значение атрибута [{1}] задано не в целочисленном формате", element.Name, attrName));

			return result;
		}

		/// <summary>
		/// Возвращает ID подразделения.
		/// </summary>
		/// <param name="departmentName">Название подразделения.</param>
		/// <returns>ID подразделения.</returns>
		private int GetDepartmentId(string departmentName)
		{
			if (string.IsNullOrEmpty(departmentName)) throw new ArgumentException("Value cannot be null or empty.", "departmentName");
			XElement departmentElement = this.DepartmentsNode.Elements().First(x =>
			{
				XAttribute xAttribute = x.Attribute("Name");
				return xAttribute != null && xAttribute.Value == departmentName;
			});
			return this.GetIntegerXmlAttrValue(departmentElement, "ID");
		}
	}
}
