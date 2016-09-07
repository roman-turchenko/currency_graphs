/**
 * Created by roman on 07.09.2016.
 */
$(document).ready(function(){

    var today = new Date();
    var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

    // datepicker init
    var dateFormat = "dd/mm/yy",

        startDate = $("#startDate").datepicker({
            changeMonth: true,
            changeYear: true,
            numberOfMonths: 2,
            dateFormat: dateFormat,
            firstDay: 1,
            maxDate: yesterday

        }).on("change", function(){
            endDate.datepicker( "option", "minDate", getDate(this));
        }),

        endDate = $("#endDate").datepicker({
            changeMonth: true,
            changeYear: true,
            numberOfMonths: 2,
            dateFormat: dateFormat,
            firstDay: 1,
            maxDate: today

        }).on("change", function(){
            startDate.datepicker( "option", "maxDate", getDate(this));
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


    // set default values to input
    var month = today.getMonth() - 1,
        year = today.getFullYear();

    if (month < 0) {
        month = 11;
        year -= 1;
    }
    var oneMonthAgo = new Date(year, month, today.getDate());

    startDate.val($.datepicker.formatDate(dateFormat, oneMonthAgo));
    endDate.val($.datepicker.formatDate(dateFormat, today));
});