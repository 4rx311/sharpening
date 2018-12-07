<%@ WebHandler Language="C#" Class="GetCompanyFullList" %>

using System;
using System.Web;
using System.Web.Script.Serialization;

public class GetCompanyFullList : IHttpHandler {

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "application/json";


        Model model = new Model();
        var serializer = new JavaScriptSerializer();
        model.GlobalRequest();
        var json = serializer.Serialize(model.companyInfo);

        context.Response.Write(json);
    }

    public bool IsReusable {
        get {
            return false;
        }
    }

}