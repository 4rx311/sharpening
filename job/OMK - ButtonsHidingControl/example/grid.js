//debugger
function SortGrid(sortColumn, sortDirection)
{
    //debugger
    var url = window.location.href;
    var queryBuilder = new RequestQueryBuilder();
    queryBuilder.Init(url);
    queryBuilder.SetParam('sortColumn', encodeURI(sortColumn));
    queryBuilder.SetParam('sortDirection', sortDirection);
    queryBuilder.SetParam('pageNumber', '1');
    url = GetRelativeUrl(url);
    url = url.split('?')[0] + '?' + queryBuilder.GetQueryString();
    window.document.location.href = url;
}

function RequestQueryBuilder()
{
    this.ParamsByIndex = new Array();
    this.ParamsByName = new Array();
    var thisObj = this;
    
    this.SetParam = function(paramName, paramValue)
    {
        if(!window.SM.IsNE(paramName))
        {
            var paramEntry = thisObj.ParamsByName[paramName];
            if(paramEntry != null)
                paramEntry.ParamValue = paramValue;
            else
            {
                paramEntry = new RequestQueryEntry();
                paramEntry.ParamName = paramName;
                paramEntry.ParamValue = paramValue;
                thisObj.ParamsByName[paramName] = paramEntry;
                thisObj.ParamsByIndex[thisObj.ParamsByIndex.length] = paramEntry;
            }
        }
    }
    
    this.GetQueryString = function()
    {
        var i, len = thisObj.ParamsByIndex.length;
        var queryString = '';
        for(i = 0; i < len; i++)
        {
            var paramEntry = thisObj.ParamsByIndex[i];
            if(queryString.length > 0)
                queryString = queryString.concat('&');
            var paramValue = '';
            if(paramEntry.ParamValue != null)
                paramValue = paramEntry.ParamValue.toString();
            queryString = queryString.concat(paramEntry.ParamName, '=', paramValue);
        }
        //queryString = encodeURI(queryString);
        if(this.HasRNDParam)
            queryString += '&rnd=' + Math.random();
        return queryString;
    }
    
    this.Init = function(url)
    {
        var splitedUrl = url.split('?');
        if (splitedUrl[1] != null)
        {
            var stParams = splitedUrl[1];
            var arParams = stParams.split('&');
            var i, len = arParams.length;
            for(i = 0; i < len; i++)
            {
	            var paramPair = arParams[i].split('=');
	            if(paramPair.length == 2)
	            {
	                if(paramPair[0] != 'rnd' && paramPair[0] != 'isHistoryLoading')
	                {
		                thisObj.SetParam(paramPair[0], paramPair[1]);
		            }
		            else if(paramPair[0] == 'rnd')
		            {
		                thisObj.HasRNDParam = true;
		            }
	            }
            }
        }
    }
}

function RequestQueryEntry()
{
    this.ParamName = null;
    this.ParamValue = null;
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

function GetRelativeUrl(webUrl)
{
    var isAbsUrl = webUrl.indexOf("http") != -1;
    var relativeUrl = webUrl;
    if (isAbsUrl)
    {
        var webServerUrl = GetServerUrl(webUrl);
        var serverLen = webServerUrl.length;
        var webLen = webUrl.length;
        if (serverLen < webLen)
            relativeUrl = webUrl.substr(serverLen, webLen - serverLen);
        else
            relativeUrl = '/';
    }
    return relativeUrl;
}