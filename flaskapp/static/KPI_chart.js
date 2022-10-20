//creator: rubin
//last modified: nov 30, 2021
//purpose: get the json fire object, extract the properties / attribute, aggregate them and show in charts

//GET fire json object

function load_KPI_Chart() {

    var json_fire_data = L.geoJson(fires)._layers

    //check if the fire object has any data
    if (Object.keys(json_fire_data).length > 0) {

        // PART 0 - Common Fire Stat Data
        //drop the table if already exist to delete previous data
        try {
            alasql("DROP TABLE IF EXISTS WILDFIRE_STAT")
        }
        catch (err) {
            console.log("Could not drop table as it may not exist")
            console.log(err.message)
        }

        //create the stat table
        alasql("CREATE TABLE IF NOT EXISTS WILDFIRE_STAT (agency string,nfireid number,sdate string,edate string,year number,firecaus number,adj_ha number,burnclas number)")

        //loop through the fire json object and parse the properties, and insert them into alaSQL table
        //see this wiki on alaSQL commands https://github.com/agershun/alasql/wiki
        // Add 2 columns: burnclas and IN_VIEWPORT for future dev

        for (const leaf_id in json_fire_data) {
            agency = json_fire_data[leaf_id].feature.properties.agency
            nfireid = json_fire_data[leaf_id].feature.properties.nfireid
            sdate = json_fire_data[leaf_id].feature.properties.sdate
            edate = json_fire_data[leaf_id].feature.properties.edate
            year = json_fire_data[leaf_id].feature.properties.year
            firecaus = json_fire_data[leaf_id].feature.properties.firecaus
            adj_ha = json_fire_data[leaf_id].feature.properties.adj_ha
            burnclas = json_fire_data[leaf_id].feature.properties.burnclas
            //IN_VIEWPORT = null  // Removed IN_VIEWPORT since we switched to geojson data object in memory
            //console.log(`agency: ${agency}, nfireid: ${nfireid}, sdate: ${sdate}, edate: ${edate}, year: ${year}, firecaus: ${firecaus}, adj_ha: ${adj_ha}, burnclas: ${burnclas}, IN_VIEWPORT: ${IN_VIEWPORT}`)
            alasql('INSERT INTO WILDFIRE_STAT VALUES (?,?,?,?,?,?,?,?)', [agency, nfireid, sdate, edate, year, firecaus, adj_ha, burnclas])
        };

        // Prepare the DISCRETE_COLORS scheme manually
        const DISCRETE_COLORS = {
            red: 'rgb(255, 99, 132)',
            orange: 'rgb(255, 159, 64)',
            yellow: 'rgb(255, 205, 86)',
            green: 'rgb(75, 192, 192)',
            blue: 'rgb(54, 162, 235)',
            purple: 'rgb(153, 102, 255)',
            grey: 'rgb(201, 203, 207)'
          };

        // PART 1 - Count of Fire - Bar chart
        //FOR TESTING ONLY WITH RANDOM NUMBERS - Tested OK - Disabled temporarily
        //var random_year = 2000 + Math.round(Math.random() * 10)
        //aggregate_count_of_fire = alasql("SELECT agency, COUNT(nfireid) AS COUNT_OF_FIRE, year FROM WILDFIRE_STAT WHERE year = (?) GROUP BY agency, year",[random_year])
        aggregate_count_of_fire = alasql("SELECT agency, COUNT(nfireid) AS count_of_fire, year FROM WILDFIRE_STAT GROUP BY agency, year")
        //console.log("count of fire data")
        //console.log(aggregate_count_of_fire)

        x_years_1 = []
        y_fire_count = []
        for (const i in Object.values(aggregate_count_of_fire)) {
            x_years_1.push(Object.values(aggregate_count_of_fire)[i].year)
            y_fire_count.push(Object.values(aggregate_count_of_fire)[i].count_of_fire)
        }

        document.getElementById('KPI_CHART1').remove()
        document.querySelector("#KPI_CHART_DIV1").innerHTML = '<canvas id="KPI_CHART1"></canvas>';


        // Parepare the GRADUAL_COLORS scheme
        // GRADUAL_CORLORS is associated with dataLength_1, which changes per the geojson object in memory
        const dataLength_1 = x_years_1.length;
        const colorScale = d3.interpolateInferno;
        const colorRangeInfo = {colorStart: 0, colorEnd: 1, useEndAsStart: true,};
        const GRADUAL_COLORS = interpolateColors(dataLength_1, colorScale, colorRangeInfo);
        // Draw the bar chart
        const ctx1 = document.getElementById('KPI_CHART1').getContext('2d');
        const kpiChart1 = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: x_years_1,
                datasets: [{
                    label: 'Count of Fire',
                    data: y_fire_count,
                    borderWidth: 1,
                    backgroundColor: GRADUAL_COLORS,  // New Color scheme - tested OK
                    //backgroundColor: ["blue"],
                }]
            },
            options: {
                scales: {
                    xAxes: {
                      ticks: {
                        autoSkip: true,
                        maxTicksLimit: 8,
                        maxRotation: 0,
                        minRotation: 0
                      }
                    },
                    yAxes: {
                        beginAtZero: true
                    }
                }
            }
        });
/*
        // Failed to implement the COLOR Scheme - The higher the Y value is, the darker the fillcolor
        const myDataset = kpiChart1.data.datasets[0];
        for(var i=0;i<myDataset.data.length;i++){
           //var color=GRADUAL_COLORS[i];
           //You can check for bars[i].value and put your conditions here
           if myDataset.data[i] <5 {myDataset.backgroundCorlor = "yellow";}
           else if myDataset.data[i] <15 {myDataset.backgroundCorlor = "orange";}
           else if myDataset.data[i] <25 {myDataset.backgroundCorlor = "brown";}
           else {myDataset.backgroundCorlor = "red";};    
        };
        kpiChart1.update(); //update the chart
*/

        // PART 2 - Fire Cause - Bar charts
        //FOR TESTING ONLY WITH RANDOM NUMBERS - Tested OK - Disabled temporarily
        //var random_year = 2000 + Math.round(Math.random() * 10)
        //aggregate_total_duration = alasql("SELECT agency, COUNT(nfireid) AS COUNT_OF_FIRE, year FROM WILDFIRE_STAT WHERE year = (?) GROUP BY agency, year",[random_year])
        aggregate_fire_cause = alasql("SELECT COUNT(nfireid) as COUNT_OF_FIRE, FIRE_CAUSE FROM (SELECT nfireid, CASE WHEN firecaus=0 THEN 'Unknown' WHEN firecaus=1 THEN 'Other' WHEN firecaus=2 THEN 'Lightning' WHEN firecaus=3 THEN 'Industry' ELSE 'Human' END AS FIRE_CAUSE from WILDFIRE_STAT) GROUP BY FIRE_CAUSE");
        //console.log("firecause Frequency");
        //console.log(aggregate_fire_cause);

        x_firecause = []
        y_count_of_fire = []
        for (const i in Object.values(aggregate_fire_cause)) {
            x_firecause.push(Object.values(aggregate_fire_cause)[i].FIRE_CAUSE)
            y_count_of_fire.push(Object.values(aggregate_fire_cause)[i].COUNT_OF_FIRE)
        }

        document.getElementById('KPI_CHART2').remove();
        document.querySelector("#KPI_CHART_DIV2").innerHTML = '<canvas id="KPI_CHART2"></canvas>';

        // Draw the chart
        const ctx2 = document.getElementById('KPI_CHART2').getContext('2d');
        const kpiChart2 = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: x_firecause,
                datasets: [
                    {
                        label: 'Fire Cause',
                        data: y_count_of_fire,
                        borderColor: DISCRETE_COLORS.red,
                        backgroundColor: ["red", "blue", "orange", "purple", "cyan"],
                    }    ],
                options: {
                  responsive: true,
                  plugins: {
                    //legend: {position: 'top',},
                    //title: {
                      //display: true,
                      //text: 'Fire Cause'
                    //}
                  }
                }
            }
        });


        // PART 3 - Avg Duration - Line chart
        //FOR TESTING ONLY WITH RANDOM NUMBERS - Tested OK - Disabled temporarily
        //var random_year = 2000 + Math.round(Math.random() * 10)
        //aggregate_avg_duration = alasql("SELECT agency, COUNT(nfireid) AS COUNT_OF_FIRE, year FROM WILDFIRE_STAT WHERE year = (?) GROUP BY agency, year",[random_year])
        aggregate_avg_duration = alasql("SELECT agency, AVG(DATE(edate)-DATE(sdate))/1000/3600/24 AS avg_duration, year FROM WILDFIRE_STAT GROUP BY agency, year")
        //console.log("avg duration")
        //console.log(aggregate_avg_duration)

        x_years_3 = []
        y_avg_duration = []
        for (const i in Object.values(aggregate_avg_duration)) {
            x_years_3.push(Object.values(aggregate_avg_duration)[i].year)
            y_avg_duration.push(Object.values(aggregate_avg_duration)[i].avg_duration)
        }

        document.getElementById('KPI_CHART3').remove()
        document.querySelector("#KPI_CHART_DIV3").innerHTML = '<canvas id="KPI_CHART3"></canvas>';

        // Draw the chart
        const ctx3 = document.getElementById('KPI_CHART3').getContext('2d');
        const kpiChart3 = new Chart(ctx3, {
            type: 'line',
            data: {
                labels: x_years_3,
                datasets: [{
                        label: 'Avg Duration (Days)',
                        data: y_avg_duration,
                        borderColor: DISCRETE_COLORS.red,
                        fill: false}
                ]
            },
            options: {
                  scales: {
                    xAxes: {
                      ticks: {
                        autoSkip: true,
                        maxTicksLimit: 8,
                        maxRotation: 0,
                        minRotation: 0
                      }
                    },
                    yAxes: {
                        beginAtZero: true
                    }
                },
                responsive: true,
                //plugins: {
                  //title: {
                    //display: true,
                    //text: 'AVG DURATION (Days)'
                  //},
                //},

                interaction: {
                  intersect: false,
                }
            }
        });


        // PART 4 - Fire Duration - Bar Chart
        aggregate_fire_durations = alasql("SELECT duration_category, COUNT(nfireid) AS COUNT_OF_FIRE FROM (SELECT agency, nfireid, ((DATE(edate)-DATE(sdate))/1000/3600/24) AS DURATION_DAYS, CASE WHEN ((DATE(edate)-DATE(sdate))/1000/3600/24) <1 THEN '<1 Day' WHEN ((DATE(edate)-DATE(sdate))/1000/3600/24) >=1 AND ((DATE(edate)-DATE(sdate))/1000/3600/24) <7 THEN '<7 Days' WHEN ((DATE(edate)-DATE(sdate))/1000/3600/24) >=7 AND ((DATE(edate)-DATE(sdate))/1000/3600/24) <50 THEN '<50 Days' WHEN ((DATE(edate)-DATE(sdate))/1000/3600/24) >=50 AND ((DATE(edate)-DATE(sdate))/1000/3600/24) <200 THEN '<200 Days' ELSE 'Undef' END AS duration_category FROM WILDFIRE_STAT) GROUP BY duration_category")
        // console.log(aggregate_fire_durations)

        x4_fire_duration_category = []
        y4_number_of_fire = []
        for (const i in Object.values(aggregate_fire_durations)) {
            x4_fire_duration_category.push(Object.values(aggregate_fire_durations)[i].duration_category)
            y4_number_of_fire.push(Object.values(aggregate_fire_durations)[i].COUNT_OF_FIRE)
        }
        //console.log(y4_number_of_fire)

        document.getElementById('KPI_CHART4').remove();
        document.querySelector("#KPI_CHART_DIV4").innerHTML = '<canvas id="KPI_CHART4"></canvas>';

        // Draw the chart
        const ctx4 = document.getElementById('KPI_CHART4').getContext('2d');
        const kpiChart4 = new Chart(ctx4, {
            type: 'bar',
            data: {
                labels: x4_fire_duration_category,
                datasets: [
                    {
                        label: 'Fire Duration',
                        data: y4_number_of_fire,
                        borderColor: DISCRETE_COLORS.red,
                        backgroundColor: ["green", "navy", "blue", "sheelblue", "cyan"],
                    }
                ],
                options: {
                  responsive: true,
                  plugins: {
                    //legend: {position: 'top',},
                    title: {
                      display: true,
                      text: 'Fire Duration'
                    }
                  }
                }
            }
        });

        var acc = [];
        //PART 5 - Info Cards
        // Define custom MYMEDIAN function for alaSQL
        alasql.aggr.MYMEDIAN = function(v,s){

          if(typeof s == 'undefined') {
              acc = [v];
              return v;   
          } else {
              acc.push(v);
              var p = acc.sort();
              return acc[(Math.floor(p.length/2))];         
          }
        };
        //var res = alasql('SELECT MYMEDIAN(((DATE(edate)-DATE(sdate))/1000/3600/24)) FROM WILDFIRE_STAT');
        //console.log(res);

        max_fire_durations = alasql("SELECT MAX(((DATE(edate)-DATE(sdate))/1000/3600/24)) AS MAX_FIRE_DURATION_DAYS FROM WILDFIRE_STAT")
        avg_fire_durations = alasql("SELECT AVG(((DATE(edate)-DATE(sdate))/1000/3600/24)) AS AVG_FIRE_DURATION_DAYS FROM WILDFIRE_STAT")
        median_fire_durations = alasql("SELECT MYMEDIAN(((DATE(edate)-DATE(sdate))/1000/3600/24)) AS MED_FIRE_DURATION_DAYS FROM WILDFIRE_STAT")
        //median_fire_durations = alasql("SELECT ROUND(MYMEDIAN(((DATE(edate)-DATE(sdate))/1000/3600/24)),2) AS MED_FIRE_DURATION_DAYS FROM WILDFIRE_STAT")
        //console.log('median fire duration:')
        // console.log("median fire" + median_fire_durations[0].MED_FIRE_DURATION_DAYS);
        //concole.log(max_fire_durations[0].MAX_FIRE_DURATION_DAYS)
        document.getElementById('KPI_CHART_DIV5_inner').remove();
        document.querySelector("#KPI_CHART_DIV5").innerHTML = "<div id = \"KPI_CHART_DIV5_inner\">\
                    <h6 class=\"mb-0\">Max Fire Duration</h6><p class=\"mb-0 opacity-75\">"+max_fire_durations[0].MAX_FIRE_DURATION_DAYS+" Days</p>\
                    <h6 class=\"mb-0\">Average Fire Duration</h6><p class=\"mb-0 opacity-75\">"+Math.round(avg_fire_durations[0].AVG_FIRE_DURATION_DAYS*100)/100+" Days</p>\
                    <h6 class=\"mb-0\">Median Fire Duration</h6><p class=\"mb-0 opacity-75\">"+median_fire_durations[0].MED_FIRE_DURATION_DAYS+" Days</p>\
                    </div>"


        //Pie Chart
	var cluster_all = fires.features.map(fire => fire.properties.Cluster)
	var val1 = cluster_all.filter(c => c === 1).length
	var val2 = cluster_all.filter(c => c === 2).length
	var val3 = cluster_all.filter(c => c === 3).length
	var val_tot = (val1+val2+val3)/100.0
	val1 = val1 / val_tot
	val2 = val2 / val_tot
	val3 = val3 / val_tot
	val1 = val1.toFixed(1)
	val2 = val2.toFixed(1)
	val3 = val3.toFixed(1)
	var pie_value = [val1, val2, val3]
	var pie_label = ["1", "2", "3"]
	var pie_colors = ["#ab5e0c", "#0c17ab", "#ab0c9e"]

        document.getElementById('Pie_chart').remove();
        document.querySelector("#PIE_CHART_DIV").innerHTML = '<canvas id="Pie_chart"></canvas>';

        const pch = document.getElementById('Pie_chart').getContext('2d');
        const pieChart = new Chart(pch, {
			type: 'pie',
			data: {
			  labels: pie_label,
			  datasets: [{
				label: "Percent (%)",
				backgroundColor: pie_colors,
				data: pie_value
			  }]
			},
			options: {
			  responsive: true,
			  plugins: {
				//legend: {position: 'top',},
				title: {
				  display: true,
				  text: 'Wildfire Clusters (%)'
				}
			  }
			}
		});




    }
    else {console.log("NO DATA FOUND")}

}
