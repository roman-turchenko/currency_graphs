<?php
/**
 * Created by PhpStorm.
 * User: roman
 * Date: 07.09.2016
 * Time: 0:35
 */

// www.cbr.ru/scripts/XML_dynamic.asp?date_req1=02/03/2001&date_req2=14/03/2001&VAL_NM_RQ=R01235

$currencyCode = $_GET['currencyCode'] ? $_GET['currencyCode'] : '';
$startDate = $_GET['startDate'] ? $_GET['startDate'] : '';
$endDate = $_GET['endDate'] ? $_GET['endDate'] : '';

if (!empty($currencyCode) && !empty($startDate) && !empty($endDate)){

    $requestURL = "http://www.cbr.ru/scripts/XML_dynamic.asp?date_req1=".$startDate."&date_req2=".$endDate."&VAL_NM_RQ=".$currencyCode;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $requestURL);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $xml_string = curl_exec($ch);
    curl_close($ch);

    $result = simplexml_load_string($xml_string);
}
else{

    $result = array("result" => false, "message" => "Some vars came empty", "get" => $_GET);
}

header("Content-type: application/json");
print json_encode($result);
