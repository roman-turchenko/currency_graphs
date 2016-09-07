/**
 * Created by roman.turchenko on 07.09.2016.
 */
Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()) / 7);
}


function getData(){

    var currencyCode = $("#currency").val(),
        startDate = $("#startDate").val(),
        endDate = $("#endDate").val();

    if (currencyCode == "" || startDate == "" || endDate == ""){
        alert("currencyCode, startDate and endDate shouldn't be empty");
    }
    else{

        var apiRequest = "/api/?currencyCode=" + currencyCode + "&startDate=" + startDate + "&endDate=" + endDate;

        $.get(apiRequest, function(data){
            displayData(data);
        });
    }
}

function convertDateToEng(dateRuFormat){
    var dateArray = dateRuFormat.split(".");
    return dateArray[1]+'.'+dateArray[0]+'.'+dateArray[2];
}

function displayData(data){

    var graphData = {
        perDay: {x:[], y:[]},
        perWeek: {x: [], y:[]},
        perMonth: {x: [], y:[]}
    };

    if (data.Record.length > 0){

        var groupPerWeek = {};
        var previousRecordDate = null;
        var summPerWeek = 0;
        var counterPerWeek = 0;

        for (var i = 0; i < data.Record.length; i++){

            var recordDate = new Date(convertDateToEng(data.Record[i]['@attributes'].Date)),
                isLastItaration = (i == (data.Record.length - 1));

            // per day
            graphData.perDay.x.push(data.Record[i]['@attributes'].Date);
            graphData.perDay.y.push(parseFloat(data.Record[i].Value.replace(",", ".")));

            //console.log(recordDate.getWeek(), "i:"+i);

            // group per weeks
            if ( previousRecordDate !== null && previousRecordDate.getWeek() !== recordDate.getWeek() ){

                //groupPerWeek[previousRecordDate.getWeek()] = summ / counter;
                graphData.perWeek.x.push(previousRecordDate.getWeek());
                graphData.perWeek.y.push(summPerWeek / counterPerWeek);
                summPerWeek = parseFloat(data.Record[i].Value.replace(",", "."));
                counterPerWeek = 1;

                // if last iteration and only one item
                if (isLastItaration){
                    //groupPerWeek[recordDate.getWeek()] = summPerWeek / counterPerWeek;
                    graphData.perWeek.x.push(recordDate.getWeek());
                    graphData.perWeek.y.push(summPerWeek / counterPerWeek);
                }
            }
            // last iteration, and number of items more then one
            else if (isLastItaration){

                summPerWeek += parseFloat(data.Record[i].Value.replace(",", "."));
                ++counterPerWeek;
                //groupPerWeek[recordDate.getWeek()] = summPerWeek / counterPerWeek;
                graphData.perWeek.x.push(recordDate.getWeek());
                graphData.perWeek.y.push(summPerWeek / counterPerWeek);
                //console.log("end", i, data.Record.length);
            }
            else{
                summPerWeek += parseFloat(data.Record[i].Value.replace(",", "."));
                ++counterPerWeek;
            }

            // group per month
            if ( previousRecordDate !== null && previousRecordDate.getMonth() !== recordDate.getMonth() ){

                //groupPerWeek[previousRecordDate.getMonth()] = summ / counter;
                graphData.perMonth.x.push(previousRecordDate.getMonth());
                graphData.perMonth.y.push(summPerWeek / counterPerWeek);
                summPerWeek = parseFloat(data.Record[i].Value.replace(",", "."));
                counterPerWeek = 1;

                // if last iteration and only one item
                if (isLastItaration){
                    //groupPerWeek[recordDate.getMonth()] = summPerWeek / counterPerWeek;
                    graphData.perMonth.x.push(recordDate.getMonth());
                    graphData.perMonth.y.push(summPerWeek / counterPerWeek);
                }
            }
            // last iteration, and number of items more then one
            else if (isLastItaration){

                summPerWeek += parseFloat(data.Record[i].Value.replace(",", "."));
                ++counterPerWeek;
                //groupPerWeek[recordDate.getMonth()] = summPerWeek / counterPerWeek;
                graphData.perMonth.x.push(recordDate.getMonth());
                graphData.perMonth.y.push(summPerWeek / counterPerWeek);
                //console.log("end", i, data.Record.length);
            }
            else{
                summPerWeek += parseFloat(data.Record[i].Value.replace(",", "."));
                ++counterPerWeek;
            }

            previousRecordDate = recordDate;
        }

        console.log(graphData);

        drawGraph(graphData.perMonth);
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
            valueSuffix: 'RUR'
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
                data: [[0, graphData.y[0]], [graphData.x.length-1, graphData.y[graphData.y.length-1]]],
                marker: {
                    enabled: false
                }
            }]
    });
}

$(document).ready(function(){

    // datepicker initialisation
    var dateFormat = "dd/mm/yy",

        startDate = $("#startDate").datepicker({
            changeMonth: true,
            numberOfMonths: 2,
            dateFormat: dateFormat,
            firstDay: 1,

        }).on("change", function(){
            endDate.datepicker( "option", "minDate", getDate(this));
            getData();
        }),

        endDate = $("#endDate").datepicker({
            changeMonth: true,
            numberOfMonths: 2,
            dateFormat: dateFormat,
            firstDay: 1,
            maxDate: new Date(),

        }).on("change", function(){
            startDate.datepicker( "option", "maxDate", getDate(this));
            getData();
        });

    function getDate( element ) {
        var date;
        try {
            date = $.datepicker.parseDate( dateFormat, element.value );
        } catch( error ) {
            date = null;
        }
        return date;
    }

    // bind events on controls
    $("#currency").on("change", function(){ getData(); });

    getData();
});