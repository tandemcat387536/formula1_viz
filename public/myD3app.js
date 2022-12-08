// LINE-UP
//https://lineup.js.org/

// Data
var drivers = [];
var races = [];
var results = [];
var constructors = [];
var driver_standings = [];
var constructor_standings = [];
var lap_times = [];

// D3.js canvases
var winsBarChartArea;
var constructorsWinsBarchartArea;
var overallPosChartArea;

// variables
var width;
var height;    

var selectedSeason;


// DATA LOADING
d3.csv("./public/f1_data/drivers.csv").row(function (d) {
    return {
        driverId: +d["driverId"],
        driverRef: d.driverRef,
        number: d.number,
        code: d.code,
        forename: d.forename,
        surname: d.surname,
        dob: d.dob,
        nationality: d.nationality,
    };
}).get(function(data) {
   drivers = data;
});

d3.csv("./public/f1_data/races.csv").row(function (d) {
    return {
        raceId: +d["raceId"],
        year: +d["year"],
        round: +d["round"],
        circuitId: +d["circuitId"],
        name: d.name,
        date: d.date
    };
}).get(function(data) {
    races = data;
});

d3.csv("./public/f1_data/results.csv").row(function (d) {
    return {
        resultId: +d["resultId"],
        raceId: +d["raceId"],
        driverId: +d["driverId"],
        constructorId: +d["constructorId"],
        number: +d["number"],
        grid: +d["grid"],
        position: +d["position"],
        points: +d["points"],
        rank: +d["rank"]
    };
}).get(function(data) {
    results = data; 
});

d3.csv("./public/f1_data/constructors.csv").row(function (d) {
    return {
        constructorId: +d["constructorId"],
        constructorRef: d.constructorRef,
        name: d.name,
        nationality: d.nationality
    };
}).get(function(data) {
    constructors = data; 
});

d3.csv("./public/f1_data/driver_standings.csv").row(function (d) {
    return {
        driverStandingsId: +d["driverStandingsId"],
        raceId: +d["raceId"],
        driverId: +d["driverId"],
        points: +d["points"],
        position: +d["position"],
        wins: +d["wins"]
    };
}).get(function(data) {
    driver_standings = data; 
});

d3.csv("./public/f1_data/constructor_standings.csv").row(function (d) {
    return {
        constructorStandingsId: +d["constructorStandingsId"],
        raceId: +d["raceId"],
        constructorId: +d["constructorId"],
        points: +d["points"],
        position: +d["position"],
        wins: +d["wins"]
    };
}).get(function(data) {
    constructor_standings = data; 
});

d3.csv("./public/f1_data/lap_times.csv").row(function (d) {
    return {
        raceId: +d["raceId"],
        driverId: +d["driverId"],
        lap: +d["lap"],
        position: +d["position"],
        time: d.time
    };
}).get(function(data) {
    lap_times = data;
    init();
});


//INIT
function init() {
    
    width = screen.width;
    height = screen.height;    

    var select = document.getElementById('selectSeasonBox');
    selectedSeason = 2021;

    for (let i = 2021; i >= 1950; i--) {

        var opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = i;
        select.appendChild(opt);
    }


    winsBarChartArea = d3.select("#winsBarchart_div").append("svg")
    .attr("width", d3.select("#winsBarchart_div").node().clientWidth)
    .attr("height", d3.select("#winsBarchart_div").node().clientHeight);   
    
    constructorsWinsBarchartArea = d3.select("#constructorsWinsBarchart_div").append("svg")
    .attr("width", d3.select("#constructorsWinsBarchart_div").node().clientWidth)
    .attr("height", d3.select("#constructorsWinsBarchart_div").node().clientHeight);   

    overallPosChartArea = d3.select("#overallPosChart_div").append("svg")
    .attr("width", d3.select("#overallPosChart_div").node().clientWidth)
    .attr("height", d3.select("#overallPosChart_div").node().clientHeight);

    seasonSelected();
}

// FUNCTIONS
function seasonSelected() {
    var select = document.getElementById('selectSeasonBox');
    selectedSeason = select.options[select.selectedIndex].value;
    updateSeason();
}

function updateSeason() {
    var seasonRaces = [];
    var lastRaceId = null;
    
    // FIND ALL RACES OF SELECTED SEASON
    for (let i=0; i < races.length; i++) {
        if (races[i].year == selectedSeason) {
            seasonRaces.push(races[i]);
            lastRaceId = races[i].raceId;
        }
    }

    var standgs = getSeasonStandings(driver_standings, lastRaceId);

    updateDriverStandingsTable(standgs, seasonRaces);   
    updateConstructorsStandingsTable(getSeasonStandings(constructor_standings, lastRaceId));    
    
    // DRAW OVERALL POSITIONS DURING SEASON - CONNECTED SCATTER MULTI
    updateOverallPositions(seasonRaces, standgs);
}


function getSeasonStandings(standings, lastRaceId) {

    var seasonStandings = [];
    let i=0;
    // FIND LAST RACE OF SEASON
    while (i < standings.length && standings[i].raceId != lastRaceId) i++
    if (i >= standings.length) {        
        return seasonStandings;
    }
    
    // COLLECT STANDINGS AFTER LAST RACE OF SEASON
    while (standings[i].raceId == lastRaceId) {
        seasonStandings.push(standings[i]);        
        i++;
    }

    // SORT BASED ON FINAL POSITION
    seasonStandings.sort(function (a, b) {return a.position - b.position});
    return seasonStandings;
}

// DRIVER STANDINGS TABLE
function updateDriverStandingsTable(seasonStandings, seasonRaces) {
    
    //constructorsWinsBarchartArea.selectAll("*").remove();

    var table = document.getElementById('driverStandingsTable');

    if (seasonStandings.length==0 || seasonRaces.length==0) {
        table.style.display = "none";
        return;
    }
    
    table.style.display = "inline-table";

    var data = [];
    var mostWins=0;

    var const_data = [];
    var mostCstWins=0;

    // REMOVE ROWS
    while (table.rows.length > 1) {
        table.deleteRow(table.rows.length - 1);
    } 

    // FOR EACH DRIVER ADD ROW TO TABLE
    for (let i=0; i < seasonStandings.length; i++) {
        
        var row = table.insertRow();
        
        var pos = row.insertCell();
        var name = row.insertCell();
        var number = row.insertCell();
        var nationality = row.insertCell();
        var car = row.insertCell();
        var points = row.insertCell();

        pos.innerHTML = seasonStandings[i].position;

        var driver = drivers.find(d => d.driverId == seasonStandings[i].driverId);
        name.innerHTML = driver.forename + " " + driver.surname;
        number.innerHTML = driver.number !== '\\N' ? driver.number : '-';        
        nationality.innerHTML = driver.nationality;
                
        // GET CONSTRUCTOR(S) FOR SELECTED DRIVER (COULD BE MORE THAN 1)
        var cars = new Set();
        for (let j=0; j < seasonRaces.length; j++) {
            var race = results.find(r => r.raceId == seasonRaces[j].raceId && r.driverId == driver.driverId);

            if (race != null) {                
                                
                var cst = constructors.find(c => c.constructorId == race.constructorId).name;                
                cars.add(cst);                
                
                // UPDATE CONSTRUCTORS WINS ARRAY
                var cst_existing = const_data.find(c => c.code == cst);
                if (race.position == 1) var p = 1; else p = 0;
                if (cst_existing != null) { 
                    if (race.position == 1) {
                        cst_existing.wins += p;
                    }
                } else {
                    let c = {
                        code: cst,
                        wins: p
                    }                    
                    const_data.push(c);
                }
                
            }            
        }        
    
        car.innerHTML = Array.from(cars).join(', ');
        points.innerHTML = seasonStandings[i].points;

        // FIRST 3 LETTERS OF LAST NAME USED INSTEAD OF DRIVER CODE
        var c = driver.code;
        if (c ==='\\N') {
            c = driver.surname.slice(0, 3).toUpperCase();            
        }

        // UPDATE DRIVERS WINS ARRAY
        let d = {
            code: c,
            wins: seasonStandings[i].wins
        }

        if (d.wins != 0) {
            data.push(d); 
            if (d.wins > mostWins) mostWins = d.wins;
        }
        
    }

    // REMOVE CONSTRUCTORS WHICH DIDN'T WIN IN THIS SEASON
    const_data = const_data.filter(c => c.wins > 0);
    mostCstWins = Math.max.apply(Math, const_data.map(function (c) {return c.wins}));

    // SORT DRIVERS WIN
    data.sort(function(b, a) {
        return a.wins - b.wins;
    });

    // SORT CONSTRUCTORS WIN
    const_data.sort(function(b, a) {
        return a.wins - b.wins;
    });

    // DRAW DRIVERS WINS BARCHART
    winsBarchart(winsBarChartArea, "#winsBarchart_div", data, mostWins);
    // DRAW CONSTRUCTORS WINS
    winsBarchart(constructorsWinsBarchartArea, "#constructorsWinsBarchart_div", const_data, mostCstWins);
}

function winsBarchart(barChartArea, barChartID, data, mostWins) {

    barChartArea.selectAll("*").remove();

    let thisCanvasWidth = barChartArea.node().clientWidth -20;
    let thisCanvasHeight = barChartArea.node().clientHeight - 30;

    // X axis
    var x = d3.scaleBand()
        .range([ 25, thisCanvasWidth ])
        .domain(data.map(function(d) { return d.code; }))
        .padding(0.2);
    
        barChartArea.append("g")
        .attr("transform", "translate(0," + (thisCanvasHeight) + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "translate(11)")
            .attr("font-size", "12px")
            .attr("stroke", "black")
            .style("text-anchor", "end");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, mostWins+1])
        .range([ thisCanvasHeight , 10])        

        barChartArea.append("g")
        .attr("transform", "translate(25)")
        .call(d3.axisLeft(y).tickFormat(function(d) {
            if (d % 1 == 0) {
              return d3.format(",.0f")(d)
            } else {
              return ""
            }
          }))
        .attr("font-size", "12px")
        .attr("stroke", "black")
        .selectAll("text")
            .attr("font-size", "12px")
            .attr("stroke", "black")

    // ----------------
    // Create a tooltip
    // ----------------
    var tooltip = d3.select(barChartID)
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")  
        .style("position", "relative")
        .style("max-width", "60px")

    // Bars    
    barChartArea.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.code); })
            .attr("y", function(d) { return y(d.wins); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return (thisCanvasHeight) - y(d.wins); })
            .attr("fill", "#04AA6D")
        
            //Our new hover effects
        .on('mouseover', function (d, i) {
            d3.selectAll(".bar").transition()
            .duration('50')
            .attr('opacity', '0.3');

            d3.select(this).transition()
            .duration('50')
            .attr('opacity', '1')
            
            var wins = d3.select(this).datum().wins;                        
            tooltip
                .html("Wins: " + wins)
                .style("opacity", 1)})

        .on('mouseout', function (d, i) {
            d3.selectAll(".bar").transition()
            .duration('50')
            .attr('opacity', '1')

            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1')

            tooltip.style("opacity", 0)})

        .on('mousemove', function (d) {
            console.log(d3.mouse(this)[1])
            tooltip
            .style("left", (d3.mouse(this)[0]) + "px")
            .style("top", (d3.mouse(this)[1] - thisCanvasHeight) + "px")
        })
}

// CONSTRUCTORS STANDINGS TABLE
function updateConstructorsStandingsTable(seasonStandings){
    
    var table = document.getElementById('constructorStandingsTable');
    if (seasonStandings.length == 0) {        
        table.style.display = "none";    
        return;
    }
    
    table.style.display = "inline-table";    
      
    // REMOVE ROWS
    while (table.rows.length > 1) {
        table.deleteRow(table.rows.length - 1);
    } 

    // FOR EACH CONSTRUCTOR ADD ROW TO TABLE
    for (let i=0; i < seasonStandings.length; i++) {
        
        var row = table.insertRow();
        
        var pos = row.insertCell();
        var name = row.insertCell();
        var nationality = row.insertCell();
        var points = row.insertCell();

        pos.innerHTML = seasonStandings[i].position;
        var constructor = constructors.find(c => c.constructorId == seasonStandings[i].constructorId);
        if (constructor == null) {
            table.style.display = "none";
            return;
        }
        name.innerHTML = constructor.name;    
        nationality.innerHTML = constructor.nationality;
        points.innerHTML = seasonStandings[i].points;
    }
}

// OVERALL POSITIONS GRAPH
function updateOverallPositions(seasonRaces, standings) {

    overallPosChartArea.selectAll("*").remove();
    if (seasonRaces.length==0 || standings.length==0) {
        document.getElementById('overallPosChart_div').style.display = "none";     
        document.getElementById('overallPosTitle').style.display = "none"; 
        return;
    }

    document.getElementById('overallPosChart_div').style.display = "inline_table";     

    // ONLY FIRST 24 DRIVERS WILL BE SHOWN (WITH MORE DRIVERS IT WOULDN'T BE NICE)
    while (standings.length >= 24) {
        standings.pop();
    }

    // SORT RACES BASED ON ROUND
    seasonRaces.sort(function (a, b) {return a.round - b.round});
    
    var names = [];
    
    // ARRAY WHERE IS STORED POSITION (FROM END) OF LAST DRIVER IN EVERY RACE - NEEDED FOR SITUATIONS,
    // WHERE SOME DRIVERS DIDN'T RACE EVERY RACE AND STARTED LATER IN THE SEASON
    var lastIndex = Array(seasonRaces.length).fill(1);        

    // PREPARE DATA FOR PLOTTING OVERALL POSITIONS GRAPH
    var dataReady = standings.map(function(s) {

        // FOR EACH DRIVER
        var driver = drivers.find(d => d.driverId == s.driverId);
        names.push(driver.surname);        

        return {
            name: driver.surname,
            values: seasonRaces.map(function(r) {

                var v = driver_standings.find(stdgs => stdgs.raceId == r.raceId && stdgs.driverId == driver.driverId);
                var val;
                if (v == null) {
                    val = driver_standings.filter(stdgs => stdgs.raceId == r.raceId).length + lastIndex[r.round];                    
                    lastIndex[r.round]++;
                } else val = v.position;
                                
                if (val >= 24) val = 23;

                return {
                    round: r.round,
                    pos: val
                }
            })
        };
    })

    // SORT DATA BASED ON ROUND
    for (var i=0; i < dataReady.length; i++) {
        dataReady[i].values.sort(function (a, b) {return a.round - b.round});
    }
    
    // 24 COLORS NEEDED FOR LINE FOR DRIVER
    var colors = ["#F39C12","#48C9B0", "#F39C12", "#626567", "#A2D9CE", "#2ECC71", "#D35400", "#5DADE2",
                  "#922B21","#E74C3C", "#9B59B6", "#3498DB", "#0E6251", "#D4AC0D", "#D35400", "#5D6D7E", 
                  "#6E2C00", "#641E16", "#154360", "#21618C", "#48C9B0", "#7D6608", "#F39C12", "#212F3C"];
    
    // ADD COLOR TO EACH DRIVER
    var myColor = [];
    for (var i=0; i<names.length; i++) {
        var c = colors.pop();        
        myColor.push({
            name: names[i],
            color:c
        });
    }
      
    // ADD X AXIS
    var x = d3.scaleLinear()
        .domain([1, seasonRaces.length])
        .range([ 0, d3.select("#overallPosChart_div").node().clientWidth -200]);
        overallPosChartArea.append("g")
    
    // ADD Y AXIS
    var y = d3.scaleLinear()
        .domain( [standings.length, 0])
        .range([ d3.select("#overallPosChart_div").node().clientHeight - 200, 0 ]);
        overallPosChartArea.append("g")
        .call(d3.axisLeft(y));
             
    // ADD VERTICAL LINES FOR RACES
    var x1=0;
    var x2=0;
    for (var i=0; i<seasonRaces.length; i++) {
        
        overallPosChartArea.append('line')             
            .attr('stroke', 'lightgrey')
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr("x1", x1)
            .attr("y1", 0)
            .attr("x2", x2)
            .attr("y2", d3.select("#overallPosChart_div").node().clientHeight -200);

        overallPosChartArea.append('text')
            .text(seasonRaces[i].name.replace("Grand Prix", ""))     
            .attr("x", x1)
            .attr("y", d3.select("#overallPosChart_div").node().clientHeight -180)
            .attr("transform", "rotate(45 " + x1 + ' ' + (d3.select("#overallPosChart_div").node().clientHeight -180) + ')')
            .attr("fill", "black")
            .attr("font-weight", "bold")
                          
        x1 += (d3.select("#overallPosChart_div").node().clientWidth -200) / (seasonRaces.length-1);
        x2 += (d3.select("#overallPosChart_div").node().clientWidth -200) / (seasonRaces.length-1);
    }       

    // ADD A LEGEND AT THE END OF A LINE
    overallPosChartArea.selectAll("myLabels")
    .data(dataReady)
    .enter()
      .append('g')
      .append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; }) // keep only the last value of each time series
        .attr("transform", function(d) { return "translate(" + x(d.value.round) + "," + y(d.value.pos) + ")"; }) // Put the text at the position of the last point
        .attr("x", 12) // shift the text a bit more right
        .text(function(d) { return d.name; })
        .style("fill", function(d){ return myColor.find(c => c.name == d.name).color })
        .style("font-size", 15)
        .attr("class", "label")
            
        .on('mouseover', function (d, i) {
            d3.selectAll(".label").transition()
            .duration('50')
            .attr('opacity', '0.3')

            d3.select(this).transition()
            .duration('50')
            .attr('opacity', '1')})

        .on('mouseout', function (d, i) {
            d3.selectAll(".label").transition()
            .duration('50')
            .attr('opacity', '1')

            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1')})

    // ADD THE LINES
    var line = d3.line()
        .x(function(d) { return x(+d.round) })
        .y(function(d) { return y(+d.pos) });
    
    overallPosChartArea.selectAll("myLines")
        .data(dataReady)
        .enter()
        .append("path")
            .attr("class", "line")

            .attr("d", function(d){ return line(d.values) } )
            .attr("stroke", function(d){ return myColor.find(c => c.name == d.name).color })
            .style("stroke-width", 4)
            .style("fill", "none")
        
        .on('mouseover', function (d, i) {
            d3.selectAll(".line").transition()
            .duration('50')
            .attr('opacity', '0.3')

            d3.select(this).transition()
            .duration('50')
            .attr('opacity', '1')
                        
        })

        .on('mouseout', function (d, i) {
            d3.selectAll(".line").transition()
            .duration('50')
            .attr('opacity', '1')

            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1')});

}
