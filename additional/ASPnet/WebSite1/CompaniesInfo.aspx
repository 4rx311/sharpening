<%@ Page Language="C#" AutoEventWireup="true" CodeFile="CompaniesInfo.aspx.cs" Inherits="CompaniesInfo" %>

<!DOCTYPE html>
<style>
    table,th,td {
      border : 0px;
      border-collapse: collapse;
    }
    th,td {
      padding: 3px;
      font-weight:100;
    }
    #Text1 {
        height: 20px;
        width: 180px;
    }
    #Text2 {
        height: 20px;
        width: 180px;
    }
</style>
<style>
* {
  box-sizing: border-box;
}

#inputInn {
  background-position: 10px 10px;
  background-repeat: no-repeat;
  width: 35%;
  font-size: 16px;
  padding: 12px 20px 12px 40px;
  border: 1px solid #ddd;
  margin-bottom: 12px;
}

#inputName {
  background-position: 10px 10px;
  background-repeat: no-repeat;
  width: 35%;
  font-size: 16px;
  padding: 12px 20px 12px 40px;
  border: 1px solid #ddd;
  margin-bottom: 12px;
}

#table {
  border-collapse: collapse;
  width: 100%;
  border: 1px solid #ddd;
  font-size: 14px;
}

#table th, #table td {
  text-align: left;
  padding: 12px;
}

#table tr {
  border-bottom: 1px solid #ddd;
}

#table tr.header, #myTable tr:hover {
  background-color: #f1f1f1;
}
</style>


<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>

<body style="margin-left: 10px">
    <h1>The XMLHttpRequest Object</h1>

    <form id="form1" runat="server">
        <select id="select" onchange="showCompanyByName(this.value)">
            <option value="">Select a company:</option>
        </select>

    <p id="showData" style="font-weight: bold;">

    </form>

    <h2>Companies List</h2>
    <input type="text" id="inputName" onkeyup="tidySearch('inputName', 0)" placeholder="Search for names.." title="Type in a name">
    <input type="number" id="inputInn" onkeyup="tidySearch('inputInn', 2)" placeholder="Search for INN.." title="Type in an INN">
    <p id="showTable" style="font-weight: bold;">

    <%--<form action="CompaniesInfo.aspx">
        <p style="font-weight: bold">
            Name:   <input type="text" id="inputName" value="Enter Company Name"/></p>
        <p style="font-weight: bold;">
            INN:    <input type="number" id="inputINN" value="0000000000" /></p>
        <input type="button" value="Найти" onclick="showCompanyByINN(document.getElementById('inputName').value, document.getElementById('inputINN').value)">
    </form>--%>

    </body>
</html>


<script>
    function tidySearch(inputId, columnNo) {  
      var input = document.getElementById(inputId);
        
      var filter = input.value.toUpperCase();
      var table = document.getElementById("table");
      var tr = table.getElementsByTagName("tr");
      for (var i = 0; i < tr.length; i++) {
        var td = tr[i].getElementsByTagName("td")[columnNo];
        if (td) {
          if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }
        }       
      }
    }      

    function showAll() {
        var request;
        request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                dynamicTableFromJSON(request.responseText, "showTable");
            }
        };
        request.open("GET", "GetCompanyFullList.ashx", true);
        request.send();
    }

    function showCompanyByName(str) {
        var request;
        if (str == "") {
            document.getElementById("showData").innerHTML = "";
            return;
        }
        request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                printTable(request.responseText);
            }
        };
        request.open("GET", "GetCompanyInfo.ashx?t=0&q=" + str, true);
        request.send();
    }

    function showCompanyByINN(str) {
        var request;
        if (str == "") {
            document.getElementById("showData").innerHTML = "";
            return;
        }
        request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                printTable(request.responseText);
            }
        };
        request.open("GET", "GetCompanyInfo.ashx?t=1&q=" + str, true);
        request.send();
    }

    function showNames() {
        var request;
        request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {

                var jsonData = JSON.parse(request.responseText);
                createOptions(jsonData);
            }
        };
        request.open("GET", "GetCompanyList.ashx", true);
        request.send();
    }

    function createOptions(jsonData) {
        var names = jsonData;
        var select = document.createElement('select');

        var html = '';
        for (var i = 0; i < names.length; i++) {
            var newOption = document.createElement('option');
            html += '<option value="' + JSON.stringify(names[i]) + '">' + names[i] + '</option>';
            
            newOption.innerHTML = html;
            document.getElementById('select').appendChild(newOption);
            var html = '';
        }
    }

    function printTable(jsonData) {
        var json = JSON.parse(jsonData);
        var jsonObj = json[0];
        var table = document.createElement("table");

        //row 1
        var row1 = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.appendChild(document.createTextNode("Адрес:"));
        td1.style.cssText = 'font-weight:bold;'
        var td2 = document.createElement("td");
        td2.style.cssText = 'font-style:italic;'
        td2.innerHTML = jsonObj.address;
        
        row1.appendChild(td1);
        row1.appendChild(td2);
        table.appendChild(row1);

        //row2
        var row2 = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.appendChild(document.createTextNode("Название:"));
        td1.style.cssText = 'font-weight:bold;'
        var td2 = document.createElement("td");
        td2.style.cssText = 'font-style:italic;'
        td2.innerHTML = jsonObj.name;

        row2.appendChild(td1);
        row2.appendChild(td2);
        table.appendChild(row2);

        //row 3
        var row3 = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.appendChild(document.createTextNode("ИНН:"));
        td1.style.cssText = 'font-weight:bold;'
        var td2 = document.createElement("td");
        td2.style.cssText = 'font-style:italic;'
        td2.innerHTML = jsonObj.inn;

        row3.appendChild(td1);
        row3.appendChild(td2);
        table.appendChild(row3);

        //row 4
        var row4 = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.appendChild(document.createTextNode("Описание:"));
        td1.style.cssText = 'font-weight:bold;'
        var td2 = document.createElement("td");
        td2.style.cssText = 'font-style:italic;'
        td2.innerHTML = jsonObj.description;

        row4.appendChild(td1);
        row4.appendChild(td2);
        table.appendChild(row4);

        var container = document.getElementById("showData");
        container.innerHTML = "";
        container.appendChild(table);

    } 

    function dynamicTableFromJSON(jsonData, id) {
        var json = JSON.parse(jsonData);

        // extract header values from json
        var values = [];
        for (var i = 0; i < json.length; i++) {
            for (var key in json[i]) {
                if (values.indexOf(key) === -1) {
                    values.push(key);
                }
            }
        }

        var table = document.createElement("table");
        table.setAttribute("id", "table");

        // create table header
        var tr = table.insertRow(-1);                   

        for (var i = 0; i < values.length; i++) {
            var th = document.createElement("th");      // header
            th.innerHTML = values[i];
            tr.appendChild(th);
        }

        // add json data to the table
        for (var i = 0; i < json.length; i++) {
            tr = table.insertRow(-1);
            for (var j = 0; j < values.length; j++) {
                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = json[i][values[j]];
            }
        }

        // print created table
        var container = document.getElementById(id);
        container.innerHTML = "";
        container.appendChild(table);
    } //can print multiple data from json

    window.onload = function () {
        showNames();
        showAll();
    }
</script>