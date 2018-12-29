<%@ Page Language="C#"
AutoEventWireup="true"
Inherits="WSSC.V4.DMS.OMK.Reports.UpdatedDetalization, WSSC.V4.DMS.OMK,Version=4.0.0.0,Culture=neutral,PublicKeyToken=9f4da00116c38ec5" %>

<!DOCTYPE HTML>
<head runat="server">
    <meta http-equiv="X-UA-Compatible" content="IE=EDGE">
    <title runat="server"></title>
    <link rel="stylesheet" type="text/css" href="/_layouts/wss/wssc.v4.dms.reports/report/netmodel/rpstyle.css"/>
</head>
<body>
<form id="form1" runat="server">
    <asp:LinkButton ID="DownloadLink" runat="server" OnClick="DownloadLink_OnClick" Text="Сохранить в Excel">Сохранить в Excel</asp:LinkButton>
    <asp:Literal runat="server" ID="ContentLiteral"></asp:Literal>
</form>
    <style>
        #DownloadLink {
            float:right;
            right:5px;
            position: fixed;
        }

        #reportTitle {
            text-align: center;
            padding:0 0 20px 0;
            font-size:14px;
            font-weight:bold;
        }
    </style>
</body>