using System;
using System.Collections;
using System.Linq;
using System.Text;

namespace SystemCollections
{
    class MyHashTable
    {
        public Hashtable table = new Hashtable();

        public void Init() {
            CompanyData data1 = new CompanyData(101, 101151);
            CompanyData data2 = new CompanyData(102, 101011);
            CompanyData data3 = new CompanyData(103, 967811);
            CompanyData data4 = new CompanyData(104, 251689);
            

            table[data1.number] = data1.amount;
            table[data2.number] = data2.amount;
            table[data3.number] = data3.amount;
            table[data4.number] = data4.amount;
        }

        public void Print()
        {
            Console.WriteLine(new string('-', 20));
            Console.WriteLine("Number:  Amount: ");
            foreach (DictionaryEntry name in table)
            {
                Console.WriteLine("{0} \t {1}", name.Key, name.Value);
            }
        }

        public void Add(int num, int amt)
        {
            CompanyData data = new CompanyData(num, amt);
            table[data.number] = data.amount;
        }

        public void Input(MyHashTable table)
        {
            try
            {
                Console.WriteLine("Input");
                Console.Write("account number: ");
                int num = Convert.ToInt32(Console.ReadLine());

                Console.Write("account amount: ");
                int amount = Convert.ToInt32(Console.ReadLine());

                table.Add(num, amount);
            }
            catch (FormatException ex)
            {
                Console.WriteLine(ex);
            }
            Console.ReadKey();
        }

        public MyHashTable()
        {
            Init();
        }
    }
}
