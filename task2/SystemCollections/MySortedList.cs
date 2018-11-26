using System;
using System.Collections;

namespace SystemCollections
{
    class MySortedList
    {
        SortedList sort = new SortedList(new DescendingComparer());
        //MyHashTable table = new MyHashTable();

        public void Init()
        {
            CompanyData data1 = new CompanyData(101, 101151);
            CompanyData data2 = new CompanyData(102, 101011);
            CompanyData data3 = new CompanyData(103, 251689);
            CompanyData data4 = new CompanyData(104, 967811);

            sort[data1.number] = data1.amount;
            sort[data2.number] = data2.amount;
            sort[data3.number] = data3.amount;
            sort[data4.number] = data4.amount;
        }

        public void Print()
        {
            foreach (DictionaryEntry name in sort)
            {
                Console.WriteLine("{0} - {1}", name.Key, name.Value);
            }
        }
    }

    public class DescendingComparer : IComparer
    {
        CaseInsensitiveComparer comparer = new CaseInsensitiveComparer();

        public int Compare(object a, object b)
        {
            int result = comparer.Compare(b, a);
            return result;
        }
    }
}
