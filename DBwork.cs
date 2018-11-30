 public static void GetMultiDep()
        {
            //IEnumerable<string> depIDs = from s in dmsStages select s.DisplayName;
            //Params queryParams = new DBParams();
            //string condition = queryParams.MakeCondition("[Название]", "@names", stageNames);
            //DBItemCollection stages = webStagesList.GetItems(condition, queryParams);

            DBSite site = DBSite.GetSite("http://venice-dev");
            DBWeb depWeb = site.GetWeb("/");
            DBList depList = depWeb.GetList("Departments");

            DBField depField = depList.GetField("ID").As<DBField>();
            DBFieldLookupMulti dbFieldLookupMulti = depList.GetField("Родительское подразделение").As<DBFieldLookupMulti>();


            string selectCondition = "[Название] = N'\"Группа компаний \"ОМК\"'";
            DBItemCollection depItems = depList.GetItems(selectCondition);
            
            // Уровень 1
            foreach (var item in depItems)
                Console.WriteLine("Level One: {0};\t", item.ID);


            // Возвращает список названий подразделений
            List<DBItem> list = null;
            foreach (var item in depItems)
            {
                list = item.GetLookupItems("Родительское подразделение");
                
                //item.GetLookupItems("Родительское подразделение");
            }
            foreach (var item in list)
            {
                Console.WriteLine("Level Two List: {0};\t", item);
            }

                // Уровень 2
            string[] arr = GetParents(depList, depItems);
            foreach (var item in arr)
            Console.WriteLine("Level Two: {0};\t", item);

            
            foreach (string item in arr)
            {
                //GetParents(Convert.ToInt32(item), depList);
            }
                //foreach (var item in depItems)
                //{
                //    DBFieldLookupValueCollection coll = dbFieldLookupMulti.GetLookupValues(item);
                //    Console.WriteLine("Level Two: {0};\t", coll.LookupIDSequence);
                //}
                

            }

        public static string[] GetParents(DBList depList, DBItemCollection depItems)
        {
            string result = null;

            DBFieldLookupMulti dbFieldLookupMulti = depList.GetField("Родительское подразделение").As<DBFieldLookupMulti>();
            foreach (var item in depItems)
            {
                DBFieldLookupValueCollection coll = dbFieldLookupMulti.GetLookupValues(item);
                result = coll.LookupIDSequence;
            }

            string[] arr = result.Split(new char[] { ',' });

            return arr;
        }

        public static DBItemCollection GetParents(int itemid, DBList list)
        {
            DBFieldLookupMulti dbFieldLookupMulti = list.GetField("Родительское подразделение").As<DBFieldLookupMulti>();
            string query = dbFieldLookupMulti.GetSelectCondition(67);

            DBItemCollection items = list.GetItems(itemid + "");
            return items;
        }