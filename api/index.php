<?php
/**
 * Created by PhpStorm.
 * User: roman
 * Date: 07.09.2016
 * Time: 0:35
 */


$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "www.cbr.ru/scripts/XML_dynamic.asp?date_req1=02/03/2001&date_req2=14/03/2001&VAL_NM_RQ=R01235");
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$xml_string = curl_exec($ch);
curl_close($ch);

$xml = simplexml_load_string($xml_string);

header("Content-type: application/json");
print json_encode($xml);
