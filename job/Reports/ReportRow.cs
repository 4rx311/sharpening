using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WSSC.V4.DMS.OMK.ComplexReports
{
    //Строка табличной секции - элементы канцтовара + информация о количестве и общей стоимости
    public class ReportItem
    {
        public string Name;
        public string Article;
        public int Count;
        public double Price;
        public double Amount;

        public ReportItem(string name, string article, int count, double price, double amount)
        {
            this.Name = name;
            this.Article = article;
            this.Count = count;
            this.Price = price;
            this.Amount = amount;
        }
    }

}
