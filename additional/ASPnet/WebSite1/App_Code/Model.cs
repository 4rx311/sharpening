using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for Model
/// </summary>
/// 

using System.Data.SqlClient;

public class Model
{
    private string _connectionStr = @"Data Source=VENICE-DEV;
                                     Initial Catalog=WSSC_Test;
                                     Integrated Security=True;
                                     Connect Timeout=30;
                                     Encrypt=False;
                                     TrustServerCertificate=False;
                                     ApplicationIntent=ReadWrite;
                                     MultiSubnetFailover=False";


    public List<Company> companyInfo = new List<Company>();
    public List<object> companyNames = new List<object>();

    public void GlobalRequest()
    {
        SqlConnection connection = new SqlConnection(_connectionStr);
        connection.Open();
        SqlCommand cmd = new SqlCommand("SELECT * FROM Companies", connection);

        SqlDataReader reader = cmd.ExecuteReader();


        while (reader.Read())
        {
            companyInfo.Add(new Company(reader["Name"], reader["Address"], reader["INN"], reader["Description"]));
        }
        reader.Close();
        connection.Close();
    }

    public void Request()
    {
        SqlConnection connection = new SqlConnection(_connectionStr);
        connection.Open();
        SqlCommand cmd = new SqlCommand("SELECT Name FROM Companies", connection);

        SqlDataReader reader = cmd.ExecuteReader();


        while (reader.Read())
        {
            var counter = reader["Name"];
            companyNames.Add(reader["Name"]);
        }
        reader.Close();
        connection.Close();
    }

    public void Request(string name)
    {
        SqlConnection connection = new SqlConnection(_connectionStr);
        connection.Open();
        SqlCommand cmd = new SqlCommand("SELECT * FROM Companies WHERE Name = \'" + name + "\'", connection);

        SqlDataReader reader = cmd.ExecuteReader();


        while (reader.Read())
        {
            companyInfo.Add(new Company(reader["Name"], reader["Address"], reader["INN"], reader["Description"]));
        }
        reader.Close();
        connection.Close();
    }
    public void RequestINN(string inn)
    {
 
        SqlConnection connection = new SqlConnection(_connectionStr);
        connection.Open();
        SqlCommand cmd = new SqlCommand("SELECT * FROM Companies WHERE INN = \'" + inn + "\'", connection);

        SqlDataReader reader = cmd.ExecuteReader();


        while (reader.Read())
        {
            companyInfo.Add(new Company(reader["Name"], reader["Address"], reader["INN"], reader["Description"]));
        }
        reader.Close();
        connection.Close();
    }
}

public struct Company
{
    public object name;
    public object address;
    public object inn;
    public object description;

    public Company(object n, object a, object i, object d)
    {
        this.name = n;
        this.address = a;
        this.inn = i;
        this.description = d;
    }
}