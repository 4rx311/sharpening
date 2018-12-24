

function AnonymousFileDownload(link) {

    var fileItem = link.FileItem;
    var clientField = fileItem.ClientField;

    var xmlhttp = SM.GetXmlRequest();

    var requestString = '/_layouts/WSS/WSSC.V4.SYS.Fields.Files/DisposableLinksPage/DisposableLinksPage.aspx?opType=CreateLink&FileURI=' + encodeURIComponent(clientField.HostUrl + fileItem.FileUrl) + '&rnd=' + Math.random().toString();

    xmlhttp.open('GET', requestString, true);

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {

                if (xmlhttp.responseText.indexOf('ok:') == 0) {
                    var guid = xmlhttp.responseText.split(':')[1];

                    AnonymousFileDownloadByGuid(guid);

                    return false;
                }

                else {
                    alert(xmlhttp.responseText)
                }
            }
            else {
                alert(xmlhttp.responseText);
            }
        }
    }
    xmlhttp.send(null);
}

function AnonymousFileDownloadByGuid(guid) {
    if (SM.IsNullOrEmpty(guid))
        throw ('guid');

    var fileUrl = '/_layouts/WSS/WSSC.V4.SYS.Fields.Files/DisposableLinksAnonymousPage/DisposableLinksAnonymousPage.aspx?opType=GetFile&disposableFileGuid=' + guid + '&rnd=' + Math.random().toString();

    var oldCookie = document.cookie;

    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {

        var name = cookies[i].split("=")[0];
        var value = "";
        var days = -1;

        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
        document.cookie = name + "=" + value + expires + "; path=/";

    }
    window.location.href = fileUrl;

    document.cookie = oldCookie;
}