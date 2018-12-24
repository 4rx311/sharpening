//--- работа с Signer для ECP
function WKF_ECP_DisposeSigner(signer)
{
    if (signer != null)
    {
        var disposeResult = signer.Dispose();
        if (window.Crypto.HasError(disposeResult))
            return;
        signer = null;
    }
}

function WKF_ECP_Generate()
{
    //если у текущего пользователя нет сертификата эцп, то не вызываем функцию подписи
    if (!this.ItemInfo.CurrentUserHasECPCertificate) return;

    //проверяем нужно ли проверять ЭЦП
    var ECP = '';
    var signDate = null;

    var filesCheckECP = this.GetDMSFieldValue(this.SelectedSolution, SLFConsts.SolutionsConsts.FilesCheckECP);
    if (!IsNullOrEmpty(filesCheckECP))
    {
        //получение signer ЭЦП
        var signerObj = Crypto.GetSigner();
        var signer = signerObj.Signer;

        //вывод ошибки
        if (signerObj.Exception != null)
        {
            //текст сообщения об ошибке
            if (signerObj.Exception.DisplayText != null && signerObj.Exception.DisplayText != "")
                return signerObj.Exception.DisplayText;
            return 'Ошибка: signerObj.Exception.DisplayText не содержит текста ошибки';
        }
        if (signer == null) return "Ошибка: Crypto.GetSigner вернула пустой Signer, Exception=null";

        //подпись решения
        var solutionName = this.SelectedSolutionName;
        var solutionDisplayName = this.GetDMSFieldValue(this.SelectedSolution, SLFConsts.SolutionsConsts.DisplayName);
        var comment = this.GetComment();
        var signSolObj = WKF_ECP_SignSolution(signer, solutionName, solutionDisplayName, comment);
        if (signSolObj.Exception != null) return signSolObj.Exception;
        ECP = signSolObj.ECP;
        signDate = signSolObj.SignDate;

        //подпись файлов
        var filesFields = filesCheckECP.split(';');
        for (var i = 0; i < filesFields.length; i++)
        {
            var fileFieldName = filesFields[i];

            //поле файлов
            var filesField = window.ListForm.GetField(filesFields[i]);
            if (filesField != null)
            {
                var fileECPObj = filesField.TypedField.SignFiles(signer);
                if (fileECPObj != null)
                {
                    if (fileECPObj.ErrorMessage != null && fileECPObj.ErrorMessage != '')
                    {
                        return fileECPObj.ErrorMessage;
                    }
                }
            }
        }
    }
    WKF_ECP_DisposeSigner(signer);
    this.ResultInfo.ECP = ECP;
    this.ResultInfo.SignDate = signDate;
}

//общая функция подписи решения (картотека и карточка)
function WKF_ECP_SignSolution(signer, solutionName, solutionDisplayName, comment)
{
    var signSolObj = {ECP: null, Exception: null};
    var xmlRequest = new ActiveXObject('Microsoft.XMLHTTP');
    var url = '/_LAYOUTS/WSS/WSSC.V4.DMS.Workflow/ECP/Get_ECP_HashCode.aspx?rnd=' + Math.random().toString();
    xmlRequest.open('POST', url, false);
    var params = 'solutionName=' + solutionName;
    params += '&solutionDisplayName=' + solutionDisplayName;
    params += '&comment=' + comment;
    params = encodeURI(params);

    xmlRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlRequest.send(params);
    if (xmlRequest.status == 200) {
        var response = xmlRequest.responseText;
        if (!window.SM.IsNE(response)) {
            if (response.indexOf('Exception') != -1) {
                window.alert(response);
                return;
            }
            //hashCode для решения
            var solutionHash = null;
            var signDate = null;
            //загружаем результат
            var xmlDoc = SM.LoadXML(response);
            var resultNode = xmlDoc.documentElement;
            if (resultNode != null)
            {
                solutionHash = resultNode.getAttribute('solHashCode');
                signDate = resultNode.getAttribute('signDate');
            }
            if (solutionHash == null || solutionHash == '')
            {
                signSolObj.Exception = 'Страница Get_ECP_HashCode вернула пустой hashCode';
                return;
            }

            var ECPObj = signer.SignData(solutionHash, "base64");
            if (ECPObj.Exception != null)
            {
                //текст сообщения об ошибке
                if (ECPObj.Exception.DisplayText != null && ECPObj.Exception.DisplayText != "")
                    signSolObj.Exception = ECPObj.Exception.DisplayText;
                else signSolObj.Exception = 'Ошибка: ECPObj.Exception.DisplayText не содержит текста ошибки';
            }
            signSolObj.ECP = ECPObj.Value;
            signSolObj.SignDate = signDate;
        }
    }
    return signSolObj;
}

