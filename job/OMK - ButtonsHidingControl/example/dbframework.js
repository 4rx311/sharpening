String.prototype.trim = function() { return this.replace(/(^\s+)|(\s+$)/g, ""); }
String.prototype.startsWith = function(str){ return (this.substr(0, str.length) == str); }

window.SpecifiedSymbols = new Array();
window.SpecifiedSymbols['[symbol-plus]'] = /\+/g;
window.SpecifiedSymbols['[symbol-ampersand]'] = /\&/g;
window.SpecifiedSymbols['[symbol-at]'] = /\@/g;
window.SpecifiedSymbols['[symbol-question]'] = /\?/g;
window.SpecifiedSymbols['[symbol-equals]'] = /\=/g;
window.SpecifiedSymbols['[symbol-colon]'] = /\:/g;
window.SpecifiedSymbols['[symbol-comma]'] = /\,/g;
window.SpecifiedSymbols['[symbol-dollar]'] = /\$/g;
window.SpecifiedSymbols['[symbol-semicolon]'] = /\;/g;

function EncodeUrlParameter(paramString) {
    for (var symbol in window.SpecifiedSymbols)
        paramString = paramString.replace(window.SpecifiedSymbols[symbol], symbol)

    return paramString;
}

function DBF_containsKey(key){ if(key != null){ return this[key] != null; } return false; }

//*************************************************************
//************************ DBContext ************************
//*************************************************************
window.__init_Context = false;
window._Context = null;
window.Context = function()
{
    if(!window.__init_Context)
    {
        window._Context = new DBContext();
        window.__init_Context = true;
    }
    return window._Context;
}

function DBContext()
{
    if(window.__init_Context)
        throw new Error('Объект DBContext уже создан в контексте текущей страницы. Данный объект можно получить через метод window.Context().');
    
    
    var thisObj = this;
    
    //DataAdapter
    this.__init_DataAdapter = false;
    this._DataAdapter = null;
    this.DataAdapter = function()
    {
        if(!thisObj.__init_DataAdapter)
        {
            thisObj._DataAdapter = new DBDataAdapter(this);
            thisObj.__init_DataAdapter = true;
        }
        return thisObj._DataAdapter;
    }
    
    //Site
    this.__init_Site = false;
    this._Site = null;
    this.Site = function()
    {
        if(!thisObj.__init_Site)
        {
            var responseText = thisObj.DataAdapter().GetClientData('GetSite', null);
            var result = thisObj.DataAdapter().GetResponseJson(responseText);
                
            if(result == null)
                throw new Error('Не удалось получить объект DBSite.');
                
            DBSite.call(result, thisObj);
            thisObj._Site = result;
            thisObj.__init_Site = true;
        }
        return thisObj._Site;
    }
    this.ContextSiteUrl = null;
    this.SetContextSite = DBContext_SetContextSite;
    
    //CurrentWeb
    this.__init_CurrentWeb = false;
    this._CurrentWeb = null;
    this.CurrentWeb = function()
    {
        if(!thisObj.__init_CurrentWeb)
        {
            if(thisObj.Site() != null)
                thisObj._CurrentWeb = thisObj.Site().CurrentWeb();
            thisObj.__init_CurrentWeb = true;
        }
        return thisObj._CurrentWeb;
    }
}

function DBContext_SetContextSite(siteUrl)
{
    if(IsNullOrEmpty(siteUrl))
        throw new Error('Не передан параметр siteUrl');
    this.ContextSiteUrl = siteUrl;
}
//*************************************************************




//*************************************************************
//************************ DBDataAdapter ************************
//*************************************************************
function DBDataAdapter(context)
{
    if(context == null)
        throw new Error('Параметр context не может быть равен null.');
    this.Context = context;
    this.Queue = new Array();
    this.GetData = DBDataAdapter_GetData;
    this.GetClientData = DBDataAdapter_GetClientData;
    this.ExecuteNextQuery = DBDataAdapter_ExecuteNextQuery;
    this.GetResponseXml = DBDataAdapter_GetResponseXml;
    this.GetResponseJson = DBDataAdapter_GetResponseJson;
}

function DBDataAdapter_GetData(url, completedHandler, postParams)
{
    var query = new DBAdapterQuery(url, completedHandler, postParams, this);
    
    if(query.IsAsynch)
    {
        this.Queue.push(query);
        if(this.CurrentQuery == null)
            this.ExecuteNextQuery();
    }
    else
    {
        var responseText = query.Execute();
        return responseText;
    }
    return null;
}

function DBDataAdapter_ExecuteNextQuery()
{
    if(this.Queue.length > 0)
    {
        var nextQuery = this.Queue.shift();
        nextQuery.Execute();
    }
    else
        this.CurrentQuery = null;
}

function DBDataAdapter_GetClientData(operationName, params, completedHandler, isPost)
{
    if(IsNullOrEmpty(operationName))
        throw new Error('Параметр operationName не может быть пустым.');

    var url = '/_layouts/WSS/DBF/ClientModel/DBClientAdapter.aspx?rnd=' + Math.random();
    if(!IsNullOrEmpty(params))
    {
        if(params.charAt(0) == '&' && params.length > 1)
            params = params.substr(1);
    }
    if(!IsNullOrEmpty(params))
        params = 'operationName=' + encodeURI(operationName) + '&' + params;
    else
        params = 'operationName=' + encodeURI(operationName)
    if(!IsNullOrEmpty(this.Context.ContextSiteUrl))
        params = 'contextSiteUrl=' + encodeURI(this.Context.ContextSiteUrl) + '&' + params;
    var postParams = null;
    if(!isPost)
        url += '&' + params;
    else
        postParams = params;
    
    var responseText = this.GetData(url, completedHandler, postParams);
    return responseText;
}

function DBDataAdapter_GetResponseXml(responseText)
{
    var responseXml = null;
    if(!IsNullOrEmpty(responseText))
    {
        var lowResponseText = responseText.toLowerCase();
        if(lowResponseText.indexOf('exception') == -1)
        {
            var axoResponse = SM.LoadXML(responseText);
            responseXml = axoResponse.documentElement;
        }
        else
            alert('Возникла неожиданная ошибка:\n\r' + responseText);
    }
    
    return responseXml;
}

function DBDataAdapter_GetResponseJson(responseText)
{
    var responseJson = null;
    if(!IsNullOrEmpty(responseText))
    {
        var lowResponseText = responseText.toLowerCase();
        if(lowResponseText.indexOf('exception') == -1)
        {
            responseJson = $.parseJSON(responseText);
        }
        else
            alert('Возникла неожиданная ошибка:\n\r' + responseText);
    }
    
    return responseJson;
}




function DBAdapterQuery(url, completedHandler, postParams, adapter)
{
    if(IsNullOrEmpty(url))
        throw new Error('Параметр url не может быть пустым.');
        
    this.Adapter = adapter;
    this.Url = url;
    this.CompletedHandler = completedHandler;
    if(IsNullOrEmpty(postParams))
        postParams = null;
    this.PostParams = postParams;
    this.IsPost = !IsNullOrEmpty(postParams);
    this.IsAsynch = completedHandler != null;
    
    this.Execute = DBAdapterQuery_Execute;
    
}

//debugger
function DBAdapterQuery_Execute()
{
    if(this.IsAsynch)
        this.Adapter.CurrentQuery = this;
    var xmlRequest = SM.GetXmlRequest();
    var isPost = !IsNullOrEmpty(this.PostParams)
    if(!this.IsPost)
        xmlRequest.open('GET', this.Url, this.IsAsynch);
    else
    {
        xmlRequest.open('POST', this.Url, this.IsAsynch);
        xmlRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    }
    if(this.IsAsynch)
    {
        var thisObj = this;
        xmlRequest.onreadystatechange = function()
        {
            if(xmlRequest.readyState == 4 && xmlRequest.status == 200) 
            {
                var responseText = xmlRequest.responseText;
                thisObj.CompletedHandler(responseText);
                thisObj.Adapter.ExecuteNextQuery();
            }
        }
    }
    xmlRequest.send(this.PostParams);
    if(!this.IsAsynch)
    {
        var responseText = xmlRequest.responseText;
        return responseText;
    }
    return null;
}
//*******************************************************************




//*************************************************************
//************************ DBSite ************************
//*************************************************************
//debugger
function DBSite(context)
{
    if(context == null)
        throw new Error('Параметр context не может быть равен null.');
    
    this.Context = context;
    this.DataAdapter = context.DataAdapter();
    
    //CurrentWeb
    var thisObj = this;
    this.__init_CurrentWeb = false;
    this._CurrentWeb = null;
    this.CurrentWeb = function()
    {
        if(!thisObj.__init_CurrentWeb)
        {
            thisObj._CurrentWeb = null;
            
            var params = 'currentPageUrl=' + escape(window.location.href.split('?')[0]);
            
            var responseText = thisObj.DataAdapter.GetClientData('GetCurrentWeb', params);
            var responseObj = thisObj.DataAdapter.GetResponseJson(responseText);
                
            if(responseObj != null)
                thisObj._CurrentWeb = thisObj.GetUniqueWeb(responseObj);
                
            thisObj.__init_CurrentWeb = true;
        }
        return thisObj._CurrentWeb;
    }
    
    //RootWeb
    var thisObj = this;
    this.__init_RootWeb = false;
    this._RootWeb = null;
    this.RootWeb = function()
    {
        if(!thisObj.__init_RootWeb)
        {
            thisObj._RootWeb = thisObj.GetWebByID(thisObj.RootWebID);
            thisObj.__init_RootWeb = true;
        }
        return thisObj._RootWeb;
    }
    
    //Cache
    this.WebsByUrl = new Array();
    this.WebsByUrl.containsKey = DBF_containsKey;
    this.WebsByID = new Array();
    this.WebsByID.containsKey = DBF_containsKey;
    
    //Methods
    this.GetWeb = DBSite_GetWeb;
    this.GetWebByID = DBSite_GetWebByID;
    this.GetUniqueWeb = DBSite_GetUniqueWeb;
}

function DBSite_GetUniqueWeb(web)
{
    if(web == null)
        return null;
        
    var webID = web.ID;
    var relativeUrl = web.RelativeUrl;
    if(!this.WebsByID.containsKey(webID))
    {
        DBWeb.call(web, this);
        this.WebsByID[webID] = web;
        if(!this.WebsByUrl.containsKey(relativeUrl))
            this.WebsByUrl[relativeUrl] = web;
    }
    else
    {
        web = this.WebsByID[webID];
    }
    return web;
}

function DBSite_GetWeb(url)
{
    var web = null;
    if(IsNullOrEmpty(url))
        throw new Error('Параметр url не может быть пустым.');
    url = GetRelativeUrl(url);
    if(url != null)
    {
        if(!this.WebsByUrl.containsKey(url))
        {
            var params = 'webUrl=' + encodeURI(url);
            
            var responseText = this.DataAdapter.GetClientData('GetWeb', params);
            var responseJson = this.DataAdapter.GetResponseJson(responseText);
                
            if(responseJson != null)
                web = this.GetUniqueWeb(responseJson);
                
            if(!this.WebsByUrl.containsKey(url))
                this.WebsByUrl[url] = web;
        }
        else
        {
            web = this.WebsByUrl[url];
        }
    }
    return web;
}

function DBSite_GetWebByID(webID)
{
    var web = null;
    if(IsNullOrEmpty(webID))
        throw new Error('Параметр webID не может быть пустым.');
    if(!IsNullOrEmpty(webID))
    {
        webID = parseInt(webID.toString());
        if(!this.WebsByID.containsKey(webID))
        {
            var params = 'webID=' + encodeURI(webID);
            
            var responseText = this.DataAdapter.GetClientData('GetWebByID', params);
            var responseJson = this.DataAdapter.GetResponseJson(responseText);
                
            if(responseJson != null)
                web = this.GetUniqueWeb(responseJson);
                
            if(!this.WebsByID.containsKey(webID))
                this.WebsByID[webID] = web;
        }
        else
        {
            web = this.WebsByID[webID];
        }
    }
    return web;
}
//*********************************************************





//*************************************************************
//************************ DBWeb ************************
//*************************************************************
function DBWeb(site)
{    
    if(site == null)
        throw new Error('Параметр site не может быть равен null.');

    this.Site = site;
    
    //Cache
    this.ListsByName = new Array();
    this.ListsByName.containsKey = DBF_containsKey;
    this.ListsByID = new Array();
    this.ListsByID.containsKey = DBF_containsKey;
    
    //Methods
    this.GetList = DBWeb_GetList;
    this.GetListByID = DBWeb_GetListByID;
    this.GetUniqueList = DBWeb_GetUniqueList;
}

function DBWeb_GetUniqueList(list)
{
    if(list == null)
        return null;
        
    var listID = list.ID;
    var listName = list.Name;
    if(!this.ListsByID.containsKey(listID))
    {
        DBList.call(list, this);
        this.ListsByID[listID] = list;
        if(!IsNullOrEmpty(listName))
        {
            listName = listName.toLowerCase();
            if(!this.ListsByName.containsKey(listName))
                this.ListsByName[listName] = list;
        }
    }
    else
    {
        list = this.ListsByID[listID];
    }
    return list;
}

function DBWeb_GetList(listName)
{
    var list = null;
    if(IsNullOrEmpty(listName))
        throw new Error('Параметр listName не может быть пустым.');
    listName = listName.toLowerCase()
    
    if(!this.ListsByName.containsKey(listName))
    {
        var params = 'webID=' + encodeURI(this.ID);
        params += '&listName=' + encodeURI(listName);
        
        var responseText = this.Site.DataAdapter.GetClientData('GetList', params);
        var responseJson = this.Site.DataAdapter.GetResponseJson(responseText);
            
        if(responseJson != null)
            list = this.GetUniqueList(responseJson);
            
        if(!this.ListsByName.containsKey(listName))
            this.ListsByName[listName] = list;
    }
    else
    {
        list = this.ListsByName[listName];
    }
    
    return list;
}

function DBWeb_GetListByID(listID)
{
    var list = null;
    
    if(listID != null)
        listID = parseInt(listID.toString());
    
    if(!(listID > 0))
        throw new Error('Параметр listID должен быть больше 0.');
        
    if(!this.ListsByID.containsKey(listID))
    {
        var params = 'webID=' + encodeURI(this.ID);
        params += '&listID=' + encodeURI(listID);
        
        var responseText = this.Site.DataAdapter.GetClientData('GetListByID', params);
        var responseJson = this.Site.DataAdapter.GetResponseJson(responseText);
            
        if(responseJson != null)
            list = this.GetUniqueList(responseJson);
            
        if(!this.ListsByID.containsKey(listID))
            this.ListsByID[listID] = list;
    }
    else
    {
        list = this.ListsByID[listID];
    }
    
    return list;
}

//*************************************************************






//*************************************************************
//************************ DBList ************************
//*************************************************************

function DBList(web)
{    
    if(web == null)
        throw new Error('Параметр web не может быть равен null.');

    this.Web = web;
    this.Site = web.Site;
    
    //Methods
    this.GetItemByID = DBList_GetItemByID;
    this.GetItems = DBList_GetItems;
    this.GetLoadedFieldsString = DBList_GetLoadedFieldsString;
    this.GetField = DBList_GetField;
    this.GetFieldByID = DBList_GetFieldByID;
    
    //Properties
    var thisObj = this;
    this.Fields = function()
    {
        if(!thisObj.__init_Fields)
        {
            var params = 'listID=' + encodeURI(this.ID);
            var responseText = this.Site.DataAdapter.GetClientData('GetFields', params);
            var responseJson = this.Site.DataAdapter.GetResponseJson(responseText);
            if(responseJson != null)
            {
                var i, len = responseJson.length;
                for(i = 0; i < len; i++)
                {
                    var field = responseJson[i];
                    if(field != null)
                        DBFieldClient.call(field, thisObj);
                }
                thisObj._Fields = responseJson;
            }
            if(thisObj._Fields == null)
                thisObj._Fields = [];
            
            thisObj.__init_Fields = true;
        }
        return thisObj._Fields;
    }
}

function DBList_GetField(fieldName)
{       
    var resultField = null; 
    if(this.FieldsByName == null)
    {
        this.FieldsByName = [];
        this.FieldsByName.containsKey = DBF_containsKey;
        
        var i, len = this.Fields().length;
        for(i = 0; i < len; i++)
        {
            var field = this.Fields()[i];
            this.FieldsByName[field.Name.toLowerCase()] = field;
        }
    }
    if(!SM.IsNE(fieldName))
    {
        fieldName = fieldName.toLowerCase();
        if(this.FieldsByName.containsKey(fieldName))
            resultField = this.FieldsByName[fieldName];
    }
    return resultField;
}

function DBList_GetFieldByID(fieldID)
{
    if(fieldID != null)
        listID = parseInt(fieldID.toString());
    
    if(!(fieldID > 0))
        throw new Error('Параметр fieldID должен быть больше 0.');
       
    var resultField = null; 
    if(this.FieldsByID == null)
    {
        this.FieldsByID = [];
        this.FieldsByID.containsKey = DBF_containsKey;
        
        var i, len = this.Fields().length;
        for(i = 0; i < len; i++)
        {
            var field = this.Fields()[i];
            this.FieldsByID[field.ID] = field;
        }
    }
    if(this.FieldsByID.containsKey(fieldID))
        resultField = this.FieldsByID[fieldID];
    return resultField;
}

function DBList_GetLoadedFieldsString(loadedFields)
{
    var stLoadedFields = new String();
    if(loadedFields != null)
    {
        /*
        if(loadedFields.length == 0)
            throw new Error('Необходимо указать хотя бы одно поле для загрузки.');
        */
        var i, len = loadedFields.length;
        for(i = 0; i < len; i++)
        {
            var fieldName = loadedFields[i];
            if(!IsNullOrEmpty(fieldName))
            {
                if(stLoadedFields.length > 0)
                    stLoadedFields += '_sf_';
                stLoadedFields += fieldName;
            }
        }
    }
    return stLoadedFields;
}

function DBList_GetItemByID(itemID, loadedFields, completedHandler, checkAccess, customParams)
{
    var item = null;
    
    if(itemID != null)
        itemID = parseInt(itemID.toString());
    
    if(itemID == null)
        itemID = 0;

    if(itemID > 0)
    {        
        checkAccess = checkAccess == true;
        
        var stLoadedFields = this.GetLoadedFieldsString(loadedFields);
        
        var params = new String();
        params += 'listID=' + this.ID;
        params += '&itemID=' + itemID;
        params += '&loadedFields=' + encodeURIComponent(stLoadedFields);
        params += '&checkAccess=' + checkAccess.toString();

        //добавляем кастомные параметры запросы, которые могут быть индивидуально обработаны полем конкретного типа.
        //используется для получения значения поля Отображаемое название, вместо значения из поля Название, 
        //при извлечении значения из поля подстановки.
        if (!SM.IsNE(customParams)) {
            if (customParams.charAt(0) != '&')
                customParams = '&' + customParams;
            params += customParams;
        }
        
        if(completedHandler == null)
        {
            var responseText = this.Site.DataAdapter.GetClientData('GetItemByID', params, null, true);
            var xmlElement = this.Site.DataAdapter.GetResponseXml(responseText);
            if(xmlElement != null)
                item = new DBItem(xmlElement, this);
        }
        else
        {
            var thisObj = this;
            this.Site.DataAdapter.GetClientData('GetItemByID', params, function(responseText)
            {
                var xmlElement = thisObj.Site.DataAdapter.GetResponseXml(responseText);
                var asynchItem = null;
                if(xmlElement != null)
                    asynchItem = new DBItem(xmlElement, thisObj);
                completedHandler(asynchItem);
            }, true);
        }
    }
    else if(completedHandler != null)
        completedHandler(null);
    
    return item;
}

function DBList_GetItems(selectCondition, loadedFields, completedHandler, checkAccess, customParams)
{
    var items = new Array();
    
    if(selectCondition == null)
        selectCondition = '';
        
    checkAccess = checkAccess == true;
    
    var stLoadedFields = this.GetLoadedFieldsString(loadedFields);
    
    var params = new String();
    params += 'listID=' + this.ID;
    params += '&selectCondition=' + encodeURIComponent(selectCondition);
    params += '&loadedFields=' + encodeURIComponent(stLoadedFields);
    params += '&checkAccess=' + checkAccess.toString();

    //добавляем кастомные параметры запросы, которые могут быть индивидуально обработаны полем конкретного типа.
    //используется для получения значения поля Отображаемое название, вместо значения из поля Название, 
    //при извлечении значения из поля подстановки.
    if (!SM.IsNE(customParams))
    {
        if (customParams.charAt(0) != '&')
            customParams = '&' + customParams;
        params += customParams;
    }
    
    if(completedHandler == null)
    {
        var responseText = this.Site.DataAdapter.GetClientData('GetItems', params, null, true);
        var resultNode = this.Site.DataAdapter.GetResponseXml(responseText);
        if(resultNode != null)
        {
            var itemNodes = resultNode.selectNodes('Item');
            var i, len = itemNodes.length;
            for(i = 0; i < len; i++)
            {
                var xmlElement = itemNodes[i];
                if(xmlElement != null)
                {
                    var item = new DBItem(xmlElement, this);
                    items.push(item);
                }
            }
        }
    }
    else
    {
        var thisObj = this;
        this.Site.DataAdapter.GetClientData('GetItems', params, function(responseText)
        {
            var asynchItems = new Array();
            var resultNode = thisObj.Site.DataAdapter.GetResponseXml(responseText);
            if(resultNode != null)
            {
                var itemNodes = resultNode.selectNodes('Item');
                var i, len = itemNodes.length;
                for(i = 0; i < len; i++)
                {
                    var xmlElement = itemNodes[i];
                    if(xmlElement != null)
                    {
                        var item = new DBItem(xmlElement, thisObj);
                        asynchItems.push(item);
                    }
                }
            }
            completedHandler(asynchItems);
        }, true);
    }
    
    return items;
}








//*************************************************************
//************************* DBFieldClient ****************************
//*************************************************************

//класс называется DBFieldClient, поскольку на ListForm есть уже класс с названием DBField.
function DBFieldClient(list)
{
    if(list == null)
        throw new Error('Не передан параметр list.');
    this.List = list;
}

//*************************************************************




//*************************************************************
//************************* DBItem ****************************
//*************************************************************

function DBItem(xmlElement, list)
{
    if(xmlElement == null)
        throw new Error('Параметр xmlElement не может быть равен null.');
        
    if(list == null)
        throw new Error('Параметр list не может быть равен null.');

    this.XmlElement = xmlElement;
    this.List = list;
    this.Web = list.Web;
    this.Site = list.Site;
    this.GetAttribute = DBF_GetAttribute;
    this.GetBooleanAttribute = DBF_GetBooleanAttribute;
    this.GetIntegerAttribute = DBF_GetIntegerAttribute;
    
    //Properties
    this.ID = this.GetIntegerAttribute('ID');
    this.DisplayUrl = this.GetAttribute('DisplayUrl');
    this.EditUrl = this.GetAttribute('EditUrl');
    
    //Cache
    this.FieldValues = new Array();
    this.FieldValues.containsKey = DBF_containsKey;
    
    //Methods
    this.GetValue = DBItem_GetValue;
}

function DBItem_GetValue(fieldName)
{
    var value = null;

    if (IsNullOrEmpty(fieldName))
        throw new Error('Параметр fieldName не может быть пустым.');
    
    fieldName = fieldName.toLowerCase();
    if(!this.FieldValues.containsKey(fieldName))
    {
        var fieldValueNode = this.XmlElement.selectSingleNode("FieldValues/FieldValue[@FieldName='" + fieldName + "']");
        if(fieldValueNode != null)
        {
            var isValueXml = DBF_GetBooleanAttributeValue(fieldValueNode, 'IsValueXml');
            var valueNode = fieldValueNode.selectSingleNode('Value');
            if(valueNode != null)
            {
                if(!isValueXml)
                {
                    var simpleValueNode = valueNode.selectSingleNode('SimpleValue');
                    if(simpleValueNode != null)
                    {
                        if(SM.IsIE)
                            value = simpleValueNode.text;
                        else
                            value = simpleValueNode.textContent;
                        if(value == '')
                            value = null;
                    }
                }
                else
                {
                    if(SM.IsIE)
                        value = valueNode.firstChild;
                    else
                        value = valueNode.firstElementChild;
                }
            }
        }
        this.FieldValues[fieldName] = value;
    }
    else
    {
        value = this.FieldValues[fieldName];
    }
    
    return value;
}

//*************************************************************




////////////////////////Common Methods//////////////////////////////
function DBF_GetAttribute(attributeName)
{
    return DBF_GetAttributeValue(this.XmlElement, attributeName); 
}

function DBF_GetBooleanAttribute(attributeName)
{
    return DBF_GetBooleanAttributeValue(this.XmlElement, attributeName);
}

function DBF_GetIntegerAttribute(attributeName)
{
    return DBF_GetIntegerAttributeValue(this.XmlElement, attributeName);
}

//проверка строки на пусто/нул
function IsNullOrEmpty(str)
{
    return (str == null || str == '');
}

//получение текстового атрибута ХМЛ-элемента
function DBF_GetAttributeValue(xmlElement, attributeName)
{
    var attrValue = null;
    var val = xmlElement.getAttribute(attributeName);
    if(!IsNullOrEmpty(val))
        attrValue = val;
    return attrValue;        
}

//получение булевого атрибута ХМЛ-элемента
function DBF_GetBooleanAttributeValue(xmlElement, attributeName)
{
    var boolValue = false;
    var attrValue = DBF_GetAttributeValue(xmlElement, attributeName);
    if(!IsNullOrEmpty(attrValue))
    {
        boolValue = attrValue.toLowerCase() == 'true';
    }
    return boolValue;
}

function DBF_GetIntegerAttributeValue(xmlElement, attributeName)
{
    var intValue = 0;
    var value = DBF_GetAttributeValue(xmlElement, attributeName);
    if(!IsNullOrEmpty(value))
        intValue = parseInt(value);
    return intValue;
}


function GetServerUrl(absoluteUrl)
{
    var len = absoluteUrl.length;
    var slashCount = 0;
    var i = 0;
    var stServerUrl = new String();
    while (slashCount < 3 && i < len)
    {
        var ch = absoluteUrl.charAt(i);
        if (ch == '/')
            slashCount++;
        if (slashCount < 3)
            stServerUrl += ch;
        i++;
    }
    return stServerUrl;
}

function GetRelativeWebUrl(webUrl)
{
    var isAbsUrl = webUrl.startsWith("http");
    var relativeUrl = webUrl;
    if (isAbsUrl)
    {
        var webServerUrl = GetServerUrl(webUrl);
        var serverLen = webServerUrl.length;
        var webLen = webUrl.length;
        if (serverLen < webLen)
            relativeUrl = webUrl.substr(serverLen, webLen - serverLen);
        else
            relativeUrl = "/";
    }
    return relativeUrl;
}

function GetRelativeUrl(url)
{
    var relativeUrl = null;
    if (url != null)
    {
        var relativeUrl = GetRelativeWebUrl(url);
        if(IsNullOrEmpty(relativeUrl))
            relativeUrl = '/';
        else if(relativeUrl.charAt(0) != '/')
            relativeUrl = '/' + relativeUrl;
        relativeUrl = relativeUrl.toLowerCase();
    }
    return relativeUrl;
}

////////////////////////////////////////////////////////////////////