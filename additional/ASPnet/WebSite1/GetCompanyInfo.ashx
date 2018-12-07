<%@ WebHandler Language="C#" Class="GetCompanyInfo" %>

using System;
using System.Web;
using System.Web.Script.Serialization;

public class GetCompanyInfo : IHttpHandler {

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "application/json";
        string query = context.Request.QueryString["q"];
        string str = context.Request.QueryString["t"];
        bool check = str.Equals("1") ? true : false ;

        Model model = new Model();
        var serializer = new JavaScriptSerializer();

        if (!check) model.Request(query);
        else
        {
            model.RequestINN(query);
        }
        var json = serializer.Serialize(model.companyInfo);

        context.Response.Write(json);
    }

    public bool IsReusable {
        get {
            return false;
        }
    }

}
