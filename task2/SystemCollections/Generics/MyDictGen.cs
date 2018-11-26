using System;
using System.Collections.Generic;

namespace SystemCollections.Generics
{
    class MyDictGen
    {
        public Dictionary<int, int> dict = new Dictionary<int, int>();

        private void Init()
        {
            CompanyData data1 = new CompanyData(101, 101151);
            CompanyData data2 = new CompanyData(102, 101011);
            CompanyData data3 = new CompanyData(103, 967811);
            CompanyData data4 = new CompanyData(104, 251689);

            dict[data1.number] = data1.amount;
            dict[data2.number] = data2.amount;
            dict[data3.number] = data3.amount;
            dict[data4.number] = data4.amount;
        }
        
        public MyDictGen()
        {
            Init();
        }
    }
}
