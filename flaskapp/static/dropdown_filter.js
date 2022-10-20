// N.B. Different js files still use the same var name space!
var dropDown_years = ['', 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];
var dropDown_provinces = ['',"'AB'","'BC'","'MB'","'NB'","'NL'","'NS'","'NT'","'NU'","'ON'","'QC'","'SK'","'YT'","'PC-BA'","'PC-EI'","'PC-GL'","'PC-GR'","'PC-JA'","'PC-KG'","'PC-KO'","'PC-LM'","'PC-NA'","'PC-PA'","'PC-PU'","'PC-RE'","'PC-RM'","'PC-TN'","'PC-VU'","'PC-WB'","'PC-WL'","'PC-WP'","'PC-YO'"];
var dropDown_causes = [-1,0.0,1.0,2.0,3.0,4.0];
var listOfCauses = ['','Unknown','Other','Lightning','Industry','Human'];
var dropDown_clusters = ['',1,2,3];


  /* ************************* */
 /* Data Filter Dropdown Code */
/* ************************* */

// Year Start Drop Down
d3.select("#yearStartDropdown")
.selectAll('option')
.data(dropDown_years)
.enter()
.append('option')
.text(function (d) { return d; }) // text showed in the menu
.attr("value", function (d) { return d; }); // corresponding value returned by the button

// Year End Drop Down
d3.select("#yearEndDropdown")
.selectAll('option')
.data(dropDown_years)
.enter()
.append('option')
.text(function (d) { return d; }) // text showed in the menu
.attr("value", function (d) { return d; }); // corresponding value returned by the button

// Province Drop Down
d3.select("#provinceDropdown")
.selectAll('option')
.data(dropDown_provinces)
.enter()
.append('option')
.text(function (d) { return d.slice(1,-1); }) // text showed in the menu
.attr("value", function (d) { return d; }); // corresponding value returned by the button

// Cause of Fire Drop Down
d3.select("#causeOfFireDropdown")
.selectAll('option')
.data(dropDown_causes)
.enter()
.append('option')
.text(function (d) { return listOfCauses[Math.round(d) + 1]; }) // text showed in the menu
.attr("value", function (d) { return d; }); // corresponding value returned by the button

// Cluster Drop Down
d3.select("#clusterDropdown")
.selectAll('option')
.data(dropDown_clusters)
.enter()
.append('option')
.text(function (d) { return d; }) // text showed in the menu
.attr("value", function (d) { return d; }); // corresponding value returned by the button

