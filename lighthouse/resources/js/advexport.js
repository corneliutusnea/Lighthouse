var timeoverride = null;

window.onerror = function(message, url, lineNumber) {  
  document.getElementById("loading").innerHTML = "Error loading page<br>"+message+" Line "+lineNumber;
  return true;
}; 


document.addEventListener('DOMContentLoaded', function() {


document.getElementById("goButton").addEventListener("click", function(){
 RunForestRun()
});

});

// //on DOM load


// });


function getSearchParameters() {
    var prmstr = window.location.search.substr(1);
    return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray(prmstr) {
    var params = {};
    var prmarr = prmstr.split("&");
    for (var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

var timeperiod;
var unitname = "";


var params = getSearchParameters();



//Get times vars for the call
function RunForestRun() {

            document.getElementById("loading").style.visibility = 'visible';


    if (timeoverride !== null) { //we are using a time override

        var end = new Date();

        var start = new Date();
        start.setDate(start.getDate() - (timeoverride / 24));


        starttime = start.toISOString();
        endtime = end.toISOString();

        console.log(starttime);
        console.log(endtime);

        params.start = starttime;
        params.end = endtime;

    }

    //IF TRAIN BEACON

    // if (params.host == "trainbeacon.ses.nsw.gov.au")
    // {
    //     document.body.style.backgroundColor = "green";
    // }



    if (unitname == "") {

        console.log("firstrun...will fetch vars");

        

        if (typeof params.hq !== 'undefined') {

        if (params.hq.split(",").length == 1)
            {

            GetUnitNamefromBeacon(params.hq, params.host, function(returnedunitname) {
                unitname = returnedunitname;
                HackTheMatrix(params.hq, params.host, returnedunitname);
            });

            } else {
        console.log("passed array of units");
        unitname = "group selection";
        HackTheMatrix(params.hq, params.host, unitname);
    }

        } else { //no hq was sent, get them all
            unitname = "NSW";
            HackTheMatrix(null, params.host, unitname);
        }


    


    } else {
        console.log("rerun...will NOT fetch vars");
        if (typeof params.hq == 'undefined') {
            HackTheMatrix(null, unitname);
        } else {
            HackTheMatrix(params.hq, params.host, unitname);
        }

    }




}

//make the call to beacon
function HackTheMatrix(id,host, unit) {

    document.title = unitname + " Export";


    var start = new Date(decodeURIComponent(params.start));
    var end = new Date(decodeURIComponent(params.end));

    GetJSONfromBeacon(id, host, start, end, function(jobs) {



        var exports = jobs.Results.map(function(d){
        var rawdate = new Date(d.JobReceived);
        d.JobReceivedFixed = new Date(rawdate.getTime() + ( rawdate.getTimezoneOffset() * 60000 ));
        
        var tags = d.Tags.map(function(d){return d.Name}).join(",");

        var rObj = {};



        if (document.getElementById("Id").checked) {rObj["Id"] = d.Identifier};
        if (document.getElementById("Received").checked) {rObj["JobReceivedFixed"] = d.JobReceivedFixed};
        if (document.getElementById("Priority").checked) {rObj["JobPriorityType"] = d.JobPriorityType.Name};
        if (document.getElementById("Type").checked) {rObj["Type"] = d.JobType.Name};
        if (document.getElementById("Status").checked) {rObj["Status"] = d.JobStatusType.Name};
        if (document.getElementById("SituationOnScene").checked) {rObj["SituationOnScene"] = d.SituationOnScene};
        if (document.getElementById("PermissionToEnterPremises").checked) {rObj["PermissionToEnterPremises"] = d.PermissionToEnterPremises};

        if (document.getElementById("Tags").checked) {rObj["Tags"] = tags};
        if (document.getElementById("HQ").checked) {rObj["HQ"] = d.EntityAssignedTo.Code};
        if (document.getElementById("Region").checked) {rObj["Region"] = d.CallerFirstName};
        if (document.getElementById("Event").checked) {rObj["Event"] = d.Event.Identifier};


        if (document.getElementById("Level").checked) {rObj["Level"] = d.Address.Level};
        if (document.getElementById("StreetNumber").checked) {rObj["StreetNumber"] = d.Address.StreetNumber};
        if (document.getElementById("Street").checked) {rObj["Street"] = d.Address.Street};
        if (document.getElementById("Locality").checked) {rObj["Locality"] = d.Address.Locality};
        if (document.getElementById("PostCode").checked) {rObj["PostCode"] = d.Address.PostCode};
        if (document.getElementById("PrettyAddress").checked) {rObj["PrettyAddress"] = d.Address.PrettyAddress};
        if (document.getElementById("AdditionalAddressInfo").checked) {rObj["AdditionalAddressInfo"] = d.Address.AdditionalAddressInfo};
        if (document.getElementById("Latitude").checked) {rObj["Latitude"] = d.Address.Latitude};
        if (document.getElementById("Longitude").checked) {rObj["Longitude"] = d.Address.Longitude};

        if (document.getElementById("CallerFirstName").checked) {rObj["CallerFirstName"] = d.CallerFirstName};
        if (document.getElementById("CallerLastName").checked) {rObj["CallerLastName"] = d.CallerLastName};
        if (document.getElementById("CallerPhoneNumber").checked) {rObj["CallerPhoneNumber"] = d.CallerPhoneNumber};
        if (document.getElementById("ContactCalled").checked) {rObj["ContactCalled"] = d.ContactCalled};
        if (document.getElementById("ContactFirstName").checked) {rObj["ContactFirstName"] = d.ContactFirstName};
        if (document.getElementById("ContactLastName").checked) {rObj["ContactLastName"] = d.ContactLastName};
        if (document.getElementById("ContactPhoneNumber").checked) {rObj["ContactPhoneNumber"] = d.ContactPhoneNumber};


        return rObj

        });

        downloadCSV("LighthouseExport.csv",exports);

                    document.getElementById("loading").style.visibility = 'hidden';

});
}



function convertArrayOfObjectsToCSV(data) {  
        var result, ctr, keys, columnDelimiter, lineDelimiter, data;

        if (data == null || !data.length) {
            return null;
        }

        columnDelimiter =  ',';
        lineDelimiter = '\n';



        keys = Object.keys(data[0]);

        result = '';
        result += keys.join(columnDelimiter);
        result += lineDelimiter;

        data.forEach(function(item) {
            ctr = 0;
            keys.forEach(function(key) {
                if (ctr > 0) result += columnDelimiter;

                result += item[key];
                ctr++;
            });
            result += lineDelimiter;
        });

        return result;
    }


    function downloadCSV(file,dataIn) {  
        var csv = convertArrayOfObjectsToCSV(dataIn);
        if (csv == null) return;

        filename = file;

        if (!csv.match(/^data:text\/csv/i)) {
            csv = 'data:text/csv;charset=utf-8,' + csv;
        }
        data = encodeURI(csv);

        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
    }
