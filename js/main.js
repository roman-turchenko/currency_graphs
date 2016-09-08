/**
 * Created by roman.turchenko on 07.09.2016.
 */
Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()) / 7);
}

var graphData = {},
    group = "perDay";

var Data = function(dateFunction){

    this.x = [];
    this.y = [];
    this.counter = 0;
    this.summ = 0;
    this.dateFunction = function(dateObject){
        if (dateObject instanceof Date && typeof dateObject[dateFunction] == 'function'){
            return dateObject[dateFunction]();
        }
        return null;
    };
    this.previousDate = null;
};

Data.prototype = {

    group: function(currentDate, currencyValue, isLastIteration){

        var previousDateValue = this.dateFunction(this.previousDate),
            currentDateValue  = this.dateFunction(currentDate);

        if ( this.previousDate !== null && previousDateValue !== currentDateValue ){

            this.setX(previousDateValue);
            this.setY(this.summ / this.counter);

            this.summ = currencyValue;
            this.counter = 1;

            // if last iteration and only one item
            if (isLastIteration){
                this.setX(currentDateValue);
                this.setY(this.summ / this.counter);
            }
        }
        // last iteration, and number of items more then one
        else if (isLastIteration){

            this.summ += currencyValue;
            ++this.counter;

            this.setX(currentDateValue);
            this.setY(this.summ / this.counter);
        }
        else{
            this.summ += currencyValue
            ++this.counter;
        }

        this.previousDate = currentDate;
    },

    setX: function(x){
        this.x.push(x);
    },

    setY: function(y){
        this.y.push(+y.toFixed(4));
    },

    get: function(){
        return {x: this.x, y: this.y}
    }
};


function requestData(){

    var currencyCode = $("#currency").val(),
        startDate = $("#startDate").val(),
        endDate = $("#endDate").val();

        // data objects init
        graphData = {
            perDay: new Data(),
            perWeek: new Data("getWeek"),
            perMonth: new Data("getMonth")
        };

    if (currencyCode == "" || startDate == "" || endDate == ""){
        alert("currencyCode, startDate and endDate shouldn't be empty");
    }
    else{

        var apiRequest = "./api/?currencyCode=" + currencyCode + "&startDate=" + startDate + "&endDate=" + endDate;

        $.get(apiRequest, function(data){

            if (typeof data.Record !== 'undefined' && data.Record.length > 0){

                for (var i = 0; i < data.Record.length; i++){

                    var dateArray = data.Record[i]['@attributes'].Date.split(".");
                    var dateEnFormat = dateArray[1]+'.'+dateArray[0]+'.'+dateArray[2];

                    var recordDate = new Date(dateEnFormat),
                        isLastIteration = (i == (data.Record.length - 1)),
                        currencyValue = parseFloat(data.Record[i].Value.replace(",", "."));

                    // per day
                    graphData.perDay.setX(data.Record[i]['@attributes'].Date);
                    graphData.perDay.setY(currencyValue);

                    // group data per week
                    graphData.perWeek.group(recordDate, currencyValue, isLastIteration);

                    //group data per day
                    graphData.perMonth.group(recordDate, currencyValue, isLastIteration);
                }

                drawGraph(graphData[group].get());
            }
            else{

                alert("Error: " + JSON.stringify(data));
            }
        });
    }
}

function drawGraph(graphData){

    $('#container').highcharts({
        title: {
            text: 'График по котировкам рубля относительно 6 мировых резервных валют',
            x: -20 //center
        },
        subtitle: {
            text: 'Source: www.cbr.ru',
            x: -20
        },
        xAxis: {
            categories: graphData.x
        },
        yAxis: {
            title: {
                text: 'RUR'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: ' RUR'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: $("#currency").find("option:selected").html(),
            data:  graphData.y
        },
            {
                type: 'line',
                name: 'Trend',
                color: (graphData.y[0] > graphData.y[graphData.y.length-1] ? "#00ff00" : "#ff0000"),
                data: [[0, graphData.y[0]], [graphData.x.length-1, graphData.y[graphData.y.length-1]]],
                marker: {
                    enabled: false
                }
            }]
    });
}


$(document).ready(function(){

    // bind events on controls
    $("#currency").on("change", function(){
        requestData();
    });

    $("#startDate").on("change", function(){
        requestData();
    });

    $("#endDate").on("change", function(){
        requestData();
    });

    $(".group").on("change", function(){
        group = this.value;
        drawGraph(graphData[group].get());
    });

    requestData();
});