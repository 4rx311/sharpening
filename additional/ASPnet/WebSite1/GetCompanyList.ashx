<%@ WebHandler Language="C#" Class="GetCompanyList" %>

using System;
using System.Web;
using System.Web.Script.Serialization;

public class GetCompanyList : IHttpHandler {

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "application/json";


        Model model = new Model();
        var serializer = new JavaScriptSerializer();
        model.Request();
        var json = serializer.Serialize(model.companyNames);

        context.Response.Write(json);
    }

    public bool IsReusable {
        get {
            return false;
        }
    }

}