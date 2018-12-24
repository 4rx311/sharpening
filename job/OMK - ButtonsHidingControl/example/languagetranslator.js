function LanguageTranslator() {
    window.TN = this;

    this.BasePhrasesByNamespace = new Array();

    this.BasePhrasesOnLoad = new Array();
    this.LoadCompleted = false;

    if (SM.IsNE(this.DropCacheParam))
        this.DropCacheParam = Math.random().toString();

    //Methods
    this.Translate = TN_Translate;
    this.TranslateOnLoad = TN_TranslateOnLoad;
    this.TranslateKey = TN_TranslateKey;
    this.ExecuteTranslateOnLoad = TN_ExecuteTranslateOnLoad;
    this.ExecuteTranslateOnLoadCompleted = TN_ExecuteTranslateOnLoadCompleted;
    this.GetBasePhrases = TN_GetBasePhrases;
    this.ChangeLanguage = TN_ChangeLanguage;
}
new LanguageTranslator();

function TN_GetBasePhrases(phraseNamespace) {
    if (SM.IsNE(phraseNamespace))
        phraseNamespace = '#';
    phraseNamespace = phraseNamespace.toLowerCase();

    var basePhrases = this.BasePhrasesByNamespace[phraseNamespace];
    if (basePhrases == null) {
        basePhrases = new Array();
        this.BasePhrasesByNamespace[phraseNamespace] = basePhrases;
    }
    return basePhrases;
}

function TN_TranslateKey(translationKey)
{
    if(SM.IsNE(translationKey))
        throw new Error('Не передан параметр translationKey.');
    
    if(this.ClientTranslations == null)
    {
        this.ClientTranslations = new Array();
        var i, len = this.TranslationEntries.length;
        for(i = 0; i < len; i++)
        {
            var entry = this.TranslationEntries[i];
            var key = entry.Key;
            if(!SM.IsNE(key))
            {
                key = key.toLowerCase();
                this.ClientTranslations[key] = entry;
            }
        }
    }
    
    translationKey = translationKey.toLowerCase();
    var translationEntry = this.ClientTranslations[translationKey];
    if(translationEntry == null)
        throw new Error('Не удалось получить клиентский перевод с ключом ' + translationKey);
    
    var translation = translationEntry.Translation;
    return translation;
}

function TN_Translate(basePhrase, phraseNamespace) {
    if (SM.IsNE(basePhrase) || !this.EnableTranslation)
        return basePhrase;

    if (SM.IsNE(phraseNamespace))
        phraseNamespace = '#';

    var basePhrases = this.GetBasePhrases(phraseNamespace);

    var result = null;
    var translation = basePhrases[basePhrase];
    if (translation == null) {
        var url = '/_layouts/WSS/DBF/UI/LanguageTranslator.ashx';
        var params = '';
        params += 'dropParam=' + this.DropCacheParam;
        params += '&operationName=' + 'Translate';
        params += '&basePhrase=' + encodeURI(basePhrase);
        params += '&phraseNamespace=' + encodeURI(phraseNamespace);
        params += '&currentLanguage=' + encodeURI(this.CurrentLanguage);

        var xmlRequest = SM.GetXmlRequest();
        xmlRequest.open('POST', url, false);
        xmlRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xmlRequest.send(params);
        var responseText = xmlRequest.responseText;
        if (responseText == null)
            responseText = '';
        if (TN_HasResponseError(responseText))
            return;
        translation = responseText;
        basePhrases[basePhrase] = translation;
    }
    return translation;
}

function TN_HasResponseError(responseText)
{
    var hasError = false;
    if (!SM.IsNE(responseText) && responseText.indexOf('ResponseExceptionJSON:') != -1) {
        hasError = true;
        var responseText = responseText.replace('ResponseExceptionJSON:', '');
        var errorResult = JSON.parse(responseText);
        alert(errorResult.Exception.DisplayText);
    }
    return hasError;
}

function TN_ChangeLanguage(languageCode, refreshPage) {
    if (SM.IsNE(languageCode))
        throw new Error('Не передан параметр languageCode');

    if (refreshPage == null)
        refreshPage = true;

    var url = '/_layouts/WSS/DBF/UI/LanguageTranslator.ashx';
    var params = '';
    params += '?dropParam=' + Math.random();
    params += '&operationName=' + 'ChangeLanguage';
    params += '&userLanguageCode=' + encodeURI(languageCode);

    url += params;

    var xmlRequest = SM.GetXmlRequest();
    xmlRequest.open('GET', url, false);

    xmlRequest.send(null);
    var responseText = xmlRequest.responseText;
    if (responseText == null)
        responseText = '';
    if (TN_HasResponseError(responseText))
        return;
    if (refreshPage == true)
        window.location.reload(true);
}

function TN_TranslateOnLoad(basePhrase, callBack, phraseNamespace) {
    if (callBack == null)
        throw new Error('Не передан параметр callBack.');

    if (SM.IsNE(basePhrase) || !this.EnableTranslation)
        callBack(basePhrase);
        
    if (SM.IsNE(phraseNamespace))
        phraseNamespace = '#';

    if (!this.LoadCompleted) {
        if (this.CurrentPhraseID == null)
            this.CurrentPhraseID = 0;

        this.BasePhrasesOnLoad.push({
            BasePhrase: basePhrase,
            CallBack: callBack,
            PhraseID: this.CurrentPhraseID,
            PhraseNamespace: phraseNamespace
        });

        this.CurrentPhraseID++;
    }
    else {
        var result = this.Translate(basePhrase, phraseNamespace);
        callBack(result);
    }
}

function TN_ExecuteTranslateOnLoad() {
    this.LoadCompleted = true;

    var stPhrases = '';
    var i, len = this.BasePhrasesOnLoad.length;
    for (i = 0; i < len; i++) {
        var phraseOnLoad = this.BasePhrasesOnLoad[i];
        if (phraseOnLoad != null && !SM.IsNE(phraseOnLoad.BasePhrase)) {
            var stPhrase = phraseOnLoad.PhraseID + '_phr_' + phraseOnLoad.BasePhrase + '_phr_' + phraseOnLoad.PhraseNamespace;
            if (stPhrases.length > 0)
                stPhrases += '_phrs_';
            stPhrases += stPhrase;
        }
    }
    if (stPhrases.length > 0) {
        var url = '/_layouts/WSS/DBF/UI/LanguageTranslator.ashx';
        var params = '';
        params += 'dropParam=' + this.DropCacheParam;
        params += '&operationName=' + 'TranslateOnLoad';
        params += '&phrasesOnLoad=' + encodeURI(stPhrases);
        params += '&currentLanguage=' + encodeURI(this.CurrentLanguage);


        var xmlRequest = SM.GetXmlRequest();
        xmlRequest.open('POST', url, true);
        xmlRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

        var thisObj = this;
        xmlRequest.onreadystatechange = function() {
            if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
                xmlRequest.onreadystatechange = new Function();
                var responseText = xmlRequest.responseText;
                thisObj.ExecuteTranslateOnLoadCompleted(responseText);
            }
        }

        xmlRequest.send(params);
    }
}

function TN_ExecuteTranslateOnLoadCompleted(responseText) {
    if (SM.IsNE(responseText))
        throw new Error('Результат перевода не может быть пустым.');
    if (TN_HasResponseError(responseText))
        return;

    var result = $.parseJSON(responseText);
    if (result != null) {
        var i, len = result.length;
        for (i = 0; i < len; i++) {
            var resultTranslation = result[i];
            var phraseOnLoad = this.BasePhrasesOnLoad[resultTranslation.PhraseID];
            if (phraseOnLoad != null) {
                var translation = resultTranslation.Translation;
                if (SM.IsNE(translation))
                    translation = '';

                var phraseNamespace = resultTranslation.PhraseNamespace;
                var basePhrases = this.GetBasePhrases(phraseNamespace);

                if (basePhrases != null) {
                    if (basePhrases[phraseOnLoad.BasePhrase] == null)
                        basePhrases[phraseOnLoad.BasePhrase] = translation;
                }

                phraseOnLoad.CallBack(translation);
            }
        }
    }

}