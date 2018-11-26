using System;
using System.Collections;
using System.Linq;
using System.Text;

namespace SystemCollections
{
    class MyHashTable
    {
        public Hashtable table = new Hashtable();

        CompanyData data1 = new CompanyData(101, 101151);
        CompanyData data2 = new CompanyData(102, 101011);
        CompanyData data3 = new CompanyData(103, 251689);
        CompanyData data4 = new CompanyData(104, 967811);

        public void Init() {
            table[data1.Number] = data1.Amount;
            table[data2.Number] = data2.Amount;
            table[data3.Number] = data3.Amount;
            table[data4.Number] = data4.Amount;
        }

        public void Print()
        {
            foreach (DictionaryEntry name in table)
            {
                Console.WriteLine("{0} - {1}", name.Key, name.Value);
            }
        }
    }
}
