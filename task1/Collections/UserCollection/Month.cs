namespace Collection.UserCollections
{
    class Month
    {
        public static string Name { get; set; }
        public static int Year { get; set; }

        /// </summary> Возвращает количество дней месяца
        /// <param name="id"> id месяца в коллекции </param>
        /// <returns>Количество дней в месяце</returns>
        public int CountDays(int id)
        {
            id++;   // увеличиваем значение поскольку отсчет в массивах начинается с 0
            return System.DateTime.DaysInMonth(Year, id);
        }

        public Month(string name, int year)
        {
            Name = name;
            Year = year;
        }

    }
}
