using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

/*  Написать LINQ запрос, выбирающий сотрудников с должностью "Менеджер", 
 *  у которых ФИО начинается на букву "А" и отсортировать по убыванию зарботной платы.
 */

namespace ConsoleApp20
{
    class Employee
    {
        public string name;
        public string position;
        public int salary;
        
        public Employee(string nam, string pos, int sal)
        {
            name = nam;
            position = pos;
            salary = sal;
        }
    }
    class Program
    {
        static void Main(string[] args)
        {
            List<Employee> peons = new List<Employee> (5);
            peons.Add(new Employee("Vasya", "Programmer", 1500));
            peons.Add(new Employee("Alex", "Janitor", 2000));
            peons.Add(new Employee("Artyom", "Manager", 1600));
            peons.Add(new Employee("Anastasia", "Manager", 2100));
            peons.Add(new Employee("Oksana", "Manager", 2000));

            var query =
                from peon in peons
                where peon.name.StartsWith("A") && peon.position == "Manager"
                orderby peon.salary descending
                select peon.name;
            using (SqlConnection cn = new SqlConnection())
            {
                cn.Open();

            }

            try
            {
                SqlConnection cn = new SqlConnection();
                cn.Open();

            }
            catch (Exception ex)
            {

            }
            finally
            {
                
            }

                foreach (string s in query)
                {
                    Console.WriteLine("{0}", s);
                }

            Console.ReadKey();
        }
    }
}
