using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApp6
{
    class Article
    {
        private string goodsName, shopName;
        private int price;
        public string GoodsName { get { return goodsName; } }
        public string ShopName { get { return shopName; } }
        public int Price { get { return price; }  }

        public string Status
        {
            get
            {
                return string.Format("Name: {0},\nShop: {1},\nPrice: {2}", GoodsName, ShopName, Price);
            }
        }

        public Article(string name, string shop, int price)
        {
            this.goodsName = name;
            this.shopName = shop;
            this.price = price;
        }
    }

    class Store
    {
        Article[] goods = null;

        public Store(Article[] getGoods)
        {
            goods = getGoods;
        }

        public string Info(int index)
        {
            if (index < 0 || index >= goods.Length)
            {
                return "There is no such index.";
            }
            return goods[index].Status;
        }

        public string Info(string name)
        {
            foreach (Article g in goods)
            {
                if (g.GoodsName.Equals(name))
                {
                    return g.Status;
                }
            }
            return "No such article.";
        }
        
        public void Sort(string type)
        {
            if (type == "name")
            {
                Array.Sort(goods, delegate (Article ar1, Article ar2)
                {
                    return ar1.GoodsName.CompareTo(ar2.GoodsName);
                });
            }
            if (type == "shop")
            {
                Array.Sort(goods, delegate (Article ar1, Article ar2)
                {
                    return ar1.ShopName.CompareTo(ar2.ShopName);
                });
            }
            if (type == "price")
            {
                Array.Sort(goods, delegate (Article ar1, Article ar2)
                {
                    return ar1.Price.CompareTo(ar2.Price);
                });
            }
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            // Все виды товаров
            Article ar0 = new Article("Stuff", "A", 5000);
            Article ar1 = new Article("Sword", "A", 6000);
            Article ar2 = new Article("Shield", "B", 3500);
            Article ar3 = new Article("Knife", "B", 2300);
            Article ar4 = new Article("Hammer", "B", 10000);

            // Массив в котором хранятся товары
            Article[] array = new Article[5];
            array[0] = ar0;
            array[1] = ar1;
            array[2] = ar2;
            array[3] = ar3;
            array[4] = ar4;

            Store store = new Store(array);


            //Вывод информации о товарах

            Console.Write("Input index: ");
            int index = int.Parse(Console.ReadLine());
            Console.WriteLine("{0}", store.Info(index));

            Console.Write("Input name: ");
            string name = Console.ReadLine();
            Console.WriteLine("{0}", store.Info(name));

            Console.WriteLine("Press any key to exit.");
            Console.ReadKey();
        }
    }
}
