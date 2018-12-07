using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.SqlClient;

namespace ADOnet
{
    class Program
    {
        static void Main(string[] args)
        {
            //List<Company> companies = new List<Company> (10);



            //string connectionStr = @"Data Source=VENICE-DEV;
            //                         Initial Catalog=WSSC_Test;
            //                         Integrated Security=True;
            //                         Connect Timeout=30;
            //                         Encrypt=False;
            //                         TrustServerCertificate=False;
            //                         ApplicationIntent=ReadWrite;
            //                         MultiSubnetFailover=False";

            //SqlConnection connection = new SqlConnection(connectionStr);
            //connection.Open();
            //SqlCommand cmd = new SqlCommand("SELECT * FROM Companies", connection);

            //SqlDataReader reader = cmd.ExecuteReader();

            //while (reader.Read())
            //{
            //    companies.Add(new Company(reader["Name"], reader["Address"], reader["INN"], reader["Description"]));

            //}

            //foreach(var company in companies)
            //{
            //    Console.WriteLine("{0}", company.name);
            //    Console.WriteLine("{0}", company.address);
            //    Console.WriteLine(new string('_', 20));
            //}

            //reader.Close();
            //connection.Close();


            Model model = new Model();
            model.Request();
            model.Print();
            //Journal journal = new Journal();
            //journal.Print();

            Console.ReadKey();
            
        }
    }




    //using System.Data.SqlClient;
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


        List<Company> companies = new List<Company>();

        public void Request()
        {
            SqlConnection connection = new SqlConnection(_connectionStr);
            connection.Open();
            SqlCommand cmd = new SqlCommand("SELECT * FROM Companies", connection);

            SqlDataReader reader = cmd.ExecuteReader();

 
            while (reader.Read())
            {
                companies.Add(new Company(reader["Name"], reader["Address"], reader["INN"], reader["Description"]));
            }
            reader.Close();
            connection.Close();
        }

        public void Print()
        {
            foreach (var company in companies)
            {
                Console.WriteLine("{0}", company.name);
                Console.WriteLine("{0}", company.address);
                Console.WriteLine(new string('_', 20));
            }
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
}
